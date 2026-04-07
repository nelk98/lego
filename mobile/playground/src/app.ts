import 'uno.css'
import '@lego/shared/styles/mobile'
import './app.scss'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

const app = createApp({
  onShow() {
    console.info('Lego mobile playground onShow')
  }
})

app.use(createPinia())

export default app
