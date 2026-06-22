import type { Plugin } from 'vite'

export function createHammerjsShimPlugin(): Plugin {
  const virtualId = 'virtual:lego-hammerjs'
  const resolvedVirtualId = `\0${virtualId}`

  return {
    name: 'lego-hammerjs-shim',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'hammerjs') {
        return resolvedVirtualId
      }
      return undefined
    },
    load(id, options) {
      if (id !== resolvedVirtualId) {
        return undefined
      }

      if (options?.ssr) {
        return `
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const Hammer = require('hammerjs')

export default Hammer
`
      }

      return `
import 'hammerjs/hammer.js'

export default window.Hammer
`
    }
  }
}
