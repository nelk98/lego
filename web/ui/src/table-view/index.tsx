import { defineComponent } from 'vue'
import './style.scss'

const TableView = defineComponent({
  setup() {
    return () => {
      return <div class="c_table-view">...</div>
    }
  }
})

export { TableView }
