import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'BasicLayoutHeader',
  setup() {
    return () => {
      return <header class="basic-layout__header">...</header>
    }
  }
})
