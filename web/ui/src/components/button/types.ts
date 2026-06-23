import type { VNode, VNodeChild } from 'vue'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'danger-soft'

export type ButtonSize = 'sm' | 'md' | 'lg'

/** Vue 表单扩展：原生 button type。 */
export type ButtonNativeType = 'button' | 'submit' | 'reset'

export interface ButtonRenderProps {
  isPending: boolean
  isPressed: boolean
  isHovered: boolean
  isFocused: boolean
  isFocusVisible: boolean
  isDisabled: boolean
}

export type ButtonRenderFn = (
  props: Record<string, unknown>,
  state: ButtonRenderProps,
  children: VNodeChild
) => VNode
