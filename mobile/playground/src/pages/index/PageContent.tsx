import { Button, Text, View } from '@tarojs/components'
import { useCounterStore } from '@lego/shared'
import { defineComponent } from 'vue'

import './index.scss'

export default defineComponent({
  name: 'PageContent',
  setup() {
    const counterStore = useCounterStore()

    return () => (
      <View class="page home-page">
        <View class="hero">
          <Text class="eyebrow">Taro 4 Playground</Text>
          <Text class="title">Lego Mobile Playground</Text>
          <Text class="description">
            现在这套入口已经切成 Taro 4 + Vite + Vue 3 + TSX，并且走 shared 的 mobile 样式入口。
          </Text>
        </View>

        <View class="card counter-card">
          <Text class="counter-label">@lego/shared / counter</Text>
          <Text class="counter-value">{counterStore.count}</Text>
          <Text class="counter-meta">doubleCount = {counterStore.doubleCount}</Text>
          <Button class="button counter-button" onClick={() => counterStore.increment()}>
            count + 1
          </Button>
        </View>
      </View>
    )
  },
})
