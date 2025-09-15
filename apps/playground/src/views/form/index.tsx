import { defineComponent } from 'vue'
import { Schema } from '@lego/form'

new Schema({})

export default defineComponent({
  setup() {
    return () => {
      return <div>Schema Form</div>
    }
  }
})
