import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import '../../runtime/taroH5Global'
import { configureTaroH5App } from '../../runtime/taroH5Setup'
import Layout from './Layout'
import './style.scss'

const theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    configureTaroH5App(app)
  }
} satisfies Theme

export default theme
