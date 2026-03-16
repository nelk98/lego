import { defineComponent } from 'vue'
import { useCounterStore } from '@lego/shared'

import styles from './HomeView.module.css'

export default defineComponent({
  name: 'HomeView',
  setup() {
    const store = useCounterStore()
    return () => (
      <div class={styles.home}>
        <h1>Lego Mobile Playground</h1>
        <p>使用 @lego/shared: count = {store.count}</p>
      </div>
    )
  },
})
