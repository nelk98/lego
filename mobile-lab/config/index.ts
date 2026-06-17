import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfigExport } from '@tarojs/cli'

import devConfig from './dev'
import prodConfig from './prod'

const { sharedSassResources, unoConfigFile, legoMobileTaroVite } =
  require('../../configs/style.cjs') as typeof import('../../configs/style.cjs')

export default defineConfig<'vite'>(async (merge) => {
  const { default: UnoCSS } = await Function('return import("@unocss/vite")')()

  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'mobile-lab',
    date: '2026-04-03',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url))
    },
    framework: 'vue3',
    compiler: {
      type: 'vite',
      vitePlugins: [UnoCSS({ configFile: unoConfigFile })]
    },
    mini: {
      vite: legoMobileTaroVite,
      sassLoaderOption: {
        additionalData: sharedSassResources
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    h5: {
      vite: legoMobileTaroVite,
      publicPath: '/',
      staticDirectory: 'static',
      sassLoaderOption: {
        additionalData: sharedSassResources
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, devConfig)
  }

  return merge({}, baseConfig, prodConfig)
})
