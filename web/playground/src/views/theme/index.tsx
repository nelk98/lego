import { defineComponent } from 'vue'
import './style.scss'
import { ScrollView } from '@lego/web-ui'

const BG_LEVELS = [0, 1, 2, 3, 4, 5] as const

/** 两层嵌套：外层 i、内层 j，共 6×6 种 */
const NEST_PAIRS: { outer: number; inner: number }[] = BG_LEVELS.flatMap((outer) =>
  BG_LEVELS.map((inner) => ({ outer, inner }))
)

export default defineComponent({
  setup() {
    const themes = ['light', 'dark'] as const

    const BgColor = () => {
      return (
        <div>
          <div class="p_theme-stack">
            <div class="bg b0">
              <div class="bg b1">
                <div class="bg b2">
                  <div class="bg b3">
                    <div class="bg b4">
                      <div class="bg b5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <section class="p_theme-nest-section">
            <h2 class="p_theme-nest-heading">两层嵌套（0–5）</h2>
            <div class="p_theme-nest-grid">
              {NEST_PAIRS.map(({ outer, inner }) => (
                <div class="p_theme-nest-cell" key={`${outer}-${inner}`}>
                  <span class="p_theme-nest-label">
                    {outer}套{inner}
                  </span>
                  <div class={`p_theme-nest-preview bg b${outer}`}>
                    <div class={`bg b${inner}`} />
                  </div>
                </div>
              ))}
            </div>
          </section> */}
        </div>
      )
    }

    const TextColor = () => {
      return (
        <div class="m-12 font-size-[12px] dark:m-1 text-13.5px">
          <div class="t0">标题 0 </div>
          <div class="t1">标题 1 </div>
          <div class="t2">标题 2 </div>
          <div class="t3">标题 3 </div>
          <div class="t4">标题 4 </div>
          <div class="t5">标题 5 </div>
        </div>
      )
    }

    return () => {
      return (
        <div class="p_theme">
          {themes.map((theme) => (
            <ScrollView class="p_theme-view" data-theme={theme}>
              <BgColor />
              <TextColor />
            </ScrollView>
          ))}
        </div>
      )
    }
  }
})
