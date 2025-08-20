import { type RouteRecordRaw } from 'vue-router'

export const stylesThemeRoute: RouteRecordRaw = {
  path: '/styles/theme',
  name: 'StylesTheme',
  component: () => import('../../views/styles/theme'),
  meta: {
    title: '主题样式',
    requiresAuth: false
  }
}
