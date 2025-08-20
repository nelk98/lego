import { createRouter, createWebHistory } from 'vue-router'
import { stylesThemeRoute } from './modules/styles'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [stylesThemeRoute]
})

export default router
