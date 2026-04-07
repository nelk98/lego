import { defineComponent } from 'vue'
import './style.scss'

export const Loading = defineComponent({
  setup() {
    return () => {
      return <div class="c_dot-loading"></div>
    }
  }
})
