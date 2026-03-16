import { fileURLToPath } from 'node:url'
import { defineConfig, configDefaults } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, 'e2e/**', 'node_modules/**'],
    include: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.spec.tsx'],
    root: fileURLToPath(new URL('./', import.meta.url)),
  },
})
