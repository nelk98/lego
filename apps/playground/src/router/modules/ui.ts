import { type RouteRecordRaw } from 'vue-router'

export const uiRoute: RouteRecordRaw = {
  path: '/ui/:componentName(.*)?',
  name: 'Ui',
  component: () => import('../../views/ui'),
  meta: {
    title: 'UI组件',
    requiresAuth: false
  }
}
