import { evaluateCondition } from './condition'
import { resolveDynamicObject, resolveField } from './dynamic'
import { cloneValue, deepMerge, getIn, setIn, shallowEqual } from './path'
import { normalizeRules } from './rules'
import { compileSchema, mergeSchemas } from './schema'
import { applyDefaults, formatValues, getLeafFields, retrieveValues } from './transform'
import { validateFieldValue } from './validate'
import { createRegistry } from '../registry/registry'
import type {
  CompiledField,
  CreateFormOptions,
  DataSourceState,
  Dict,
  FieldHandleEntry,
  FieldPath,
  FieldState,
  FieldTrace,
  FormError,
  FormHooks,
  FormRuntime,
  LocateOptions,
  ResolvedField,
  ValidateResult
} from './types'

const DEFAULT_LOCATE_BEHAVIOR: NonNullable<LocateOptions['behavior']> = [
  'reveal',
  'scroll',
  'activate',
  'focus',
  'highlight'
]

/** 创建表单运行时实例。renderer 和业务代码都应围绕这个实例交互。 */
export function createForm(options: CreateFormOptions): FormRuntime {
  return new SchemaFormRuntime(options)
}

/**
 * 表单运行时的默认实现。
 *
 * 这层只做平台无关逻辑：values、schema 编译结果、字段状态、校验错误、dataSource
 * 状态和定位句柄。不要在这里引入 DOM、Taro API 或 Vue 组件实例。
 */
class SchemaFormRuntime implements FormRuntime {
  readonly registry
  readonly mode
  readonly platform
  readonly schema

  private values: Dict = {}
  private initialValues: Dict = {}
  private fieldStates = new Map<FieldPath, FieldState>()
  private errors: FormError[] = []
  private listeners = new Set<(form: FormRuntime) => void>()
  private handles = new Map<FieldPath, FieldHandleEntry>()
  private dataSourceStates = new Map<FieldPath, DataSourceState>()
  /** 每个 dataSource 字段自己的请求版本号，用来忽略过期异步结果。 */
  private dataSourceRequestIds = new Map<FieldPath, number>()
  /** 每个字段自己的校验版本号，用来忽略过期异步结果。 */
  private validationRequestIds = new Map<FieldPath, number>()
  private destroyed = false
  /** 外部强制覆盖 visible/disabled/readonly 时写入这里，优先级高于 schema 条件。 */
  private overrides = new Map<
    FieldPath,
    Partial<Pick<FieldState, 'visible' | 'disabled' | 'readonly'>>
  >()

  constructor(private options: CreateFormOptions) {
    this.registry = options.registry ?? createRegistry()
    this.mode = options.mode ?? 'runtime'
    this.platform = options.platform
    this.schema = compileSchema(
      options.schemas?.length ? mergeSchemas(options.schemas) : (options.schema ?? { fields: [] })
    )

    // 初始化有两条入口：model 先 retrieve 成内部 values；values/defaultValues 则直接进入表单。
    const sourceValues = options.model
      ? retrieveValues({
          schema: this.schema,
          registry: this.registry,
          model: options.model,
          retrieve: options.retrieve,
          form: this
        })
      : cloneValue(options.values ?? options.defaultValues ?? {})

    this.values = applyDefaults(this.schema, sourceValues)
    this.initialValues = cloneValue(this.values)
    this.recomputeFieldStates()
  }

  /** 返回克隆值，避免外部绕过 runtime 直接修改内部状态。 */
  getValues(): Dict {
    return cloneValue(this.values)
  }

