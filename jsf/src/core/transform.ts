import { cloneValue, getIn, setIn } from './path'
import type { JsfRegistry } from '../registry/registry'
import type {
  CompiledField,
  CompiledSchema,
  Dict,
  FormatDefinition,
  MappingDefinition,
  RetrieveDefinition,
  TransformContext
} from './types'

/**
 * 将外部 model 转为表单内部 values。
 *
 * retrieve 的方向固定为：external model -> internal form values。整体 retrieve 先执行，
 * 字段级 retrieve 后执行，因此字段可以覆盖或补充整体映射。
 */
export function retrieveValues(options: {
  schema: CompiledSchema
  registry: JsfRegistry
  model: Dict
  retrieve?: RetrieveDefinition
  form?: TransformContext['form']
}): Dict {
  const ctx: TransformContext = { registry: options.registry, form: options.form }
  const retrieve = options.retrieve ?? options.schema.retrieve
  let values = applyRetrieveDefinition(retrieve, options.model, ctx)

  options.schema.fieldMap.forEach((field) => {
    if (!field.retrieve) return
    setIn(values, field.path, field.retrieve(options.model, { ...ctx, field }))
  })

  applyDefaults(options.schema, values)
  return values
}

/**
 * 将表单内部 values 转为外部 model。
 *
 * format 的方向固定为：internal form values -> external model。提交接口、保存草稿、
 * 低代码预览都应走同一套转换，避免业务方在 submit 里手写拼装逻辑。
 */
export function formatValues(options: {
  schema: CompiledSchema
  registry: JsfRegistry
  values: Dict
  format?: FormatDefinition
  form?: TransformContext['form']
}): Dict {
  const ctx: TransformContext = { registry: options.registry, form: options.form }
  const format = options.format ?? options.schema.format
  const model = applyFormatDefinition(format, options.values, ctx)

  options.schema.fieldMap.forEach((field) => {
    if (!field.format) return
    const next = field.format(getIn(options.values, field.path), model, { ...ctx, field })
    if (next) Object.assign(model, next)
  })

  return model
}

/** 根据字段 defaultValue 补齐 values 中缺失的值。 */
export function applyDefaults(schema: CompiledSchema, values: Dict): Dict {
  schema.fieldMap.forEach((field) => {
    if (field.defaultValue === undefined) return
    if (getIn(values, field.path) !== undefined) return
    setIn(values, field.path, cloneValue(field.defaultValue))
  })

  return values
}

/** 执行整体 retrieve；没有 retrieve 时默认克隆 model。 */
function applyRetrieveDefinition(
  retrieve: RetrieveDefinition | undefined,
  model: Dict,
  ctx: TransformContext
): Dict {
  if (!retrieve) return cloneValue(model)

  if (typeof retrieve === 'function') {
    return cloneValue(retrieve(model, ctx) ?? {})
  }

  return applyMappings(retrieve, model, ctx)
}

/** 执行整体 format；没有 format 时默认克隆 values。 */
function applyFormatDefinition(
  format: FormatDefinition | undefined,
  values: Dict,
  ctx: TransformContext
): Dict {
  if (!format) return cloneValue(values)

  if (typeof format === 'function') {
    return cloneValue(format(values, ctx) ?? {})
  }

  return applyMappings(format, values, ctx)
}

/** 执行可序列化 mapping 列表。 */
function applyMappings(mappings: MappingDefinition[], source: Dict, ctx: TransformContext): Dict {
  const output: Dict = {}

  mappings.forEach((mapping) => {
    const rawValue = getIn(source, mapping.source)
    const value = applyTransformer(rawValue, mapping, ctx)
    setIn(output, mapping.target, value)
  })

  return output
}

/** 执行 mapping 上声明的 transformer，支持函数和 registry 名称两种方式。 */
function applyTransformer(
  value: unknown,
  mapping: MappingDefinition,
  ctx: TransformContext
): unknown {
  if (!mapping.transform) return value

  if (typeof mapping.transform === 'function') {
    return mapping.transform(value, ctx)
  }

  const transformer = ctx.registry.transformers.get(mapping.transform)
  if (!transformer) {
    throw new Error(`Unknown transformer: ${mapping.transform}`)
  }

  return transformer(value, ctx)
}

/** 获取叶子字段；容器字段不直接参与普通字段校验。 */
export function getLeafFields(schema: CompiledSchema): CompiledField[] {
  return [...schema.fieldMap.values()].filter((field) => !field.children?.length)
}
