# Select 选择器

Select 用于从候选项中选择一个或多个值。API 参考 HeroUI 的命名习惯，但样式由组件内部基于 shared token 自行实现；业务侧传 `items`、`value/modelValue`、`onChange` 即可。

## 设计说明

- `items` 支持普通选项和 `{ label, items }` 分组选项。
- `variant`、`color`、`size`、`radius` 控制外观；`labelPlacement` 控制标签位置。
- `description`、`errorMessage`、`isInvalid` 用于表单辅助和校验态。
- `isClearable`、`isLoading`、`isDisabled`、`isRequired` 都是直接 props。
- `selectionMode="multiple"` 时，`value/modelValue` 使用数组。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `items` | 选项数组，支持普通选项和分组 | `SelectOptionInput[]` | `[]` |
| `value` | 受控值 | `SelectModelValue` | - |
| `modelValue` | Vue 受控值 | `SelectModelValue` | - |
| `defaultValue` | 非受控初始值 | `SelectModelValue` | - |
| `label` | 标签文案 | `VNodeChild` | - |
| `placeholder` | 占位文案 | `string` | - |
| `description` | 辅助说明 | `VNodeChild` | - |
| `errorMessage` | 错误文案，存在时进入错误态 | `VNodeChild` | - |
| `variant` | 视觉变体 | `'flat' \| 'bordered' \| 'faded' \| 'underlined'` | `'flat'` |
| `color` | 语义色 | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| `size` | 尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `radius` | 圆角 | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` |
| `labelPlacement` | 标签位置 | `'outside' \| 'inside' \| 'outside-left'` | `'outside'` |
| `selectionMode` | 选择模式 | `'single' \| 'multiple'` | `'single'` |
| `isDisabled` | 是否禁用 | `boolean` | `false` |
| `isRequired` | 是否必填 | `boolean` | `false` |
| `isInvalid` | 是否错误态 | `boolean` | `false` |
| `isLoading` | 是否加载中 | `boolean` | `false` |
| `isClearable` | 是否可清除 | `boolean` | `false` |
| `fullWidth` | 是否撑满父容器 | `boolean` | `true` |
| `by` | 对象值比较字段或比较函数 | `string \| ((a, b) => boolean)` | - |
| `onChange` | 值变化事件 | `(value, option) => void` | - |
| `onClear` | 清除事件 | `() => void` | - |

## 选项类型

```ts
type SelectOption = {
  label: string
  value: string | number | bigint | Record<string, any> | null
  disabled?: boolean
  description?: string
  textValue?: string
}

type SelectOptionGroup = {
  label: string
  items: SelectOption[]
}
```