  /** 设置单个字段值，并触发字段状态重算与 change hook。 */
  setValue(path: FieldPath, value: unknown): void {
    const previousValue = getIn(this.values, path)
    if (Object.is(previousValue, value)) return

    const fieldsToRevalidate = this.getErroredFieldsAffectedByChange([path])
    const fieldsToInvalidate = this.getFieldsAffectedByChange([path])

    setIn(this.values, path, value)
    const state = this.fieldStates.get(path)
    if (state) state.dirty = true

    this.recomputeFieldStates()
    this.invalidateFieldValidations(fieldsToInvalidate)
    this.callHook('onFieldChange', {
      form: this,
      values: this.getValues(),
      field: this.requireField(path),
      value,
      previousValue
    })
    this.emitChange()
    this.revalidateErroredFields(fieldsToRevalidate)
  }

  setValues(values: Dict): void {
    this.patchValues(values)
  }

  patchValues(values: Dict): void {
    const changedPaths = this.collectPatchLeafPaths(values)
    const fieldsToRevalidate = this.getErroredFieldsAffectedByChange(changedPaths)
    const fieldsToInvalidate = this.getFieldsAffectedByChange(changedPaths)
    const next = deepMerge(this.values, values)
    if (shallowEqual(this.values, next)) return

    this.values = next
    this.markDirtyFromPatch(values)
    this.recomputeFieldStates()
    this.invalidateFieldValidations(fieldsToInvalidate)
    this.emitChange()
    this.revalidateErroredFields(fieldsToRevalidate)
  }

  /** 整体替换内部 values，适合受控数据源或 retrieve 后的回填。 */
  replaceValues(values: Dict): void {
    const allFieldPaths = [...this.schema.fieldMap.keys()]
    const fieldsToRevalidate = this.getErroredFieldsAffectedByChange(allFieldPaths)
    const fieldsToInvalidate = this.getFieldsAffectedByChange(allFieldPaths)
    this.values = applyDefaults(this.schema, cloneValue(values))
    this.schema.fieldMap.forEach((field) => {
      const state = this.fieldStates.get(field.path)
      if (state) state.dirty = true
    })
    this.recomputeFieldStates()
    this.invalidateFieldValidations(fieldsToInvalidate)
    this.emitChange()
    this.revalidateErroredFields(fieldsToRevalidate)
  }

  /** 接收后端 model，并通过 retrieve 转成表单内部 values。 */
  setModel(model: Dict): void {
    this.replaceValues(this.retrieve(model))
  }

  /** 获取提交给后端的 model，会走 format 转换。 */
  getModel(): Dict {
    return this.format()
  }

  /** 只执行 retrieve 转换，不直接写入表单。 */
  retrieve(model: Dict): Dict {
    return retrieveValues({
      schema: this.schema,
      registry: this.registry,
      model,
      retrieve: this.options.retrieve,
      form: this
    })
  }

  /** 只执行 format 转换；默认格式化当前内部 values。 */
  format(values: Dict = this.values): Dict {
    return formatValues({
      schema: this.schema,
      registry: this.registry,
      values,
      format: this.options.format,
      form: this
    })
  }

