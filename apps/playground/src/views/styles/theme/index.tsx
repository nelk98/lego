import { defineComponent } from 'vue'
import './style.scss'

export default defineComponent({
  name: 'StyleTheme',
  setup() {
    const Content = () => {
      return (
        <div class="p_style-theme__content bg1">
          <div class="bg1">
            <div class="squircle3"></div>
            <div class="squircle4"></div>
            <div class="squircle5"></div>
            <div class="squircle6"></div>
            <div class="squircle7"></div>
            <strong>文字</strong>
            <strong class="info">信息</strong>
            <strong class="success">成功</strong>
            <strong class="danger">危险</strong>
            <strong class="warning">警告</strong>
            <strong class="price">价格</strong>
            <div class="bg2">
              <div class="bg3">
                <div class="bg4"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return () => {
      return (
        <div class="p_style-theme">
          <div lego-theme="light" style="display:contents">
            <Content />
          </div>
          <div lego-theme="dark" style="display:contents">
            <Content />
          </div>
        </div>
      )
    }
  }
})
