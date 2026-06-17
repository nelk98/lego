import type { UserConfig } from '@unocss/core'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetWind4 from '@unocss/preset-wind4'

import { UNO_THEME_COLORS } from './shared/src/style/palette.meta'

const LEGO_BORDER_RADIUS = {
  xl: 'calc(var(--radius) + 4px)',
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)'
} as const

export default {
  theme: {
    borderRadius: LEGO_BORDER_RADIUS
  },
  extendTheme(theme) {
    return {
      ...theme,
      colors: UNO_THEME_COLORS,
      borderRadius: {
        ...theme.borderRadius,
        ...LEGO_BORDER_RADIUS
      }
    }
  },
  presets: [
    presetWind4({
      dark: {
        dark: '[data-theme="dark"]',
        light: '[data-theme="light"]'
      },
      preflights: {
        reset: false
      }
    }),
    presetRemToPx({
      baseFontSize: 16
    })
  ]
} satisfies UserConfig
