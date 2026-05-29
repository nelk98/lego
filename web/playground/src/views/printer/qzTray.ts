import qz from 'qz-tray'
import type { StepLogApi } from './useStepLog'

export const LAST_QZ_PRINTER_KEY = 'lego-playground-last-qz-printer'

/** 小票机名称特征 */
const RECEIPT_NAME =
  /deli|dl-|5801|得力|escpos|pos|receipt|热敏|小票|tm-|rp80|xp-?80|58mm|80mm|票据/i

/** 明显不是小票机的名称（勿自动选中） */
const AVOID_NAME =
  /^\d{1,3}(\.\d{1,3}){3}$|fax|pdf|onenote|xps|microsoft|airprint|ipp\.|碳粉|laser|laserjet|brother hl|hp laser|color|彩色|192\.168/i

export function scoreQzPrinter(name: string) {
  if (AVOID_NAME.test(name.trim())) return -100
  if (RECEIPT_NAME.test(name)) return 100
  if (/print|打印机/i.test(name) && !/^\d{1,3}(\.\d{1,3}){3}$/.test(name)) return 5
  return 0
}

export function bytesToHex(bytes: Uint8Array) {
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, '0')
  }
  return hex
}

/**
 * 选择 QZ 打印机：优先 localStorage / 上次手动选择 → 名称像小票机 → 不自动选 list[0]
 * （list[0] 常为网络激光机，例如 192.168.x.x）
 */
export function pickQzPrinter(list: string[], preferred?: string) {
  if (preferred && list.includes(preferred)) return preferred

  try {
    const saved = localStorage.getItem(LAST_QZ_PRINTER_KEY)
    if (saved && list.includes(saved)) return saved
  } catch {
    /* ignore */
  }

  const ranked = list
    .map((name) => ({ name, score: scoreQzPrinter(name) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  return ranked[0]?.name ?? ''
}

export function rememberQzPrinter(name: string) {
  try {
    localStorage.setItem(LAST_QZ_PRINTER_KEY, name)
  } catch {
    /* ignore */
  }
}

export async function qzConnect(log?: StepLogApi) {
  const stepId = log?.pushStep('连接 QZ Tray', 'pending', '请确认桌面端 QZ Tray 已运行')
  try {
    if (!qz.websocket.isActive()) {
      await qz.websocket.connect()
    }
    log?.settleStep(stepId!, 'ok', 'WebSocket 已连接')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log?.settleStep(stepId!, 'error', msg)
    throw new Error(`${msg}。请启动 QZ Tray，并在弹窗中允许本站点`)
  }
}

export async function qzDisconnect(log?: StepLogApi) {
  if (!qz.websocket.isActive()) return
  const stepId = log?.pushStep('断开 QZ Tray')
  await qz.websocket.disconnect()
  log?.settleStep(stepId!, 'ok')
}

export async function qzListPrinters(log?: StepLogApi) {
  await qzConnect(log)
  const stepId = log?.pushStep('枚举系统打印机')
  const list = await qz.printers.find()
  log?.settleStep(stepId!, 'ok', list.length ? list.join('、') : '未找到打印机')
  return list
}

export async function qzPrintRawEscPos(bytes: Uint8Array, printerName: string, log?: StepLogApi) {
  if (!printerName) {
    throw new Error('未指定打印机，请在下拉框中手动选择 DL-5801PW')
  }
  rememberQzPrinter(printerName)
  await qzConnect(log)
  const stepId = log?.pushStep(
    'QZ 发送 ESC/POS',
    'pending',
    `${bytes.length} 字节 → 【${printerName}】`
  )
  const config = qz.configs.create(printerName, { forceRaw: true })
  await qz.print(config, [
    {
      type: 'raw',
      format: 'command',
      flavor: 'hex',
      data: bytesToHex(bytes)
    }
  ])
  log?.settleStep(stepId!, 'ok')
}

/** 由 QZ 将图片转为 ESC/POS 光栅（通常比手写位图更稳） */
export async function qzPrintEscPosImage(imageUrl: string, printerName: string, log?: StepLogApi) {
  if (!printerName) {
    throw new Error('未指定打印机，请在下拉框中手动选择 DL-5801PW')
  }
  rememberQzPrinter(printerName)
  await qzConnect(log)
  const absUrl = imageUrl.startsWith('http')
    ? imageUrl
    : new URL(imageUrl, window.location.origin).href
  const stepId = log?.pushStep('QZ 发送 ESC/POS 图片', 'pending', absUrl)
  const config = qz.configs.create(printerName, { forceRaw: true })
  await qz.print(config, [
    {
      type: 'raw',
      format: 'image',
      flavor: 'file',
      data: absUrl,
      options: { language: 'ESCPOS', dotDensity: 'single' }
    }
  ])
  log?.settleStep(stepId!, 'ok')
}
