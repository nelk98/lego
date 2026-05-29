import type { StepLogApi } from './useStepLog'

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** Chrome requestDevice 需预先声明的 Service UUID */
export const BLE_OPTIONAL_SERVICES = [
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  '49535343-fe7d-4ae0-88c1-f915ce6d2204',
  '49535343-8841-43f4-a8d4-4c8729f3efaa',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '0000fff1-0000-1000-8000-00805f9b34fb',
  '0000fff2-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000ff01-0000-1000-8000-00805f9b34fb',
  '0000ff02-0000-1000-8000-00805f9b34fb',
  '000018f0-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
]

const WRITE_CANDIDATES: { label: string; service: string; characteristic: string }[] = [
  {
    label: 'Nordic UART TX',
    service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    characteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  },
  {
    label: 'Nordic UART TX (no rsp)',
    service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    characteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'
  },
  {
    label: 'ISSC UART',
    service: '49535343-fe7d-4ae0-88c1-f915ce6d2204',
    characteristic: '49535343-8841-43f4-a8d4-4c8729f3efaa'
  },
  {
    label: 'FFF0/FFF2',
    service: '0000fff0-0000-1000-8000-00805f9b34fb',
    characteristic: '0000fff2-0000-1000-8000-00805f9b34fb'
  },
  {
    label: 'FFF0/FFF1',
    service: '0000fff0-0000-1000-8000-00805f9b34fb',
    characteristic: '0000fff1-0000-1000-8000-00805f9b34fb'
  }
]

export interface BlePrinterSession {
  device: BluetoothDevice
  characteristic: BluetoothRemoteGATTCharacteristic
  channelLabel: string
}

function canWrite(char: BluetoothRemoteGATTCharacteristic) {
  return char.properties.write || char.properties.writeWithoutResponse
}

async function writeBleChunks(char: BluetoothRemoteGATTCharacteristic, data: Uint8Array) {
  const chunkSize = 100
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.subarray(i, i + chunkSize)
    const buf = chunk.buffer.slice(
      chunk.byteOffset,
      chunk.byteOffset + chunk.byteLength
    ) as ArrayBuffer
    const view = new Uint8Array(buf)
    if (char.properties.writeWithoutResponse) {
      await char.writeValueWithoutResponse(view)
    } else if (char.properties.write) {
      await char.writeValue(view)
    } else {
      throw new Error('特征不可写')
    }
    await delay(30)
  }
}

async function pickWritableCharacteristic(
  server: BluetoothRemoteGATTServer,
  log: StepLogApi
): Promise<{ characteristic: BluetoothRemoteGATTCharacteristic; channelLabel: string }> {
  for (const c of WRITE_CANDIDATES) {
    const tryId = log.pushStep(`尝试通道 ${c.label}`, 'pending')
    try {
      const service = await server.getPrimaryService(c.service)
      const characteristic = await service.getCharacteristic(c.characteristic)
      if (!canWrite(characteristic)) {
        log.settleStep(tryId, 'error', '特征不可写')
        continue
      }
      log.settleStep(tryId, 'ok', `${c.service} / ${c.characteristic}`)
      return { characteristic, channelLabel: c.label }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.settleStep(tryId, 'error', msg)
    }
  }

  const scanId = log.pushStep('扫描全部可写特征', 'pending')
  const services = await server.getPrimaryServices()
  const lines: string[] = []

  for (const service of services) {
    const chars = await service.getCharacteristics()
    for (const char of chars) {
      const flags = [
        char.properties.write && 'write',
        char.properties.writeWithoutResponse && 'writeNoRsp'
      ]
        .filter(Boolean)
        .join(',')
      lines.push(`服务 ${service.uuid} → ${char.uuid} [${flags}]`)
      if (canWrite(char)) {
        log.settleStep(scanId, 'ok', `选用 ${char.uuid}`)
        return { characteristic: char, channelLabel: `自动: ${char.uuid}` }
      }
    }
  }

  log.settleStep(scanId, 'error', lines.join('；') || '未找到可写特征')
  throw new Error('未找到可写的 BLE 特征，请点「扫描 BLE 服务」查看 UUID')
}

export async function connectBlePrinter(log: StepLogApi): Promise<BlePrinterSession> {
  if (!navigator.bluetooth) {
    throw new Error('当前浏览器不支持 Web Bluetooth')
  }

  const pickId = log.pushStep('请求 BLE 设备', 'pending', '选择 DL-5801PW（需已开机）')
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'DL' }, { namePrefix: 'Deli' }],
    optionalServices: BLE_OPTIONAL_SERVICES
  })
  log.settleStep(pickId, 'ok', device.name || device.id)

  const gattId = log.pushStep('连接 GATT')
  const server = device.gatt
  if (!server) {
    log.settleStep(gattId, 'error', '无 GATT')
    throw new Error('设备不支持 GATT')
  }
  await server.connect()
  log.settleStep(gattId, 'ok')

  const { characteristic, channelLabel } = await pickWritableCharacteristic(server, log)

  log.pushStep('BLE 就绪', 'ok', `通道: ${channelLabel}`)

  return { device, characteristic, channelLabel }
}

export async function discoverBleServices(session: BlePrinterSession, log: StepLogApi) {
  const server = session.device.gatt
  if (!server?.connected) {
    await server?.connect()
  }
  if (!server) throw new Error('GATT 未连接')

  const id = log.pushStep('枚举 BLE 服务与特征', 'pending')
  const services = await server.getPrimaryServices()
  const lines: string[] = []

  for (const service of services) {
    lines.push(`[服务] ${service.uuid}`)
    const chars = await service.getCharacteristics()
    for (const char of chars) {
      const p = char.properties
      lines.push(
        `  [特征] ${char.uuid} — read:${p.read} write:${p.write} wnr:${p.writeWithoutResponse} notify:${p.notify}`
      )
    }
  }

  log.settleStep(id, 'ok', lines.join('\n') || '无服务')
}

export async function disconnectBlePrinter(session: BlePrinterSession | null, log: StepLogApi) {
  if (!session) return
  const id = log.pushStep('断开 BLE')
  try {
    if (session.device.gatt?.connected) {
      session.device.gatt.disconnect()
    }
    log.settleStep(id, 'ok')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log.settleStep(id, 'error', msg)
    throw err
  }
}

export async function sendBleEscPos(
  session: BlePrinterSession,
  bytes: Uint8Array,
  log: StepLogApi,
  label: string
) {
  const id = log.pushStep(label, 'pending', `${bytes.length} 字节，分块写入`)
  await writeBleChunks(session.characteristic, bytes)
  log.settleStep(id, 'ok', `通道 ${session.channelLabel}`)
}
