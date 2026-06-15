/** 色板元数据，供 UnoCSS / TS 使用。与 palette.scss 顶部的 SCSS 列表保持同步。 */

export const PALETTE_FAMILIES = [
  'amber',
  'blue',
  'carmine',
  'cyan',
  'green',
  'grey',
  'indigo',
  'light-blue',
  'light-green',
  'lime',
  'neutral',
  'orange',
  'pink',
  'purple',
  'red',
  'saffron',
  'teal',
  'turquoise',
  'violet',
  'wathet',
  'yellow'
] as const

export type PaletteFamily = (typeof PALETTE_FAMILIES)[number]

export const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type ColorStep = (typeof COLOR_STEPS)[number]

export const PRIMARY_COLOR_NAMES = [
  'amber',
  'blue',
  'cyan',
  'green',
  'grey',
  'indigo',
  'light-blue',
  'light-green',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'violet',
  'yellow'
] as const

export type PrimaryColorName = (typeof PRIMARY_COLOR_NAMES)[number]

export const PRIMARY_STEPS = COLOR_STEPS
export type PrimaryStep = ColorStep

export const STATUS_COLORS = ['info', 'success', 'warning', 'danger'] as const

export const STATUS_SUFFIXES = [
  '',
  '-hover',
  '-active',
  '-disabled',
  '-light',
  '-light-hover',
  '-light-active'
] as const

function cssVar(token: string) {
  return `var(--${token})`
}

function rgbaChannel(token: string) {
  return `rgba(var(--${token}), 1)`
}

/** 公开色板：CSS 变量保存 RGB 通道，UnoCSS 中映射为完整颜色。 */
export function buildPaletteUnoColors() {
  const colors: Record<string, Record<number | 'DEFAULT', string> | string> = {
    white: rgbaChannel('color-white'),
    black: rgbaChannel('color-black')
  }

  for (const family of PALETTE_FAMILIES) {
    colors[family] = {
      DEFAULT: rgbaChannel(`color-${family}`),
      ...Object.fromEntries(
        COLOR_STEPS.map((step) => [step, rgbaChannel(`color-${family}-${step}`)])
      )
    }
  }

  for (const name of STATUS_COLORS) {
    for (const suffix of STATUS_SUFFIXES) {
      colors[`${name}${suffix}`] = cssVar(`color-${name}${suffix}`)
    }
  }

  return colors
}

const primarySteps = Object.fromEntries(
  PRIMARY_STEPS.map((step) => [step, `var(--color-primary-${step})`])
)

const paletteColors = buildPaletteUnoColors()

export const UNO_THEME_COLORS = {
  border: 'var(--color-border)',
  input: 'var(--input)',
  ring: 'var(--ring)',
  background: 'var(--background)',
  foreground: 'var(--foreground)',

  primary: {
    DEFAULT: 'var(--color-primary)',
    foreground: 'var(--color-foreground)',
    hover: 'var(--color-primary-600)',
    active: 'var(--color-primary-700)',
    disabled: 'var(--color-primary-100)',
    ...primarySteps
  },

  text: {
    DEFAULT: 'var(--color-text)',
    muted: 'var(--color-text-muted)',
    0: 'var(--color-text-0)',
    1: 'var(--color-text-1)',
    2: 'var(--color-text-2)',
    3: 'var(--color-text-3)',
    4: 'var(--color-text-4)',
    5: 'var(--color-text-5)'
  },

  bg: {
    DEFAULT: 'var(--color-bg)',
    0: 'var(--color-bg-0)',
    1: 'var(--color-bg-1)',
    2: 'var(--color-bg-2)',
    3: 'var(--color-bg-3)',
    4: 'var(--color-bg-4)',
    5: 'var(--color-bg-5)'
  },

  line: {
    1: 'var(--color-line-1)',
    2: 'var(--color-line-2)',
    3: 'var(--color-line-3)',
    4: 'var(--color-line-4)'
  },

  secondary: {
    DEFAULT: 'var(--secondary)',
    foreground: 'var(--secondary-foreground)'
  },
  destructive: {
    DEFAULT: 'var(--destructive)',
    foreground: 'var(--destructive-foreground)'
  },
  muted: {
    DEFAULT: 'var(--muted)',
    foreground: 'var(--muted-foreground)'
  },
  accent: {
    DEFAULT: 'var(--accent)',
    foreground: 'var(--accent-foreground)'
  },
  popover: {
    DEFAULT: 'var(--popover)',
    foreground: 'var(--popover-foreground)'
  },
  card: {
    DEFAULT: 'var(--card)',
    foreground: 'var(--card-foreground)'
  },

  ...paletteColors
} as const
