import type { StepLogApi } from './useStepLog'

export const LAST_USB_DEVICE_KEY = 'lego-playground-last-usb-device'

export interface UsbPrinterSession {
  device: USBDevice
  interfaceNumber: number
  endpointNumber: number
  endpointLabel: string
}

export function formatUsbId(device: USBDevice) {
  const vid = device.vendorId.toString(16).padStart(4, '0')
  const pid = device.productId.toString(16).padStart(4, '0')
  return `VID ${vid} PID ${pid} — ${device.productName || '未知产品'}`
}

export function getUsbDeviceKey(device: USBDevice) {
  if (device.serialNumber) return device.serialNumber
  return `${device.vendorId.toString(16)}-${device.productId.toString(16)}`
}

export function saveLastUsbDevice(device: USBDevice) {
  try {
    localStorage.setItem(LAST_USB_DEVICE_KEY, getUsbDeviceKey(device))
  } catch {
    /* private mode 等 */
  }
}

function findBulkOutEndpoint(device: USBDevice) {
  const config = device.configuration
  if (!config) return null

  for (const iface of config.interfaces) {
    for (const alt of iface.alternates) {
      for (const ep of alt.endpoints) {
        if (ep.direction === 'out' && ep.type === 'bulk') {
          return {
            interfaceNumber: iface.interfaceNumber,
            endpointNumber: ep.endpointNumber,
            label: `interface ${iface.interfaceNumber} / ep ${ep.endpointNumber} (alt ${alt.alternateSetting}, class ${alt.interfaceClass})`
          }
        }
      }
    }
  }

  return null
}

/** 打开并占用已选定的 USBDevice（不含 requestDevice 弹窗） */
export async function openUsbSession(
  device: USBDevice,
  log: StepLogApi
): Promise<UsbPrinterSession> {
  const openId = log.pushStep('打开 USB 设备', 'pending', formatUsbId(device))
  if (!device.opened) {
    await device.open()
  }
  log.settleStep(openId, 'ok')

  if (device.configuration === null) {
    const cfgId = log.pushStep('选择配置 descriptor')
    await device.selectConfiguration(1)
    log.settleStep(cfgId, 'ok', 'configuration 1')
  }

  const ep = findBulkOutEndpoint(device)
  if (!ep) {
    throw new Error('未找到 Bulk OUT 端点，请点「扫描 USB 接口」')
  }

  const claimId = log.pushStep('占用接口', 'pending', ep.label)
  try {
    await device.claimInterface(ep.interfaceNumber)
    log.settleStep(claimId, 'ok')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log.settleStep(claimId, 'error', msg)
    throw new Error(`${msg}。若打印机已被系统占用，请暂时移除系统打印机后重试`)
  }

  saveLastUsbDevice(device)
  log.pushStep('USB 就绪', 'ok', ep.label)

  return {
    device,
    interfaceNumber: ep.interfaceNumber,
    endpointNumber: ep.endpointNumber,
    endpointLabel: ep.label
  }
}

async function requestUsbDevice(): Promise<USBDevice> {
  try {
    return await navigator.usb.requestDevice({
      filters: [{ classCode: 0x07 }, { classCode: 0xff }]
    })
  } catch {
    return await navigator.usb.requestDevice({ filters: [] })
  }
}

/** 首次连接：弹窗选设备并授权（授权后刷新页可用 getDevices 重连） */
export async function connectUsbPrinter(log: StepLogApi): Promise<UsbPrinterSession> {
  if (!navigator.usb) {
    throw new Error('当前浏览器不支持 WebUSB')
  }

  const pickId = log.pushStep('请求 USB 设备', 'pending', '选择 DL-5801PW（USB 连接）')
  const device = await requestUsbDevice()
  log.settleStep(pickId, 'ok', formatUsbId(device))

  return openUsbSession(device, log)
}

