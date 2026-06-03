import type { JsfRegistry } from '../registry/registry'

/* -------------------------------------------------------------------------------------------------
 * 基础类型
 * ------------------------------------------------------------------------------------------------- */

export type MaybePromise<T> = T | Promise<T>
export type Dict<T = any> = Record<string, T>
export type FieldPath = string

export type RuntimeMode = 'runtime' | 'designer' | 'preview'
export type JsfPlatform = 'web' | 'taro' | string
export type FieldValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'email'
  | 'url'
  | 'date'
  | 'any'
  | string

export type DynamicGetter<T> = ((ctx: DynamicValueContext) => T) & {
  deps?: FieldPath[]
}

export interface DynamicExpression<T = unknown> {
  $dynamic: 'expression' | 'computed'
  deps?: FieldPath[]
  code?: string
  value?: T
  fallback?: T
}

export type DynamicValue<T> = T | DynamicGetter<T> | DynamicExpression<T>

export interface DynamicValueContext {
  values: Dict
  field?: CompiledField | ResolvedField
  form: FormRuntime
  registry: JsfRegistry
}

export interface JsfContext {
  registry: JsfRegistry
  platform?: JsfPlatform
  mode: RuntimeMode
}

/** 用户编写或后端下发的完整表单 schema。 */
export interface JsfSchema {
  version?: string
  fields: FieldSchema[]
  retrieve?: RetrieveDefinition
  format?: FormatDefinition
  meta?: Dict
}

/** schema patch 片段，用于平台、权限、低代码等覆盖场景。 */
export type SchemaFragment = Partial<Omit<JsfSchema, 'fields'>> & {
  fields?: FieldSchema[]
}

/** 字段 schema：描述字段语义、行为和 widget 引用，不描述真实渲染细节。 */
export interface FieldSchema {
  name: string
  label?: DynamicValue<string>
  helper?: DynamicValue<string>
  widget?: DynamicValue<string | WidgetDefinition>
  valueType?: DynamicValue<FieldValueType>
  defaultValue?: unknown
  props?: DynamicValue<Dict>
  layout?: DynamicValue<Dict>
  behavior?: DynamicValue<FieldBehavior>
  bindings?: Record<string, BindingDefinition>
  rules?: DynamicValue<RuleLike[]>
  replaceRules?: boolean
  visible?: DynamicBoolean
  disabled?: DynamicBoolean
  readonly?: DynamicBoolean
  required?: DynamicBoolean
  requiredMessage?: DynamicValue<string>
  dataSource?: DynamicValue<DataSourceSchema>
  retrieve?: FieldRetrieve
  format?: FieldFormat
  children?: FieldSchema[]
  meta?: Dict
  [key: string]: unknown
}

/** 编译后的字段，比 FieldSchema 多了稳定完整的 path。 */
export interface CompiledField extends FieldSchema {
  path: FieldPath
  name: string
  children?: CompiledField[]
}

export interface ResolvedField {
  name: string
  path: FieldPath
  label?: string
  helper?: string
  widget?: string | WidgetDefinition
  valueType?: FieldValueType
  defaultValue?: unknown
  props?: Dict
  layout?: Dict
  behavior?: FieldBehavior
  bindings?: Record<string, BindingDefinition>
  rules?: RuleLike[]
  replaceRules?: boolean
  visible?: DynamicBoolean
  disabled?: DynamicBoolean
  readonly?: DynamicBoolean
  required?: DynamicBoolean
  requiredMessage?: string
  dataSource?: DataSourceSchema
  retrieve?: FieldRetrieve
  format?: FieldFormat
  children?: CompiledField[]
  meta?: Dict
  [key: string]: unknown
}

/** 编译后的 schema，包含运行时高频使用的 fieldMap 和依赖图。 */
export interface CompiledSchema extends JsfSchema {
  fields: CompiledField[]
  fieldMap: Map<FieldPath, CompiledField>
  dependencies: Map<FieldPath, Set<FieldPath>>
}

/** 表单引擎理解的行为配置，不直接作为 Vue props 透传给控件。 */
export interface FieldBehavior {
  clearValueWhenHidden?: boolean
  preserveValue?: boolean
  validateTrigger?: 'change' | 'blur' | 'submit' | Array<'change' | 'blur' | 'submit'>
  validateWhenHidden?: boolean
  [key: string]: unknown
}

