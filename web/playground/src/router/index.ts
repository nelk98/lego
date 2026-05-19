import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ui',
      name: 'ui',
      component: () => import('../views/UIView'),
      meta: { title: '组件调试' }
    },
    {
      path: '/table-view',
      name: 'table-view',
      component: () => import('../views/table-view/index'),
      meta: { title: '表格视图' }
    },
    {
      path: '/theme',
      name: 'theme',
      component: () => import('../views/theme/index'),
      meta: { title: '主题' }
    },
    {
      path: '/color',
      name: 'color',
      component: () => import('../views/color/index'),
      meta: { title: '主题色' }
    }
  ]
})

export default router
