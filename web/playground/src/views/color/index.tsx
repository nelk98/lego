import { defineComponent } from 'vue'
import { ScrollView } from '@lego/web-ui'

import {
  PRIMARY_COLOR_NAMES,
  PRIMARY_STEPS,
  swatchTextClass,
  type PrimaryColorName,
  type PrimaryStep
} from '../../data/primary-colors'

import './style.scss'

const THEMES = ['light', 'dark'] as const

function cssVar(step: PrimaryStep) {
  return `var(--color-primary-${step})`
}

const ColorSwatches = (props: { theme: (typeof THEMES)[number] }) => {
  return (
    <div class="p_color-swatches">
      {PRIMARY_STEPS.map((step) => (
        <div
          key={step}
          class={['p_color-swatch', swatchTextClass(props.theme, step)]}
          style={{ backgroundColor: cssVar(step) }}
        >
          <span class="p_color-swatch-step">{step}</span>
        </div>
      ))}
    </div>
  )
}

const ColorTextRow = () => {
  return (
    <div class="p_color-text-row">
      {PRIMARY_STEPS.map((step) => (
        <span key={step} class="p_color-text-item" style={{ color: cssVar(step) }}>
          Aa {step}
        </span>
      ))}
    </div>
  )
}

const PrimaryBlock = (props: { theme: (typeof THEMES)[number]; primary: PrimaryColorName }) => {
  return (
    <section class="p_color-primary" data-primary={props.primary}>
      <h3 class="p_color-primary-name">{props.primary}</h3>
      <p class="p_color-section-label">色阶方块</p>
      <ColorSwatches theme={props.theme} />
      <p class="p_color-section-label">色阶文字</p>
      <ColorTextRow />
    </section>
  )
}

export default defineComponent({
  name: 'ColorView',
  setup() {
    return () => (
      <div class="p_color">
        {THEMES.map((theme) => (
          <ScrollView key={theme} class="p_color-panel" data-theme-isolate="" data-theme={theme}>
            <h2 class="p_color-panel-title">{theme === 'light' ? '浅色主题' : '深色主题'}</h2>
            {PRIMARY_COLOR_NAMES.map((primary) => (
              <PrimaryBlock key={primary} theme={theme} primary={primary} />
            ))}
          </ScrollView>
        ))}
      </div>
    )
  }
})
