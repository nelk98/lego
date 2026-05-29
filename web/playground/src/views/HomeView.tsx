import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import styles from './HomeView.module.css'
import {
  buildAsciiTestPage,
  buildFeedOnly,
  buildSampleReceipt,
  type ReceiptData
} from './printer/escpos'
import { buildKamaoLogoEscPos, buildTestBlackBlock, KAMAO_LOGO_URL } from './printer/escposRaster'
import StepLogList from './printer/StepLogList'
import { useStepLog } from './printer/useStepLog'
import {
  connectBlePrinter,
  disconnectBlePrinter,
  discoverBleServices,
  sendBleEscPos,
  type BlePrinterSession
} from './printer/webBluetooth'
import {
  connectUsbPrinter,
  disconnectUsbPrinter,
  discoverUsbInterfaces,
  reconnectAuthorizedUsbPrinter,
  sendUsbEscPos,
  type UsbPrinterSession
} from './printer/webUsb'
import {
  LAST_QZ_PRINTER_KEY,
  pickQzPrinter,
  qzDisconnect,
  qzListPrinters,
  qzPrintEscPosImage,
  qzPrintRawEscPos
} from './printer/qzTray'

const BAUD_RATES = [9600, 115200, 19200, 38400, 57600] as const
const BAUD_OPTIONS = BAUD_RATES as readonly number[]
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function closeSerialPort(serialPort: SerialPort) {
  try {
    await serialPort.close()
  } catch {
    /* ignore */
  }
}

async function applyPortSignals(serialPort: SerialPort) {
  if (!('setSignals' in serialPort) || typeof serialPort.setSignals !== 'function') {
    return false
  }
  await serialPort.setSignals({ dataTerminalReady: true, requestToSend: true })
  return true
}

