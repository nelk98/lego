import { defineComponent, type PropType } from 'vue'
import ClientOnly from './ClientOnly'
import type { StoryDemo, StoryPlatform } from '../types'

export default defineComponent({
  name: 'DemoRenderer',
  props: {
    demo: {
      type: Object as PropType<StoryDemo | undefined>,
      default: undefined
    },
    propsValue: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({})
    },
    platform: {
      type: String as PropType<StoryPlatform>,
      default: 'web'
    }
  },
  setup(props) {
    function renderDemoContent() {
      if (!props.demo) {
        return <div class="lego-demo-placeholder">请选择 demo</div>
      }

      try {
        return <div class="lego-demo-rendered">{props.demo.render(props.propsValue)}</div>
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return <pre class="lego-demo-error">{message}</pre>
      }
    }

    return () => {
      const content = renderDemoContent()

      if (props.platform === 'mobile') {
        return (
          <ClientOnly>
            {{
              default: () => content,
              fallback: () => <div class="lego-demo-placeholder">加载预览中…</div>
            }}
          </ClientOnly>
        )
      }

      return content
    }
  }
})
