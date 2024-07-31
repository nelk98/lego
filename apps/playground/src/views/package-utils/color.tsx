import { Color } from '@lego/utils'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {
    const color = ref(new Color())
    return () => {
      return (
        <div>
          <div
            style={`width:100px;height:100px;background-color:${color.value}`}
            onClick={() => color.value.dropper()}
          ></div>
        </div>
      )
    }
  }
})
