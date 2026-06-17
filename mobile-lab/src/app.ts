import 'uno.css'
import '@lego/mobile-ui/styles'
import './app.scss'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

const app = createApp({
  onShow() {
    console.info('Lego mobile lab onShow')
  }
})

app.use(createPinia())

export default app
