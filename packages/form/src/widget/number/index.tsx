import { defineComponent } from 'vue'

export const NumberWidget = defineComponent({
  name: 'NumberWidget',
  setup() {
    return () => {
      return <div>default number widget</div>
    }
  }
})
