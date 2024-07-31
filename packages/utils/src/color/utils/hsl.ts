import type { HSL, RGB } from '../types'

/**
 * 判断是否 hsl颜色 字符串，非严格模式下可以省略 rgba() 格式符号
 * @param color 颜色字符串
 * @param strict 是否严格校验 rgba() 格式符号，默认 true
 */
export function isHslColor(color: string, strict: boolean = true): boolean {
  const hslPattern = /^\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*$/
  const hslaPattern = /^\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*,\s*(0|0?\.\d+|1(\.0)?)\s*$/
  if (strict) {
    return /^hsla?\(/.test(color) && (hslPattern.test(color.slice(4, -1)) || hslaPattern.test(color.slice(5, -1)))
  } else {
    return hslPattern.test(color) || hslaPattern.test(color)
  }
}

export function extractHSL(hslString: string): HSL | null {
  const regex = /hsl\(\s*(\d+),\s*([\d.]+)%,\s*([\d.]+)%\s*\)/
  const match = hslString.match(regex)

  if (match) {
    const h = parseInt(match[1], 10)
    const s = parseFloat(match[2])
    const l = parseFloat(match[3])
    return { h, s, l }
  }

  return null // 如果格式不正确，返回 null
}

/** 将 hsl 通道转化为 rgb 通道 */
export function hsl2rgb(h: number, s: number, l: number): RGB {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return { r, g, b }
}
