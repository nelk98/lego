import { Icon } from '@lego/web-ui'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HomeView',
  setup() {
    return () => (
      <main class="flex flex-col gap-4 p-6">
        <h1 class="text-xl font-semibold">Web Lab</h1>
        <p class="text-text-2">Icon 来自 @lego/web-ui。</p>
        <div class="flex items-center gap-3">
          <Icon name="search" size={24} />
          <Icon name="close" size={24} color="#ef4444" />
          <Icon name="check" size={24} color="#22c55e" />
        </div>
      </main>
    )
  }
})
