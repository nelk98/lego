import { defineComponent } from 'vue'

import styles from './HomeView.module.css'

export default defineComponent({
  name: 'HomeView',
  setup() {
    return () => (
      <main
        class={[
          styles.main,
          'mx-auto max-w-3xl rounded-3xl bg-white/85 p-10 shadow-[0_24px_64px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur'
        ]}
      >
        <span class="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-sky-700 uppercase">
          UnoCSS Ready
        </span>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight text-slate-900 bg-amber-1">
          Lego Web Playground
        </h1>
        <p class={[styles.desc, 'mt-3 text-base leading-7 text-slate-600']}>组件库开发调试</p>
        <div class="active">点击</div>
      </main>
    )
  }
})
