# DeviceFrame 设备框

DeviceFrame 用于在 Web 演练场中嵌入真实 DOM，并按指定移动设备规格模拟屏幕尺寸、安全区、状态栏和小程序胶囊按钮。

## 基础用法

```tsx
import { DeviceFrame } from '@lego/web-ui'

function Example() {
  return (
    <DeviceFrame model="iPhone 14 Pro / 15 / 15 Pro / 16" scale={0.62}>
      <YourMobilePage />
    </DeviceFrame>
  )
}
```

slot 内容会作为真实 DOM 渲染在屏幕区域内。组件本身只提供设备外壳、视口裁剪、状态栏、胶囊按钮和 CSS 变量。

## 设计说明

- `model` 可以传内置设备名，也可以传完整设备规格对象。
- `scale` 只影响外层展示尺寸，不改变 slot 内可读取到的设备逻辑尺寸。
- 胶囊按钮使用内置 `mp-menu.svg`，位置来自设备规格里的 `capsule`。
- slot 内容可以通过 CSS 变量读取安全区与胶囊位置，例如 `var(--device-safe-area-bottom)`、`var(--device-capsule-bottom)`。
- 如果只想验证页面布局，可以关闭 `showStatusBar` 和 `showCapsule`。

## 内置型号

| 型号                               | 屏幕        | DPR | 安全区    |
| ---------------------------------- | ----------- | --- | --------- |
| `iPhone SE 2/3`                    | `375 x 667` | `2` | `20 / 0`  |
| `iPhone 14 Pro / 15 / 15 Pro / 16` | `393 x 852` | `3` | `59 / 34` |
| `iPhone 12 / 13 / 14`              | `390 x 844` | `3` | `47 / 34` |

## API

| 属性            | 说明                       | 类型                                       | 默认值                               |
| --------------- | -------------------------- | ------------------------------------------ | ------------------------------------ |
| `model`         | 设备型号名称或完整设备规格 | `DeviceFrameModelName \| DeviceFrameModel` | `'iPhone 14 Pro / 15 / 15 Pro / 16'` |
| `scale`         | 展示缩放比例               | `number`                                   | `1`                                  |
| `background`    | 屏幕背景色                 | `string`                                   | `'#ffffff'`                          |
| `showStatusBar` | 是否展示模拟状态栏         | `boolean`                                  | `true`                               |
| `showCapsule`   | 是否展示小程序胶囊按钮     | `boolean`                                  | `true`                               |

## CSS 变量

| 变量                         | 说明           |
| ---------------------------- | -------------- |
| `--device-frame-width`       | 设备逻辑宽度   |
| `--device-frame-height`      | 设备逻辑高度   |
| `--device-frame-dpr`         | 设备 DPR       |
| `--device-status-bar-height` | 状态栏高度     |
| `--device-safe-area-top`     | 顶部安全区     |
| `--device-safe-area-bottom`  | 底部安全区     |
| `--safe-area-inset-top`      | 顶部安全区别名 |
| `--safe-area-inset-bottom`   | 底部安全区别名 |
| `--device-capsule-top`       | 胶囊顶部位置   |
| `--device-capsule-right`     | 胶囊右侧位置   |
| `--device-capsule-bottom`    | 胶囊底部位置   |
