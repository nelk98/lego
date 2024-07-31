import type { RGB } from '../types'

/**
 * 判断是否 十六进制颜色 字符串，支持缩写，非严格模式下可以省略 #
 * @param color 颜色字符串
 * @param strict 是否严格校验 # ，默认 true
 */
export function isHexColor(color: string, strict: boolean = true): boolean {
  const hexPattern = /^#?[0-9A-Fa-f]{6}$/
  const shortHexPattern = /^#?[0-9A-Fa-f]{3}$/

  if (strict) {
    return /^#/.test(color) && (hexPattern.test(color) || shortHexPattern.test(color))
  } else {
    return hexPattern.test(color) || shortHexPattern.test(color)
  }
}

// 将 hex 字符串转化为 rgb 通道，支持省略 #、缩写
export function hex2rgb(hex: string): RGB {
  if (!isHexColor(hex)) {
    throw new Error(`不符合 Hex 颜色格式："${hex}"`)
  }

  if (hex.startsWith('#')) {
    hex = hex.slice(1)
  }

  // 缩写补充完整
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(char => char + char)
      .join('')
  }

  hex = hex.toLowerCase()

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  return { r, g, b }
}
