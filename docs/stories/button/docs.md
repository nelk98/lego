# Button 按钮

按钮用于触发一次明确的操作，适合提交表单、打开弹层、执行页面级主操作或普通文本操作。

## 基础用法

在文档页可以纵向查看所有示例；需要临时调整 props 时，点击左侧某个示例或示例卡片中的调试入口进入单示例演练模式。

## 设计说明

- `type` 控制视觉层级，常用值为 `primary`、`default`、`danger`、`text`。
- `size` 控制按钮高度和内边距，支持 `sm`、`md`、`lg`。
- `loading` 会展示加载指示并自动禁用点击。
- `disabled` 用于表达当前操作不可用。
- `block` 让按钮占满父容器宽度，常用于移动端或表单底部。
- `htmlType` 透传原生 `button`、`submit`、`reset` 类型。
- `children` 在演练场中作为插槽文本传入，方便通过 JSON 直接调试。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 视觉层级 | `'primary' \| 'default' \| 'danger' \| 'text'` | `'default'` |
| `size` | 按钮尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `loading` | 是否加载中 | `boolean` | `false` |
| `block` | 是否撑满父容器 | `boolean` | `false` |
| `htmlType` | 原生按钮类型 | `'button' \| 'submit' \| 'reset'` | `'button'` |
