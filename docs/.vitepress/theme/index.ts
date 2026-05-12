import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'

const theme = {
  extends: DefaultTheme
} satisfies Theme

export default theme