/** 低代码动态绑定描述；core 先保留结构，具体表达式执行由后续 engine 接入。 */
export interface BindingDefinition {
  type: 'expression' | 'computed' | 'action' | string
  code?: string
  actionId?: string
  value?: unknown
  [key: string]: unknown
}

/** 条件 DSL 支持的内置操作符。 */
export type ConditionOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'empty'
  | 'notEmpty'
  | 'truthy'
  | 'falsy'

export type ConditionDefinition = boolean | ConditionSchema | ((ctx: ConditionContext) => boolean)

export type DynamicBoolean = ConditionDefinition

/** 单个条件表达式，例如 `{ field: 'userType', op: 'eq', value: 'company' }`。 */
export interface ConditionExpression {
  field?: FieldPath
  path?: FieldPath
  op?: ConditionOperator | string
  value?: unknown
}

/**
 * JSON Schema 风格的条件对象。
 *
 * 基础表达式和 allOf/anyOf/oneOf/not 可以共存在同一个对象中，运行时会全部参与判断，
 * 并按 AND 合并最终结果。
 */
export type ConditionSchema = ConditionExpression & ConditionGroup

export interface ConditionGroup {
  allOf?: ConditionDefinition[]
  anyOf?: ConditionDefinition[]
  oneOf?: ConditionDefinition[]
  not?: ConditionDefinition
}

/** 条件执行上下文。 */
export interface ConditionContext {
  values: Dict
  field?: CompiledField | ResolvedField
  form: FormRuntime
  registry: JsfRegistry
}

/** 字段校验规则；内置规则与自定义 validator 可以混用。 */
export interface RuleDefinition {
  required?: boolean
  message?: string
  trigger?: 'change' | 'blur' | 'submit' | Array<'change' | 'blur' | 'submit'>
  pattern?: RegExp | string
  min?: number
  max?: number
  len?: number
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url'
  validator?: string | FieldValidator
  when?: ConditionDefinition
  [key: string]: unknown
}

/** 自定义校验器执行上下文。 */
export interface ValidateContext {
  values: Dict
  value: unknown
  field: ResolvedField
  form: FormRuntime
  rule: RuleDefinition
}

/** 自定义校验器返回 true/void 表示通过，false/string/FormError 表示失败。 */
export type FieldValidator = (
  value: unknown,
  ctx: ValidateContext
) => MaybePromise<boolean | string | FormError | void>

/** schema 中可直接书写的规则形态，会在运行时归一化为 RuleDefinition。 */
export type RuleLike = string | FieldValidator | RuleDefinition

/** 统一错误结构，供错误汇总、字段展示、定位链路和调试工具消费。 */
export interface FormError {
  field: FieldPath
  message: string
  type?: string
  rule?: RuleDefinition
}

/** 字段运行时状态，不包含真实控件实例。 */
export interface FieldState {
  path: FieldPath
  visible: boolean
  disabled: boolean
  readonly: boolean
  required: boolean
  dirty: boolean
  touched: boolean
  validating: boolean
  errors: FormError[]
}

/* -------------------------------------------------------------------------------------------------
 * 数据转换：retrieve / format
 * ------------------------------------------------------------------------------------------------- */

export type RetrieveDefinition =
  | MappingDefinition[]
  | ((model: Dict, ctx: TransformContext) => Dict | void)

export type FormatDefinition =
  | MappingDefinition[]
  | ((values: Dict, ctx: TransformContext) => Dict | void)

/** 可序列化映射规则，适合低代码保存到后端。 */
export interface MappingDefinition {
  source: string
  target: string
  transform?: string | ((value: unknown, ctx: TransformContext) => unknown)
}

/** retrieve/format/transformer 共享上下文。 */
export interface TransformContext {
  form?: FormRuntime
  registry: JsfRegistry
}

/** 字段级 retrieve：从整个外部 model 中取出当前字段的内部值。 */
export type FieldRetrieve = (
  model: Dict,
  ctx: TransformContext & { field: CompiledField }
) => unknown
/** 字段级 format：把当前字段值写回外部 model。 */
export type FieldFormat = (
  value: unknown,
  model: Dict,
  ctx: TransformContext & { field: CompiledField }
) => Dict | void

/* -------------------------------------------------------------------------------------------------
 * DataSource
 * ------------------------------------------------------------------------------------------------- */

/** 字段上的数据源声明，供 select/radio/picker 等控件复用。 */
export interface DataSourceSchema {
  sourceId: string
  params?: Dict
  search?: boolean
  pagination?: boolean
  reloadWhen?: FieldPath[]
  cache?: {
    enabled?: boolean
    key?: FieldPath[]
  }
  [key: string]: unknown
}

