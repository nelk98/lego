import { defineConfig } from 'vitepress'
import { createLegoDocsConfig } from '../preset'

export default defineConfig(
  createLegoDocsConfig({
    extend: {
      cleanUrls: true,
      vite: {
        server: {
          port: 4900,
          strictPort: true
        },
        preview: {
          port: 4900,
          strictPort: true
        }
      }
    }
  })
)
