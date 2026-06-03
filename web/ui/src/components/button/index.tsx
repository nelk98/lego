import { computed, defineComponent, useAttrs, type PropType } from 'vue'
import { UiButton, type UiButtonSize, type UiButtonVariant } from '../../shadcn/button'
import { cn } from '../../shadcn/utils'

export type ButtonType = 'primary' | 'default' | 'danger' | 'text'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonHtmlType = 'button' | 'submit' | 'reset'

const buttonVariantMap: Record<ButtonType, UiButtonVariant> = {
  primary: 'default',
  default: 'outline',
  danger: 'destructive',
  text: 'ghost'
}

const buttonSizeMap: Record<ButtonSize, UiButtonSize> = {
  sm: 'sm',
  md: 'default',
  lg: 'lg'
}

export const Button = defineComponent({
  name: 'Button',
  inheritAttrs: false,
  props: {
    /** AntD-like visual type. */
    type: {
      type: String as PropType<ButtonType>,
      default: 'default'
    },
    /** Native button type; separated from visual `type`. */
    htmlType: {
      type: String as PropType<ButtonHtmlType>,
      default: 'button'
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    loading: Boolean,
    disabled: Boolean,
    block: Boolean
  },
  emits: {
    click: (_event: MouseEvent) => true
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs()
    const variant = computed(() => buttonVariantMap[props.type])
    const size = computed(() => buttonSizeMap[props.size])

    return () => (
      <UiButton
        {...attrs}
        variant={variant.value}
        size={size.value}
        type={props.htmlType}
        loading={props.loading}
        disabled={props.disabled}
        class={cn(props.block && 'w-full', attrs.class)}
        onClick={(event) => emit('click', event)}
      >
        {slots.default?.()}
      </UiButton>
    )
  }
})

export default Button
