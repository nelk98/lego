# 校验

校验由 core 执行，结果统一输出为 `FormError[]`。renderer 和业务侧只负责展示错误、触发校验和调用 `form.locateField()` 定位字段。

## 入口

```ts
await form.validate()
await form.validateField('customer.phone')
await form.submit()
```

- `validate()`：校验所有叶子字段。
- `validateField(path)`：校验单个字段，并写回字段错误状态。
- `submit()`：先触发表单提交生命周期，再执行 `validate()`。
- 隐藏字段默认不校验；需要校验隐藏字段时配置 `behavior.validateWhenHidden: true`。

## 提交后的纠错体验

`validateTrigger: 'submit'` 只控制错误首次出现的时机。字段一旦因为 `submit()` 或
`validate()` 展示过错误，后续编辑该字段时 core 会自动重新校验这个字段；如果字段的
`required/visible/rules.when` 等声明依赖了其它字段，依赖字段变化时也会重新校验已有错误的
受影响字段。

这样可以保持“首次提交前不打扰用户”的体验，同时避免用户修正输入后错误提示仍然停留在页面上。
异步校验会按字段忽略过期结果，连续输入时旧请求不会覆盖新值对应的错误状态。

## rules 写法

`rules` 支持四种工程代码推荐写法，运行时会统一归一化成 `RuleDefinition`。其中“规则预设”本质上也是规则对象，只是由业务或 JSF 工厂函数提前封装好：

```ts
import { minRule, validatorRule } from '@lego/jsf'

const positiveMoneyRule = validatorRule('positiveMoney')

rules: [
  'mainlandPhone',
  (value: unknown) => /^1\d{10}$/.test(String(value)) || '请输入 11 位大陆手机号',
  minRule(2, '至少 2 个字符'),
  positiveMoneyRule
]
```

- 字符串：引用 `registry` 中注册的 validator。
- 函数：直接作为当前字段的 validator。
- 规则对象：内置规则、自定义 validator 和配置可以组合。
- 规则预设：提前声明好的规则对象，可以直接放进 `rules`。

```ts
// TODO: JSON Schema 风格的“规则断言”后续由表单编辑器生成并支持。
// 当前运行时不把 { allOf / anyOf / oneOf / not } 作为独立校验规则执行。
```

## 规则对象

```ts
interface RuleDefinition {
  required?: boolean
  message?: string
  trigger?: 'change' | 'blur' | 'submit' | Array<'change' | 'blur' | 'submit'>
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url'
  pattern?: RegExp | string
  min?: number
  max?: number
  len?: number
  validator?: string | FieldValidator
  when?: ConditionDefinition
}
```

- `message`：当前规则失败时的错误文案。
- `trigger`：给 renderer 或业务层消费的触发提示；显式调用 `validate()` 时会校验所有生效规则。
- `type`：基础类型校验，`email/url` 是便捷类型。
- `pattern`：字符串值正则校验。
- `len`：字符串或数组长度必须等于指定值。
- `min/max`：数字比较；字符串和数组按长度比较。
- `validator`：注册名称或函数。
- `when`：条件校验，支持 `ConditionDefinition` 的 boolean、函数和 DSL。

## 规则预设

核心提供一组小型工厂，便于把常用规则做成可复用预设：

```ts
import {
  arrayRequiredRule,
  defineRule,
  emailRule,
  maxRule,
  minRule,
  patternRule,
  requiredRule,
  typeRule,
  validatorRule
} from '@lego/jsf'

export const phoneRule = defineRule({
  pattern: '^1\\d{10}$',
  message: '请输入 11 位大陆手机号'
})

export const contactRules = [
  arrayRequiredRule('请至少维护 1 位联系人'),
  validatorRule('stakeholders')
]
```

已内置的工厂：

- `defineRule(rule)`：声明业务预设并保留类型。
- `requiredRule(message)`：必填。
- `typeRule(type, message)`：值类型校验。
- `patternRule(pattern, message)`：正则。
- `lenRule(len, message)`：固定长度。
- `minRule(min, message)`：最小值或最小长度。
- `maxRule(max, message)`：最大值或最大长度。
- `validatorRule(validator, message)`：自定义 validator。
- `emailRule(message)` / `urlRule(message)`：常用格式。
- `arrayRequiredRule(message)` / `arrayMinRule(min, message)`：数组场景。

## required

普通字段推荐使用字段级 `required`：

```ts
{
  name: 'companyName',
  label: '企业名称',
  widget: 'input',
  required: {
    field: 'customer.type',
    op: 'eq',
    value: 'company'
  },
  requiredMessage: '请输入企业名称'
}
```

需要把“必填”做成规则预设时，可以放进 `rules`：

```ts
{
  name: 'contacts',
  label: '业务联系人',
  widget: 'stakeholderList',
  valueType: 'array',
  rules: [
    arrayRequiredRule('请至少维护 1 位联系人'),
    'stakeholders'
  ]
}
```

字段级 `required` 和 `rules` 中的 `requiredRule()` 同时存在时，字段级 required 优先，避免重复错误。空值在 required 通过后才会继续执行其他规则；非 required 的空值默认跳过格式、长度和自定义校验。

## 自定义 validator

注册名称：

```ts
jsf.registerValidator('mainlandPhone', value => {
  if (value == null || value === '') return true
  return /^1\d{10}$/.test(String(value)) || '请输入 11 位大陆手机号'
})

rules: ['mainlandPhone']
```

直接传函数：

```ts
rules: [
  (value: unknown, ctx) => {
    if (ctx.values.customer?.type !== 'company') return true
    return String(value ?? '').length >= 2 || '企业名称至少 2 个字符'
  }
]
```

返回值约定：

- `true` / `void`：通过。
- `false`：失败，使用规则的 `message` 或默认文案。
- `string`：失败，并把字符串作为错误文案。
- `FormError`：失败，并直接使用完整错误对象。
- `Promise`：支持异步校验。

## 条件校验

`when` 控制规则是否生效：

```ts
{
  validator: 'taxId',
  when: {
    allOf: [
      { field: 'customer.type', op: 'eq', value: 'company' },
      { field: 'customer.companyName', op: 'notEmpty' }
    ]
  }
}
```

`when` 只用于控制“这条规则跑不跑”。如果要控制字段是否显示、禁用、只读或必填，应该使用字段上的 `visible/disabled/readonly/required`。

## 多 Schema 合并

多个 schema fragment 合并时，静态 `rules` 默认追加：

```ts
createForm({
  schemas: [baseSchema, permissionSchema, webPatchSchema]
})
```

如果 patch 需要替换原规则：

```ts
{
  name: 'phone',
  replaceRules: true,
  rules: ['mainlandPhone']
}
```

动态 `rules` 是运行时函数或表达式，无法在编译期安全追加，通常由 patch 整体覆盖。

## 错误与定位

错误结构：

```ts
{
  field: 'customer.phone',
  message: '请输入 11 位大陆手机号',
  type: 'validator',
  rule: { validator: 'mainlandPhone' }
}
```

提交时常见处理：

```ts
const result = await form.validate()

if (!result.valid) {
  await form.locateField(result.errors[0].field)
  return
}
```

`JsfErrorSummary` 会读取 `form.getErrors()`，点击错误后调用 `form.locateField(error.field)`。复杂控件可以通过 `defineWidget` 暴露自定义 `focus/activate/reveal/highlight`，让错误定位成为完整链路，而不是只滚动到 DOM 节点。
