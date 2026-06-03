# Schema

Schema 描述字段语义，不描述具体平台 UI。控件可以替换，字段路径、校验、转换和低代码保存边界仍由 schema 决定。

## 字段结构

```ts
interface FieldSchema {
  name: string
  label?: DynamicValue<string>
  helper?: DynamicValue<string>
  widget?: DynamicValue<string | WidgetDefinition>
  valueType?: DynamicValue<FieldValueType>
  defaultValue?: unknown
  props?: DynamicValue<Record<string, unknown>>
  layout?: DynamicValue<Record<string, unknown>>
  behavior?: DynamicValue<FieldBehavior>
  bindings?: Record<string, BindingDefinition>
  rules?: DynamicValue<RuleLike[]>
  visible?: DynamicBoolean
  disabled?: DynamicBoolean
  readonly?: DynamicBoolean
  required?: DynamicBoolean
  requiredMessage?: DynamicValue<string>
  dataSource?: DynamicValue<DataSourceSchema>
  retrieve?: FieldRetrieve
  format?: FieldFormat
  children?: FieldSchema[]
}
```

## 职责划分

- `name`：字段路径片段，必须稳定。
- `label/helper`：字段展示语义，由 renderer 展示。
- `widget`：控件引用，可以是注册名称或直接的 `WidgetDefinition`。
- `valueType`：字段值语义，优先级高于 widget 默认建议。
- `props`：传给 widget 的控件属性。
- `layout`：传给 renderer 的布局配置。
- `behavior`：表单引擎消费的行为，例如隐藏清值。
- `bindings`：低代码动态绑定预留。
- `rules/required`：校验语义。
- `retrieve/format`：字段级数据转换。
- `children`：字段分组。

## valueType

字段应支持显式声明值类型：

```ts
{
  name: 'contacts',
  label: '业务联系人',
  widget: 'stakeholderList',
  valueType: 'array'
}
```

设计原则：

- `schema.valueType` 是字段语义来源。
- widget 只能提供默认建议，不应成为最终来源。
- 当前不会因为 `valueType: 'number'` 自动强制校验。
- 需要强校验时使用 `rules: [typeRule('number')]` 或自定义 validator。

## 多 Schema 合并

`createForm` 支持多个 schema fragment：

```ts
const form = createForm({
  schemas: [baseSchema, permissionSchema, webPatchSchema],
  registry: jsf.registry
})
```

合并规则：

- 字段按 `name` 合并。
- `props` 使用深合并。
- 静态 `rules` 默认追加；`rules` 内可放字符串 validator、函数或规则预设。
- `replaceRules: true` 时替换规则。
- `children` 递归合并。
- `visible / disabled / readonly / required` 按 patch 覆盖。

常见用途：

- 基础 schema + 权限 schema。
- 后端 schema + 前端 patch。
- 基础 schema + Web/Taro 平台差异。
- 低代码 schema + 工程侧补充行为。
