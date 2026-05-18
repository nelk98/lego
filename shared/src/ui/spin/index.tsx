import { defineComponent } from 'vue'
import './style.scss'

export const Spin = defineComponent({
  setup() {
    return () => {
      return <div class="c_dot-spin"></div>
    }
  }
})
