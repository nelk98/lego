import { mergeConfig, defineConfig } from 'vite'
import baseConfig from '../../vite.config.base'

export default defineConfig(config => {
  return mergeConfig(baseConfig, {})
})
