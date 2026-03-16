# Lego - 公共组件与逻辑 Monorepo

本仓库用于开发公共组件和逻辑，采用 monorepo 结构。作为 submodule 被业务层仓库引入使用。

## 目录结构

```
lego/
├── shared/                 # @lego/shared - 跨平台共享包（stores、utils、types）
├── web/                    # Web 平台
│   ├── ui/               # @lego/web-ui
│   └── playground/        # Web 开发调试 Playground
├── mobile/                 # Mobile 平台
│   ├── ui/               # @lego/mobile-ui
│   └── playground/        # Mobile 开发调试 Playground
├── configs/               # 共享配置
│   └── vite.config.base.ts
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

## 包命名规范

- `@lego/shared`：跨平台共享逻辑（Pinia stores、工具函数、类型等）
- `@lego/web-ui`：Web 平台 Vue 组件
- `@lego/mobile-ui`：Mobile 平台组件

业务层通过 `@lego/*` scope 引用，避免与 npm 包冲突。

## 脚本

| 命令                | 说明                            |
| ------------------- | ------------------------------- |
| `pnpm dev:web`      | 启动 Web Playground 开发服务    |
| `pnpm dev:mobile`   | 启动 Mobile Playground 开发服务 |
| `pnpm build:web`    | 构建 Web Playground             |
| `pnpm build:mobile` | 构建 Mobile Playground          |
| `pnpm test:unit`    | 运行单元测试                    |
| `pnpm type-check`   | 类型检查                        |
| `pnpm lint`         | 代码检查                        |
| `pnpm format`       | 代码格式化（oxfmt）             |
| `pnpm commit`       | 使用 Commitizen 交互式提交      |

## 提交规范

- 使用 `pnpm commit` 替代 `git commit`，进入 Commitizen 交互流程
- 提交前自动执行：`lint-staged` → `oxfmt` 格式化暂存文件
- 格式化工具：**oxfmt**（OXC 生态，Vue 官方推荐）

## 作为 Submodule 使用

```bash
# 在业务仓库中
git submodule add <lego-repo-url> lego
cd lego && pnpm install
```

业务层 `package.json` 中依赖：

```json
{
  "dependencies": {
    "@lego/shared": "workspace:*",
    "@lego/web-ui": "workspace:*"
  }
}
```

若业务层使用 pnpm workspace，需在根 `pnpm-workspace.yaml` 包含 submodule 路径。

## 环境要求

- Node.js: >=22
- pnpm
