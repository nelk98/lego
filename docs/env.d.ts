/// <reference types="vite/client" />
/// <reference types="@tarojs/taro" />

declare module 'uno.css'

declare module 'virtual:lego-stories' {
  const stories: import('./runtime/types').StoryModuleRecord[]
  export default stories
}

declare module '*.md' {
  import type { Component } from 'vue'

  const component: Component
  export default component
}

declare namespace NodeJS {
  interface ProcessEnv {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'qq' | 'jd' | 'harmony' | 'jdrn'
  }
}

declare module '@tarojs/components' {
  export * from '@tarojs/components/types/index.vue3'
}
