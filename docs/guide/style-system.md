# 样式系统

Lego 的样式系统按“底层色板 → 主题语义 → 框架入口”分层。业务代码优先使用语义 token；只有做色板展示、品牌主题或特殊可视化时才直接使用 palette token。

## 色阶规范

统一使用 `50-950` 作为公开色阶，例如：

- CSS channel: `--color-blue-500`
- SCSS: `$color-blue-500`
- UnoCSS: `text-blue-500`、`bg-blue-500`、`border-blue-500`

不再把 `0-9` 作为业务可用色阶。选择 `50-950` 的原因是它和 UnoCSS / Tailwind preset 的补全心智一致，也能直接表达 `primary-500`、`red-600` 这类常见设计语言。当前源色板只有 10 个原始阶梯，所以 `950` 暂由 `900` 派生。

## 颜色变量形态

Palette CSS 变量保存 RGB 通道值，不带 `-rgb` 后缀：

```css
:root {
  --color-red-50: 254, 241, 241;
}
```

CSS 中需要完整颜色时用 `rgba(var(...), alpha)`：

```css
.surface {
  background: rgba(var(--color-red-50), 0.16);
}
```

SCSS 中 `$color-blue-500` 是完整颜色，适合直接用于常规样式；需要透明度时使用函数：

```scss
.brand {
  color: $color-blue-500;
  background: palette-color('blue', 500, 0.12);
  border-color: color-var(color-blue-500, 0.4);
}
```

语义 token 和状态 token 仍然输出完整颜色，例如 `--color-primary-500`、`--color-info`、`--color-bg-0`，业务样式优先使用这些语义 token。

## 模块关系

| 模块 | 作用 |
| --- | --- |
| `shared/src/style/_palette-config.scss` | SCSS 侧的色板 family、primary family、状态色、公开色阶元数据。 |
| `shared/src/style/palette.meta.ts` | TS / UnoCSS 侧的同构元数据，需与 `_palette-config.scss` 同步。 |
| `shared/src/style/palette.scss` | 输出全局 palette CSS 变量、状态色变量、`data-primary` 主题色变量。 |
| `shared/src/style/palette-scale-vars.scss` | 静态 SCSS 色阶变量，服务编辑器补全，例如 `$color-blue-500`。 |
| `shared/src/style/theme.scss` | 输出 `data-theme` 语义变量，例如文字、背景、边框。 |
| `shared/src/style/functions.scss` | 提供 `theme()`、`color-var()`、`palette-color()` 等 SCSS helper。 |
| `shared/src/style/variables.scss` | SCSS 注入入口，转发 palette 变量并定义语义 SCSS 变量。 |
| `shared/src/style/tokens.ts` | 导出 TS token 枚举和 `UNO_THEME_COLORS`。 |
| `uno.config.ts` | 使用 `preset-wind4` 的规则，但通过 `extendTheme` 用 Lego token 替换默认色板。 |
| `configs/style.ts` | web / mobile 共用的 Sass 注入路径和 UnoCSS 配置路径。 |
| `shared/src/style/web.scss` | Web 全局入口，包含 palette、theme、preflight。 |
| `shared/src/style/mobile.scss` | Mobile/Taro 全局入口，包含 palette、theme、移动端基础 reset。 |
| `web/ui/src/styles/shadcn-theme.css` | 把 shadcn 语义变量映射到 shared token。 |

## 使用规则

Web 应用入口引入：

```ts
import 'uno.css'
import '@lego/shared/web'
```

Mobile/Taro 应用入口引入：

```ts
import 'uno.css'
import '@lego/shared/styles/mobile'
```

SCSS 文件无需手动 `@use` shared 变量；`configs/style.ts` 会通过构建配置注入：

```scss
.card {
  color: $color-text-1;
  background: $color-bg-0;
  border-color: $color-border;
}

.brand {
  color: $color-blue-500;
  background: palette-color('blue', 500, 0.08);
}
```

UnoCSS 类名同样使用 shared token：

```tsx
<div class="bg-bg-0 text-text-1 border border-border" />
<div class="bg-blue-500/20 text-blue-700" />
<button class="bg-primary hover:bg-primary-hover text-primary-foreground" />
```

## 新增 token 需要修改哪里

新增 palette family，例如 `brand`：

1. 在 `shared/src/style/_palette-config.scss` 的 `$palette-families` 增加 `brand`。
2. 如果它能作为主题主色，在同文件 `$primary-colors` 增加 `brand`。
3. 在 `shared/src/style/palette.meta.ts` 的 `PALETTE_FAMILIES` 同步增加 `brand`。
4. 如果它能作为主题主色，在 `PRIMARY_COLOR_NAMES` 同步增加 `brand`。
5. 在 `shared/src/style/palette.scss` 的 light/dark 区块增加 `--color-brand-50` 到 `--color-brand-900`，值为 RGB 通道；`950` 会由 `900` 自动派生。
6. 在 `shared/src/style/palette-scale-vars.scss` 增加 `$color-brand-50` 到 `$color-brand-950`，值使用 `color-var(color-brand-*)`，用于 SCSS 智能提示和直接使用。

新增语义 token，例如 `color-surface-raised`：

1. 在 `shared/src/style/theme.scss` 的每个 theme map 增加 `color-surface-raised`。
2. 在 `shared/src/style/variables.scss` 增加 `$color-surface-raised: var(--color-surface-raised);`。
3. 如果需要 UnoCSS 类名，在 `shared/src/style/tokens.ts` 的 `UNO_THEME_COLORS` 增加映射。
4. 在本页文档补充 token 语义和推荐使用场景。

新增状态色，例如 `notice`：

1. 在 `shared/src/style/_palette-config.scss` 的 `$status-colors` 增加 `notice`。
2. 在 `shared/src/style/palette.meta.ts` 的 `STATUS_COLORS` 同步增加 `notice`。
3. 在 `shared/src/style/palette.scss` 定义 `--color-notice`、hover、active、disabled、light 系列；需要透明度时用 `rgba(var(--color-*), alpha)`。
4. 在 `shared/src/style/variables.scss` 增加 `$color-notice*` SCSS 变量。
5. 如需 UnoCSS 类名，`tokens.ts` 会通过 `STATUS_COLORS` 自动暴露 `text-notice`、`bg-notice-hover` 等。

新增组件私有 token 时，优先使用组件 CSS 变量并给 shared token fallback，不要先加全局变量：

```scss
.lego-widget {
  background: var(--lego-widget-bg, $color-bg-0);
  color: var(--lego-widget-color, $color-text-1);
}
```

当同一个值被多个组件复用，或需要跨 web/mobile 保持主题一致时，再提升为 shared semantic token。
