import { PRIMARY_COLOR_NAMES, type PrimaryColorName } from '@lego/shared'
import { defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from 'vue'

function isPrimaryColorName(value: string | undefined): value is PrimaryColorName {
  return PRIMARY_COLOR_NAMES.includes(value as PrimaryColorName)
}

const primary = ref<PrimaryColorName>('blue')
let listenerCount = 0
let openRef: { value: boolean } | null = null

function applyPrimary(value: PrimaryColorName) {
  primary.value = value
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.primary = value
  }
}

function syncPrimaryFromDocument() {
  if (typeof document === 'undefined') return
  const current = document.documentElement.dataset.primary
  if (isPrimaryColorName(current)) {
    primary.value = current
  } else if (!current) {
    applyPrimary('blue')
  }
}

function closePanel() {
  if (openRef) openRef.value = false
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!openRef?.value) return
  const target = event.target
  if (target instanceof Element && target.closest('.lego-primary-switch')) return
  closePanel()
}

function onDocumentKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') closePanel()
}

function usePrimaryColorPanel(panelOpen: { value: boolean }) {
  openRef = panelOpen

  onMounted(() => {
    syncPrimaryFromDocument()
    listenerCount += 1
    if (listenerCount === 1) {
      document.addEventListener('pointerdown', onDocumentPointerDown)
      document.addEventListener('keydown', onDocumentKeyDown)
    }
  })

  onBeforeUnmount(() => {
    listenerCount -= 1
    if (listenerCount <= 0) {
      listenerCount = 0
      document.removeEventListener('pointerdown', onDocumentPointerDown)
      document.removeEventListener('keydown', onDocumentKeyDown)
    }
    if (openRef === panelOpen) openRef = null
  })

  return { primary, apply: applyPrimary }
}

export default defineComponent({
  name: 'PrimaryColorSwitch',
  props: {
    variant: {
      type: String as PropType<'bar' | 'screen'>,
      default: 'bar'
    }
  },
  setup(props) {
    const open = ref(false)
    const { primary, apply } = usePrimaryColorPanel(open)

    function toggle() {
      open.value = !open.value
    }

    function select(value: PrimaryColorName) {
      apply(value)
      open.value = false
    }

    function renderSwatch(value: PrimaryColorName) {
      return (
        <button
          type="button"
          class={['lego-primary-switch-option', primary.value === value && 'is-active']}
          data-primary={value}
          aria-label={value}
          aria-selected={primary.value === value}
          onClick={() => select(value)}
        />
      )
    }

    function renderTrigger(label: string) {
      return (
        <button
          type="button"
          class="lego-primary-switch-trigger"
          data-primary={primary.value}
          aria-label={label}
          aria-expanded={open.value}
          onClick={toggle}
        />
      )
    }

    return () => {
      if (props.variant === 'screen') {
        return (
          <div class={['lego-primary-switch', 'is-screen', open.value && 'is-open']}>
            <div class="lego-primary-switch-screen">
              <p class="lego-primary-switch-screen-label">主题色</p>
              {renderTrigger('切换主题色')}
            </div>
            {open.value ? (
              <div class="lego-primary-switch-screen-panel" role="listbox" aria-label="主题色">
                {PRIMARY_COLOR_NAMES.map((value) => renderSwatch(value))}
              </div>
            ) : null}
          </div>
        )
      }

      return (
        <div class={['lego-primary-switch', 'is-bar', open.value && 'is-open']}>
          {renderTrigger('切换主题色')}
          {open.value ? (
            <div class="lego-primary-switch-panel" role="listbox" aria-label="主题色">
              {PRIMARY_COLOR_NAMES.map((value) => renderSwatch(value))}
            </div>
          ) : null}
        </div>
      )
    }
  }
})
