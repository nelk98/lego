import { fileURLToPath, URL } from 'node:url'
import { mergeConfig } from 'vite'
import baseConfig from '../../configs/vite.config.base'

export default mergeConfig(baseConfig, {
  server: {
    port: 5100,
    strictPort: true
  },
  preview: {
    port: 5100,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