/** dataSource loader 执行上下文。 */
export interface DataSourceContext {
  field: ResolvedField
  values: Dict
  params: Dict
  search?: string
  pageNo?: number
  pageSize?: number
  form: FormRuntime
}

/** dataSource 返回值；raw 用于保留分页等后端原始信息。 */
export interface DataSourceResult<T = unknown> {
  options: T[]
  raw?: unknown
}

export type DataSourceLoader<T = unknown> = (
  ctx: DataSourceContext
) => MaybePromise<DataSourceResult<T> | T[]>

/** dataSource 当前请求状态；requestId 用于避免旧请求覆盖新请求。 */
export interface DataSourceState<T = unknown> {
  loading: boolean
  error: unknown
  options: T[]
  raw?: unknown
  requestId: number
}

/* -------------------------------------------------------------------------------------------------
 * 定位链路
 * ------------------------------------------------------------------------------------------------- */

/** widget 自己暴露的定位/激活能力。 */
export interface WidgetHandle {
  reveal?: (ctx: LocateContext) => MaybePromise<void>
  activate?: (ctx: LocateContext) => MaybePromise<void>
  focus?: (ctx: LocateContext) => MaybePromise<void>
  highlight?: (ctx: LocateContext) => MaybePromise<void>
}

/** 容器控件能力，例如 step/tab/collapse 根据字段路径切换面板。 */
export interface ContainerHandle {
  revealField?: (fieldPath: FieldPath, ctx: LocateContext) => MaybePromise<void>
}

/** 字段外壳能力；scroll 通常由 FieldFrame 或 renderer 实现。 */
export interface FieldHandle extends WidgetHandle {
  scroll?: (ctx: LocateContext) => MaybePromise<void>
}

/** renderer 注册到 core 的字段实例信息。 */
export interface FieldHandleEntry {
  field?: FieldHandle
  widget?: WidgetHandle
  containers?: ContainerHandle[]
}

/** 定位链路执行上下文。 */
export interface LocateContext {
  form: FormRuntime
  fieldPath: FieldPath
  reason?: string
}

/** 定位动作选项；focus 只是链路中的一步，不等价于完整定位。 */
export interface LocateOptions {
  reason?: string
  behavior?: Array<'reveal' | 'scroll' | 'activate' | 'focus' | 'highlight'>
}

/* -------------------------------------------------------------------------------------------------
 * Widget / Plugin
 * ------------------------------------------------------------------------------------------------- */

/** core 层 widget definition，只描述控件元信息，不依赖具体渲染框架。 */
export interface WidgetDefinition<TComponent = unknown> {
  name: string
  component?: TComponent
  loader?: () => Promise<{ default?: WidgetDefinition<TComponent> } | WidgetDefinition<TComponent>>
  value?: {
    prop?: string
    event?: string
  }
  defaults?: {
    props?: Dict
    behavior?: FieldBehavior
  }
  behavior?: FieldBehavior
  fieldFrame?: boolean
  designer?: Dict
  capabilities?: Dict
  [key: string]: unknown
}

/** 插件可以安装一组 widget、validator、dataSource 或 hooks。 */
export interface JsfPlugin {
  name?: string
  install?: (jsf: JsfInstance) => void
  hooks?: Partial<FormHooks>
}

/** 应用级 JSF 实例，主要负责注册扩展点。 */
export interface JsfInstance {
  registry: JsfRegistry
  platform?: JsfPlatform
  use(plugin: JsfPlugin | ((jsf: JsfInstance) => void)): JsfInstance
  register(name: string, widget: WidgetDefinition): JsfInstance
  registerLazy(
    name: string,
    loader: () => Promise<{ default?: WidgetDefinition } | WidgetDefinition>
  ): JsfInstance
  registerValidator(name: string, validator: FieldValidator): JsfInstance
  registerTransformer(name: string, transformer: Transformer): JsfInstance
  registerDataSource(name: string, loader: DataSourceLoader): JsfInstance
}

export type Transformer = (value: unknown, ctx: TransformContext) => unknown
export type Operator = (left: unknown, right: unknown, ctx: ConditionContext) => boolean

