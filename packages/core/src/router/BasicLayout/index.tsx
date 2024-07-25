import { defineComponent } from 'vue'
import './style.scss'
import Header from './Header'
import Footer from './Footer'
import Main from './Main'
import Side from './Side'

export default defineComponent({
  name: 'BasicLayout',
  setup() {
    return () => {
      return (
        <div class="basic-layout">
          <Header />
          <div class="basic-layout-content">
            <Side />
            <Main />
          </div>
          {/* <Footer /> */}
        </div>
      )
    }
  }
})
