# ScrollView

基于 [OverlayScrollbars](https://kingsora.github.io/OverlayScrollbars/) 的滚动容器封装，适用于 Web 端。

## 用法

```vue
<script setup lang="ts">
import { ScrollView } from '@lego/web-ui'
</script>

<template>
  <ScrollView
    class="h-40"
    :options="{ scrollbars: { autoHide: 'move' } }"
    @scroll="() => {}"
  >
    <div v-for="i in 50" :key="i">行 {{ i }}</div>
  </ScrollView>
</template>
```

## Props

| 名称             | 说明                                                |
| ---------------- | --------------------------------------------------- |
| `options`        | OverlayScrollbars `PartialOptions`                 |
| `lowerThreshold` | 距底部可滚距离 ≤ 该值（px）视为进入「触底敏感区」，默认 `150` |
| `trigger`        | `always` / `hover`，默认 `always`；由组件自带 **CSS**（挂在 OS `host` 上）控制 `.os-scrollbar` 显隐，与 `options.scrollbars` 独立 |

`trigger="hover"` 时：样式中对 **`@media (hover: none)`**（典型为触控）会退回滚动条常显，避免无法拖动滚动条。

## 事件

- `scroll` — 与库内同名事件参数一致（`instance`, `event`）。其余生命周期事件不对外透出，需要时通过 `getOs()` 在实例上自行 `on`。
- `scrollToLower` — 当距底部从 **大于** `lowerThreshold` 变为 **小于等于** 该值时触发一次（边界穿越检测）；先滚出敏感区再滚入可再次触发（类似小程序触底语义）。

## 实例方法（expose）

子组件 ref 上可访问 `getOs()`、`update(force?)`、`scrollTo(options?)`、`scrollBy(options?)`（后两者作用于内部滚动元素，参数同原生 `ScrollToOptions`）。
