import { defineComponent } from 'vue'

export const StringWidget = defineComponent({
  name: 'StringWidget',
  setup() {
    return () => {
      return <div>default string widget</div>
    }
  }
})
