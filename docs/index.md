---
layout: home

hero:
  name: Lego
  text: 组件与共享 UI
  tagline: 无业务逻辑的基础设施包，供各业务仓库按需引入
  actions:
    - theme: brand
      text: 指南
      link: /guide/
    - theme: alt
      text: 在业务中复用文档
      link: /guide/reuse

features:
  - title: 与业务解耦
    details: 本仓库不包含业务域模型，仅维护可复用的 UI 与工具。
  - title: 文档可复用
    details: 通过 @lego/docs/preset 与 @lego/docs/sidebar 在业务侧合并 VitePress 配置与导航结构。
  - title: Monorepo 友好
    details: 使用 pnpm workspace 协议即可在本地联调文档与组件。
---
