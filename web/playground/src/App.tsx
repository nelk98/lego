import { defineComponent } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

import styles from './App.module.css'
import ThemeControls from './components/ThemeControls'
import { ScrollView } from '@lego/web-ui'

export default defineComponent({
  name: 'App',
  setup() {
    return () => (
      <ScrollView style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <ThemeControls />
        <header class={styles.header}>
          <nav class={styles.nav}>
            <RouterLink to="/" activeClass={styles.navLinkActive}>
              Home
            </RouterLink>
            <RouterLink to="/ui" activeClass={styles.navLinkActive}>
              UI
            </RouterLink>
            <RouterLink to="/jsf" activeClass={styles.navLinkActive}>
              JSF
            </RouterLink>
            <RouterLink to="/theme" activeClass={styles.navLinkActive}>
              theme
            </RouterLink>
            <RouterLink to="/color" activeClass={styles.navLinkActive}>
              color
            </RouterLink>
            <RouterLink to="/tailwind" activeClass={styles.navLinkActive}>
              tailwind
            </RouterLink>
          </nav>
        </header>
        <RouterView />
      </ScrollView>
    )
  }
})
