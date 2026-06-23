import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { UserConfig } from '@unocss/core'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetWind4 from '@unocss/preset-wind4'

import { UNO_THEME_COLORS } from './shared/src/style/palette.meta'

const workspaceRoot = fileURLToPath(new URL('.', import.meta.url))

const LEGO_BORDER_RADIUS = {
  xl: 'calc(var(--radius) + 4px)',
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)'
} as const

export default {
  content: {
    // 默认 pipeline 不含 .ts；variants.ts 等纯 TS 模块需显式纳入。
    pipeline: {
      include: [/\.(vue|svelte|[jt]sx?|vine.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/]
    },
    // filesystem 的 cwd 是各 Vite 应用的 root（如 docs/），须用绝对路径覆盖 monorepo 包。
    filesystem: [
      join(workspaceRoot, 'web/ui/src/**/*.{ts,tsx,vue}'),
      join(workspaceRoot, 'docs/**/*.{ts,tsx,vue,md}'),
      join(workspaceRoot, 'web-lab/src/**/*.{ts,tsx,vue}'),
      join(workspaceRoot, 'mobile/ui/src/**/*.{ts,tsx,vue}')
    ]
  },
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
