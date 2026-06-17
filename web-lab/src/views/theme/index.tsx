import { defineComponent, onMounted, ref, watch, type PropType } from 'vue'
import { ScrollView } from '@lego/web-ui'
import {
  PRIMARY_STEPS,
  swatchTextClass,
  useTheme,
  type PrimaryStep,
  type ThemeMode
} from '@lego/web-ui'

import './style.scss'

const THEMES: ThemeMode[] = ['light', 'dark']

interface TokenDef {
  name: string
  label?: string
  preview: 'color' | 'text' | 'line'
}

interface TokenSection {
  title: string
  description: string
  tokens: TokenDef[]
}

const TEXT_TOKENS: TokenDef[] = [
  { name: '--color-text', label: 'text', preview: 'text' },
  { name: '--color-text-muted', label: 'muted', preview: 'text' },
  { name: '--color-text-0', label: '0', preview: 'text' },
  { name: '--color-text-1', label: '1', preview: 'text' },
  { name: '--color-text-2', label: '2', preview: 'text' },
  { name: '--color-text-3', label: '3', preview: 'text' },
  { name: '--color-text-4', label: '4', preview: 'text' },
  { name: '--color-text-5', label: '5', preview: 'text' }
]

const BG_TOKENS: TokenDef[] = [
  { name: '--color-bg', label: 'bg', preview: 'color' },
  { name: '--color-bg-0', label: '0', preview: 'color' },
  { name: '--color-bg-1', label: '1', preview: 'color' },
  { name: '--color-bg-2', label: '2', preview: 'color' },
  { name: '--color-bg-3', label: '3', preview: 'color' },
  { name: '--color-bg-4', label: '4', preview: 'color' },
  { name: '--color-bg-5', label: '5', preview: 'color' }
]

const LINE_TOKENS: TokenDef[] = [
  { name: '--color-border', label: 'border', preview: 'line' },
  { name: '--color-line-1', label: 'line-1', preview: 'line' },
  { name: '--color-line-2', label: 'line-2', preview: 'line' },
  { name: '--color-line-3', label: 'line-3', preview: 'line' },
  { name: '--color-line-4', label: 'line-4', preview: 'line' }
]

const STATUS_TOKENS: TokenDef[] = [
  { name: '--color-info', preview: 'color' },
  { name: '--color-info-hover', preview: 'color' },
  { name: '--color-info-active', preview: 'color' },
  { name: '--color-info-disabled', preview: 'color' },
  { name: '--color-info-light', preview: 'color' },
  { name: '--color-info-light-hover', preview: 'color' },
  { name: '--color-info-light-active', preview: 'color' },
  { name: '--color-success', preview: 'color' },
  { name: '--color-success-hover', preview: 'color' },
  { name: '--color-success-active', preview: 'color' },
  { name: '--color-success-disabled', preview: 'color' },
  { name: '--color-success-light', preview: 'color' },
  { name: '--color-success-light-hover', preview: 'color' },
  { name: '--color-success-light-active', preview: 'color' },
  { name: '--color-warning', preview: 'color' },
  { name: '--color-warning-hover', preview: 'color' },
  { name: '--color-warning-active', preview: 'color' },
  { name: '--color-warning-disabled', preview: 'color' },
  { name: '--color-warning-light', preview: 'color' },
  { name: '--color-warning-light-hover', preview: 'color' },
  { name: '--color-warning-light-active', preview: 'color' },
  { name: '--color-danger', preview: 'color' },
  { name: '--color-danger-hover', preview: 'color' },
  { name: '--color-danger-active', preview: 'color' },
  { name: '--color-danger-disabled', preview: 'color' },
  { name: '--color-danger-light', preview: 'color' },
  { name: '--color-danger-light-hover', preview: 'color' },
  { name: '--color-danger-light-active', preview: 'color' }
]

const SEMANTIC_TOKENS: TokenDef[] = [
  { name: '--background', preview: 'color' },
  { name: '--foreground', preview: 'text' },
  { name: '--card', preview: 'color' },
  { name: '--card-foreground', preview: 'text' },
  { name: '--popover', preview: 'color' },
  { name: '--popover-foreground', preview: 'text' },
  { name: '--primary', preview: 'color' },
  { name: '--primary-foreground', preview: 'text' },
  { name: '--secondary', preview: 'color' },
  { name: '--secondary-foreground', preview: 'text' },
  { name: '--muted', preview: 'color' },
  { name: '--muted-foreground', preview: 'text' },
  { name: '--accent', preview: 'color' },
  { name: '--accent-foreground', preview: 'text' },
  { name: '--destructive', preview: 'color' },
  { name: '--destructive-foreground', preview: 'text' },
  { name: '--border', preview: 'line' },
  { name: '--input', preview: 'color' },
  { name: '--ring', preview: 'color' }
]

