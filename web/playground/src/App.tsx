import { defineComponent } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import styles from './App.module.css'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <>
        <header class={styles.header}>
          <nav class={styles.nav}>
            <RouterLink to="/" activeClass={styles.navLinkActive}>
              Home
            </RouterLink>
            <RouterLink to="/ui" activeClass={styles.navLinkActive}>
              UI
            </RouterLink>
          </nav>
        </header>
        <RouterView />
      </>
    )
  },
})
