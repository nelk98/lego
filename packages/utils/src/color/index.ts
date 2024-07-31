import dropper from './utils/dropper'
import { clamp } from 'lodash-es'

import { type Hex, type HSB, type HSL } from './types'
import { extractRGBA, isRgbColor, isValidRGB, rgb2hex, rgbToHsb, rgbToHsl } from './utils/rgb'
import { extractHSL, hsl2rgb, isHslColor } from './utils/hsl'
import { hex2rgb, isHexColor } from './utils/hex'
import { hsb2rgb } from './utils/hsb'

/** 颜色格式 */
type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsb'

/**
 * 颜色
 * 支持 hex、rgb(a)、hsl(a)
 */
class Color {
  public r: number = 0
  public g: number = 0
  public b: number = 0
  public a: number = 1

  constructor(color: string)
  constructor(r: number, g: number, b: number, a?: number)
  constructor()
  constructor(...args: any[]) {
    if (typeof args[0] === 'string' && args[1] === undefined) {
      // 去除字符串中所有的空格
      const colorString = args[0].replace(new RegExp(' ', 'g'), '')
      if (isHexColor(colorString)) {
        this.hex = colorString
      } else if (isRgbColor(colorString)) {
        const rgba = extractRGBA(colorString)
        if (rgba) {
          const { r, g, b, a } = rgba
          this.r = r
          this.g = g
          this.b = b
          this.a = clamp(a, 0, 1)
        }
      } else if (isHslColor(colorString)) {
        const hsl = extractHSL(colorString)
        if (hsl) {
          this.hsl = hsl
        }
      }
    } else {
      const [r, g, b, a] = args.map(Number)
      if (isValidRGB(r, g, b)) {
        this.r = r
        this.g = g
        this.b = b
        if (a !== undefined) {
          this.a = clamp(a, 0, 1)
        }
      }
      return this
    }
  }

  get isValid() {
    return isValidRGB(this.r, this.g, this.b)
  }

  toString() {
    return this.toRgba()
  }

  get hex(): Hex {
    return rgb2hex(this.r, this.g, this.b)
  }

  set hex(hex: string) {
    const { r, g, b } = hex2rgb(hex)
    this.r = r
    this.g = g
    this.b = b
  }

  get hsl(): HSL {
    return rgbToHsl(this.r, this.g, this.b)
  }

  set hsl(hsl: HSL) {
    const { h, s, l } = hsl
    const { r, g, b } = hsl2rgb(h, s, l)
    this.r = r
    this.g = g
    this.b = b
  }

  get hsb(): HSB {
    return rgbToHsb(this.r, this.g, this.b)
  }

  set hsb(hsb: HSB) {
    const { h, s, b: _b } = hsb
    const { r, g, b } = hsb2rgb(h, s, _b)
    this.r = r
    this.g = g
    this.b = b
  }

  /** 十六进制颜色字符串 */
  toHex() {
    return this.hex
  }
  /** rgb颜色字符串 */
  toRgb() {
    return `rgb(${this.r}, ${this.g}, ${this.b})`
  }
  /** rgba颜色字符串 */
  toRgba() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`
  }
  /** hsl颜色字符串 */
  toHsl() {
    const { h, s, l } = this.hsl
    return `hsl(${h}, ${s}%, ${l}%)`
  }

  dropper() {
    Color.dropper()
      .then(res => {
        this.hex = res.sRGBHex
      })
      .catch(() => {})
  }

  static isHEX = isHexColor
  static isRGB = isRgbColor
  static isHSL = isHslColor
  static dropper = dropper
}

export { Color, type ColorFormat }

window.Color = Color
