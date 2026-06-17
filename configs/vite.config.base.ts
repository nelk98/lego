import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from '@unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { unoConfigFile, withSharedSassResources } from './style'

/** workspace 包不走依赖预构建，避免 .tsx 被 esbuild 编译成 React.createElement。 */
const legoWorkspaceOptimizeDepsExclude = ['@lego/shared', '@lego/web-ui', '@lego/mobile-ui']

/**
 * 共享的 Vite 配置，供 lab 引用。
 */
const baseConfig = {
  optimizeDeps: {
    exclude: legoWorkspaceOptimizeDepsExclude
  },
  plugins: [UnoCSS({ configFile: unoConfigFile }), vue(), vueJsx(), vueDevTools()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        additionalData: withSharedSassResources
      }
    }
  }
} satisfies UserConfig

export default baseConfig
