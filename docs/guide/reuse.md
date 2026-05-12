# 在业务仓库中复用 Lego 文档

设计目标：业务仓库搭建自己的 VitePress 时，能 **共享同一套主题基线、侧栏结构、搜索与 Markdown 约定**，而不必复制粘贴配置；内容仍可在业务侧扩展。

## 1. 安装方式

### 发布后（推荐）

在业务仓库中：

```bash
pnpm add -D @lego/docs vitepress vue
```

将 `@lego/docs` 的 `private` 改为可发布版本并发布到贵司 npm / Verdaccio 后，业务侧按上式安装固定版本即可。

### Monorepo / 本地联调

在业务 monorepo 的 `pnpm-workspace.yaml` 中通过 `catalog` 或 `workspace:` 将 `@lego/docs` 指向本仓库（例如 git submodule 后的路径），与引入 `@lego/web-ui` 的方式一致。

## 2. 合并 VitePress 配置

业务仓库 `docs/.vitepress/config.ts`（路径可自定）示例：

```ts
import { defineConfig, mergeConfig } from 'vitepress'
import { createLegoDocsConfig, legoDocsSidebar } from '@lego/docs/preset'
import type { DefaultTheme } from 'vitepress'

const businessSidebar: DefaultTheme.Sidebar = [
  {
    text: '业务文档',
    items: [{ text: '概览', link: '/biz/' }],
  },
  // 需要时可直接复用 Lego 侧栏片段
  ...legoDocsSidebar,
]

export default defineConfig(
  mergeConfig(
    createLegoDocsConfig(),
    {
      title: '某某业务 · Lego',
      themeConfig: {
        nav: [
          { text: '业务首页', link: '/biz/' },
          { text: 'Lego 指南', link: '/guide/' },
        ],
        sidebar: {
          '/biz/': businessSidebar,
          '/': legoDocsSidebar,
        },
      },
    },
  ),
)
```

要点：

- **`createLegoDocsConfig()`**：返回 Lego 约定的 `title`、`themeConfig`（含默认 `sidebar`）、`markdown`、`vite.plugins`（含 Vue JSX，便于演示 TSX 组件）等。
- **`mergeConfig` / `extend`**：业务侧覆盖 `title`、`nav`、按路由拆分 `sidebar` 等。
- **`legoDocsSidebar`**：也可从 `@lego/docs/sidebar` 单独 import，便于与自有侧栏数组拼接。

若只需在预设上小幅覆盖，也可：

```ts
import { createLegoDocsConfig } from '@lego/docs/preset'

export default defineConfig(
  createLegoDocsConfig({
    extend: {
      themeConfig: {
        nav: [{ text: '首页', link: '/' }],
      },
    },
  }),
)
```

注意：`mergeConfig` 对数组字段的合并策略与对象字段不同；`nav`、`sidebar` 若需 **完全替换** 请在 `extend` 中显式写出最终值。

## 3. 主题（Theme）

当前 Lego 文档使用默认主题并附加少量 CSS（`.vitepress/theme`）。业务仓库可以：

- 继续使用 VitePress 默认主题，仅合并配置；或
- 在业务侧编写 `extends: DefaultTheme` 的主题包，与 Lego 文档风格对齐。

若后续抽取 **独立 npm 包 `@lego/docs-theme`**，可与 `@lego/docs/preset` 并列发布，此处预留演进空间。

## 4. Markdown 正文是否打进 npm？

本包 `files` 字段包含 `guide/`、`components/`、`index.md` 等，**发布 `@lego/docs` 后**，业务侧可通过以下方式复用正文（择一）：

1. **链接跳转**：业务文档中链接到已部署的 Lego 文档站点（维护成本最低）。
2. **VitePress 本地搜索 / 侧栏**：侧栏指向业务站内的路由，正文使用 `@include` 或构建时脚本从 `node_modules/@lego/docs/...` 拉取片段（路径依赖包版本，建议在 CI 中校验）。
3. **Git submodule**：业务仓库将 lego 仓库作为 submodule，VitePress `srcDir` 或 alias 指向 submodule 中的 `docs`，由单一源码源维护正文。

**推荐组合**：配置与侧栏通过 `@lego/docs/preset` 复用；正文以 **外链 + 必要时 include** 为主，避免业务构建强耦合 `node_modules` 深层路径。

## 5. 根目录脚本

在 Lego 仓库根目录已提供：

- `pnpm docs:dev` — 本地启动文档
- `pnpm docs:build` / `pnpm docs:preview` — 构建与预览

业务仓库可为自有文档目录配置独立脚本，无需与 Lego 根脚本同名。
