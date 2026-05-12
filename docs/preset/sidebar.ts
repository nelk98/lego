import type { DefaultTheme } from 'vitepress'

/**
 * Lego 文档默认侧栏结构。
 * 业务仓库可 `import { legoDocsSidebar } from '@lego/docs/sidebar'` 后与自有侧栏合并。
 */
export const legoDocsSidebar: DefaultTheme.Sidebar = [
  {
    text: '指南',
    items: [
      { text: '介绍', link: '/guide/' },
      { text: '在业务仓库中复用', link: '/guide/reuse' }
    ]
  },
  {
    text: '组件',
    items: [{ text: 'ScrollView', link: '/components/scroll-view' }]
  }
]
