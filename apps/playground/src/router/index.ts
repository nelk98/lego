import { BasicLayout, useAppStore } from '@lego/core'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: BasicLayout,
      children: [
        {
          path: '/p1',
          component: () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(import('../views/Page1')), 1000)
            }),
          children: [
            {
              path: '/p1/p3',
              component: () => import('../views/Page3')
            }
          ]
        },
        {
          path: '/p2',
          component: () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(import('../views/Page2')), 1000)
            })
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  useAppStore().setLoadingRoute(from.fullPath)

  next()
  // setTimeout(() => {
  //   next()
  // }, 1000)
})

router.afterEach((to, from, fail) => {
  useAppStore().setLoadingRoute('')
})

export default router
