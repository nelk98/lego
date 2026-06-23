# Button 按钮

可点击的按钮组件，支持多种变体与状态。API 对齐 [HeroUI Button](https://www.heroui.com/docs/react/components/button)。

## 设计说明

- `variant` 控制视觉样式：`primary`、`secondary`、`tertiary`、`outline`、`ghost`、`danger`、`danger-soft`。
- `isPending` 进入加载态；内容通过 scoped slot 自行渲染 Spinner（与 HeroUI 一致，组件不内置 Spinner）。
- `isDisabled` 表达不可操作；`fullWidth` 用于通栏按钮；`isIconOnly` 用于纯图标按钮。
- 默认 slot 接收 `ButtonRenderProps`，可读取 `isPending`、`isPressed` 等状态。
- 图标通过 [`Icon`](/stories/?story=icon) 组件传入，见「图标 / Icon」文档。
- `render` 可覆盖默认 `<button>` 根节点。
- `type` 为 Vue 表单扩展，支持 `button`、`submit`、`reset`。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `variant` | 视觉变体 | `'primary' \| 'secondary' \| 'tertiary' \| 'outline' \| 'ghost' \| 'danger' \| 'danger-soft'` | `'primary'` |
| `size` | 按钮尺寸 | `'sm' \| 'md' \| 'lg'` | `'md'` |
| `fullWidth` | 是否撑满父容器 | `boolean` | `false` |
| `isDisabled` | 是否禁用 | `boolean` | `false` |
| `isPending` | 是否加载中 | `boolean` | `false` |
| `isIconOnly` | 是否为纯图标按钮 | `boolean` | `false` |
| `render` | 自定义根节点渲染函数 | `ButtonRenderFn` | - |
| `type` | 原生按钮类型（Vue 扩展） | `'button' \| 'submit' \| 'reset'` | `'button'` |

## 事件

| 事件 | 说明 |
| --- | --- |
| `press` | 按钮被按下时触发，对齐 HeroUI `onPress` |
| `click` | 兼容 Vue 习惯的点击事件 |

## ButtonRenderProps

scoped slot 与 `render` 的第二个参数：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `isPending` | `boolean` | 是否处于加载状态 |
| `isPressed` | `boolean` | 是否正在被按压 |
| `isHovered` | `boolean` | 是否悬停 |
| `isFocused` | `boolean` | 是否聚焦 |
| `isFocusVisible` | `boolean` | 是否应显示焦点环 |
| `isDisabled` | `boolean` | 是否禁用 |

## 样式

组件内部使用 UnoCSS / Tailwind 工具类与 `@lego/shared` token（如 `bg-primary`、`bg-bg-2`、`border-line-2`），不复制 HeroUI 的 BEM 类名。
