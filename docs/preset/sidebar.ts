import type { DefaultTheme } from 'vitepress'

/**
 * Lego 文档默认侧栏结构。
 * 业务仓库可 `import { legoDocsSidebar } from '@lego/docs/sidebar'` 后与自有侧栏合并。
 */
export const legoMainSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '指南',
    items: [
      { text: '介绍', link: '/guide/' },
      { text: '在业务仓库中复用', link: '/guide/reuse' },
      { text: '样式系统', link: '/guide/style-system' }
    ]
  },
  {
    text: '组件',
    items: [
      { text: 'shadcn-vue Web UI', link: '/components/shadcn-vue' },
      { text: 'ScrollView', link: '/components/scroll-view' }
    ]
  },
  {
    text: '表单',
    items: [{ text: 'JSF 动态表单', link: '/jsf/' }]
  }
]

export const legoJsfSidebar: DefaultTheme.SidebarItem[] = [
  {
    text: '@lego/jsf',
    items: [
      { text: '概览', link: '/jsf/' },
      { text: '模块关系', link: '/jsf/architecture' },
      { text: 'Schema', link: '/jsf/schema' },
      { text: 'Condition DSL', link: '/jsf/condition' },
      { text: 'DynamicValue', link: '/jsf/dynamic-value' },
      { text: 'FormRuntime', link: '/jsf/runtime' },
      { text: 'Renderer', link: '/jsf/renderer' }
    ]
  },
  {
    text: '扩展模块',
    items: [
      { text: 'Widget', link: '/jsf/widgets' },
      { text: '校验', link: '/jsf/validation' },
      { text: 'DataSource', link: '/jsf/data-source' },
      { text: 'retrieve / format', link: '/jsf/transform' },
      { text: '数组字段', link: '/jsf/array' },
      { text: '低代码预留', link: '/jsf/low-code' }
    ]
  },
  {
    text: '示例与计划',
    items: [
      { text: 'Lab', link: '/jsf/lab' },
      { text: '限制与演进', link: '/jsf/roadmap' }
    ]
  }
]

export const legoDocsSidebar: DefaultTheme.Sidebar = {
  '/jsf/': legoJsfSidebar,
  '/': legoMainSidebar
}
