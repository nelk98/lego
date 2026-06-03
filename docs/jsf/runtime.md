# FormRuntime

`FormRuntime` 是 JSF 的核心入口。业务代码、renderer、widget 都围绕同一个 runtime 交互。

## 创建

```ts
const form = createForm({
  schema,
  registry: jsf.registry,
  model: apiModel,
  retrieve,
  format
})
```

## values

```ts
form.getValues()
form.setValue('customer.companyName', '乐高科技')
form.patchValues({ customer: { companyName: '乐高科技' } })
form.replaceValues(nextValues)
form.reset()
```

`getValues()` 返回克隆值，避免外部绕过 runtime 修改内部状态。

## model

```ts
form.setModel(apiModel)
form.getModel()
form.retrieve(apiModel)
form.format(values)
```

`model` 是外部接口数据结构，`values` 是表单内部结构。

## 字段状态

```ts
form.getFieldState('customer.companyName')
form.setFieldVisible('customer.companyName', true)
form.setFieldDisabled('customer.companyName', false)
form.setFieldReadonly('opportunity.ownerName', false)
```

字段状态包括：

- `visible`
- `disabled`
- `readonly`
- `required`
- `dirty`
- `touched`
- `validating`
- `errors`

## 字段解析

```ts
form.getField('customer.companyName')
form.getResolvedField('customer.companyName')
```

- `getField` 返回原始编译字段。
- `getResolvedField` 返回动态属性解析后的字段。

## 定位链路

定位不是简单 focus，而是一条链：

```text
reveal -> scroll -> activate -> focus -> highlight
```

```ts
form.locateField('customer.customerId')
form.revealField('customer.customerId')
form.activateField('customer.customerId')
form.focusField('customer.customerId')
```

renderer 注册字段外壳能力，widget 通过 `useWidgetContext().exposeHandle` 暴露内部能力。

## 调试

```ts
form.getDependencyGraph()
form.getFieldTrace('opportunity.contacts')
form.debug()
```

`getFieldTrace` 会同时包含原始字段、解析字段、当前值、状态、错误、依赖和 dataSource 状态。
