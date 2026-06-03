import { evaluateCondition } from './condition'
import { normalizeRules } from './rules'
import type { JsfRegistry } from '../registry/registry'
import type {
  Dict,
  FieldValidator,
  FormError,
  FormRuntime,
  ResolvedField,
  RuleDefinition
} from './types'

/**
 * 校验单个字段当前值。
 *
 * 返回结构化错误列表，不直接修改 form 状态。状态写入由 FormRuntime 负责，便于测试
 * 和后续支持只预览校验结果的场景。
 */
export async function validateFieldValue(options: {
  field: ResolvedField
  value: unknown
  values: Dict
  form: FormRuntime
  registry: JsfRegistry
}): Promise<FormError[]> {
  const errors: FormError[] = []
  const hasFieldRequired = options.field.required !== undefined
  const requiredByField = hasFieldRequired
    ? evaluateCondition(
        options.field.required,
        {
          values: options.values,
          field: options.field,
          form: options.form,
          registry: options.registry
        },
        false
      )
    : false

  if (requiredByField && isEmpty(options.value)) {
    errors.push(
      createError(
        options.field,
        { required: true, message: options.field.requiredMessage },
        options.field.requiredMessage ?? `${options.field.label ?? options.field.path}不能为空`,
        'required'
      )
    )
  }

  for (const rule of normalizeRules(options.field.rules)) {
    if (hasFieldRequired && rule.required === true) continue

    const shouldValidate = evaluateCondition(
      rule.when,
      {
        values: options.values,
        field: options.field,
        form: options.form,
        registry: options.registry
      },
      true
    )

    if (!shouldValidate) continue

    if (rule.required === true) {
      const fieldRequired = options.field.required
      if (fieldRequired !== undefined) {
        const requiredNow = evaluateCondition(
          fieldRequired,
          {
            values: options.values,
            field: options.field,
            form: options.form,
            registry: options.registry
          },
          false
        )
        if (!requiredNow) continue
      }
    }

    const error = await validateRule(rule, options)
    if (error) errors.push(error)
  }

  return errors
}

/** 表单语义上的空值判断，required 校验共用。 */
function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

/** 执行一条规则；内置规则先跑，自定义 validator 最后跑。 */
async function validateRule(
  rule: RuleDefinition,
  options: {
    field: ResolvedField
    value: unknown
    values: Dict
    form: FormRuntime
    registry: JsfRegistry
  }
): Promise<FormError | undefined> {
  const { value, field } = options

  if (rule.required && isEmpty(value)) {
    return createError(
      field,
      rule,
      rule.message ?? `${field.label ?? field.path}不能为空`,
      'required'
    )
  }

  if (isEmpty(value)) return undefined

  if (rule.type && !validateType(rule.type, value)) {
    return createError(
      field,
      rule,
      rule.message ?? `${field.label ?? field.path}格式不正确`,
      'type'
    )
  }

  if (rule.pattern) {
    const pattern = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern
    if (typeof value !== 'string' || !pattern.test(value)) {
      return createError(
        field,
        rule,
        rule.message ?? `${field.label ?? field.path}格式不正确`,
        'pattern'
      )
    }
  }

  if (rule.len !== undefined && getComparableLength(value) !== rule.len) {
    return createError(
      field,
      rule,
      rule.message ?? `${field.label ?? field.path}长度应为 ${rule.len}`,
      'len'
    )
  }

  if (rule.min !== undefined && !validateMin(value, rule.min)) {
    return createError(
      field,
      rule,
      rule.message ?? `${field.label ?? field.path}不能小于 ${rule.min}`,
      'min'
    )
  }

  if (rule.max !== undefined && !validateMax(value, rule.max)) {
    return createError(
      field,
      rule,
      rule.message ?? `${field.label ?? field.path}不能大于 ${rule.max}`,
      'max'
    )
  }

  const validator = resolveValidator(rule.validator, options.registry)
  if (validator) {
    const result = await validator(value, {
      value,
      values: options.values,
      field,
      form: options.form,
      rule
    })

    if (typeof result === 'string') return createError(field, rule, result, 'validator')
    if (result === false) {
      return createError(
        field,
        rule,
        rule.message ?? `${field.label ?? field.path}校验失败`,
        'validator'
      )
    }
    if (result && typeof result === 'object' && 'message' in result) return result
  }

  return undefined
}

/** validator 可以直接传函数，也可以传 registry 中注册的名称。 */
function resolveValidator(
  validator: RuleDefinition['validator'],
  registry: JsfRegistry
): FieldValidator | undefined {
  if (!validator) return undefined
  if (typeof validator === 'function') return validator
  return registry.validators.get(validator)
}

/** 创建统一错误对象，方便错误面板、定位链路和调试工具消费。 */
function createError(
  field: ResolvedField,
  rule: RuleDefinition,
  message: string,
  type: string
): FormError {
  return {
    field: field.path,
    message,
    type,
    rule
  }
}

/** 基础类型校验；email/url 是常用业务便捷类型。 */
function validateType(type: NonNullable<RuleDefinition['type']>, value: unknown): boolean {
  if (type === 'array') return Array.isArray(value)
  if (type === 'object') return typeof value === 'object' && value !== null && !Array.isArray(value)
  if (type === 'email') return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  if (type === 'url') return typeof value === 'string' && /^https?:\/\/\S+$/i.test(value)
  return typeof value === type
}

function getComparableLength(value: unknown): number | undefined {
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return undefined
}

function validateMin(value: unknown, min: number): boolean {
  if (typeof value === 'number') return value >= min
  const length = getComparableLength(value)
  return length === undefined ? true : length >= min
}

function validateMax(value: unknown, max: number): boolean {
  if (typeof value === 'number') return value <= max
  const length = getComparableLength(value)
  return length === undefined ? true : length <= max
}
