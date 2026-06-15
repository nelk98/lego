import type { UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from '@unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { unoConfigFile, withSharedSassResources } from './style'

/**
 * 共享的 Vite 配置，供 playground 引用。
 */
const baseConfig = {
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
