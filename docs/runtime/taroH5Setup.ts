import type { App } from 'vue'
import Taro from '@tarojs/taro'
import { hooks } from '@tarojs/runtime'

import 'uno.css'
import '@lego/shared/styles/mobile'

if (hooks.isExist('initNativeApi')) {
  hooks.call('initNativeApi', Taro)
}

export function configureTaroH5App(app: App) {
  const isCustomElement = app.config.compilerOptions.isCustomElement
  app.config.compilerOptions.isCustomElement = (tag) => {
    if (tag.startsWith('taro-')) {
      return true
    }
    return typeof isCustomElement === 'function' ? isCustomElement(tag) : false
  }
}
