import type { App } from 'vue'

import LButton from './LButton.vue'

const components = [LButton]

/**
 * Ant Design Vue 二次封装 - 安装入口
 * 外部通过 app.use(LegoAntd) 引入，不直接使用 ant-design-vue
 */
export function install(app: App) {
  app.component('LButton', LButton)
}

export default { install }
