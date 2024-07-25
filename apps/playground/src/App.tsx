import { RouterView } from '@lego/core'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  setup() {
    return () => {
      return <RouterView />
    }
  }
})
