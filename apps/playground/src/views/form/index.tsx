import { defineComponent } from 'vue'
import { Schema, WidgetManager } from '@lego/form'

new Schema({})

WidgetManager.instance.registerWidget({ key: 'xx' })

export default defineComponent({
  setup() {
    return () => {
      return <div>Schema Form</div>
    }
  }
})
