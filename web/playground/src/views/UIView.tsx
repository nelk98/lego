import { defineComponent, ref } from 'vue'
import { LButton, Loading, ScrollView } from '@lego/web-ui'

import styles from './UIView.module.css'

export default defineComponent({
  name: 'UIView',
  setup() {
    const height = ref(310)

    return () => (
      <div class={styles.uiPlayground}>
        <h1>组件库调试</h1>
        <p class={styles.desc}>@lego/web-ui 组件展示</p>

        <section class={styles.block}>
          <h2>LButton</h2>
          <div class={styles.flex}>
            <LButton type="primary">Primary</LButton>
            <LButton tooltip="哈哈哈">Default</LButton>
            <LButton loading>Loading</LButton>
            <LButton>Loading</LButton>
            <LButton type="dashed">Dashed</LButton>
            <LButton type="link">Link</LButton>
            ???
            <Loading />
            ...
          </div>
        </section>

        <ScrollView
          style="height: 300px;"
          lowerThreshold={50}
          onScrollToLower={() => {
            console.log('scrollToLower')
            height.value += 100
          }}
        >
          <div style={`height: ${height.value}px; background-color: #f0f0f0;`}>...</div>
        </ScrollView>
      </div>
    )
  }
})
