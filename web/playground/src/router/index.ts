import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/ui',
      name: 'ui',
      component: () => import('../views/UIView'),
      meta: { title: '组件调试' },
    },
  ],
})

export default router
