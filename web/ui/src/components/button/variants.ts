import type { ButtonSize, ButtonVariant } from './types'

export const buttonBaseClass = [
  'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap',
  'rounded-full font-medium outline-none',
  'transition-[background-color,border-color,color,box-shadow,transform,opacity]',
  'focus-visible:ring-3 focus-visible:ring-primary/25',
  'disabled:pointer-events-none disabled:opacity-50',
  'active:scale-[0.98]',
  'data-[pending=true]:pointer-events-none data-[pending=true]:opacity-70',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4'
]

export const buttonSizeClass: Record<ButtonSize, string> = {
  sm: 'h-6 min-w-16 px-3 text-xs',
  md: 'h-8 min-w-20 px-4 text-sm',
  lg: 'h-10 min-w-24 px-6 text-base'
}

export const iconOnlySizeClass: Record<ButtonSize, string> = {
  sm: 'size-6 min-w-0 px-0',
  md: 'size-8 min-w-0 px-0',
  lg: 'size-10 min-w-0 px-0'
}

/**
 * HeroUI v3 变体语义（用 Lego token 实现，不用 BEM）：
 * - secondary：primary 浅底 + primary 字色
 * - danger：实心危险色 + 白字
 * - danger-soft：危险色浅底 + 危险色字
 */
export const buttonVariantClass: Record<ButtonVariant, string> = {
  primary:
    'border border-solid border-transparent bg-primary text-primary-foreground hover:bg-primary-hover disabled:bg-primary-disabled',
  secondary: 'border border-solid border-transparent bg-bg-2 text-primary hover:bg-bg-3',
  tertiary: 'border border-solid border-transparent bg-bg-2 text-text-0 hover:bg-bg-3',
  // Wind4 的 .border 只设 width，须配 border-solid；颜色用 theme token（与 Select 一致）。
  outline: 'border border-solid border-line-2 bg-transparent text-text-0 hover:bg-bg-2',
  ghost: 'border border-solid border-transparent bg-transparent text-text-0 hover:bg-bg-2',
  danger:
    'border border-solid border-transparent bg-danger text-white hover:bg-danger-hover disabled:bg-danger-disabled',
  'danger-soft':
    'border border-solid border-transparent bg-danger-light text-danger hover:bg-danger-light-hover'
}
