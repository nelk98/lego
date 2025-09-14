import { createRouter, createWebHistory } from 'vue-router'
import { stylesThemeRoute } from './modules/styles'
import { uiRoute } from './modules/ui'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [stylesThemeRoute, uiRoute]
})

export default router