function pickAuthorizedDevice(devices: USBDevice[]) {
  if (devices.length === 0) return null
  if (devices.length === 1) return devices[0]

  try {
    const lastKey = localStorage.getItem(LAST_USB_DEVICE_KEY)
    if (lastKey) {
      const matched = devices.find((d) => getUsbDeviceKey(d) === lastKey)
      if (matched) return matched
    }
  } catch {
    /* ignore */
  }

  return devices[0]
}

/**
 * 重连浏览器已授权的 USB 设备（无需 requestDevice 弹窗）。
 * 首次使用仍需用户点「连接 USB」完成授权。
 */
export async function reconnectAuthorizedUsbPrinter(
  log: StepLogApi,
  options?: { silent?: boolean }
): Promise<UsbPrinterSession | null> {
  if (!navigator.usb) {
    throw new Error('当前浏览器不支持 WebUSB')
  }

  const devices = await navigator.usb.getDevices()
  if (devices.length === 0) {
    if (!options?.silent) {
      log.pushStep('无已授权设备', 'error', '请先点「连接 USB」完成一次授权')
    }
    return null
  }

  const device = pickAuthorizedDevice(devices)!
  const stepId = options?.silent
    ? 0
    : log.pushStep('重连已授权 USB', 'pending', formatUsbId(device))

  try {
    const session = await openUsbSession(device, log)
    if (stepId) log.settleStep(stepId, 'ok', '未弹出设备选择框')
    return session
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (stepId) log.settleStep(stepId, 'error', msg)
    throw err
  }
}

export async function discoverUsbInterfaces(device: USBDevice, log: StepLogApi) {
  const id = log.pushStep('枚举 USB 配置', 'pending')
  const lines: string[] = []
  lines.push(formatUsbId(device))

  const config = device.configuration
  if (!config) {
    log.settleStep(id, 'error', '无 configuration')
    return
  }

  for (const iface of config.interfaces) {
    for (const alt of iface.alternates) {
      lines.push(
        `interface ${iface.interfaceNumber} alt ${alt.alternateSetting} class ${alt.interfaceClass} subclass ${alt.interfaceSubclass}`
      )
      for (const ep of alt.endpoints) {
        lines.push(`  ep ${ep.endpointNumber} ${ep.direction} ${ep.type} packet ${ep.packetSize}`)
      }
    }
  }

  log.settleStep(id, 'ok', lines.join('\n'))
}

export async function disconnectUsbPrinter(session: UsbPrinterSession | null, log: StepLogApi) {
  if (!session) return
  const id = log.pushStep('释放 USB')
  try {
    try {
      await session.device.releaseInterface(session.interfaceNumber)
    } catch {
      /* 可能已释放 */
    }
    if (session.device.opened) {
      await session.device.close()
    }
    log.settleStep(id, 'ok')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log.settleStep(id, 'error', msg)
    throw err
  }
}

const USB_CHUNK_SIZE = 4096

export async function sendUsbEscPos(
  session: UsbPrinterSession,
  bytes: Uint8Array,
  log: StepLogApi,
  label: string
) {
  const id = log.pushStep(label, 'pending', `${bytes.length} 字节，分块发送`)
  let sent = 0

  for (let offset = 0; offset < bytes.length; offset += USB_CHUNK_SIZE) {
    const chunk = bytes.subarray(offset, offset + USB_CHUNK_SIZE)
    const buf = chunk.buffer.slice(
      chunk.byteOffset,
      chunk.byteOffset + chunk.byteLength
    ) as ArrayBuffer
    const result = await session.device.transferOut(session.endpointNumber, buf)
    if (result.status !== 'ok') {
      log.settleStep(id, 'error', `offset ${offset} status: ${result.status}`)
      throw new Error(`USB 传输失败: ${result.status}`)
    }
    sent += result.bytesWritten ?? chunk.length
  }

  log.settleStep(id, 'ok', `已发送 ${sent} 字节`)
}
