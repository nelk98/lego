import { type RouteRecordRaw } from 'vue-router'

export const formRoute: RouteRecordRaw = {
  path: '/form/:componentName(.*)?',
  name: 'Form',
  component: () => import('../../views/form'),
  meta: {
    title: '模态表单',
    requiresAuth: false
  }
}
