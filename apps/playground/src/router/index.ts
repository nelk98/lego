import { createRouter, createWebHistory } from 'vue-router'
import { stylesThemeRoute } from './modules/styles'
import { uiRoute } from './modules/ui'
import { formRoute } from './modules/form'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [stylesThemeRoute, uiRoute, formRoute]
})

export default router
