/** 不透明度通道，取值范围 [0, 1]，保留 2 位小数 */
export type Alpha = { a: number }
export type RGB = { r: number; g: number; b: number }
export type RGBA = RGB & Alpha
export type HSL = { h: number; s: number; l: number }
export type HSB = { h: number; s: number; b: number }

// export type Hex = `#${string & /^[0-9a-fA-F]{6}$/}` // ts >= 4.9
export type Hex = `#${string}` // ts >= 4.4
