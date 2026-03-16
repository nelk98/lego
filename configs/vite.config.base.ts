import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

/**
 * 共享的 Vite 配置，供 playground 引用
 */
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
})
