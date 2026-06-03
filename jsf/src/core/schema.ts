import { cloneValue, deepMerge, joinPath } from './path'
import { collectDynamicDependencies, isDynamicExpression } from './dynamic'
import type {
  CompiledField,
  CompiledSchema,
  ConditionDefinition,
  DataSourceSchema,
  FieldPath,
  FieldSchema,
  JsfSchema,
  RuleLike,
  SchemaFragment
} from './types'

/**
 * 轻量 schema 声明 helper。
 *
 * 当前只做类型承载，不改变传入对象；后续如果需要 schema 静态校验，可以从这里扩展。
 */
export function defineSchema<T extends JsfSchema>(schema: T): T {
  return schema
}

/**
 * 合并多个 schema fragment。
 *
 * 这是权限 patch、平台 patch、低代码 patch 的基础。字段按 name 合并，其他顶层配置
 * 按普通对象合并。
 */
export function mergeSchemas(schemas: SchemaFragment[]): JsfSchema {
  const [first, ...rest] = schemas
  const output: JsfSchema = {
    ...(cloneValue(first ?? {}) as SchemaFragment),
    fields: cloneValue(first?.fields ?? [])
  }

  rest.forEach((schema) => {
    mergeSchemaInto(output, schema)
  })

  return output
}

/**
 * 将用户 schema 编译成运行时结构。
 *
 * 编译阶段会补齐字段 path、构建 fieldMap，并收集声明式规则依赖，方便后续联动、
 * 调试和局部刷新。
 */
export function compileSchema(schema: JsfSchema): CompiledSchema {
  const fieldMap = new Map<FieldPath, CompiledField>()
  const dependencies = new Map<FieldPath, Set<FieldPath>>()

  const fields = compileFields(schema.fields, undefined, fieldMap, dependencies)

  return {
    ...schema,
    fields,
    fieldMap,
    dependencies
  }
}

/** 将一个 fragment 合并到目标 schema；会特殊处理 fields。 */
function mergeSchemaInto(target: JsfSchema, fragment: SchemaFragment): void {
  const { fields, ...rest } = fragment
  const merged = deepMerge(target, rest)
  Object.assign(target, merged)

  if (fields) {
    target.fields = mergeFields(target.fields, fields)
  }
}

/**
 * 按字段 name 合并字段数组。
 *
 * rules 默认追加，只有显式 `replaceRules: true` 时整体替换；这是为了让权限/平台
 * patch 能自然追加约束。
 */
function mergeFields(baseFields: FieldSchema[], patchFields: FieldSchema[]): FieldSchema[] {
  const output = cloneValue(baseFields)

  patchFields.forEach((patchField) => {
    const index = output.findIndex((field) => field.name === patchField.name)

    if (index < 0) {
      output.push(cloneValue(patchField))
      return
    }

    const current = output[index]
    if (!current) return

    const { children, rules, replaceRules, ...restPatch } = patchField
    const merged = deepMerge(current, restPatch)

    if (rules) {
      const currentRules = getStaticArray<RuleLike>(current.rules)
      const patchRules = getStaticArray<RuleLike>(rules)
      merged.rules =
        !replaceRules && currentRules && patchRules
          ? [...cloneValue(currentRules), ...cloneValue(patchRules)]
          : cloneValue(rules)
    }

    if (children) {
      merged.children = mergeFields(current.children ?? [], children)
    }

    output[index] = merged
  })

  return output
}

/** 递归编译字段树，并同步填充 fieldMap 与依赖图。 */
function compileFields(
  fields: FieldSchema[],
  parentPath: string | undefined,
  fieldMap: Map<FieldPath, CompiledField>,
  dependencies: Map<FieldPath, Set<FieldPath>>
): CompiledField[] {
  return fields.map((field) => {
    const path = joinPath(parentPath, field.name)
    const compiled: CompiledField = {
      ...field,
      path,
      children: undefined
    }

    fieldMap.set(path, compiled)
    dependencies.set(path, collectFieldDependencies(field))

    if (field.children?.length) {
      compiled.children = compileFields(field.children, path, fieldMap, dependencies)
    }

    return compiled
  })
}

/** 收集影响字段状态的声明式依赖；函数条件无法静态分析，暂不收集。 */
function collectFieldDependencies(field: FieldSchema): Set<FieldPath> {
  const dependencies = new Set<FieldPath>()

  collectConditionDependencies(field.visible, dependencies)
  collectConditionDependencies(field.disabled, dependencies)
  collectConditionDependencies(field.readonly, dependencies)
  collectConditionDependencies(field.required, dependencies)
  collectDynamicDependencies(field.label, dependencies)
  collectDynamicDependencies(field.helper, dependencies)
  collectDynamicDependencies(field.widget, dependencies)
  collectDynamicDependencies(field.props, dependencies)
  collectDynamicDependencies(field.layout, dependencies)
  collectDynamicDependencies(field.behavior, dependencies)
  collectDynamicDependencies(field.requiredMessage, dependencies)
  collectDynamicDependencies(field.rules, dependencies)
  collectDynamicDependencies(field.dataSource, dependencies)

  getStaticArray<RuleLike>(field.rules)?.forEach((rule) => {
    if (!rule || typeof rule !== 'object') return
    collectConditionDependencies(rule.when as ConditionDefinition | undefined, dependencies)
  })

  getStaticObject<DataSourceSchema>(field.dataSource)?.reloadWhen?.forEach((path) => {
    dependencies.add(path)
  })

  return dependencies
}

function getStaticArray<T>(value: unknown): T[] | undefined {
  return Array.isArray(value) ? (value as T[]) : undefined
}

function getStaticObject<T extends object>(value: unknown): T | undefined {
  if (!value || typeof value === 'function' || Array.isArray(value) || isDynamicExpression(value)) {
    return undefined
  }
  return typeof value === 'object' ? (value as T) : undefined
}

/** 从可序列化条件 DSL 中提取依赖字段路径。 */
function collectConditionDependencies(
  condition: ConditionDefinition | undefined,
  output: Set<FieldPath>
): void {
  if (!condition || typeof condition === 'boolean' || typeof condition === 'function') return

  if ('field' in condition && condition.field) output.add(condition.field)
  if ('path' in condition && condition.path) output.add(condition.path)

  if (condition.allOf) {
    condition.allOf.forEach((item) => collectConditionDependencies(item, output))
  }

  if (condition.anyOf) {
    condition.anyOf.forEach((item) => collectConditionDependencies(item, output))
  }

  if (condition.oneOf) {
    condition.oneOf.forEach((item) => collectConditionDependencies(item, output))
  }

  if (condition.not !== undefined) {
    collectConditionDependencies(condition.not, output)
  }
}
