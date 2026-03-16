import { fileURLToPath, URL } from 'node:url'
import { mergeConfig } from 'vite'
import baseConfig from '../../configs/vite.config.base'

export default mergeConfig(baseConfig, {
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
