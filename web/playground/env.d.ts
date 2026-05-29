/// <reference types="vite/client" />
/// <reference types="w3c-web-serial" />
/// <reference types="web-bluetooth" />
/// <reference types="w3c-web-usb" />

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module 'uno.css'
declare module '*.scss'
declare module '*.sass'
