import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'

import styles from './App.module.css'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <div class={styles.mobileWrapper}>
        <RouterView />
      </div>
    )
  },
})