/** 表单生命周期 hooks；用于埋点、日志、动作流和外部集成。 */
export interface FormHooks {
  onFieldChange: (ctx: FieldChangeContext) => void
  onFieldBlur: (ctx: FieldEventContext) => void
  onValidateStart: (ctx: ValidateLifecycleContext) => void
  onValidateEnd: (ctx: ValidateLifecycleContext & { errors: FormError[] }) => void
  onSubmitStart: (ctx: FormLifecycleContext) => void
  onSubmitEnd: (ctx: FormLifecycleContext & { errors: FormError[] }) => void
  onWidgetLoadError: (ctx: { name: string; error: unknown }) => void
  onLocateField: (ctx: LocateContext & { behavior: LocateOptions['behavior'] }) => void
}

export interface FormLifecycleContext {
  form: FormRuntime
  values: Dict
}

export interface FieldEventContext extends FormLifecycleContext {
  field: CompiledField
}

export interface FieldChangeContext extends FieldEventContext {
  value: unknown
  previousValue: unknown
}

export interface ValidateLifecycleContext extends FormLifecycleContext {
  fields: CompiledField[]
}

/* -------------------------------------------------------------------------------------------------
 * FormRuntime
 * ------------------------------------------------------------------------------------------------- */

/** createForm 的配置项。 */
export interface CreateFormOptions {
  schema?: JsfSchema
  schemas?: SchemaFragment[]
  defaultValues?: Dict
  values?: Dict
  model?: Dict
  retrieve?: RetrieveDefinition
  format?: FormatDefinition
  registry?: JsfRegistry
  mode?: RuntimeMode
  platform?: JsfPlatform
  hooks?: Partial<FormHooks>
  widgetDefaults?: Record<string, Pick<WidgetDefinition, 'defaults' | 'behavior'>>
  onValuesChange?: (values: Dict) => void
}

export interface ValidateResult {
  valid: boolean
  errors: FormError[]
}

/** 字段调试信息；devtools 或日志面板可以直接消费。 */
export interface FieldTrace {
  field?: CompiledField
  resolvedField?: ResolvedField
  value: unknown
  state?: FieldState
  errors: FormError[]
  dependencies: FieldPath[]
  dataSource?: DataSourceState
}

/**
 * 表单运行时。
 *
 * 它是 core 的主入口：维护 values、字段状态、校验错误、dataSource 状态和定位句柄。
 * Vue/Taro renderer 只负责把这个 runtime 渲染出来。
 */
export interface FormRuntime {
  readonly schema: CompiledSchema
  readonly registry: JsfRegistry
  readonly mode: RuntimeMode
  readonly platform?: JsfPlatform

  getValues(): Dict
  setValue(path: FieldPath, value: unknown): void
  setValues(values: Dict): void
  patchValues(values: Dict): void
  replaceValues(values: Dict): void

  setModel(model: Dict): void
  getModel(): Dict
  retrieve(model: Dict): Dict
  format(values?: Dict): Dict

  validate(): Promise<ValidateResult>
  validateField(path: FieldPath): Promise<FormError[]>
  getErrors(): FormError[]
  clearErrors(path?: FieldPath): void

  getField(path: FieldPath): CompiledField | undefined
  getResolvedField(path: FieldPath): ResolvedField | undefined
  getFieldState(path: FieldPath): FieldState | undefined
  getAllFieldStates(): FieldState[]
  setFieldVisible(path: FieldPath, visible: boolean): void
  setFieldDisabled(path: FieldPath, disabled: boolean): void
  setFieldReadonly(path: FieldPath, readonly: boolean): void

  loadDataSource<T = unknown>(
    path: FieldPath,
    options?: { search?: string; pageNo?: number; pageSize?: number; params?: Dict }
  ): Promise<DataSourceState<T>>
  getDataSourceState<T = unknown>(path: FieldPath): DataSourceState<T> | undefined

  registerFieldHandle(path: FieldPath, entry: FieldHandleEntry): () => void
  locateField(path: FieldPath, options?: LocateOptions): Promise<void>
  revealField(path: FieldPath): Promise<void>
  activateField(path: FieldPath): Promise<void>
  focusField(path: FieldPath): Promise<void>

  submit(): Promise<ValidateResult>
  reset(values?: Dict): void
  destroy(): void

  subscribe(listener: (form: FormRuntime) => void): () => void
  notifyFieldBlur(path: FieldPath): void

  getDependencyGraph(): Map<FieldPath, Set<FieldPath>>
  getFieldTrace(path: FieldPath): FieldTrace
  debug(): {
    values: Dict
    errors: FormError[]
    fields: FieldTrace[]
    dependencyGraph: Map<FieldPath, Set<FieldPath>>
  }
}
