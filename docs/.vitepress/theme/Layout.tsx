import { defineAsyncComponent, defineComponent, h, watchEffect } from 'vue'
import { useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PrimaryColorSwitch from './PrimaryColorSwitch'

const StoryLayout = defineAsyncComponent(() => import('../../runtime/components/StoryLayout'))

function isStoryRoute(path: string) {
  const cleanPath = path.replace(/\.html$/, '')
  return cleanPath === '/stories' || cleanPath.startsWith('/stories/')
}

export default defineComponent({
  name: 'LegoDocsLayout',
  setup() {
    const route = useRoute()
    const { isDark } = useData()

    watchEffect(() => {
      if (typeof document === 'undefined') {
        return
      }

      const root = document.documentElement
      root.dataset.theme = isDark.value ? 'dark' : 'light'

      if (!root.dataset.primary) {
        root.dataset.primary = 'blue'
      }
    })

    return () =>
      h(DefaultTheme.Layout, null, {
        'page-top': () => (isStoryRoute(route.path) ? h(StoryLayout) : null),
        'nav-bar-content-after': () => h(PrimaryColorSwitch, { variant: 'bar' }),
        'nav-screen-content-after': () => h(PrimaryColorSwitch, { variant: 'screen' })
      })
  }
})
