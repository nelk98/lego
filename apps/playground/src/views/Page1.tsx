import { RouterView, useAppStore } from '@lego/core'
import { storeToRefs } from 'pinia'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    const value = Math.random()
    const appStore = useAppStore()
    const { viewportHeight, viewportWidth } = storeToRefs(appStore)

    return () => {
      return (
        <div style="height:2000px">
          <div>P1，{value}</div>
          <div>
            视口：{viewportWidth.value} &times; {viewportHeight.value}
          </div>
          <div>
            <RouterView />
          </div>
        </div>
      )
    }
  }
})
