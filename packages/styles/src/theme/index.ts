import { ref } from 'vue'
import './root.scss'

/**
 * 主题模式
 * - light: 浅色模式
 * - dark: 深色模式
 * - system: 系统模式
 */
type ThemeMode = 'light' | 'dark' | 'system'

const theme = ref<ThemeMode>('light')

export const useTheme = () => {
  return {
    theme
  }
}
