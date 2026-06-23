import type { IconSize, IconStyleValue } from './types'

export type IconInlineStyle = Record<string, string | number | undefined>

export function toCssSizeValue(size: IconSize | undefined): string | undefined {
  if (size === undefined || size === null || size === '') return undefined
  return typeof size === 'number' ? `${size}px` : size
}

export function quoteFontFamily(fontFamily: string): string {
  return `'${fontFamily.replace(/'/g, "\\'")}'`
}

function toKebabCase(value: string): string {
  return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

function styleObjectToCssText(style: IconInlineStyle): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key.startsWith('--') ? key : toKebabCase(key)}:${value};`)
    .join('')
}

function pruneStyle(style: IconInlineStyle): IconInlineStyle {
  return Object.fromEntries(
    Object.entries(style).filter(([, value]) => value !== undefined && value !== '')
  )
}

export function mergeIconStyle(
  baseStyle: IconInlineStyle,
  customStyle?: IconStyleValue
): IconStyleValue | undefined {
  const base = pruneStyle(baseStyle)
  if (!customStyle) return Object.keys(base).length ? base : undefined

  if (typeof customStyle === 'string') {
    return `${styleObjectToCssText(base)}${customStyle}`
  }

  return {
    ...base,
    ...customStyle
  }
}
