# 介绍

Lego 是本组织的 **无业务** 前端基础设施 monorepo，主要包含：

- **@lego/web-ui**：Web 端组件（如基于 Ant Design Vue 的二次封装、ScrollView 等）
- **@lego/shared**：跨端共享模块（如 Loading 等）

业务仓库通过包管理器依赖上述包，而不是复制源码。文档站同样设计为可被业务侧的 VitePress **合并配置** 复用，见 [在业务仓库中复用](./reuse)。
