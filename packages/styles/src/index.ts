/** 抹平浏览器样式差异，来自 https://tailwindcss.com/docs/preflight */
import './preflight.css'

import { useTheme } from './theme/index'

import './theme'

export { useTheme }

console.log('%c 样式模块加载完毕', 'color:green')