async function openSerialPort(serialPort: SerialPort, onTry: (baudRate: number) => void) {
  let lastError: unknown
  for (const rate of BAUD_RATES) {
    onTry(rate)
    await closeSerialPort(serialPort)
    try {
      await serialPort.open({
        baudRate: rate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      })
      return rate
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

export default defineComponent({
  name: 'SerialReceiptPrinter',

  setup() {
    const receiptStore = ref('XX运动馆')
    const receiptOrderNo = ref('202605190001')
    const receiptItem = ref('羽毛球场地')
    const receiptTime = ref('18:00 - 19:00')
    const receiptAmount = ref('￥88.00')

    const serialLog = useStepLog()
    const bleLog = useStepLog()
    const usbLog = useStepLog()

    const port = ref<SerialPort | null>(null)
    const writer = ref<WritableStreamDefaultWriter<Uint8Array> | null>(null)
    const serialConnected = ref(false)
    const serialBusy = ref(false)
    const baudRate = ref<number | null>(null)
    const selectedBaud = ref(9600)
    const serialError = ref('')

    const bleSession = ref<BlePrinterSession | null>(null)
    const bleConnected = ref(false)
    const bleBusy = ref(false)
    const bleError = ref('')

    const usbSession = ref<UsbPrinterSession | null>(null)
    const usbConnected = ref(false)
    const usbBusy = ref(false)
    const usbError = ref('')
    const usbAutoHint = ref('')

    const qzLog = useStepLog()
    const qzConnected = ref(false)
    const qzBusy = ref(false)
    const qzError = ref('')
    const qzPrinters = ref<string[]>([])
    const selectedQzPrinter = ref('')

    function printBrowserReceipt() {
      window.print()
    }

    function getReceiptData(): ReceiptData {
      return {
        store: receiptStore.value,
        orderNo: receiptOrderNo.value,
        item: receiptItem.value,
        time: receiptTime.value,
        amount: receiptAmount.value
      }
    }

    function buildCurrentReceipt() {
      return buildSampleReceipt(getReceiptData())
    }

    async function runWithLog(
      log: ReturnType<typeof useStepLog>,
      busy: typeof serialBusy,
      errRef: typeof serialError,
      job: () => Promise<void>
    ) {
      errRef.value = ''
      log.clearSteps()
      busy.value = true
      try {
        await job()
      } catch (err) {
        const msg = err instanceof Error ? err.message : '操作失败'
        log.pushStep('中止', 'error', msg)
        errRef.value = msg
      } finally {
        busy.value = false
      }
    }

    // —— Web Serial ——
    async function releaseWriterOnly() {
      if (writer.value) {
        writer.value.releaseLock()
        writer.value = null
      }
    }

    async function reopenAtBaud(rate: number) {
      if (!port.value) throw new Error('请先连接')
      await releaseWriterOnly()
      await closeSerialPort(port.value)
      await port.value.open({
        baudRate: rate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      })
      await applyPortSignals(port.value)
      writer.value = port.value.writable!.getWriter()
      baudRate.value = rate
    }

    async function connectSerial() {
      await runWithLog(serialLog, serialBusy, serialError, async () => {
        serialLog.pushStep('开始连接', 'ok')
        if (!('serial' in navigator)) {
          throw new Error('不支持 Web Serial，请用 Chrome / Edge')
        }
        if (port.value) {
          await disconnectSerial(false)
        }
        const pickId = serialLog.pushStep('选择串口', 'pending', '选 cu.DL-5801PW…')
        const selectedPort = await navigator.serial.requestPort()
        serialLog.settleStep(pickId, 'ok')
        port.value = selectedPort

        const openId = serialLog.pushStep('打开串口', 'pending', `${selectedBaud.value} baud`)
        try {
          await closeSerialPort(selectedPort)
          await selectedPort.open({
            baudRate: selectedBaud.value,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
            flowControl: 'none'
          })
          baudRate.value = selectedBaud.value
          serialLog.settleStep(openId, 'ok', String(selectedBaud.value))
        } catch {
          baudRate.value = await openSerialPort(selectedPort, (rate) => {
            serialLog.steps.value = serialLog.steps.value.map((s) =>
              s.id === openId ? { ...s, detail: `尝试 ${rate}…` } : s
            )
          })
          serialLog.settleStep(openId, 'ok', `自动 ${baudRate.value}`)
        }

        const sigId = serialLog.pushStep('DTR/RTS')
        const dtr = await applyPortSignals(selectedPort)
        serialLog.settleStep(sigId, 'ok', dtr ? '已设置' : '跳过')

        writer.value = selectedPort.writable!.getWriter()
        serialConnected.value = true
        serialLog.pushStep('完成', 'ok', '非在线检测；关机也可能 open')
      })
    }

    async function disconnectSerial(logSteps = true) {
      if (logSteps) {
        await runWithLog(serialLog, serialBusy, serialError, async () => {
          serialLog.pushStep('断开', 'ok')
          await releaseWriterOnly()
          if (port.value) await closeSerialPort(port.value)
          port.value = null
          baudRate.value = null
          serialConnected.value = false
        })
      } else {
        await releaseWriterOnly()
        if (port.value) await closeSerialPort(port.value)
        port.value = null
        baudRate.value = null
        serialConnected.value = false
      }
    }

    async function writeSerial(bytes: Uint8Array, label: string) {
      if (!writer.value) throw new Error('未连接')
      const id = serialLog.pushStep(label, 'pending', `${bytes.length} B`)
      await writer.value.write(bytes)
      await writer.value.ready
      await delay(150)
      serialLog.settleStep(id, 'ok')
    }

    async function serialTestFeed() {
      await runWithLog(serialLog, serialBusy, serialError, async () => {
        await writeSerial(buildFeedOnly(), '仅走纸')
      })
    }

    async function serialTestAscii() {
      await runWithLog(serialLog, serialBusy, serialError, async () => {
        await writeSerial(buildAsciiTestPage(), 'ASCII 测试')
      })
    }

    async function serialPrintReceipt() {
      await runWithLog(serialLog, serialBusy, serialError, async () => {
        await writeSerial(buildCurrentReceipt(), '打印小票')
      })
    }

    async function applyBaudReconnect() {
      await runWithLog(serialLog, serialBusy, serialError, async () => {
        await reopenAtBaud(selectedBaud.value)
        serialLog.pushStep('波特率已更新', 'ok', String(selectedBaud.value))
      })
    }

    // —— Web Bluetooth ——
    async function connectBle() {
      await runWithLog(bleLog, bleBusy, bleError, async () => {
        if (bleSession.value) await disconnectBle(false)
        bleSession.value = await connectBlePrinter(bleLog)
        bleConnected.value = true
      })
    }

    async function disconnectBle(logSteps = true) {
      const run = async () => {
        await disconnectBlePrinter(bleSession.value, bleLog)
        bleSession.value = null
        bleConnected.value = false
      }
      if (logSteps) await runWithLog(bleLog, bleBusy, bleError, run)
      else await run()
    }

    async function scanBle() {
      if (!bleSession.value) throw new Error('请先连接 BLE')
      await runWithLog(bleLog, bleBusy, bleError, async () => {
        await discoverBleServices(bleSession.value!, bleLog)
      })
    }

    async function bleTestFeed() {
      if (!bleSession.value) throw new Error('请先连接 BLE')
      await runWithLog(bleLog, bleBusy, bleError, async () => {
        await sendBleEscPos(bleSession.value!, buildFeedOnly(), bleLog, '仅走纸')
      })
    }

    async function bleTestAscii() {
      if (!bleSession.value) throw new Error('请先连接 BLE')
      await runWithLog(bleLog, bleBusy, bleError, async () => {
        await sendBleEscPos(bleSession.value!, buildAsciiTestPage(), bleLog, 'ASCII 测试')
      })
    }

    async function blePrintReceipt() {
      if (!bleSession.value) throw new Error('请先连接 BLE')
      await runWithLog(bleLog, bleBusy, bleError, async () => {
        await sendBleEscPos(bleSession.value!, buildCurrentReceipt(), bleLog, '打印小票')
      })
    }

    // —— WebUSB ——
    async function connectUsb() {
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        if (usbSession.value) await disconnectUsb(false)
        usbSession.value = await connectUsbPrinter(usbLog)
        usbConnected.value = true
        usbAutoHint.value = '已授权，下次刷新将自动重连'
      })
    }

    async function reconnectUsb() {
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        if (usbSession.value) await disconnectUsb(false)
        const session = await reconnectAuthorizedUsbPrinter(usbLog)
        if (!session) {
          throw new Error('无已授权 USB 设备，请先点「连接 USB」完成授权')
        }
        usbSession.value = session
        usbConnected.value = true
        usbAutoHint.value = '已重连（未弹出设备选择框）'
      })
    }

    async function tryAutoReconnectUsb() {
      if (!navigator.usb) return
      usbBusy.value = true
      try {
        const session = await reconnectAuthorizedUsbPrinter(usbLog, { silent: true })
        if (session) {
          usbSession.value = session
          usbConnected.value = true
          usbAutoHint.value = '已自动重连上次授权的 USB 打印机'
        } else {
          usbAutoHint.value = '首次请点「连接 USB」授权；之后刷新会自动重连'
        }
      } catch (err) {
        usbAutoHint.value = `${err instanceof Error ? err.message : '自动重连失败'}，请点「重连已授权」`
      } finally {
        usbBusy.value = false
      }
    }

    const onUsbDisconnect = (event: USBConnectionEvent) => {
      if (usbSession.value?.device === event.device) {
        usbSession.value = null
        usbConnected.value = false
        usbAutoHint.value = 'USB 设备已拔出'
      }
    }

    onMounted(() => {
      void tryAutoReconnectUsb()
      navigator.usb?.addEventListener('disconnect', onUsbDisconnect)
    })

    onUnmounted(() => {
      navigator.usb?.removeEventListener('disconnect', onUsbDisconnect)
      void qzDisconnect()
    })

    async function disconnectUsb(logSteps = true) {
      const run = async () => {
        await disconnectUsbPrinter(usbSession.value, usbLog)
        usbSession.value = null
        usbConnected.value = false
      }
      if (logSteps) await runWithLog(usbLog, usbBusy, usbError, run)
      else await run()
    }

    async function scanUsb() {
      if (!usbSession.value) throw new Error('请先连接 USB')
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        await discoverUsbInterfaces(usbSession.value!.device, usbLog)
      })
    }

    async function usbTestFeed() {
      if (!usbSession.value) throw new Error('请先连接 USB')
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        await sendUsbEscPos(usbSession.value!, buildFeedOnly(), usbLog, '仅走纸')
      })
    }

    async function usbTestAscii() {
      if (!usbSession.value) throw new Error('请先连接 USB')
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        await sendUsbEscPos(usbSession.value!, buildAsciiTestPage(), usbLog, 'ASCII 测试')
      })
    }

    async function usbPrintReceipt() {
      if (!usbSession.value) throw new Error('请先连接 USB')
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        await sendUsbEscPos(usbSession.value!, buildCurrentReceipt(), usbLog, '打印小票')
      })
    }

    async function usbPrintLogo() {
      if (!usbSession.value) throw new Error('请先连接 USB')
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        const rasterId = usbLog.pushStep('转换 Logo（ESC * 逐行）', 'pending')
        const { bytes, bitmap } = await buildKamaoLogoEscPos('escStar')
        usbLog.settleStep(
          rasterId,
          'ok',
          `${bitmap.width}×${bitmap.height}px，黑点 ${bitmap.blackPixels}，共 ${bytes.length} 字节`
        )
        await sendUsbEscPos(usbSession.value!, bytes, usbLog, '发送 Logo')
      })
    }

    async function usbPrintBlackTest() {
      if (!usbSession.value) throw new Error('请先连接 USB')
      await runWithLog(usbLog, usbBusy, usbError, async () => {
        const bytes = buildTestBlackBlock(80)
        usbLog.pushStep('自检黑块', 'ok', '若仍无黑块只有走纸，则位图指令不被该机支持')
        await sendUsbEscPos(usbSession.value!, bytes, usbLog, '发送黑块')
      })
    }

    function requireQzPrinter() {
      const name = selectedQzPrinter.value
      if (!name) {
        throw new Error('请在下拉框选择 DL-5801PW（不要选 192.168.x.x 网络打印机）')
      }
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(name.trim())) {
        throw new Error(`当前选中的是网络打印机「${name}」，请改选 DL-5801PW`)
      }
      return name
    }

    async function connectQz() {
      await runWithLog(qzLog, qzBusy, qzError, async () => {
        const list = await qzListPrinters(qzLog)
        qzPrinters.value = list
        const picked = pickQzPrinter(list, selectedQzPrinter.value)
        selectedQzPrinter.value = picked
        qzConnected.value = list.length > 0
        if (!picked) {
          qzLog.pushStep(
            '未自动匹配小票机',
            'error',
            `共 ${list.length} 台：${list.join('、')}。请在下拉框手动选 DL-5801PW，勿选 IP 地址打印机`
          )
        } else {
          qzLog.pushStep('已选打印机', 'ok', picked)
        }
      })
    }

    async function disconnectQz() {
      await runWithLog(qzLog, qzBusy, qzError, async () => {
        await qzDisconnect(qzLog)
        qzConnected.value = false
      })
    }

    async function qzPrintReceipt() {
      const printer = requireQzPrinter()
      await runWithLog(qzLog, qzBusy, qzError, async () => {
        await qzPrintRawEscPos(buildCurrentReceipt(), printer, qzLog)
        qzLog.pushStep('完成', 'ok', '小票已提交到 QZ 队列')
      })
    }

    async function qzPrintLogo() {
      const printer = requireQzPrinter()
      await runWithLog(qzLog, qzBusy, qzError, async () => {
        await qzPrintEscPosImage(KAMAO_LOGO_URL, printer, qzLog)
        qzLog.pushStep('完成', 'ok', 'Logo 已提交（QZ 图片模式）')
      })
    }

    async function qzPrintLogoEsc() {
      const printer = requireQzPrinter()
      await runWithLog(qzLog, qzBusy, qzError, async () => {
        const { bytes, bitmap } = await buildKamaoLogoEscPos('escStar')
        qzLog.pushStep('转换 Logo', 'ok', `${bitmap.blackPixels} 黑点 / ${bytes.length} B`)
        await qzPrintRawEscPos(bytes, printer, qzLog)
      })
    }

    const btnProps = (disabled: boolean) => ({
      type: 'button' as const,
      disabled
    })

    return () => (
      <div class={styles.page}>
        {/* 浏览器打印 */}
        <section class={styles.section}>
          <h3 class={[styles.sectionTitle, styles.noPrint].join(' ')}>
            浏览器打印小票
            <span class={styles.recommended}>推荐</span>
          </h3>
          <p class={[styles.sectionHint, styles.noPrint].join(' ')}>
            走系统打印机。对话框里选 DL-5801PW，纸张 58mm。
          </p>
          <div class={styles.previewWrap}>
            <div class={styles.receipt} id="receipt-print-area">
              <img class={styles.receiptLogo} src={KAMAO_LOGO_URL} alt="卡猫运动" />
              <h4 class={styles.receiptTitle}>{receiptStore.value}</h4>
              <hr class={styles.receiptDivider} />
              <div class={styles.receiptRow}>
                <span class={styles.receiptLabel}>订单号</span>
                <span class={styles.receiptValue}>{receiptOrderNo.value}</span>
              </div>
              <div class={styles.receiptRow}>
                <span class={styles.receiptLabel}>项目</span>
                <span class={styles.receiptValue}>{receiptItem.value}</span>
              </div>
              <div class={styles.receiptRow}>
                <span class={styles.receiptLabel}>时间</span>
                <span class={styles.receiptValue}>{receiptTime.value}</span>
              </div>
              <div class={styles.receiptRow}>
                <span class={styles.receiptLabel}>金额</span>
                <span class={styles.receiptValue}>{receiptAmount.value}</span>
              </div>
              <hr class={styles.receiptDivider} />
              <p class={styles.receiptFooter}>谢谢惠顾</p>
            </div>
            <div class={styles.printActions}>
              <button type="button" class={styles.printBtn} onClick={printBrowserReceipt}>
                打印小票（window.print）
              </button>
            </div>
          </div>
        </section>

        {/* QZ Tray */}
        <section class={[styles.apiBlock, styles.noPrint].join(' ')}>
          <h3 class={styles.sectionTitle}>
            QZ Tray
            <span class={styles.recommended}>ESC/POS 推荐</span>
          </h3>
          <p class={styles.sectionHint}>
            需先运行本机 QZ Tray。连接后请在<strong>下拉框手动选择 DL-5801PW</strong>，不要选
            192.168.x.x（那是网络激光机）。打印前请看状态栏显示的打印机名称。
          </p>
          <div style="margin-bottom: 8px; font-size: 13px;">
            状态：
            {qzConnected.value ? `已连接 — ${selectedQzPrinter.value || '未选打印机'}` : '未连接'}
          </div>
          <div class={styles.btnRow}>
            <label style="font-size: 13px; display: flex; align-items: center; gap: 6px;">
              打印机
              <select
                value={selectedQzPrinter.value}
                disabled={qzBusy.value || qzPrinters.value.length === 0}
                onChange={(e: Event) => {
                  selectedQzPrinter.value = (e.target as HTMLSelectElement).value
                  try {
                    localStorage.setItem(LAST_QZ_PRINTER_KEY, selectedQzPrinter.value)
                  } catch {
                    /* ignore */
                  }
                }}
              >
                {qzPrinters.value.length === 0 ? (
                  <option value="">请先连接 QZ</option>
                ) : (
                  qzPrinters.value.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
          <div class={styles.btnRow}>
            <button {...btnProps(qzBusy.value)} onClick={connectQz}>
              连接 QZ
            </button>
            <button {...btnProps(!qzConnected.value || qzBusy.value)} onClick={disconnectQz}>
              断开
            </button>
            <button {...btnProps(!qzConnected.value || qzBusy.value)} onClick={qzPrintReceipt}>
              打印小票
            </button>
            <button {...btnProps(!qzConnected.value || qzBusy.value)} onClick={qzPrintLogo}>
              打印 Logo（QZ 图片）
            </button>
            <button {...btnProps(!qzConnected.value || qzBusy.value)} onClick={qzPrintLogoEsc}>
              打印 Logo（ESC 字节）
            </button>
          </div>
          {qzError.value && <p class={styles.error}>{qzError.value}</p>}
          <StepLogList
            steps={qzLog.steps.value}
            stepColor={qzLog.stepColor}
            emptyHint="连接 QZ Tray 后显示步骤"
          />
        </section>

        {/* Web Bluetooth */}
        <section class={[styles.apiBlock, styles.noPrint].join(' ')}>
          <h3 class={styles.sectionTitle}>Web Bluetooth（BLE ESC/POS）</h3>
          <p class={styles.sectionHint}>
            需 Chrome +
            HTTPS/localhost。先在系统蓝牙里取消配对或保持开机，由网页重新选设备；会自动尝试常见 UART
            通道。若失败请点「扫描 BLE 服务」查看 UUID。
          </p>
          <div style="margin-bottom: 8px; font-size: 13px;">
            状态：
            {bleConnected.value
              ? `已连接 — ${bleSession.value?.device.name || 'BLE'}（${bleSession.value?.channelLabel}）`
              : '未连接'}
          </div>
          <div class={styles.btnRow}>
            <button {...btnProps(bleConnected.value || bleBusy.value)} onClick={connectBle}>
              连接 BLE
            </button>
            <button
              {...btnProps(!bleConnected.value || bleBusy.value)}
              onClick={() => disconnectBle(true)}
            >
              断开
            </button>
            <button {...btnProps(!bleConnected.value || bleBusy.value)} onClick={scanBle}>
              扫描 BLE 服务
            </button>
            <button {...btnProps(!bleConnected.value || bleBusy.value)} onClick={bleTestFeed}>
              仅走纸
            </button>
            <button {...btnProps(!bleConnected.value || bleBusy.value)} onClick={bleTestAscii}>
              ASCII 测试
            </button>
            <button {...btnProps(!bleConnected.value || bleBusy.value)} onClick={blePrintReceipt}>
              {bleBusy.value ? '执行中…' : '打印小票'}
            </button>
          </div>
          {bleError.value && <p class={styles.error}>{bleError.value}</p>}
          <StepLogList
            steps={bleLog.steps.value}
            stepColor={bleLog.stepColor}
            emptyHint="连接 DL-5801PW 后显示步骤"
          />
        </section>

        {/* WebUSB */}
        <section class={[styles.apiBlock, styles.noPrint].join(' ')}>
          <h3 class={styles.sectionTitle}>WebUSB（USB ESC/POS）</h3>
          <p class={styles.sectionHint}>
            USB 直连。首次需点「连接 USB」授权；授权后刷新会自动重连。WebUSB / BLE /
            串口「打印小票」与上方预览内容一致（GBK）。
          </p>
          <div style="margin-bottom: 8px; font-size: 13px;">
            状态：
            {usbConnected.value
              ? `已连接 — ${usbSession.value?.endpointLabel}`
              : usbBusy.value
                ? '正在连接…'
                : '未连接'}
          </div>
          {usbAutoHint.value ? (
            <p style="margin: 0 0 8px; font-size: 13px; color: #0369a1;">{usbAutoHint.value}</p>
          ) : null}
          <div class={styles.btnRow}>
            <button {...btnProps(usbConnected.value || usbBusy.value)} onClick={connectUsb}>
              连接 USB（首次授权）
            </button>
            <button {...btnProps(usbConnected.value || usbBusy.value)} onClick={reconnectUsb}>
              重连已授权
            </button>
            <button
              {...btnProps(!usbConnected.value || usbBusy.value)}
              onClick={() => disconnectUsb(true)}
            >
              断开
            </button>
            <button {...btnProps(!usbConnected.value || usbBusy.value)} onClick={scanUsb}>
              扫描 USB 接口
            </button>
            <button {...btnProps(!usbConnected.value || usbBusy.value)} onClick={usbTestFeed}>
              仅走纸
            </button>
            <button {...btnProps(!usbConnected.value || usbBusy.value)} onClick={usbTestAscii}>
              ASCII 测试
            </button>
            <button {...btnProps(!usbConnected.value || usbBusy.value)} onClick={usbPrintReceipt}>
              {usbBusy.value ? '执行中…' : '打印小票'}
            </button>
            <button {...btnProps(!usbConnected.value || usbBusy.value)} onClick={usbPrintLogo}>
              打印卡猫 Logo
            </button>
            <button {...btnProps(!usbConnected.value || usbBusy.value)} onClick={usbPrintBlackTest}>
              自检黑块
            </button>
          </div>
          {usbError.value && <p class={styles.error}>{usbError.value}</p>}
          <StepLogList
            steps={usbLog.steps.value}
            stepColor={usbLog.stepColor}
            emptyHint="USB 连接后显示步骤"
          />
        </section>

        {/* Web Serial */}
        <section class={[styles.apiBlock, styles.noPrint].join(' ')}>
          <h3 class={styles.sectionTitle}>Web Serial（蓝牙 SPP 调试）</h3>
          <p class={styles.sectionHint}>
            macOS 蓝牙虚拟串口；关机也可能 open。得力 PW 系列通常不能靠此打印。
          </p>
          <div style="margin-bottom: 8px; font-size: 13px;">
            状态：{serialConnected.value ? `已打开串口（${baudRate.value} baud）` : '未连接'}
          </div>
          <div class={styles.btnRow}>
            <label style="font-size: 13px; display: flex; align-items: center; gap: 4px;">
              波特率
              <select
                value={selectedBaud.value}
                disabled={serialBusy.value}
                onChange={(e: Event) => {
                  selectedBaud.value = Number((e.target as HTMLSelectElement).value)
                }}
              >
                {BAUD_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <button
              {...btnProps(!serialConnected.value || serialBusy.value)}
              onClick={applyBaudReconnect}
            >
              应用波特率
            </button>
          </div>
          <div class={styles.btnRow}>
            <button
              {...btnProps(serialConnected.value || serialBusy.value)}
              onClick={connectSerial}
            >
              连接串口
            </button>
            <button
              {...btnProps(!serialConnected.value || serialBusy.value)}
              onClick={serialTestFeed}
            >
              仅走纸
            </button>
            <button
              {...btnProps(!serialConnected.value || serialBusy.value)}
              onClick={serialTestAscii}
            >
              ASCII 测试
            </button>
            <button
              {...btnProps(!serialConnected.value || serialBusy.value)}
              onClick={serialPrintReceipt}
            >
              {serialBusy.value ? '执行中…' : '打印小票'}
            </button>
            <button
              {...btnProps(!serialConnected.value || serialBusy.value)}
              onClick={() => disconnectSerial(true)}
            >
              断开
            </button>
          </div>
          {serialError.value && <p class={styles.error}>{serialError.value}</p>}
          <StepLogList steps={serialLog.steps.value} stepColor={serialLog.stepColor} />
        </section>
      </div>
    )
  }
})
