import { defineComponent } from 'vue'
import { LButton } from '@lego/web-ui'

import styles from './UIView.module.css'

export default defineComponent({
  name: 'UIView',
  setup() {
    return () => (
      <div class={styles.uiPlayground}>
        <h1>组件库调试</h1>
        <p class={styles.desc}>@lego/web-ui 组件展示</p>

        <section class={styles.block}>
          <h2>LButton</h2>
          <div class={styles.flex}>
            <LButton type="primary">Primary</LButton>
            <LButton>Default</LButton>
            <LButton type="dashed">Dashed</LButton>
            <LButton type="link">Link</LButton>
          </div>
        </section>
      </div>
    )
  },
})
