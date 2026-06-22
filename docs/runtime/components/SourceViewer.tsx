import { computed, defineComponent, type PropType } from 'vue'
import type { StoryDemo } from '../types'

function normalizeSource(source: string) {
  return source.replace(/^\s*\n/, '').trim()
}

export default defineComponent({
  name: 'SourceViewer',
  props: {
    demo: {
      type: Object as PropType<StoryDemo | undefined>,
      default: undefined
    }
  },
  setup(props) {
    const source = computed(() => {
      if (!props.demo) {
        return ''
      }

      return normalizeSource(props.demo.source || props.demo.render.toString())
    })

    return () => (
      <section class="lego-source-viewer">
        <div class="lego-panel-heading">源码</div>
        <pre class="lego-source-code">
          <code>{source.value || '暂无源码'}</code>
        </pre>
      </section>
    )
  }
})
