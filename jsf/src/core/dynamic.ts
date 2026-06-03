import { isObjectLike } from './path'
import type {
  CompiledField,
  Dict,
  DynamicExpression,
  DynamicGetter,
  DynamicValue,
  DynamicValueContext,
  FieldPath,
  ResolvedField
} from './types'

/** 给函数动态值补充依赖，便于后续依赖图、调试面板和局部刷新使用。 */
export function dynamic<T>(deps: FieldPath[], getter: DynamicGetter<T>): DynamicGetter<T>
export function dynamic<T>(getter: DynamicGetter<T>): DynamicGetter<T>
export function dynamic<T>(
  depsOrGetter: FieldPath[] | DynamicGetter<T>,
  getter?: DynamicGetter<T>
): DynamicGetter<T> {
  if (Array.isArray(depsOrGetter)) {
    return Object.assign(getter!, { deps: depsOrGetter })
  }

  return depsOrGetter
}

/** 判断一个对象是否是可序列化动态表达式，而不是普通 props。 */
export function isDynamicExpression(value: unknown): value is DynamicExpression {
  if (!isObjectLike(value)) return false
  return value.$dynamic === 'expression' || value.$dynamic === 'computed'
}

/** 执行单个动态值。表达式执行引擎尚未接入时，只消费 value/fallback。 */
export function resolveDynamicValue<T>(
  value: DynamicValue<T> | undefined,
  ctx: DynamicValueContext,
  fallback?: T
): T | undefined {
  if (value === undefined) return fallback

  if (typeof value === 'function') {
    return (value as DynamicGetter<T>)(ctx)
  }

  if (isDynamicExpression(value)) {
    if ('value' in value) return value.value as T
    if ('fallback' in value) return value.fallback as T
    return fallback
  }

  return value
}

/**
 * 解析对象中的叶子动态值。
 *
 * 主要用于 props/layout/behavior/dataSource.params。这里会把对象叶子上的函数视为
 * 动态 getter；如果业务确实要传函数 prop，后续应给 widget 设计显式 prop 协议。
 */
export function resolveDynamicObject<T extends Dict>(
  value: DynamicValue<T> | undefined,
  ctx: DynamicValueContext,
  fallback?: T
): T | undefined {
  const resolved = resolveDynamicValue(value, ctx, fallback)
  if (!resolved) return resolved
  return resolveDynamicLeaves(resolved, ctx) as T
}

/** 生成 renderer、validator、dataSource 使用的字段运行时视图。 */
export function resolveField(field: CompiledField, ctx: DynamicValueContext): ResolvedField {
  const dataSource = resolveDynamicObject(field.dataSource, ctx)

  return {
    ...field,
    label: resolveDynamicValue(field.label, ctx),
    helper: resolveDynamicValue(field.helper, ctx),
    widget: resolveDynamicValue(field.widget, ctx),
    valueType: resolveDynamicValue(field.valueType, ctx),
    props: resolveDynamicObject(field.props, ctx),
    layout: resolveDynamicObject(field.layout, ctx),
    behavior: resolveDynamicObject(field.behavior, ctx),
    rules: resolveDynamicValue<ResolvedField['rules']>(field.rules, ctx),
    requiredMessage: resolveDynamicValue(field.requiredMessage, ctx),
    dataSource: dataSource
      ? {
          ...dataSource,
          params: resolveDynamicObject(dataSource.params, ctx)
        }
      : undefined
  }
}

/** 收集动态值声明的依赖。普通函数只有通过 dynamic([...], fn) 才能被静态收集。 */
export function collectDynamicDependencies(value: unknown, output: Set<FieldPath>): void {
  if (typeof value === 'function') {
    ;((value as DynamicGetter<unknown>).deps ?? []).forEach((path) => output.add(path))
    return
  }

  if (isDynamicExpression(value)) {
    value.deps?.forEach((path) => output.add(path))
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectDynamicDependencies(item, output))
    return
  }

  if (!isObjectLike(value)) return

  Object.keys(value).forEach((key) => {
    collectDynamicDependencies(value[key], output)
  })
}

function resolveDynamicLeaves(value: unknown, ctx: DynamicValueContext): unknown {
  if (typeof value === 'function' || isDynamicExpression(value)) {
    return resolveDynamicValue(value as DynamicValue<unknown>, ctx)
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveDynamicLeaves(item, ctx))
  }

  if (!isObjectLike(value)) return value

  const output: Dict = {}

  Object.keys(value).forEach((key) => {
    output[key] = resolveDynamicLeaves(value[key], ctx)
  })

  return output
}
