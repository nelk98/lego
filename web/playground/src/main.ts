import 'uno.css'
import '@lego/shared/web'
import './main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { initTheme } from '@lego/shared'

import App from './App'
import router from './router'

const app = createApp(App)

initTheme()

app.use(createPinia())
app.use(router)

app.mount('#app')
