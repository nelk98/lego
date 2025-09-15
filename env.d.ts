/// <reference types="vite/client" />

declare module 'vue' {
  interface ComponentCustomProps {
    /** 拓展自定义组件点击事件 */
    onClick?: (e: MouseEvent) => void
  }
  interface CSSProperties {
    [key: `--${string}`]: string
  }
}

export {}
