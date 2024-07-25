import { RouterView } from '@lego/core'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      return (
        <div>
          <div>P3</div>
          <div>
            <RouterView />
          </div>
        </div>
      )
    }
  }
})
