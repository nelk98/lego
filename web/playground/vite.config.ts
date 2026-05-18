import { fileURLToPath, URL } from 'node:url'
import { mergeConfig, normalizePath } from 'vite'
import baseConfig from '../../configs/vite.config.base'

const sharedVariablesPath = normalizePath(
  fileURLToPath(new URL('../../shared/src/style/variables.scss', import.meta.url))
)

export default mergeConfig(baseConfig, {
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        quietDeps: true,
        additionalData: (source: string, filename: string) => {
          const norm = filename.replace(/\\/g, '/')
          if (!norm.includes('/web/playground/src/')) {
            return source
          }
          return `@use '${sharedVariablesPath}' as *;\n${source}`
        }
      }
    }
  }
})
