import type { RGB } from '../types'

/** 将 hsb 通道转化为 rgb 通道 */
export function hsb2rgb(h: number, s: number, b: number): RGB {
  s /= 100
  b /= 100

  const c = b * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = b - c

  let r = 0,
    g = 0,
    blue = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    blue = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    blue = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    blue = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    blue = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    blue = c
  } else if (h >= 300 && h < 360) {
    r = c
    g = 0
    blue = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  blue = Math.round((blue + m) * 255)

  return { r, g, b: blue }
}
