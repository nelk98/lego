import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ColorPalette',
  setup() {
    return () => {
      return (
        <div class="color-palette">
          <h1>大标题</h1>
        </div>
      )
    }
  }
})
