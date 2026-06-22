import UnoCSS from '@unocss/vite'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { fileURLToPath } from 'node:url'
import type { UserConfig } from 'vitepress'
import { mergeConfig } from 'vitepress'
import { unoConfigFile, withSharedSassResources } from '../../configs/style'
import { createHammerjsShimPlugin } from '../runtime/hammerjsShimPlugin'
import { createStoryLoaderPlugin } from '../runtime/storyLoaderPlugin'
import { legoDocsSidebar } from './sidebar'

export type { UserConfig } from 'vitepress'
export { legoDocsSidebar, legoJsfSidebar, legoMainSidebar } from './sidebar'

export interface CreateLegoDocsConfigOptions {
  /**
   * 与 Lego 默认文档配置合并（同名字段以该对象为准，部分深层字段由 VitePress mergeConfig 处理）。
   * 用于业务仓库追加 `themeConfig.nav`、替换 `title`、注册自有 `vite.plugins` 等。
   */
  extend?: UserConfig
}

const docsRoot = fileURLToPath(new URL('..', import.meta.url))
const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url))

const legoDocsOptimizeDepsExclude = [
  '@lego/shared',
  '@lego/web-ui',
  '@lego/mobile-ui',
  '@tarojs/api',
  '@tarojs/components',
  '@tarojs/runtime',
  '@tarojs/shared'
]

const legoBaseDocsConfig = {
  title: 'Lego',
  description: '无业务 UI 与工具包，供业务仓库作为依赖引入',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '演练场', link: '/stories/' },
      { text: '表单', link: '/jsf/' }
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
    plugins: [
      createHammerjsShimPlugin(),
      UnoCSS({ configFile: unoConfigFile }),
      vueJsx(),
      createStoryLoaderPlugin({ storiesDir: `${docsRoot}/stories` })
    ],
    define: {
      'process.env.TARO_ENV': JSON.stringify('h5'),
      global: 'globalThis',
      ENABLE_INNER_HTML: 'true',
      ENABLE_ADJACENT_HTML: 'true',
      ENABLE_CLONE_NODE: 'true',
      ENABLE_CONTAINS: 'true',
      ENABLE_SIZE_APIS: 'false',
      ENABLE_TEMPLATE_CONTENT: 'true',
      ENABLE_MUTATION_OBSERVER: 'false',
      DEPRECATED_ADAPTER_COMPONENT: 'false'
    },
    resolve: {
      alias: [
        {
          find: '@lego/ui',
          replacement: `${workspaceRoot}/web/ui/src/components/index.ts`
        },
        {
          find: '@lego/mobile-ui',
          replacement: `${workspaceRoot}/mobile/ui/src/index.ts`
        },
        {
          find: '@lego/mobile-ui/styles',
          replacement: `${workspaceRoot}/mobile/ui/src/entry/styles.ts`
        },
        {
          find: /^@tarojs\/components$/,
          replacement: '@tarojs/components/lib/vue3/index.js'
        },
        {
          find: /^@tarojs\/taro$/,
          replacement: '@tarojs/api/dist/index.esm.js'
        }
      ]
    },
    optimizeDeps: {
      exclude: legoDocsOptimizeDepsExclude,
      include: ['hammerjs']
    },
    ssr: {
      noExternal: [...legoDocsOptimizeDepsExclude, 'hammerjs']
    },
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          additionalData: withSharedSassResources
        }
      }
    }
  }
} as UserConfig

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
