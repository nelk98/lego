import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Lego',
  description: 'A VitePress Site',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: 'Apps 应用', link: '/apps', activeMatch: '/apps' },
      {
        text: 'Packages 包',
        activeMatch: '/packages',
        items: [
          { text: 'Core - 核心', link: '/packages/core' },
          { text: 'UI - 界面', link: '/packages/ui' },
          { text: 'Styles - 样式', link: '/packages/styles' },
          { text: 'Utils - 工具函数', link: '/packages/utils' },
          { text: 'JSF - 表单', link: '/packages/jsf' },
          { text: 'Deck - 装修', link: '/packages/deck' },
          { text: 'Config - 配置', link: '/packages/config' }
        ]
      },
      {
        text: '更新日志',
        link: '/changelog'
      }
    ],

    sidebar: {
      '/packages/core': [
        {
          text: '权限',
          collapsed: false,
          items: [{ text: '鉴权登录', link: '/packages/core/permission' }]
        }
      ],
      '/packages/utils': [
        {
          text: '概览',
          link: '/packages/utils/'
        },
        {
          text: '界面',
          collapsed: false,
          items: [{ text: 'Color 颜色', link: '/packages/utils/color' }]
        }
      ]
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }]
  }
})
