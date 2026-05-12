import { defineConfig } from 'vitepress'
import { createLegoDocsConfig } from '../preset'

export default defineConfig(
  createLegoDocsConfig({
    extend: {
      cleanUrls: true
    }
  })
)
