import { Loading } from '@lego/ui'
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {
    return () => {
      return (
        <div>
          <Loading />
        </div>
      )
    }
  }
})
