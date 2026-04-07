import { fileURLToPath } from 'node:url'
import { defineConfig, normalizePath } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from '@unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const sharedSassFunctionsPath = normalizePath(
  fileURLToPath(new URL('../shared/src/style/functions.scss', import.meta.url))
)
const unoConfigFile = fileURLToPath(new URL('../uno.config.ts', import.meta.url))

/**
 * 共享的 Vite 配置，供 playground 引用
 */
export default defineConfig({
  plugins: [UnoCSS({ configFile: unoConfigFile }), vue(), vueJsx(), vueDevTools()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use '${sharedSassFunctionsPath}' as *;`
      }
    }
  }
})
