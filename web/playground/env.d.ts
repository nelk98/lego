/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'uno.css'
declare module '*.scss'
declare module '*.sass'
