import { defineComponent } from 'vue'
import { Select } from '@lego/web-ui'
import { PRIMARY_COLOR_NAMES, useTheme, type PrimaryColorName } from '@lego/web-ui'

import styles from './ThemeControls.module.css'

const primaryOptions = PRIMARY_COLOR_NAMES.map((primary) => ({
  value: primary,
  label: primary
}))

export default defineComponent({
  name: 'ThemeControls',
  setup() {
    const theme = useTheme()

    return () => (
      <div class={styles.themeControls} aria-label="Theme controls">
        <div class={styles.themeField}>
          <span>主题色</span>
          <Select
            value={theme.primary.value}
            options={primaryOptions}
            triggerClass={styles.themeSelect}
            contentClass={styles.themeSelectContent}
            onChange={(value) => {
              theme.setPrimary(value as PrimaryColorName)
            }}
          />
        </div>
        <button
          type="button"
          class={styles.themeToggle}
          aria-pressed={theme.theme.value === 'dark'}
          onClick={() => {
            theme.toggleTheme()
          }}
        >
          {theme.theme.value === 'dark' ? '深色' : '浅色'}
        </button>
      </div>
    )
  }
})