const NEUTRAL_TOKENS: TokenDef[] = [
  { name: '--color-white', preview: 'color' },
  { name: '--color-black', preview: 'color' },
  { name: '--color-neutral-50', preview: 'color' },
  { name: '--color-neutral-100', preview: 'color' },
  { name: '--color-neutral-200', preview: 'color' },
  { name: '--color-neutral-300', preview: 'color' },
  { name: '--color-neutral-400', preview: 'color' },
  { name: '--color-neutral-500', preview: 'color' },
  { name: '--color-neutral-600', preview: 'color' },
  { name: '--color-neutral-700', preview: 'color' },
  { name: '--color-neutral-800', preview: 'color' },
  { name: '--color-neutral-900', preview: 'color' },
  { name: '--color-neutral-950', preview: 'color' }
]

const TOKEN_SECTIONS: TokenSection[] = [
  { title: '文字色', description: 'color-text-*', tokens: TEXT_TOKENS },
  { title: '背景色', description: 'color-bg-*', tokens: BG_TOKENS },
  { title: '线条与边框', description: 'color-border / color-line-*', tokens: LINE_TOKENS },
  {
    title: '状态色',
    description: 'info / success / warning / danger',
    tokens: STATUS_TOKENS
  },
  { title: '语义色', description: 'shadcn semantic tokens', tokens: SEMANTIC_TOKENS },
  { title: '中性色', description: 'hex 色阶 + white/black 通道', tokens: NEUTRAL_TOKENS }
]

const RADIUS_SAMPLES = [
  { label: 'sm', className: 'p_theme-radius-sm' },
  { label: 'md', className: 'p_theme-radius-md' },
  { label: 'base', className: 'p_theme-radius-base' },
  { label: 'lg', className: 'p_theme-radius-lg' },
  { label: 'xl', className: 'p_theme-radius-xl' }
] as const

const FONT_SAMPLES = [
  { label: 'text-8', className: 'text-8 font-700', sample: 'Display 32px' },
  { label: 'text-6', className: 'text-6 font-700', sample: 'Heading 24px' },
  { label: 'text-4.5', className: 'text-4.5 font-600', sample: 'Subheading 18px' },
  { label: 'text-4', className: 'text-4', sample: 'Body 16px' },
  { label: 'text-3.5', className: 'text-3.5', sample: 'Secondary 14px' },
  { label: 'text-3', className: 'text-3', sample: 'Caption 12px' }
] as const

function readCssVar(el: HTMLElement | undefined, name: string) {
  if (!el) return ''
  return getComputedStyle(el).getPropertyValue(name).trim()
}

function isChannelVar(name: string) {
  return name === '--color-white' || name === '--color-black'
}

function channelPreviewStyle(name: string) {
  return { backgroundColor: `rgba(var(${name}), 1)` }
}

const TokenRow = defineComponent({
  name: 'ThemeTokenRow',
  props: {
    token: {
      type: Object as PropType<TokenDef>,
      required: true
    },
    panel: Object as PropType<HTMLElement | undefined>,
    refreshKey: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const resolved = ref('')

    const syncValue = () => {
      resolved.value = readCssVar(props.panel, props.token.name)
    }

    onMounted(syncValue)
    watch(() => [props.panel, props.refreshKey, props.token.name], syncValue, { flush: 'post' })

    return () => {
      const previewStyle = isChannelVar(props.token.name)
        ? channelPreviewStyle(props.token.name)
        : { backgroundColor: `var(${props.token.name})` }

      return (
        <div class="p_theme-token">
          <div class={['p_theme-token-preview', `p_theme-token-preview--${props.token.preview}`]}>
            {props.token.preview === 'text' ? (
              <span style={{ color: `var(${props.token.name})` }}>{props.token.label ?? 'Aa'}</span>
            ) : null}
            {props.token.preview === 'color' ? (
              <span class="p_theme-token-fill" style={previewStyle} />
            ) : null}
            {props.token.preview === 'line' ? (
              <span
                class="p_theme-token-line"
                style={{ borderColor: `var(${props.token.name})` }}
              />
            ) : null}
          </div>
          <div class="p_theme-token-meta">
            <code>{props.token.name}</code>
            <span class="p_theme-token-value">{resolved.value || '—'}</span>
          </div>
        </div>
      )
    }
  }
})

