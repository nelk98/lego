import type { ClassValue } from 'clsx'
import { defineComponent, ref, useAttrs, type PropType, type VNodeChild } from 'vue'
import { cn } from '../../utils/cn'
import { buttonBaseClass, buttonSizeClass, buttonVariantClass, iconOnlySizeClass } from './variants'
import type {
  ButtonNativeType,
  ButtonRenderFn,
  ButtonRenderProps,
  ButtonSize,
  ButtonVariant
} from './types'

export type {
  ButtonNativeType,
  ButtonRenderFn,
  ButtonRenderProps,
  ButtonSize,
  ButtonVariant
} from './types'

export const Button = defineComponent({
  name: 'LegoButton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary'
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    /** Vue 表单扩展：原生 button type。 */
    type: {
      type: String as PropType<ButtonNativeType>,
      default: 'button'
    },
    fullWidth: Boolean,
    isDisabled: Boolean,
    isPending: Boolean,
    isIconOnly: Boolean,
    /** 自定义根节点渲染，对齐 HeroUI `render`。 */
    render: Function as PropType<ButtonRenderFn>
  },
  emits: {
    press: (_event: MouseEvent) => true,
    click: (_event: MouseEvent) => true
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs()
    const isHovered = ref(false)
    const isPressed = ref(false)
    const isFocused = ref(false)
    const isFocusVisible = ref(false)

    function getRenderProps(): ButtonRenderProps {
      const disabled = props.isDisabled || props.isPending
      return {
        isPending: props.isPending,
        isPressed: isPressed.value,
        isHovered: isHovered.value,
        isFocused: isFocused.value,
        isFocusVisible: isFocusVisible.value,
        isDisabled: disabled
      }
    }

    function handlePress(event: MouseEvent) {
      if (props.isDisabled || props.isPending) {
        event.preventDefault()
        return
      }
      emit('press', event)
      emit('click', event)
    }

    function bindInteractionHandlers() {
      return {
        onMouseenter: () => {
          isHovered.value = true
        },
        onMouseleave: () => {
          isHovered.value = false
          isPressed.value = false
        },
        onMousedown: () => {
          isPressed.value = true
        },
        onMouseup: () => {
          isPressed.value = false
        },
        onFocus: (event: FocusEvent) => {
          isFocused.value = true
          isFocusVisible.value = (event.target as HTMLElement).matches(':focus-visible')
        },
        onBlur: () => {
          isFocused.value = false
          isFocusVisible.value = false
        },
        onClick: handlePress
      }
    }

    return () => {
      const { class: className, ...buttonAttrs } = attrs as Record<string, unknown> & {
        class?: ClassValue
      }
      const disabled = props.isDisabled || props.isPending
      const renderProps = getRenderProps()
      const content = slots.default?.(renderProps) as VNodeChild
      const classNames = cn(
        buttonBaseClass,
        props.isIconOnly ? iconOnlySizeClass[props.size] : buttonSizeClass[props.size],
        buttonVariantClass[props.variant],
        props.fullWidth && 'w-full',
        className
      )

      const domProps = {
        ...buttonAttrs,
        type: props.type,
        disabled,
        'aria-disabled': disabled ? true : undefined,
        'aria-busy': props.isPending ? true : undefined,
        'data-pending': props.isPending ? 'true' : undefined,
        'data-hovered': isHovered.value ? 'true' : undefined,
        'data-pressed': isPressed.value ? 'true' : undefined,
        'data-focus-visible': isFocusVisible.value ? 'true' : undefined,
        class: classNames,
        ...bindInteractionHandlers()
      }

      if (props.render) {
        return props.render(domProps, renderProps, content)
      }

      return <button {...domProps}>{content}</button>
    }
  }
})

export default Button
