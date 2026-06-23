# Icon 图标

基于 `@lego/shared/icon` 的动态图标组件，Web 端从 `@lego/ui` 引入，Mobile 端从 `@lego/mobile-ui` 引入。

## 设计说明

- `name` 指定图标，支持 `phone` 或 `@linear/eye` 这类 `@库名/图标名` 写法。
- `library` 可指定默认图标库；未传时使用 `open-icon`。
- `size` 控制图标尺寸，支持数字或带单位的字符串。
- `color` 控制图标颜色，默认跟随当前文字色。
- 内置 `open-icon`、`linear`、`solid` 三个库，也可通过 `registerLibraries` 扩展。
- 在 Button 等组件中作为 slot 内容传入时，不要使用内联 SVG。
- 浏览全部图标见同级 **[图标库](/stories/?story=icon/library&view=page)** 页面，点击可复制 name。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `name` | 图标名称 | `string` | — |
| `library` | 默认图标库 | `string` | `'open-icon'` |
| `size` | 图标尺寸 | `number \| string` | `16` |
| `color` | 图标颜色 | `string` | `'currentColor'` |
| `class` | 自定义类名 | `string` | `''` |

## 引入

```tsx
import { Icon } from '@lego/ui'
// Mobile
import { Icon } from '@lego/mobile-ui'
```
