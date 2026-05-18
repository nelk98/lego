import { SwitchRoot, SwitchThumb, type SwitchRootProps } from 'reka-ui'
import { defineComponent, mergeProps, useAttrs, type PropType } from 'vue'

import { cn } from '../utils'

export const UiSwitch = defineComponent({
  name: 'UiSwitch',
  inheritAttrs: false,
  props: {
    /** 受控开关值；TSX 下用 `modelValue` + `onUpdate:modelValue`。 */
    modelValue: {
      type: Boolean as PropType<boolean | null>,
      default: undefined
    },
    /** 非受控场景下的初始值。 */
    defaultValue: Boolean,
    /** 禁用后会保留语义状态并阻止交互。 */
    disabled: Boolean,
    /** 表单提交字段名，来自 Reka FormFieldProps。 */
    name: String,
    /** 表单必填语义。 */
    required: Boolean,
    /** 原生表单提交时使用的值。 */
    value: String,
    as: [String, Object] as PropType<SwitchRootProps['as']>,
    asChild: Boolean
  },
  emits: {
    'update:modelValue': (_value: boolean) => true
  },
  setup(props, { emit }) {
    const attrs = useAttrs()

    return () => (
      <SwitchRoot
        modelValue={props.modelValue}
        defaultValue={props.defaultValue}
        disabled={props.disabled}
        name={props.name}
        required={props.required}
        value={props.value}
        as={props.as}
        asChild={props.asChild}
        {...mergeProps(attrs, {
          'onUpdate:modelValue': (value: boolean) => emit('update:modelValue', value),
          class: cn(
            [
              'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent outline-none transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--l-shadcn-ring)] focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'data-[state=checked]:bg-[var(--l-shadcn-primary)] data-[state=unchecked]:bg-[var(--l-shadcn-input)]'
            ],
            attrs.class
          )
        })}
      >
        <SwitchThumb
          class={cn([
            'pointer-events-none block size-5 rounded-full bg-[var(--l-shadcn-background)] shadow-lg ring-0 transition-transform',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
          ])}
        />
      </SwitchRoot>
    )
  }
})

export default UiSwitch
