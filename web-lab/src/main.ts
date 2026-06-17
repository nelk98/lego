import 'uno.css'
import '@lego/web-ui/styles'
import './main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initTheme } from '@lego/web-ui'

import App from './App'
import router from './router'

const app = createApp(App)

initTheme()

app.use(createPinia())
app.use(router)

app.mount('#app')
