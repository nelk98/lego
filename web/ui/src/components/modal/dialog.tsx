import { X } from '@lucide/vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  type DialogCloseProps,
  type DialogContentProps,
  type DialogDescriptionProps,
  type DialogOverlayProps,
  type DialogPortalProps,
  type DialogRootProps,
  type DialogTitleProps,
  type DialogTriggerProps
} from 'reka-ui'
import { defineComponent, mergeProps, useAttrs, type PropType } from 'vue'

import { cn } from '../../utils/cn'

export const UiDialog = defineComponent({
  name: 'UiDialog',
  props: {
    /** 受控打开状态；TSX 下用 `open` + `onUpdate:open` 等价于 v-model:open。 */
    open: {
      type: Boolean,
      default: undefined
    },
    /** 非受控场景下的初始打开状态。 */
    defaultOpen: {
      type: Boolean,
      default: undefined
    },
    /** 是否启用模态语义；默认交给 Reka UI 处理。 */
    modal: {
      type: Boolean,
      default: undefined
    }
  },
  emits: {
    'update:open': (_value: boolean) => true
  },
  setup(props, { slots, emit }) {
    return () => (
      <DialogRoot
        open={props.open}
        defaultOpen={props.defaultOpen}
        modal={props.modal}
        {...{
          'onUpdate:open': (value: boolean) => emit('update:open', value)
        }}
      >
        {slots.default?.()}
      </DialogRoot>
    )
  }
})

export const UiDialogTrigger = defineComponent({
  name: 'UiDialogTrigger',
  inheritAttrs: false,
  props: {
    /** 与 Button 组合使用时可将样式合并到唯一子节点。 */
    asChild: Boolean,
    as: [String, Object] as PropType<DialogTriggerProps['as']>
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <DialogTrigger as={props.as} asChild={props.asChild} {...mergeProps(attrs)}>
        {slots.default?.()}
      </DialogTrigger>
    )
  }
})

export const UiDialogPortal = defineComponent({
  name: 'UiDialogPortal',
  inheritAttrs: false,
  props: {
    /** Vue Teleport 目标，默认由 Reka UI 放到 body。 */
    to: [String, Object] as PropType<DialogPortalProps['to']>,
    disabled: Boolean,
    defer: Boolean,
    forceMount: Boolean
  },
  setup(props, { slots }) {
    return () => (
      <DialogPortal
        to={props.to}
        disabled={props.disabled}
        defer={props.defer}
        forceMount={props.forceMount}
      >
        {slots.default?.()}
      </DialogPortal>
    )
  }
})

export const UiDialogOverlay = defineComponent({
  name: 'UiDialogOverlay',
  inheritAttrs: false,
  props: {
    /** 动画或测试需要稳定 DOM 时可强制挂载。 */
    forceMount: Boolean,
    as: [String, Object] as PropType<DialogOverlayProps['as']>,
    asChild: Boolean
  },
  setup(props) {
    const attrs = useAttrs()

    return () => (
      <DialogOverlay
        as={props.as}
        asChild={props.asChild}
        forceMount={props.forceMount}
        {...mergeProps(attrs, {
          'data-slot': 'dialog-overlay',
          class: cn(
            'fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            attrs.class
          )
        })}
      />
    )
  }
})

export const UiDialogContent = defineComponent({
  name: 'UiDialogContent',
  inheritAttrs: false,
  props: {
    /** 透传给 Reka Content，适合接动画库时使用。 */
    forceMount: Boolean,
    /** 打开 Dialog 后是否禁用外部元素指针事件。 */
    disableOutsidePointerEvents: Boolean,
    as: [String, Object] as PropType<DialogContentProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <UiDialogPortal>
        <UiDialogOverlay />
        <DialogContent
          as={props.as}
          asChild={props.asChild}
          forceMount={props.forceMount}
          disableOutsidePointerEvents={props.disableOutsidePointerEvents}
          {...mergeProps(attrs, {
            'data-slot': 'dialog-content',
            class: cn(
              [
                'bg-background fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
              ],
              attrs.class
            )
          })}
        >
          {slots.default?.()}
          <DialogClose
            data-slot="dialog-close"
            class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4"
          >
            <X class="size-4" aria-hidden="true" />
            <span class="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </UiDialogPortal>
    )
  }
})

export const UiDialogHeader = defineComponent({
  name: 'UiDialogHeader',
  inheritAttrs: false,
  setup(_, { slots }) {
    const attrs = useAttrs()

    return () => (
      <div {...mergeProps(attrs, { class: cn('grid gap-1.5', attrs.class) })}>
        {slots.default?.()}
      </div>
    )
  }
})

export const UiDialogFooter = defineComponent({
  name: 'UiDialogFooter',
  inheritAttrs: false,
  setup(_, { slots }) {
    const attrs = useAttrs()

    return () => (
      <div
        {...mergeProps(attrs, {
          class: cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', attrs.class)
        })}
      >
        {slots.default?.()}
      </div>
    )
  }
})

export const UiDialogTitle = defineComponent({
  name: 'UiDialogTitle',
  inheritAttrs: false,
  props: {
    as: [String, Object] as PropType<DialogTitleProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <DialogTitle
        as={props.as}
        asChild={props.asChild}
        {...mergeProps(attrs, {
          class: cn('text-lg font-semibold leading-none tracking-normal', attrs.class)
        })}
      >
        {slots.default?.()}
      </DialogTitle>
    )
  }
})

export const UiDialogDescription = defineComponent({
  name: 'UiDialogDescription',
  inheritAttrs: false,
  props: {
    as: [String, Object] as PropType<DialogDescriptionProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <DialogDescription
        as={props.as}
        asChild={props.asChild}
        {...mergeProps(attrs, {
          class: cn('text-muted-foreground text-sm', attrs.class)
        })}
      >
        {slots.default?.()}
      </DialogDescription>
    )
  }
})

export const UiDialogClose = defineComponent({
  name: 'UiDialogClose',
  inheritAttrs: false,
  props: {
    as: [String, Object] as PropType<DialogCloseProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <DialogClose as={props.as} asChild={props.asChild} {...mergeProps(attrs)}>
        {slots.default?.()}
      </DialogClose>
    )
  }
})
