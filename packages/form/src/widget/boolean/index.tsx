import { defineComponent } from 'vue'

export const BooleanWidget = defineComponent({
  name: 'BooleanWidget',
  setup() {
    return () => {
      return <div>default boolean widget</div>
    }
  }
})
