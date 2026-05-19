/** 与 `shared/src/style/color.scss` 中 data-primary 取值一致 */
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

export const PRIMARY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

export type PrimaryStep = (typeof PRIMARY_STEPS)[number]

/** 色块上的标签文字对比色（浅色/深色主题下色阶方向相反） */
export function swatchTextClass(theme: 'light' | 'dark', step: PrimaryStep): string {
  if (theme === 'light') {
    return step <= 400 ? 'p_color-swatch-text--on-light' : 'p_color-swatch-text--on-dark'
  }
  return step >= 500 ? 'p_color-swatch-text--on-light' : 'p_color-swatch-text--on-dark'
}
