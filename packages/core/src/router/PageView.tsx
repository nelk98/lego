import { defineComponent } from 'vue'
import { RouterView, type RouteLocationNormalizedLoaded } from 'vue-router'
import useAppStore from '../stores/app'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'RouterView',
  setup() {
    const appStore = useAppStore()
    const { loadingRoute } = storeToRefs(appStore)
    return () => {
      return (
        <RouterView>
          {{
            default: ({
              Component,
              route
            }: {
              Component: any
              route: RouteLocationNormalizedLoaded
            }) => {
              return route.fullPath === loadingRoute.value ? (
                <div class="lego-page-loading">加载</div>
              ) : (
                Component
              )
            }
          }}
        </RouterView>
      )
    }
  }
})
