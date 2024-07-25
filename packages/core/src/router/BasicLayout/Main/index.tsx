import { defineComponent } from 'vue'
import RouterView from '../../RouterView'
import './style.scss'

export default defineComponent({
  name: 'BasicLayoutMain',
  setup() {
    return () => {
      return (
        <main class="basic-layout__main scroll-view">
          <RouterView />
        </main>
      )
    }
  }
})
