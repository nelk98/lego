import type { UserConfigExport } from '@tarojs/cli'

export default {
  devServer: {
    port: 5000,
    strictPort: true
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport<'vite'>
