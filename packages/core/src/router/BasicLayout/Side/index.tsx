import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'BasicLayoutMain',
  setup() {
    return () => {
      return <aside class="basic-layout__side scroll-view"></aside>
    }
  }
})
