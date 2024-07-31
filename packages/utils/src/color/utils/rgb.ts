import type { Hex, HSB, HSL, RGBA } from '../types'

/**
 * 判断是否 rgb(a)颜色 字符串，非严格模式下可以省略 rgba() 格式符号
 * @param color 颜色字符串
 * @param strict 是否严格校验 rgba() 格式符号，默认 true
 */
export function isRgbColor(color: string, strict: boolean = true): boolean {
  const rgbPattern = /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*$/
  const rgbaPattern = /^\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|0?\.\d+|1(\.0)?)\s*$/

  if (strict) {
    return /^rgba?\(/.test(color) && (rgbPattern.test(color.slice(4, -1)) || rgbaPattern.test(color.slice(5, -1)))
  } else {
    return rgbPattern.test(color) || rgbaPattern.test(color)
  }
}

/** 判断 rgb 通道值是否合法 */
export function isValidRGB(r: number, g: number, b: number) {
  return (
    Number.isInteger(r) &&
    r >= 0 &&
    r <= 255 &&
    Number.isInteger(g) &&
    g >= 0 &&
    g <= 255 &&
    Number.isInteger(b) &&
    b >= 0 &&
    b <= 255
  )
}

export function extractRGBA(colorString: string): RGBA | null {
  const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  const match = colorString.match(regex)

  if (match) {
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1 // 默认为 1
    return { r, g, b, a }
  }

  return null // 无效的格式
}

/** 将 rgb 通道转化为 hex字符串，格式 #rrggbb */
export function rgb2hex(r: number, g: number, b: number): Hex {
  if (!isValidRGB(r, g, b)) {
    throw new Error(`不符合 RGB 颜色格式："${r}, ${g}, ${b}"`)
  }
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase() as Hex
}

/** 将 rgb 通道转化为 hsl 通道 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const delta = max - min
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)

    if (max === r) {
      h = (g - b) / delta + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else if (max === b) {
      h = (r - g) / delta + 4
    }

    h /= 6
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const lightness = Math.round(l * 100)

  return { h, s, l: lightness }
}

/** 将 rgb 通道转化为 hsb 通道 */
export function rgbToHsb(r: number, g: number, b: number): HSB {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  let s = 0
  const v = max

  if (max !== 0) {
    s = delta / max
  }

  if (delta !== 0) {
    if (max === r) {
      h = (g - b) / delta + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / delta + 2
    } else {
      h = (r - g) / delta + 4
    }
    h /= 6
  }

  h = Math.round(h * 360)
  s = Math.round(s * 100)
  const brightness = Math.round(v * 100)

  return { h, s, b: brightness }
}
