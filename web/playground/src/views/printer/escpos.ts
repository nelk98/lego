import iconv from 'iconv-lite'

export function escInit() {
  return new Uint8Array([0x1b, 0x40])
}

export function escFeed(lines = 3) {
  return new Uint8Array([0x1b, 0x64, lines])
}

export function escCut() {
  return new Uint8Array([0x1d, 0x56, 0x42, 0x00])
}

export function concatEsc(...parts: Uint8Array[]) {
  const n = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(n)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

export function toCrLf(text: string) {
  return text.replace(/\r?\n/g, '\r\n')
}

export function encodeAscii(text: string) {
  return new TextEncoder().encode(text)
}

/** 国内热敏小票机默认 GBK；UTF-8 中文会变成一串乱码英文字符 */
export function encodeGbk(text: string) {
  return Uint8Array.from(iconv.encode(text, 'gbk'))
}

export function buildFeedOnly(lines = 6) {
  return concatEsc(escInit(), escFeed(lines))
}

export function buildAsciiTestPage() {
  const body = toCrLf('TEST PRINT\r\n1234567890\r\n')
  return concatEsc(escInit(), encodeAscii(body), escFeed(3), escCut())
}

export interface ReceiptData {
  store: string
  orderNo: string
  item: string
  time: string
  amount: string
}

export function buildSampleReceipt(data: ReceiptData) {
  const content = toCrLf(`${data.store}
------------------------
订单号：${data.orderNo}
项目：${data.item}
时间：${data.time}
金额：${data.amount}
------------------------
谢谢惠顾
`)
  return concatEsc(escInit(), encodeGbk(content), escFeed(4), escCut())
}
