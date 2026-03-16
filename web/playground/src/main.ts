import './main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { installLegoAntd } from '@lego/web-ui'

import App from './App'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(installLegoAntd)
app.use(router)

app.mount('#app')
