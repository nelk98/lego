import { defineComponent } from 'vue'

import styles from './HomeView.module.css'

export default defineComponent({
  name: 'HomeView',
  setup() {
    return () => (
      <main class={styles.main}>
        <h1>Lego Web Playground</h1>
        <p class={styles.desc}>组件库开发调试</p>
      </main>
    )
  },
})