  /** 校验所有叶子字段；容器字段不直接执行普通校验。 */
  async validate(): Promise<ValidateResult> {
    const fields = getLeafFields(this.schema)
    this.callHook('onValidateStart', { form: this, values: this.getValues(), fields })

    const errors: FormError[] = []

    for (const field of fields) {
      const fieldErrors = await this.validateField(field.path)
      errors.push(...fieldErrors)
    }

    this.errors = errors
    this.callHook('onValidateEnd', { form: this, values: this.getValues(), fields, errors })
    this.notify()

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /** 校验单个字段，并把结果写回字段状态与全局错误列表。 */
  async validateField(path: FieldPath): Promise<FormError[]> {
    const field = this.requireResolvedField(path)
    const state = this.ensureFieldState(field)
    const requestId = (this.validationRequestIds.get(path) ?? 0) + 1
    this.validationRequestIds.set(path, requestId)

    if (!state.visible && field.behavior?.validateWhenHidden !== true) {
      if (this.isLatestValidation(path, requestId)) {
        state.errors = []
        state.validating = false
        this.replaceFieldErrors(path, [])
        this.notify()
      }
      return []
    }

    state.validating = true
    this.notify()

    let errors: FormError[]

    try {
      errors = await validateFieldValue({
        field,
        value: getIn(this.values, path),
        values: this.values,
        form: this,
        registry: this.registry
      })
    } catch (error) {
      if (this.isLatestValidation(path, requestId)) {
        const latestState = this.ensureFieldState(field)
        latestState.validating = false
        this.notify()
      }
      throw error
    }

    if (!this.isLatestValidation(path, requestId)) return errors

    const latestState = this.ensureFieldState(field)
    latestState.validating = false
    latestState.errors = errors
    this.replaceFieldErrors(path, errors)
    this.notify()

    return errors
  }

  getErrors(): FormError[] {
    return cloneValue(this.errors)
  }

  clearErrors(path?: FieldPath): void {
    if (!path) {
      this.errors = []
      this.fieldStates.forEach((state) => {
        state.errors = []
      })
      this.notify()
      return
    }

    this.replaceFieldErrors(path, [])
    const state = this.fieldStates.get(path)
    if (state) state.errors = []
    this.notify()
  }

  getField(path: FieldPath): CompiledField | undefined {
    return this.schema.fieldMap.get(path)
  }

  getResolvedField(path: FieldPath): ResolvedField | undefined {
    const field = this.getField(path)
    return field ? this.resolveField(field) : undefined
  }

  getFieldState(path: FieldPath): FieldState | undefined {
    const state = this.fieldStates.get(path)
    return state ? cloneValue(state) : undefined
  }

  getAllFieldStates(): FieldState[] {
    return [...this.fieldStates.values()].map((state) => cloneValue(state))
  }

  setFieldVisible(path: FieldPath, visible: boolean): void {
    this.setOverride(path, { visible })
  }

  setFieldDisabled(path: FieldPath, disabled: boolean): void {
    this.setOverride(path, { disabled })
  }

  setFieldReadonly(path: FieldPath, readonly: boolean): void {
    this.setOverride(path, { readonly })
  }

  async loadDataSource<T = unknown>(
    path: FieldPath,
    options: { search?: string; pageNo?: number; pageSize?: number; params?: Dict } = {}
  ): Promise<DataSourceState<T>> {
    const field = this.requireResolvedField(path)
    if (!field.dataSource) {
      throw new Error(`Field "${path}" has no dataSource`)
    }

    const loader = this.registry.dataSources.get(field.dataSource.sourceId)
    if (!loader) {
      throw new Error(`Unknown dataSource: ${field.dataSource.sourceId}`)
    }

    // 递增 requestId 后，只有最后一次请求允许写回状态，避免慢请求覆盖新结果。
    const requestId = (this.dataSourceRequestIds.get(path) ?? 0) + 1
    this.dataSourceRequestIds.set(path, requestId)

    const previous = this.dataSourceStates.get(path)
    const loadingState: DataSourceState<T> = {
      loading: true,
      error: null,
      options: (previous?.options ?? []) as T[],
      raw: previous?.raw,
      requestId
    }
    this.dataSourceStates.set(path, loadingState)
    this.notify()

    try {
      const result = await loader({
        field,
        values: this.values,
        params: this.resolveDataSourceParams(field, options),
        search: options.search,
        pageNo: options.pageNo,
        pageSize: options.pageSize,
        form: this
      })
      const normalized = Array.isArray(result) ? { options: result } : result
      const state: DataSourceState<T> = {
        loading: false,
        error: null,
        options: normalized.options as T[],
        raw: normalized.raw,
        requestId
      }

      if (this.dataSourceRequestIds.get(path) === requestId) {
        this.dataSourceStates.set(path, state)
        this.notify()
      }

      return state
    } catch (error) {
      const state: DataSourceState<T> = {
        loading: false,
        error,
        options: [],
        requestId
      }

      if (this.dataSourceRequestIds.get(path) === requestId) {
        this.dataSourceStates.set(path, state)
        this.notify()
      }

      return state
    }
  }

  getDataSourceState<T = unknown>(path: FieldPath): DataSourceState<T> | undefined {
    const state = this.dataSourceStates.get(path)
    return state ? (cloneValue(state) as DataSourceState<T>) : undefined
  }

  registerFieldHandle(path: FieldPath, entry: FieldHandleEntry): () => void {
    this.handles.set(path, entry)
    return () => {
      if (this.handles.get(path) === entry) this.handles.delete(path)
    }
  }

  /**
   * 执行字段定位链路。
   *
   * 定位不是单纯 focus：复杂表单可能需要先切 step/tab、展开 collapse、滚动到字段、
   * 激活业务控件，最后才尝试 focus 或 highlight。
   */
  async locateField(path: FieldPath, options: LocateOptions = {}): Promise<void> {
    const behavior = options.behavior ?? DEFAULT_LOCATE_BEHAVIOR
    const entry = this.handles.get(path)
    const ctx = {
      form: this,
      fieldPath: path,
      reason: options.reason
    }

    this.callHook('onLocateField', { ...ctx, behavior })

    if (!entry) return

    if (behavior.includes('reveal')) {
      for (const container of entry.containers ?? []) {
        await container.revealField?.(path, ctx)
      }
      await entry.field?.reveal?.(ctx)
      await entry.widget?.reveal?.(ctx)
    }

    if (behavior.includes('scroll')) await entry.field?.scroll?.(ctx)
    if (behavior.includes('activate')) await entry.widget?.activate?.(ctx)
    if (behavior.includes('focus')) await entry.widget?.focus?.(ctx)
    if (behavior.includes('highlight')) {
      await entry.field?.highlight?.(ctx)
      await entry.widget?.highlight?.(ctx)
    }
  }

  revealField(path: FieldPath): Promise<void> {
    return this.locateField(path, { behavior: ['reveal'] })
  }

  activateField(path: FieldPath): Promise<void> {
    return this.locateField(path, { behavior: ['reveal', 'activate'] })
  }

  focusField(path: FieldPath): Promise<void> {
    return this.locateField(path, { behavior: ['reveal', 'scroll', 'activate', 'focus'] })
  }

  async submit(): Promise<ValidateResult> {
    this.callHook('onSubmitStart', { form: this, values: this.getValues() })
    const result = await this.validate()
    this.callHook('onSubmitEnd', { form: this, values: this.getValues(), errors: result.errors })
    return result
  }

  /** 重置 values、错误和字段状态；传入 values 时同时更新新的 initialValues。 */
  reset(values: Dict = this.initialValues): void {
    this.invalidateFieldValidations([...this.schema.fieldMap.keys()])
    this.values = applyDefaults(this.schema, cloneValue(values))
    this.initialValues = cloneValue(this.values)
    this.errors = []
    this.fieldStates.clear()
    this.recomputeFieldStates()
    this.notify()
  }

  destroy(): void {
    this.destroyed = true
    this.listeners.clear()
    this.handles.clear()
    this.dataSourceStates.clear()
  }

  subscribe(listener: (form: FormRuntime) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** renderer 在 blur 时调用，用于 touched 状态和 blur hook。 */
  notifyFieldBlur(path: FieldPath): void {
    const field = this.requireField(path)
    const state = this.ensureFieldState(field)
    state.touched = true
    this.callHook('onFieldBlur', { form: this, values: this.getValues(), field })
    this.notify()
  }

  getDependencyGraph(): Map<FieldPath, Set<FieldPath>> {
    return new Map(
      [...this.schema.dependencies.entries()].map(([path, dependencies]) => [
        path,
        new Set(dependencies)
      ])
    )
  }

  getFieldTrace(path: FieldPath): FieldTrace {
    return {
      field: this.getField(path),
      resolvedField: this.getResolvedField(path),
      value: getIn(this.values, path),
      state: this.getFieldState(path),
      errors: this.errors.filter((error) => error.field === path),
      dependencies: [...(this.schema.dependencies.get(path) ?? [])],
      dataSource: this.getDataSourceState(path)
    }
  }

  debug() {
    return {
      values: this.getValues(),
      errors: this.getErrors(),
      fields: [...this.schema.fieldMap.keys()].map((path) => this.getFieldTrace(path)),
      dependencyGraph: this.getDependencyGraph()
    }
  }

  /** 获取字段；不存在时抛错，让调用方尽早发现 schema/path 拼写问题。 */
  private requireField(path: FieldPath): CompiledField {
    const field = this.getField(path)
    if (!field) throw new Error(`Unknown field: ${path}`)
    return field
  }

  private requireResolvedField(path: FieldPath): ResolvedField {
    const field = this.getResolvedField(path)
    if (!field) throw new Error(`Unknown field: ${path}`)
    return field
  }

  private resolveField(field: CompiledField): ResolvedField {
    return resolveField(field, {
      values: this.values,
      field,
      form: this,
      registry: this.registry
    })
  }

  /** values 变更后的统一出口：先通知外部受控回调，再通知订阅者。 */
  private emitChange(): void {
    this.options.onValuesChange?.(this.getValues())
    this.notify()
  }

  /** 通知 renderer 或外部监听者刷新。 */
  private notify(): void {
    if (this.destroyed) return
    this.listeners.forEach((listener) => listener(this))
  }

  /** hooks 统一调用点；hooks 不参与核心状态计算，只做扩展通知。 */
  private callHook<Name extends keyof FormHooks>(
    name: Name,
    payload: Parameters<FormHooks[Name]>[0]
  ): void {
    const hook = this.options.hooks?.[name] as ((ctx: typeof payload) => void) | undefined
    hook?.(payload)
  }

  /**
   * 重算所有字段状态。
   *
   * 当前版本先全量重算，逻辑简单稳定；依赖图已经保留，后续可演进为按依赖局部刷新。
   */
  private recomputeFieldStates(): void {
    this.schema.fieldMap.forEach((field) => {
      const resolvedField = this.resolveField(field)
      const previous = this.fieldStates.get(field.path)
      const override = this.overrides.get(field.path)
      const ctx = {
        values: this.values,
        field,
        form: this,
        registry: this.registry
      }
      const visible = override?.visible ?? resolveDynamicBoolean(field.visible, ctx, true)
      const disabled = override?.disabled ?? resolveDynamicBoolean(field.disabled, ctx, false)
      const readonly = override?.readonly ?? resolveDynamicBoolean(field.readonly, ctx, false)
      const ruleCtx = {
        values: this.values,
        field: resolvedField,
        form: this,
        registry: this.registry
      }
      const required =
        resolveDynamicBoolean(field.required, ctx, false) ||
        normalizeRules(resolvedField.rules).some(
          (rule) => rule.required === true && evaluateCondition(rule.when, ruleCtx, true)
        )

      this.fieldStates.set(field.path, {
        path: field.path,
        visible,
        disabled,
        readonly,
        required,
        dirty: previous?.dirty ?? false,
        touched: previous?.touched ?? false,
        validating: previous?.validating ?? false,
        errors: previous?.errors ?? []
      })

      // 隐藏后清值是危险行为，必须由字段 behavior 显式打开。
      if (!visible && resolvedField.behavior?.clearValueWhenHidden) {
        setIn(this.values, field.path, undefined)
      }
    })
  }

  /** 确保字段状态存在；主要给 validate/blur 这类按字段入口兜底。 */
  private ensureFieldState(field: Pick<CompiledField, 'path'>): FieldState {
    let state = this.fieldStates.get(field.path)
    if (!state) {
      this.recomputeFieldStates()
      state = this.fieldStates.get(field.path)
    }
    if (!state) throw new Error(`Unable to create field state: ${field.path}`)
    return state
  }

  /** 替换某个字段的错误，保留其他字段错误。 */
  private replaceFieldErrors(path: FieldPath, errors: FormError[]): void {
    this.errors = this.errors.filter((error) => error.field !== path).concat(errors)
  }

  private isLatestValidation(path: FieldPath, requestId: number): boolean {
    return this.validationRequestIds.get(path) === requestId
  }

  private getErroredFieldsAffectedByChange(changedPaths: FieldPath[]): FieldPath[] {
    return this.getFieldsAffectedByChange(changedPaths, true)
  }

  private getFieldsAffectedByChange(changedPaths: FieldPath[], onlyErrored = false): FieldPath[] {
    if (!changedPaths.length) return []

    const affected = new Set<FieldPath>()

    this.fieldStates.forEach((state, fieldPath) => {
      if (onlyErrored && !state.errors.length) return

      const dependencies = this.schema.dependencies.get(fieldPath)
      const shouldRevalidate = changedPaths.some(
        (changedPath) => fieldPath === changedPath || dependencies?.has(changedPath)
      )

      if (shouldRevalidate) affected.add(fieldPath)
    })

    return [...affected]
  }

  private invalidateFieldValidations(paths: FieldPath[]): void {
    paths.forEach((path) => {
      this.validationRequestIds.set(path, (this.validationRequestIds.get(path) ?? 0) + 1)

      const state = this.fieldStates.get(path)
      if (state) state.validating = false
    })
  }

  private revalidateErroredFields(paths: FieldPath[]): void {
    paths.forEach((path) => {
      void this.validateField(path).catch(() => {
        const state = this.fieldStates.get(path)
        if (state) {
          state.validating = false
          this.notify()
        }
      })
    })
  }

  private collectPatchLeafPaths(values: Dict, prefix = ''): FieldPath[] {
    return Object.keys(values).flatMap((key) => {
      const path = prefix ? `${prefix}.${key}` : key
      const value = values[key]

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return this.collectPatchLeafPaths(value as Dict, path)
      }

      return [path]
    })
  }

  /** 写入外部强制状态覆盖。 */
  private setOverride(
    path: FieldPath,
    override: Partial<Pick<FieldState, 'visible' | 'disabled' | 'readonly'>>
  ): void {
    this.overrides.set(path, {
      ...this.overrides.get(path),
      ...override
    })
    this.recomputeFieldStates()
    this.notify()
  }

  /** patchValues 后递归标记脏字段。 */
  private markDirtyFromPatch(values: Dict, prefix = ''): void {
    Object.keys(values).forEach((key) => {
      const path = prefix ? `${prefix}.${key}` : key
      const value = values[key]

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.markDirtyFromPatch(value as Dict, path)
        return
      }

      const state = this.fieldStates.get(path)
      if (state) state.dirty = true
    })
  }

  /** 解析 dataSource params 中的 `$search` 和 `$values.xxx` 占位。 */
  private resolveDataSourceParams(
    field: ResolvedField,
    options: { search?: string; params?: Dict }
  ): Dict {
    const params: Dict = {}
    const sourceParams = {
      ...(resolveDynamicObject(field.dataSource?.params, {
        values: this.values,
        field,
        form: this,
        registry: this.registry
      }) ?? {}),
      ...(options.params ?? {})
    }

    Object.keys(sourceParams).forEach((key) => {
      const value = sourceParams[key]
      if (value === '$search') {
        params[key] = options.search
        return
      }
      if (typeof value === 'string' && value.startsWith('$values.')) {
        params[key] = getIn(this.values, value.slice('$values.'.length))
        return
      }
      params[key] = value
    })

    return params
  }
}

/**
 * 统一计算动态布尔字段。
 *
 * 新 API 使用 `visible/disabled/readonly/required` 承载 boolean/function/DSL。
 */
function resolveDynamicBoolean(
  value: CompiledField['visible'],
  ctx: Parameters<typeof evaluateCondition>[1],
  fallback: boolean
): boolean {
  return evaluateCondition(value, ctx, fallback)
}
