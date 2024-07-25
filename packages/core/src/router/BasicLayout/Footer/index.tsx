import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'BasicLayoutFooter',
  setup() {
    return () => {
      return <footer class="basic-layout__footer">&copy;Lego 2024</footer>
    }
  }
})
