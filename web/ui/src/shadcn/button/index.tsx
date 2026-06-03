import { cva, type VariantProps } from 'class-variance-authority'
import { Primitive, type PrimitiveProps } from 'reka-ui'
import { defineComponent, mergeProps, useAttrs, type PropType } from 'vue'

import { cn } from '../utils'
import { Spin } from '@lego/shared'

/**
 * Button 的视觉变体集中维护在 cva 中。
 *
 * 这样调用方只按需引入组件，仍能通过 `variant` / `size` 得到稳定样式；
 * 如需覆盖，传入 class 即可被 cn/tailwind-merge 合并到最后。
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    'transition-all outline-none select-none',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'h-auto px-0 text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export type UiButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
export type UiButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>

export const UiButton = defineComponent({
  name: 'UiButton',
  inheritAttrs: false,
  props: {
    /** 渲染成其他标签或组件，例如 `as="a"`；来自 Reka UI Primitive。 */
    as: {
      type: [String, Object] as PropType<PrimitiveProps['as']>,
      default: 'button'
    },
    /** 与 shadcn-vue 保持一致：把样式与行为合并到唯一子节点。 */
    asChild: {
      type: Boolean,
      default: false
    },
    /** shadcn 风格按钮类型；新增变体时只需要扩展 buttonVariants。 */
    variant: {
      type: String as PropType<UiButtonVariant>,
      default: 'default'
    },
    /** shadcn 风格尺寸；icon 尺寸固定为正方形，避免布局跳动。 */
    size: {
      type: String as PropType<UiButtonSize>,
      default: 'default'
    },
    /** 原生按钮禁用态；同时让样式里的 disabled:* 工具类生效。 */
    disabled: {
      type: Boolean,
      default: false
    },
    /** 加载中时展示 Spin，并自动禁用点击。 */
    loading: {
      type: Boolean,
      default: false
    },
    /** 默认使用 button，避免在表单内意外触发 submit。 */
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button'
    }
  },
  emits: {
    /** 透出原生 click，避免 TSX 调用方使用 `onClick` 时缺少类型。 */
    click: (_event: MouseEvent) => true
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs()

    return () => {
      const isDisabled = props.disabled || props.loading

      return (
        <Primitive
          as={props.as}
          asChild={props.asChild}
          {...mergeProps(attrs, {
            'data-slot': 'button',
            'data-variant': props.variant,
            'data-size': props.size,
            disabled: isDisabled,
            'aria-busy': props.loading ? true : undefined,
            type: props.as === 'button' ? props.type : undefined,
            onClick: (event: MouseEvent) => {
              if (props.loading) {
                event.preventDefault()
                return
              }
              emit('click', event)
            },
            class: cn(
              'relative',
              buttonVariants({ variant: props.variant, size: props.size }),
              attrs.class
            )
          })}
        >
          {props.loading ? (
            <span class="inline-flex shrink-0 items-center justify-center [&_.c_dot-spin]:size-4 [&_.c_dot-spin]:h-4 [&_.c_dot-spin]:w-4 [&_.c_dot-spin]:before:top-1 [&_.c_dot-spin]:after:left-8">
              <Spin />
            </span>
          ) : null}
          <span class={cn(props.loading && slots.default && 'opacity-70')}>
            {slots.default?.()}
          </span>
        </Primitive>
      )
    }
  }
})

export default UiButton
