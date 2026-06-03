import { X } from '@lucide/vue'
import { defineComponent, useAttrs, type PropType, type StyleValue } from 'vue'
import { cn } from '../../shadcn/utils'

export type InputSize = 'sm' | 'md' | 'lg'
export type InputValue = string | number | undefined

const inputSizeClass: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-9 px-3 py-1 text-base md:text-sm',
  lg: 'h-10 px-4 text-sm'
}

const inputBaseClass = [
  'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground',
  'dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent shadow-xs',
  'transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
]

const inputFocusClass = 'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
const inputWrapperFocusClass =
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50'

export const Input = defineComponent({
  name: 'Input',
  inheritAttrs: false,
  props: {
    value: [String, Number] as PropType<InputValue>,
    modelValue: [String, Number] as PropType<InputValue>,
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    clearable: Boolean,
    allowClear: Boolean,
    size: {
      type: String as PropType<InputSize>,
      default: 'md'
    },
    type: {
      type: String,
      default: 'text'
    },
    name: String,
    autocomplete: String
  },
  emits: {
    'update:modelValue': (_value: InputValue) => true,
    input: (_value: InputValue, _event: InputEvent) => true,
    change: (_value: InputValue, _event?: Event) => true,
    clear: () => true
  },
  setup(props, { emit, slots }) {
    const attrs = useAttrs()

    function currentValue(): InputValue {
      return props.value !== undefined ? props.value : props.modelValue
    }

    function updateValue(value: InputValue, event: InputEvent) {
      emit('update:modelValue', value)
      emit('input', value, event)
      emit('change', value, event)
    }

    function clearValue() {
      emit('update:modelValue', '')
      emit('change', '')
      emit('clear')
    }

    return () => {
      const {
        class: className,
        style,
        ...inputAttrs
      } = attrs as Record<string, unknown> & {
        class?: string
        style?: StyleValue
      }
      const value = currentValue()
      const canClear = (props.clearable || props.allowClear) && !props.disabled && !props.readonly
      const showClear = canClear && value !== undefined && String(value) !== ''
      const inputClass = cn(inputBaseClass, inputFocusClass, inputSizeClass[props.size], className)

      if (!canClear && !slots.prefix && !slots.suffix) {
        return (
          <input
            {...inputAttrs}
            data-slot="input"
            value={value ?? ''}
            type={props.type}
            name={props.name}
            placeholder={props.placeholder}
            disabled={props.disabled}
            readonly={props.readonly}
            autocomplete={props.autocomplete}
            class={inputClass}
            style={style}
            onInput={(event) => updateValue((event.target as HTMLInputElement).value, event)}
          />
        )
      }

      return (
        <span
          class={cn(
            inputBaseClass,
            inputWrapperFocusClass,
            inputSizeClass[props.size],
            'inline-flex items-center gap-2',
            props.disabled && 'pointer-events-none cursor-not-allowed opacity-50',
            className
          )}
          style={style}
        >
          {slots.prefix?.()}
          <input
            {...inputAttrs}
            data-slot="input"
            value={value ?? ''}
            type={props.type}
            name={props.name}
            placeholder={props.placeholder}
            disabled={props.disabled}
            readonly={props.readonly}
            autocomplete={props.autocomplete}
            class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            onInput={(event) => updateValue((event.target as HTMLInputElement).value, event)}
          />
          {showClear ? (
            <button
              type="button"
              class="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear input"
              onClick={clearValue}
            >
              <X class="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
          {slots.suffix?.()}
        </span>
      )
    }
  }
})

export default Input
