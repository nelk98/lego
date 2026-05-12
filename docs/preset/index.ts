import vueJsx from '@vitejs/plugin-vue-jsx'
import type { UserConfig } from 'vitepress'
import { mergeConfig } from 'vitepress'
import { legoDocsSidebar } from './sidebar'

export type { UserConfig } from 'vitepress'
export { legoDocsSidebar } from './sidebar'

export interface CreateLegoDocsConfigOptions {
  /**
   * 与 Lego 默认文档配置合并（同名字段以该对象为准，部分深层字段由 VitePress mergeConfig 处理）。
   * 用于业务仓库追加 `themeConfig.nav`、替换 `title`、注册自有 `vite.plugins` 等。
   */
  extend?: UserConfig
}

const legoBaseDocsConfig: UserConfig = {
  title: 'Lego',
  description: '无业务 UI 与工具包，供业务仓库作为依赖引入',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' }
    ],
    sidebar: legoDocsSidebar,
    socialLinks: [],
    footer: {
      message: 'Lego 文档',
      copyright: 'MIT License'
    },
    search: {
      provider: 'local'
    }
  },
  markdown: {
    lineNumbers: true
  },
  vite: {
    plugins: [vueJsx()]
  }
}

/**
 * 生成可合并进业务仓库 VitePress 的基础配置。
 *
 * 复用方式：
 * 1. 业务仓库 `devDependencies` 增加 `@lego/docs`（发布后）或 `workspace:/path/to/lego/docs`；
 * 2. `import { defineConfig, mergeConfig } from 'vitepress'` 与 `createLegoDocsConfig`；
 * 3. `export default defineConfig(mergeConfig(createLegoDocsConfig(), { …业务覆盖… }))`，
 *    或使用本函数提供的 `extend` 参数。
 */
export function createLegoDocsConfig(options: CreateLegoDocsConfigOptions = {}): UserConfig {
  const { extend } = options
  return extend ? mergeConfig(legoBaseDocsConfig, extend) : legoBaseDocsConfig
}
