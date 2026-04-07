import { defineComponent } from 'vue'

import './index.scss'
import { Loading } from '@lego/mobile-ui'

export default defineComponent({
  name: 'PageContent',
  setup() {
    return () => (
      <div class="page home-page">
        ...
        <Loading />
      </div>
    )
  }
})
