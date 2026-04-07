import { defineComponent } from 'vue'
import { Loading } from '@lego/mobile-ui'
import './index.scss'

export default defineComponent({
  name: 'PageContent',
  setup() {
    return () => (
      <div class="page home-page lego-theme-light">
        ...
        <Loading />
        ??
      </div>
    )
  }
})
