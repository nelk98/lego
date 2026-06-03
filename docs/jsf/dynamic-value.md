# DynamicValue

`DynamicValue<T>` 用来让运行期表现类字段支持静态值、函数和可序列化表达式。它解决的是“字段属性随表单上下文变化”的问题。

## 类型

```ts
type DynamicValue<T> =
  | T
  | ((ctx: DynamicValueContext) => T)
  | DynamicExpression<T>
```

当前推荐动态化：

- `label`
- `helper`
- `props`
- `layout`
- `behavior`
- `rules`
- `dataSource`
- `requiredMessage`
- `valueType`

不建议动态化：

- `name`
- `children`
- `retrieve`
- `format`

这些属性决定结构、路径和转换边界，运行时变化会破坏依赖图、错误定位和低代码 diff。

## 函数写法

```ts
{
  name: 'contactName',
  label: ({ values }) =>
    values.customer?.type === 'company' ? '主联系人' : '本人姓名',
  props: {
    placeholder: ({ values }) =>
      values.customer?.type === 'company' ? '请输入主联系人' : '请输入本人姓名'
  }
}
```

## 声明依赖

普通函数无法被静态分析。需要依赖图时使用 `dynamic`：

```ts
import { dynamic } from '@lego/jsf'

{
  label: dynamic(['customer.type'], ({ values }) =>
    values.customer?.type === 'company' ? '主联系人' : '本人姓名'
  )
}
```

## 可序列化表达式

低代码或后端保存时应使用表达式结构。当前 core 只读取 `value/fallback`，表达式执行引擎后续接入：

```ts
{
  helper: {
    $dynamic: 'expression',
    deps: ['opportunity.signedContract'],
    code: `values.opportunity.signedContract ? '已签约后锁定' : '提交时转为分'`,
    fallback: '提交时转为分'
  }
}
```

## 解析边界

runtime 保留原始 `CompiledField`，同时提供 `getResolvedField(path)`：

```ts
const raw = form.getField('customer.contactName')
const resolved = form.getResolvedField('customer.contactName')
```

renderer、validator、dataSource 使用 `ResolvedField`；调试和低代码保存仍可读取原始 schema。
