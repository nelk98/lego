import { defineComponent, ref, type PropType } from 'vue'
import { defineWidget } from '../registry/registry'
import { useWidgetContext } from '../renderer/context'
import type { JsfPlugin, WidgetDefinition } from '../core/types'

export interface BasicOption {
  label: string
  value: string | number | boolean
  disabled?: boolean
}

/**
 * 原生 input widget。
 *
 * 这里故意保持很薄：FieldFrame 负责 label/helper/error，widget 只处理输入值和自身 focus。
 */
export const inputWidget = defineWidget({
  name: 'input',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  defaults: {
    props: {
      type: 'text'
    },
    behavior: {
      validateTrigger: 'blur'
    }
  },
  component: defineComponent({
    name: 'SchemaNativeInput',
    props: {
      modelValue: [String, Number] as PropType<string | number | undefined>,
      type: {
        type: String,
        default: 'text'
      },
      placeholder: String,
      disabled: Boolean,
      readonly: Boolean
    },
    emits: {
      'update:modelValue': (_value: string) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const inputRef = ref<HTMLInputElement>()
      const widget = useWidgetContext()

      widget.exposeHandle({
        async focus() {
          inputRef.value?.focus()
        }
      })

      return () => (
        <input
          ref={inputRef}
          class="l-jsf-control"
          value={props.modelValue ?? ''}
          type={props.type}
          placeholder={props.placeholder}
          disabled={props.disabled}
          readonly={props.readonly}
          onInput={(event) => emit('update:modelValue', (event.target as HTMLInputElement).value)}
          onBlur={() => emit('blur')}
        />
      )
    }
  })
} satisfies WidgetDefinition)

export const textareaWidget = defineWidget({
  name: 'textarea',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  component: defineComponent({
    name: 'SchemaNativeTextarea',
    props: {
      modelValue: String,
      placeholder: String,
      disabled: Boolean,
      readonly: Boolean,
      rows: {
        type: Number,
        default: 4
      }
    },
    emits: {
      'update:modelValue': (_value: string) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const inputRef = ref<HTMLTextAreaElement>()
      const widget = useWidgetContext()

      widget.exposeHandle({
        async focus() {
          inputRef.value?.focus()
        }
      })

      return () => (
        <textarea
          ref={inputRef}
          class="l-jsf-control l-jsf-control--textarea"
          value={props.modelValue ?? ''}
          rows={props.rows}
          placeholder={props.placeholder}
          disabled={props.disabled}
          readonly={props.readonly}
          onInput={(event) =>
            emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
          }
          onBlur={() => emit('blur')}
        />
      )
    }
  })
} satisfies WidgetDefinition)

export const selectWidget = defineWidget({
  name: 'select',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  component: defineComponent({
    name: 'SchemaNativeSelect',
    props: {
      modelValue: [String, Number, Boolean] as PropType<BasicOption['value'] | undefined>,
      placeholder: String,
      options: {
        type: Array as PropType<BasicOption[]>,
        default: () => []
      },
      disabled: Boolean
    },
    emits: {
      'update:modelValue': (_value: string) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const selectRef = ref<HTMLSelectElement>()
      const widget = useWidgetContext()

      widget.exposeHandle({
        async focus() {
          selectRef.value?.focus()
        }
      })

      return () => (
        <select
          ref={selectRef}
          class="l-jsf-control"
          value={String(props.modelValue ?? '')}
          disabled={props.disabled}
          onChange={(event) => emit('update:modelValue', (event.target as HTMLSelectElement).value)}
          onBlur={() => emit('blur')}
        >
          {props.placeholder ? (
            <option value="" disabled>
              {props.placeholder}
            </option>
          ) : null}
          {props.options.map((option) => (
            <option
              key={String(option.value)}
              value={String(option.value)}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      )
    }
  })
} satisfies WidgetDefinition)

export const radioWidget = defineWidget({
  name: 'radio',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  component: defineComponent({
    name: 'SchemaNativeRadioGroup',
    props: {
      modelValue: [String, Number, Boolean] as PropType<BasicOption['value'] | undefined>,
      options: {
        type: Array as PropType<BasicOption[]>,
        default: () => []
      },
      disabled: Boolean
    },
    emits: {
      'update:modelValue': (_value: string) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const widget = useWidgetContext()

      widget.exposeHandle({
        async focus() {
          const first = document.querySelector<HTMLInputElement>(
            `[name="jsf-radio-${widget.fieldPath}"]`
          )
          first?.focus()
        }
      })

      return () => (
        <div class="l-jsf-radio-group">
          {props.options.map((option) => (
            <label key={String(option.value)} class="l-jsf-radio">
              <input
                type="radio"
                name={`jsf-radio-${widget.fieldPath}`}
                checked={String(props.modelValue ?? '') === String(option.value)}
                disabled={props.disabled || option.disabled}
                onChange={() => emit('update:modelValue', String(option.value))}
                onBlur={() => emit('blur')}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )
    }
  })
} satisfies WidgetDefinition)

export const switchWidget = defineWidget({
  name: 'switch',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  component: defineComponent({
    name: 'SchemaNativeSwitch',
    props: {
      modelValue: Boolean,
      disabled: Boolean
    },
    emits: {
      'update:modelValue': (_value: boolean) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const inputRef = ref<HTMLInputElement>()
      const widget = useWidgetContext()

      widget.exposeHandle({
        async focus() {
          inputRef.value?.focus()
        }
      })

      return () => (
        <button
          class={['l-jsf-switch', props.modelValue ? 'l-jsf-switch--checked' : '']}
          type="button"
          disabled={props.disabled}
          role="switch"
          aria-checked={props.modelValue}
          onClick={() => emit('update:modelValue', !props.modelValue)}
          onBlur={() => emit('blur')}
        >
          <input ref={inputRef} class="l-jsf-switch__input" tabindex="-1" />
          <span />
        </button>
      )
    }
  })
} satisfies WidgetDefinition)

const basicWidgets = [inputWidget, textareaWidget, selectWidget, radioWidget, switchWidget]

/** 显式安装基础 Web 控件；core 不会默认安装任何 widget。 */
export function webBasicWidgets(): JsfPlugin {
  return {
    name: 'web-basic-widgets',
    install(jsf) {
      basicWidgets.forEach((widget) => jsf.register(widget.name, widget))
    }
  }
}
