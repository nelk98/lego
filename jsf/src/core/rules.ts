import type { FieldValidator, RuleDefinition, RuleLike } from './types'

type RuleType = NonNullable<RuleDefinition['type']>

/** 声明一个可复用规则预设；主要用于给业务规则常量补齐类型。 */
export function defineRule<T extends RuleDefinition>(rule: T): T {
  return rule
}

/** 把 schema 中的便捷规则写法统一转换成运行时规则对象。 */
export function normalizeRule(rule: RuleLike): RuleDefinition {
  if (typeof rule === 'string') return { validator: rule }
  if (typeof rule === 'function') return { validator: rule }

  // TODO: 表单编辑器后续生成的 JSON Schema 风格“条件断言”可以在这里扩展为正式规则。
  return rule
}

/** 批量归一化规则，供校验、字段状态和调试工具复用。 */
export function normalizeRules(rules: RuleLike[] | undefined): RuleDefinition[] {
  return (rules ?? []).map(normalizeRule)
}

export function requiredRule(message?: string): RuleDefinition {
  return withMessage({ required: true }, message)
}

export function typeRule(type: RuleType, message?: string): RuleDefinition {
  return withMessage({ type }, message)
}

export function patternRule(pattern: RegExp | string, message?: string): RuleDefinition {
  return withMessage({ pattern }, message)
}

export function lenRule(len: number, message?: string): RuleDefinition {
  return withMessage({ len }, message)
}

export function minRule(min: number, message?: string): RuleDefinition {
  return withMessage({ min }, message)
}

export function maxRule(max: number, message?: string): RuleDefinition {
  return withMessage({ max }, message)
}

export function validatorRule(
  validator: string | FieldValidator,
  message?: string
): RuleDefinition {
  return withMessage({ validator }, message)
}

export function emailRule(message?: string): RuleDefinition {
  return typeRule('email', message)
}

export function urlRule(message?: string): RuleDefinition {
  return typeRule('url', message)
}

export function arrayRequiredRule(message?: string): RuleDefinition {
  return withMessage({ required: true, type: 'array', min: 1 }, message)
}

export function arrayMinRule(min: number, message?: string): RuleDefinition {
  return withMessage({ type: 'array', min }, message)
}

function withMessage<T extends RuleDefinition>(rule: T, message?: string): T {
  if (message === undefined) return rule
  return {
    ...rule,
    message
  }
}
