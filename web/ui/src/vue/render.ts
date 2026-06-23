import { h, type Component, type PropType, type VNodeChild } from 'vue'

/** 可作为 prop / slot 替代传入的可渲染内容 */
export type Renderable<T = void> = VNodeChild | Component | ((props: T) => VNodeChild)

/** 无参懒渲染节点，常见于 `startContent` 等 prop */
export type LazyRenderable = VNodeChild | (() => VNodeChild)

/** Vue props 校验：覆盖 Renderable / LazyRenderable 的常见运行时形态 */
export const RENDERABLE_PROP = [String, Number, Object, Array, Function] as const

export function renderablePropType<T = void>() {
  return RENDERABLE_PROP as unknown as PropType<Renderable<T>>
}

export function lazyRenderablePropType() {
  return RENDERABLE_PROP as unknown as PropType<LazyRenderable>
}

export function resolveLazyRenderable(value: LazyRenderable | undefined): VNodeChild {
  return typeof value === 'function' ? value() : value
}

export function resolveRenderable<T = void>(
  value: Renderable<T> | undefined,
  props?: T
): VNodeChild {
  if (value == null) return value as undefined

  if (typeof value === 'function') {
    if (isComponentLike(value)) {
      return h(value as Component, (props ?? {}) as Record<string, unknown>)
    }
    return (value as (props: T) => VNodeChild)(props as T)
  }

  if (isComponentLike(value)) {
    return h(value as Component, (props ?? {}) as Record<string, unknown>)
  }

  return value as VNodeChild
}

function isComponentLike(value: unknown): value is Component {
  if (typeof value === 'function') {
    return '__vccOpts' in value || 'render' in value || 'setup' in value
  }

  if (typeof value === 'object' && value !== null) {
    return 'setup' in value || 'render' in value || '__vccOpts' in value
  }

  return false
}
