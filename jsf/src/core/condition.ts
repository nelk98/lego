import { getIn } from './path'
import type { ConditionContext, ConditionDefinition, ConditionSchema } from './types'

/**
 * 执行字段显隐、禁用、只读、条件校验等共享条件。
 *
 * 条件支持函数和可序列化 DSL。低代码/后端下发应优先使用 DSL；工程内手写表单
 * 可以用函数获得更强表达力。
 */
export function evaluateCondition(
  condition: ConditionDefinition | undefined,
  ctx: ConditionContext,
  fallback = true
): boolean {
  if (condition === undefined) return fallback
  if (typeof condition === 'boolean') return condition
  if (typeof condition === 'function') return condition(ctx)

  const results: boolean[] = []

  if (hasExpression(condition)) {
    results.push(evaluateExpression(condition, ctx))
  }

  if (condition.allOf) {
    results.push(condition.allOf.every((item) => evaluateCondition(item, ctx, true)))
  }

  if (condition.anyOf) {
    results.push(condition.anyOf.some((item) => evaluateCondition(item, ctx, true)))
  }

  if (condition.oneOf) {
    const matchedCount = condition.oneOf.filter((item) => evaluateCondition(item, ctx, true)).length
    results.push(matchedCount === 1)
  }

  if (condition.not !== undefined) {
    results.push(!evaluateCondition(condition.not, ctx, true))
  }

  return results.length ? results.every(Boolean) : true
}

/** 执行单个 `{ field, op, value }` 表达式。 */
function evaluateExpression(condition: ConditionSchema, ctx: ConditionContext): boolean {
  const path = condition.field ?? condition.path
  const left = path ? getIn(ctx.values, path) : undefined
  const op = condition.op ?? 'eq'
  const operator = ctx.registry.operators.get(op)

  if (!operator) {
    throw new Error(`Unknown condition operator: ${op}`)
  }

  return operator(left, condition.value, ctx)
}

function hasExpression(condition: ConditionSchema): boolean {
  return condition.field !== undefined || condition.path !== undefined || condition.op !== undefined
}
