# 数组字段

当前版本支持“数组作为字段值”的模式：core 负责保存数组、校验数组、`retrieve/format` 数组映射和错误定位；数组行的 UI 由业务 widget 管理。

## schema

```ts
import { arrayRequiredRule, validatorRule } from '@lego/jsf'

{
  name: 'contacts',
  label: '业务联系人',
  widget: 'stakeholderList',
  valueType: 'array',
  defaultValue: [{ name: '', role: '采购负责人', phone: '' }],
  rules: [
    arrayRequiredRule('请至少维护 1 位联系人'),
    validatorRule('stakeholders')
  ]
}
```

`arrayRequiredRule` 会同时标记字段为必填、要求值是数组，并要求至少 1 项。行内字段是否完整仍由业务 validator 或业务 widget 自己定义。

## 数据转换

```ts
retrieve: [
  { source: 'stakeholders', target: 'opportunity.contacts' }
],
format: [
  { source: 'opportunity.contacts', target: 'stakeholders' }
]
```

## widget 责任

业务 widget 接收整个数组：

```tsx
props: {
  modelValue: {
    type: Array as PropType<Stakeholder[]>,
    default: () => []
  }
}
```

更新时写回新数组：

```ts
emit('update:modelValue', nextRows)
```

这个模式适合：

- 联系人列表。
- 附件列表。
- 商品明细。
- 业务自定义可编辑表格。

## 后续 FieldArray

后续如果要支持 schema 级行模板，可以扩展：

```ts
{
  name: 'contacts',
  valueType: 'array',
  itemFields: [
    { name: 'name', widget: 'input' },
    { name: 'phone', widget: 'input' }
  ]
}
```

这会涉及动态实例路径，例如 `contacts[0].name`，需要配套：

- 增删行 API。
- 行级错误定位。
- 依赖图实例化。
- 数组项校验策略。
- renderer 的 FieldArray 容器。
