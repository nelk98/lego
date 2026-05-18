import { defineConfig, presetMini } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'
import presetWind4 from '@unocss/preset-wind4'

export default defineConfig({
  presets: [
    presetWind4({
      dark: {
        // Tailwind v4 preset 同样绑定到项目现有的 data-theme 主题开关。
        dark: '[data-theme="dark"]',
        light: '[data-theme="light"]'
      },
      preflights: {
        // 项目已经由 @lego/shared/web 提供 reset，避免引入第二份全局重置样式。
        reset: false
      }
    }),
    presetMini({
      dark: {
        // 设置 .dark 变体绑定 [data-theme="dark"]
        dark: '[data-theme="dark"]',
        light: '[data-theme="light"]'
      }
    }),
    presetRemToPx({
      baseFontSize: 16
    })
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    ellipsis: 'overflow-hidden text-ellipsis whitespace-nowrap',
    'ellipsis-2': 'max-w-full overflow-hidden text-ellipsis whitespace-nowrap'
  },
  rules: [
    ['t0', { color: 'var(--color-text-0)' }],
    ['t1', { color: 'var(--color-text-1)' }],
    ['t2', { color: 'var(--color-text-2)' }],
    ['t3', { color: 'var(--color-text-3)' }],
    ['t4', { color: 'var(--color-text-4)' }],
    ['t5', { color: 'var(--color-text-5)' }],
    ['b0', { background: 'var(--color-bg-0)' }],
    ['b1', { background: 'var(--color-bg-1)' }],
    ['b2', { background: 'var(--color-bg-2)' }],
    ['b3', { background: 'var(--color-bg-3)' }],
    ['b4', { background: 'var(--color-bg-4)' }],
    ['b5', { background: 'var(--color-bg-5)' }]
  ]
})
