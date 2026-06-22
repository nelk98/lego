import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter, lintGutter } from '@codemirror/lint'
import { basicSetup, EditorView } from 'codemirror'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue'

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export default defineComponent({
  name: 'JsonPropsEditor',
  props: {
    modelValue: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({})
    }
  },
  emits: {
    'update:modelValue': (_value: Record<string, unknown>) => true,
    valid: (_value: Record<string, unknown>) => true,
    invalid: (_message: string) => true
  },
  setup(props, { emit }) {
    const hostRef = ref<HTMLElement>()
    const errorMessage = ref('')
    const editorText = ref(stringifyJson(props.modelValue))
    let view: EditorView | undefined
    let isApplyingExternalValue = false

    function parseAndEmit(text: string) {
      try {
        const value = JSON.parse(text) as Record<string, unknown>
        errorMessage.value = ''
        emit('update:modelValue', value)
        emit('valid', value)
      } catch (error) {
        const message = getErrorMessage(error)
        errorMessage.value = message
        emit('invalid', message)
      }
    }

    function setEditorText(text: string) {
      if (!view || view.state.doc.toString() === text) {
        return
      }

      isApplyingExternalValue = true
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: text
        }
      })
      isApplyingExternalValue = false
    }

    onMounted(() => {
      if (!hostRef.value) {
        return
      }

      view = new EditorView({
        parent: hostRef.value,
        doc: editorText.value,
        extensions: [
          basicSetup,
          json(),
          lintGutter(),
          linter(jsonParseLinter()),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (!update.docChanged || isApplyingExternalValue) {
              return
            }

            const nextText = update.state.doc.toString()
            editorText.value = nextText
            parseAndEmit(nextText)
          })
        ]
      })
    })

    onBeforeUnmount(() => {
      view?.destroy()
    })

    watch(
      () => props.modelValue,
      (value) => {
        const nextText = stringifyJson(value)
        if (nextText === editorText.value) {
          return
        }

        editorText.value = nextText
        errorMessage.value = ''
        setEditorText(nextText)
      },
      { deep: true }
    )

    return () => (
      <section class="lego-json-editor">
        <div class="lego-panel-heading">Props JSON</div>
        <div ref={hostRef} class="lego-json-editor-host" />
        <div class={['lego-json-editor-status', errorMessage.value ? 'is-error' : 'is-valid']}>
          {errorMessage.value ? errorMessage.value : 'JSON 已生效'}
        </div>
      </section>
    )
  }
})
