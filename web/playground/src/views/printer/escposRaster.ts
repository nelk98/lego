import { concatEsc, escCut, escFeed, escInit } from './escpos'

/** 58mm 热敏纸常见 printable 宽度（203dpi） */
export const RECEIPT_RASTER_WIDTH = 384

export const KAMAO_LOGO_URL = '/kamao-logo.png'

const MAX_LOGO_HEIGHT = 320

export interface RasterBitmap {
  width: number
  height: number
  bytesPerRow: number
  /** 横向打包：每字节 8 个水平点，MSB 在左（ESC * 常用） */
  data: Uint8Array
  blackPixels: number
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`无法加载图片：${url}`))
    img.src = url
  })
}

/** 转为黑白点阵（横向打包，适配 ESC *） */
export function rasterizeImage(
  img: HTMLImageElement,
  targetWidth = RECEIPT_RASTER_WIDTH,
  threshold = 150
): RasterBitmap {
  let scale = targetWidth / img.naturalWidth
  let height = Math.max(1, Math.round(img.naturalHeight * scale))
  if (height > MAX_LOGO_HEIGHT) {
    scale = (targetWidth / img.naturalWidth) * (MAX_LOGO_HEIGHT / height)
    height = MAX_LOGO_HEIGHT
  }
  const drawWidth = Math.round(img.naturalWidth * scale)
  const drawHeight = height

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, targetWidth, height)
  const offsetX = Math.floor((targetWidth - drawWidth) / 2)
  ctx.drawImage(img, offsetX, 0, drawWidth, drawHeight)

  const { data } = ctx.getImageData(0, 0, targetWidth, height)
  const bytesPerRow = Math.ceil(targetWidth / 8)
  const out = new Uint8Array(bytesPerRow * height)
  let blackPixels = 0

  for (let y = 0; y < height; y++) {
    for (let byteX = 0; byteX < bytesPerRow; byteX++) {
      let byte = 0
      for (let bit = 0; bit < 8; bit++) {
        const x = byteX * 8 + bit
        if (x >= targetWidth) continue
        const i = (y * targetWidth + x) * 4
        const lum = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!
        if (lum < threshold) {
          byte |= 0x80 >> bit
          blackPixels++
        }
      }
      out[y * bytesPerRow + byteX] = byte
    }
  }

  return { width: targetWidth, height, bytesPerRow, data: out, blackPixels }
}

/** GS v 0 纵向打包（部分机型） */
function rasterToGsV0Vertical(bitmap: RasterBitmap) {
  const { width, height, bytesPerRow, data } = bitmap
  const vertical = new Uint8Array(bytesPerRow * height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const byteX = x >> 3
      const src = data[y * bytesPerRow + byteX]!
      if (src & (0x80 >> (x & 7))) {
        const idx = y * bytesPerRow + byteX
        vertical[idx] = (vertical[idx] ?? 0) | (0x80 >> (y & 7))
      }
    }
  }

  return vertical
}

function escGsV0(bitmap: RasterBitmap, verticalData: Uint8Array) {
  const { height, bytesPerRow } = bitmap
  const header = new Uint8Array([
    0x1d,
    0x76,
    0x30,
    0x00,
    bytesPerRow & 0xff,
    (bytesPerRow >> 8) & 0xff,
    height & 0xff,
    (height >> 8) & 0xff
  ])
  return concatEsc(header, verticalData)
}

/** ESC * 0 逐行（得力等机型兼容性更好） */
export function escStarRaster(bitmap: RasterBitmap) {
  const { height, bytesPerRow, data } = bitmap
  const parts: Uint8Array[] = [
    new Uint8Array([0x1b, 0x61, 0x01]),
    new Uint8Array([0x1b, 0x33, 0x00])
  ]

  for (let y = 0; y < height; y++) {
    const row = data.subarray(y * bytesPerRow, y * bytesPerRow + bytesPerRow)
    const head = new Uint8Array([0x1b, 0x2a, 0x00, bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff])
    parts.push(head, row, new Uint8Array([0x0a]))
  }

  parts.push(new Uint8Array([0x1b, 0x32]))
  return concatEsc(...parts)
}

export type ImagePrintMode = 'escStar' | 'gsv0' | 'both'

export function buildRasterPrint(
  bitmap: RasterBitmap,
  mode: ImagePrintMode = 'escStar',
  feedLines = 4
) {
  const parts: Uint8Array[] = [escInit()]

  if (mode === 'escStar' || mode === 'both') {
    parts.push(escStarRaster(bitmap))
  }
  if (mode === 'gsv0' || mode === 'both') {
    parts.push(escGsV0(bitmap, rasterToGsV0Vertical(bitmap)))
  }

  parts.push(escFeed(feedLines), escCut())
  return concatEsc(...parts)
}

/** 全黑块自检：若只走纸无黑块，说明位图指令不被支持 */
export function buildTestBlackBlock(height = 64) {
  const bytesPerRow = RECEIPT_RASTER_WIDTH / 8
  const data = new Uint8Array(bytesPerRow * height)
  data.fill(0xff)
  const bitmap: RasterBitmap = {
    width: RECEIPT_RASTER_WIDTH,
    height,
    bytesPerRow,
    data,
    blackPixels: RECEIPT_RASTER_WIDTH * height
  }
  return buildRasterPrint(bitmap, 'escStar', 3)
}

export async function buildImageEscPos(
  imageUrl: string,
  mode: ImagePrintMode = 'escStar',
  feedLines = 4
) {
  const img = await loadImage(imageUrl)
  const bitmap = rasterizeImage(img)
  if (bitmap.blackPixels < 50) {
    throw new Error(`位图几乎全白（黑点 ${bitmap.blackPixels}），请检查图片或降低阈值`)
  }
  return { bytes: buildRasterPrint(bitmap, mode, feedLines), bitmap }
}

export function buildKamaoLogoEscPos(mode: ImagePrintMode = 'escStar') {
  return buildImageEscPos(KAMAO_LOGO_URL, mode)
}
