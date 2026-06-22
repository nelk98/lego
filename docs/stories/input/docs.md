# Input 输入框

Input 用于收集短文本、数字、密码等单行内容，是表单、筛选器、搜索框里的基础输入控件。

## 基础用法

文档页会展示完整示例列表；进入某个示例后，可以通过右侧 JSON controls 临时修改 `value`、`placeholder`、`size`、`disabled`、`readonly`、`clearable` 等属性。

## 设计说明

- `value` 和 `modelValue` 都可以作为受控值来源。
- `size` 提供 `sm`、`md`、`lg` 三种高度。
- `clearable` 和 `allowClear` 会展示清除按钮。
- `disabled`、`readonly` 分别表达不可操作与只读。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `value` | 当前输入值 | `string \| number` | `undefined` |
| `modelValue` | v-model 绑定值 | `string \| number` | `undefined` |
| `placeholder` | 占位提示 | `string` | `undefined` |
| `size` | 输入框尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `type` | 原生输入类型 | `string` | `'text'` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `readonly` | 是否只读 | `boolean` | `false` |
| `clearable` | 是否可清除 | `boolean` | `false` |
