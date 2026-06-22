import {
  DEVICE_FRAME_MODELS,
  DEFAULT_DEVICE_FRAME_MODEL,
  DeviceFrame,
  type DeviceFrameModelName
} from '@lego/ui'
import { defineStory } from '../../runtime'

type DeviceFrameContentType = 'dashboard' | 'form'

interface DeviceFrameStoryProps {
  model?: DeviceFrameModelName
  scale?: number
  background?: string
  showStatusBar?: boolean
  showCapsule?: boolean
  contentType?: DeviceFrameContentType
}

const defaultProps = {
  model: DEFAULT_DEVICE_FRAME_MODEL.name,
  scale: 0.62,
  background: '#f8fafc',
  showStatusBar: true,
  showCapsule: true,
  contentType: 'dashboard'
} satisfies Required<DeviceFrameStoryProps>

function normalizeProps(props: DeviceFrameStoryProps = {}) {
  return {
    ...defaultProps,
    ...props
  }
}

function renderDashboardContent() {
  return (
    <div style={runtimeStyle}>
      <header style={mobileHeaderStyle}>
        <div>
          <div style={eyebrowStyle}>今日履约</div>
          <strong style={titleStyle}>订单看板</strong>
        </div>
        <span style={tagStyle}>实时</span>
      </header>

      <section style={summaryStyle}>
        <span style={summaryLabelStyle}>待处理</span>
        <strong style={summaryValueStyle}>128</strong>
        <span style={summaryMetaStyle}>较昨日 +12</span>
      </section>

      <div style={actionGridStyle}>
        <button style={primaryActionStyle}>扫码核销</button>
        <button style={secondaryActionStyle}>批量处理</button>
      </div>

      <div style={listStyle}>
        {['门店自提', '同城配送', '售后审核', '库存预警'].map((item, index) => (
          <div style={listItemStyle} key={item}>
            <span>{item}</span>
            <strong>{24 + index * 9}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderFormContent() {
  return (
    <div style={runtimeStyle}>
      <header style={mobileHeaderStyle}>
        <div>
          <div style={eyebrowStyle}>新建任务</div>
          <strong style={titleStyle}>门店巡检</strong>
        </div>
      </header>

      <section style={formCardStyle}>
        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>巡检门店</span>
          <input style={inputStyle} value="上海静安店" readonly />
        </label>
        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>负责人</span>
          <input style={inputStyle} value="Nelk" readonly />
        </label>
        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>备注</span>
          <textarea style={textareaStyle} value="检查陈列、库存和活动物料。" readonly />
        </label>
      </section>

      <button style={submitStyle}>提交巡检</button>
    </div>
  )
}

function renderRuntimeContent(type: DeviceFrameContentType) {
  return type === 'form' ? renderFormContent() : renderDashboardContent()
}

function renderDeviceFrame(props: DeviceFrameStoryProps) {
  const normalized = normalizeProps(props)

  return (
    <div style={stageStyle}>
      <DeviceFrame
        model={normalized.model}
        scale={normalized.scale}
        background={normalized.background}
        showStatusBar={normalized.showStatusBar}
        showCapsule={normalized.showCapsule}
      >
        {renderRuntimeContent(normalized.contentType)}
      </DeviceFrame>
    </div>
  )
}

const stageStyle = {
  display: 'flex',
  minWidth: '0',
  justifyContent: 'center',
  padding: '16px'
}

const runtimeStyle = {
  boxSizing: 'border-box',
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  gap: '14px',
  overflow: 'auto',
  padding:
    'calc(var(--device-capsule-bottom, var(--device-safe-area-top)) + 14px) 16px calc(var(--device-safe-area-bottom) + 18px)',
  background: 'linear-gradient(180deg, rgb(239 246 255) 0%, rgb(255 255 255) 42%)',
  color: '#172033',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
} as const

const mobileHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '12px'
}

const eyebrowStyle = {
  marginBottom: '6px',
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 650
}

const titleStyle = {
  color: '#172033',
  fontSize: '22px',
  lineHeight: 1.15
}

const tagStyle = {
  borderRadius: '999px',
  padding: '5px 9px',
  background: '#dcfce7',
  color: '#166534',
  fontSize: '12px',
  fontWeight: 650
}

const summaryStyle = {
  display: 'grid',
  gap: '7px',
  borderRadius: '8px',
  padding: '18px',
  background: '#172033',
  color: '#ffffff'
}

const summaryLabelStyle = {
  color: 'rgb(255 255 255 / 72%)',
  fontSize: '13px'
}

const summaryValueStyle = {
  fontSize: '42px',
  lineHeight: 1
}

const summaryMetaStyle = {
  color: 'rgb(255 255 255 / 72%)',
  fontSize: '12px'
}

const actionGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '10px'
}

const actionBaseStyle = {
  minHeight: '42px',
  border: 0,
  borderRadius: '8px',
  color: '#ffffff',
  font: 'inherit',
  fontSize: '14px',
  fontWeight: 650
}

const primaryActionStyle = {
  ...actionBaseStyle,
  background: '#2563eb'
}

const secondaryActionStyle = {
  ...actionBaseStyle,
  background: '#0f766e'
}

const listStyle = {
  display: 'grid',
  gap: '10px'
}

const listItemStyle = {
  display: 'flex',
  minHeight: '54px',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  border: '1px solid #e3e8ef',
  borderRadius: '8px',
  padding: '0 14px',
  background: '#ffffff',
  color: '#334155',
  fontSize: '14px'
}

const formCardStyle = {
  display: 'grid',
  gap: '14px',
  border: '1px solid #e3e8ef',
  borderRadius: '8px',
  padding: '16px',
  background: '#ffffff'
}

const fieldStyle = {
  display: 'grid',
  gap: '7px'
}

const fieldLabelStyle = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 650
}

const inputStyle = {
  boxSizing: 'border-box',
  width: '100%',
  height: '38px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '0 11px',
  color: '#172033',
  font: 'inherit'
} as const

const textareaStyle = {
  ...inputStyle,
  height: '82px',
  padding: '10px 11px',
  resize: 'none'
} as const

const submitStyle = {
  minHeight: '44px',
  border: 0,
  borderRadius: '8px',
  background: '#2563eb',
  color: '#ffffff',
  font: 'inherit',
  fontSize: '15px',
  fontWeight: 700
}

export default defineStory<DeviceFrameStoryProps>({
  title: '基础组件/DeviceFrame',
  component: DeviceFrame,
  docs: () => import('./docs.md'),
  demos: [
    {
      name: '基础用法',
      category: 'Basics',
      description: '用设备壳包裹真实 DOM，模拟小程序或移动 H5 在设备中的运行效果。',
      props: defaultProps,
      source: `<DeviceFrame model="iPhone 14 Pro / 15 / 15 Pro / 16" scale={0.62}>
  <MobileRuntime />
</DeviceFrame>`,
      render: renderDeviceFrame
    },
    {
      name: '设备型号',
      category: 'Variants',
      description: '对比当前内置的三种 iPhone 规格，检查屏幕尺寸、安全区和胶囊位置。',
      props: {
        scale: 0.38,
        background: '#f8fafc',
        showStatusBar: true,
        showCapsule: true,
        contentType: 'dashboard'
      },
      source: `DEVICE_FRAME_MODELS.map(model => (
  <DeviceFrame model={model.name} scale={0.38}>
    <MobileRuntime />
  </DeviceFrame>
))`,
      render: (props) => {
        const normalized = normalizeProps(props)

        return (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '18px',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            {DEVICE_FRAME_MODELS.map((model) => (
              <div
                style={{ display: 'grid', gap: '10px', justifyItems: 'center' }}
                key={model.name}
              >
                <DeviceFrame
                  model={model.name}
                  scale={normalized.scale}
                  background={normalized.background}
                  showStatusBar={normalized.showStatusBar}
                  showCapsule={normalized.showCapsule}
                >
                  {renderRuntimeContent(normalized.contentType)}
                </DeviceFrame>
                <span style={{ color: '#64748b', fontSize: '12px' }}>
                  {model.name} · {model.width} x {model.height}
                </span>
              </div>
            ))}
          </div>
        )
      }
    },
    {
      name: '容器模式',
      category: 'Layout',
      description: '隐藏状态栏与胶囊，只保留设备尺寸和屏幕裁剪，适合单独验证页面布局。',
      props: {
        ...defaultProps,
        showStatusBar: false,
        showCapsule: false,
        contentType: 'form'
      },
      source: `<DeviceFrame showStatusBar={false} showCapsule={false}>
  <MobileRuntime />
</DeviceFrame>`,
      render: renderDeviceFrame
    }
  ]
})
