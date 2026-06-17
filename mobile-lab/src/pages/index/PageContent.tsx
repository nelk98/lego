import { Icon, Loading } from '@lego/mobile-ui'
import { defineComponent } from 'vue'

import './index.scss'

export default defineComponent({
  name: 'PageContent',
  setup() {
    return () => (
      <div class="page home-page lego-theme-light">
        <p class="page-desc">Icon 来自 @lego/mobile-ui。</p>
        <div class="icon-row">
          <Icon name="search" size={24} />
          <Icon name="close" size={24} color="#ef4444" />
          <Icon name="check" size={24} color="#22c55e" />
        </div>
        <Loading />
      </div>
    )
  }
})
