import { computed, defineComponent, type PropType } from 'vue'

export type StoryViewport = 'desktop' | 'tablet' | 'mobile'

const viewportWidth: Record<StoryViewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px'
}

export default defineComponent({
  name: 'PreviewContainer',
  props: {
    viewport: {
      type: String as PropType<StoryViewport>,
      default: 'desktop'
    }
  },
  setup(props, { slots }) {
    const frameStyle = computed(() => ({
      width: viewportWidth[props.viewport],
      maxWidth: '100%'
    }))

    return () => (
      <div class="lego-preview-stage">
        <div class="lego-preview-frame" style={frameStyle.value}>
          {slots.default?.()}
        </div>
      </div>
    )
  }
})