const PrimaryScale = defineComponent({
  name: 'ThemePrimaryScale',
  props: {
    theme: {
      type: String as PropType<ThemeMode>,
      required: true
    },
    panel: Object as PropType<HTMLElement | undefined>,
    refreshKey: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const resolvedPrimary = ref('')

    const syncPrimary = () => {
      resolvedPrimary.value = readCssVar(props.panel, '--color-primary')
    }

    onMounted(syncPrimary)
    watch(() => [props.panel, props.refreshKey], syncPrimary, { flush: 'post' })

    return () => (
      <section class="p_theme-section">
        <div class="p_theme-section-head">
          <h3>主题色阶</h3>
          <span>data-primary · {resolvedPrimary.value || 'var(--color-primary)'}</span>
        </div>
        <div class="p_theme-primary-swatches">
          {PRIMARY_STEPS.map((step) => (
            <div
              key={step}
              class={['p_theme-primary-swatch', swatchTextClass(props.theme, step as PrimaryStep)]}
              style={{ backgroundColor: `var(--color-primary-${step})` }}
            >
              <span>{step}</span>
            </div>
          ))}
        </div>
        <div class="p_theme-primary-text">
          {PRIMARY_STEPS.map((step) => (
            <span key={step} style={{ color: `var(--color-primary-${step})` }}>
              Aa {step}
            </span>
          ))}
        </div>
      </section>
    )
  }
})

const ThemePanel = defineComponent({
  name: 'ThemePanel',
  props: {
    theme: {
      type: String as PropType<ThemeMode>,
      required: true
    },
    primary: {
      type: String,
      required: true
    },
    refreshKey: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const panelRef = ref<HTMLElement>()
    const fontFamily = ref('')
    const radiusValue = ref('')

    const syncMeta = () => {
      fontFamily.value = readCssVar(panelRef.value, 'font-family')
      radiusValue.value = readCssVar(panelRef.value, '--radius')
    }

    onMounted(syncMeta)
    watch(() => [panelRef.value, props.refreshKey], syncMeta, { flush: 'post' })

    return () => (
      <ScrollView
        class="p_theme-panel"
        data-theme-isolate=""
        data-theme={props.theme}
        data-primary={props.primary}
      >
        <div ref={panelRef} class="p_theme-panel-inner">
          <header class="p_theme-panel-head">
            <h2>{props.theme === 'light' ? '浅色模式' : '深色模式'}</h2>
            <span>data-theme="{props.theme}"</span>
          </header>

          <PrimaryScale theme={props.theme} panel={panelRef.value} refreshKey={props.refreshKey} />

          {TOKEN_SECTIONS.map((section) => (
            <section key={section.title} class="p_theme-section">
              <div class="p_theme-section-head">
                <h3>{section.title}</h3>
                <span>{section.description}</span>
              </div>
              <div class="p_theme-token-grid">
                {section.tokens.map((token) => (
                  <TokenRow
                    key={token.name}
                    token={token}
                    panel={panelRef.value}
                    refreshKey={props.refreshKey}
                  />
                ))}
              </div>
            </section>
          ))}

          <section class="p_theme-section">
            <div class="p_theme-section-head">
              <h3>圆角</h3>
              <span>--radius · {radiusValue.value || '0.625rem'}</span>
            </div>
            <div class="p_theme-radius-grid">
              {RADIUS_SAMPLES.map((sample) => (
                <div key={sample.label} class="p_theme-radius-item">
                  <div class={['p_theme-radius-box', sample.className]} />
                  <code>{sample.label}</code>
                </div>
              ))}
            </div>
          </section>

          <section class="p_theme-section">
            <div class="p_theme-section-head">
              <h3>字体</h3>
              <span>Uno text-* 字号阶梯</span>
            </div>
            <div class="p_theme-font-family">
              <code>font-family</code>
              <span>{fontFamily.value || 'inherit'}</span>
            </div>
            <div class="p_theme-font-grid">
              {FONT_SAMPLES.map((sample) => (
                <div key={sample.label} class="p_theme-font-item">
                  <span class={sample.className}>{sample.sample}</span>
                  <code>{sample.label}</code>
                </div>
              ))}
            </div>
          </section>
        </div>
      </ScrollView>
    )
  }
})

export default defineComponent({
  name: 'ThemeView',
  setup() {
    const theme = useTheme()
    const refreshKey = ref(0)

    watch(
      () => theme.primary.value,
      () => {
        refreshKey.value += 1
      }
    )

    return () => (
      <div class="p_theme">
        <header class="p_theme-intro">
          <h1>Theme tokens</h1>
          <p>
            并排对比浅色与深色下的 CSS 变量；主题色阶跟随顶部「主题色」选择（当前：
            {theme.primary.value}）。
          </p>
        </header>
        <div class="p_theme-panels">
          {THEMES.map((mode) => (
            <ThemePanel
              key={mode}
              theme={mode}
              primary={theme.primary.value}
              refreshKey={refreshKey.value}
            />
          ))}
        </div>
      </div>
    )
  }
})
