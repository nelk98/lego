import { createApp, defineComponent, h, ref, shallowRef, type PropType, type VNodeChild } from 'vue'
import {
  UiDialog,
  UiDialogContent,
  UiDialogDescription,
  UiDialogFooter,
  UiDialogHeader,
  UiDialogTitle
} from '../../shadcn/dialog'
import { cn } from '../../shadcn/utils'
import { Button, type ButtonType } from '../button'

export type ModalContent = VNodeChild | (() => VNodeChild)
export type ModalOkResult = boolean | void | Promise<boolean | void>

export interface ModalController {
  close: () => void
  update: (options: Partial<ModalOpenOptions>) => void
}

export interface ModalOpenOptions {
  title?: string | (() => VNodeChild)
  description?: string | (() => VNodeChild)
  content?: ModalContent
  okText?: string
  cancelText?: string
  okButtonType?: ButtonType
  cancelButtonType?: ButtonType
  confirmLoading?: boolean
  width?: string | number
  footer?: boolean | (() => VNodeChild)
  closable?: boolean
  onOk?: () => ModalOkResult
  onCancel?: () => ModalOkResult
  afterClose?: () => void
}

export interface ModalConfirmOptions extends Omit<ModalOpenOptions, 'footer'> {
  content?: ModalContent
}

function renderContent(content: string | ModalContent | undefined): VNodeChild {
  if (typeof content === 'function') return content()
  return content
}

function normalizeWidth(width: string | number | undefined): string | undefined {
  if (typeof width === 'number') return `${width}px`
  return width
}

export const Modal = defineComponent({
  name: 'Modal',
  props: {
    open: {
      type: Boolean,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: undefined
    },
    title: [String, Function] as PropType<string | (() => VNodeChild)>,
    description: [String, Function] as PropType<string | (() => VNodeChild)>,
    okText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    okButtonType: {
      type: String as PropType<ButtonType>,
      default: 'primary'
    },
    cancelButtonType: {
      type: String as PropType<ButtonType>,
      default: 'default'
    },
    confirmLoading: Boolean,
    width: [String, Number] as PropType<string | number>,
    footer: {
      type: [Boolean, Function] as PropType<boolean | (() => VNodeChild)>,
      default: true
    },
    onOk: Function as PropType<() => ModalOkResult>,
    onCancel: Function as PropType<() => ModalOkResult>,
    afterClose: Function as PropType<() => void>
  },
  emits: {
    'update:open': (_value: boolean) => true
  },
  setup(props, { slots, emit, attrs }) {
    const internalLoading = ref(false)
    const uncontrolledOpen = ref(props.defaultOpen ?? false)

    function isOpen() {
      return props.open !== undefined ? props.open : uncontrolledOpen.value
    }

    function setOpen(value: boolean) {
      uncontrolledOpen.value = value
      emit('update:open', value)
      if (!value) props.afterClose?.()
    }

    async function handleCancel() {
      const result = await props.onCancel?.()
      if (result === false) return
      setOpen(false)
    }

    async function handleOk() {
      if (props.confirmLoading || internalLoading.value) return
      internalLoading.value = true
      try {
        const result = await props.onOk?.()
        if (result === false) return
        setOpen(false)
      } finally {
        internalLoading.value = false
      }
    }

    function renderFooter() {
      if (props.footer === false) return null
      if (typeof props.footer === 'function') return props.footer()

      return (
        <UiDialogFooter>
          <Button type={props.cancelButtonType} onClick={handleCancel}>
            {props.cancelText}
          </Button>
          <Button
            type={props.okButtonType}
            loading={props.confirmLoading || internalLoading.value}
            onClick={handleOk}
          >
            {props.okText}
          </Button>
        </UiDialogFooter>
      )
    }

    return () => {
      const width = normalizeWidth(props.width)
      const attrsStyle = typeof attrs.style === 'object' ? attrs.style : undefined

      return (
        <UiDialog
          open={isOpen()}
          {...{
            'onUpdate:open': (value: boolean) => {
              setOpen(value)
            }
          }}
        >
          <UiDialogContent
            {...attrs}
            class={cn('w-[min(92vw,var(--k-modal-width,520px))]', attrs.class)}
            style={{ ...attrsStyle, '--k-modal-width': width }}
          >
            {props.title || props.description ? (
              <UiDialogHeader>
                {props.title ? <UiDialogTitle>{renderContent(props.title)}</UiDialogTitle> : null}
                {props.description ? (
                  <UiDialogDescription>{renderContent(props.description)}</UiDialogDescription>
                ) : null}
              </UiDialogHeader>
            ) : null}
            {slots.default?.()}
            {renderFooter()}
          </UiDialogContent>
        </UiDialog>
      )
    }
  }
})

const ImperativeModalHost = defineComponent({
  name: 'ImperativeModalHost',
  props: {
    options: {
      type: Object as PropType<ModalOpenOptions>,
      required: true
    },
    open: {
      type: Boolean,
      required: true
    },
    onOpenChange: {
      type: Function as PropType<(value: boolean) => void>,
      required: true
    }
  },
  setup(props) {
    return () => {
      const { afterClose: _afterClose, ...modalOptions } = props.options

      return (
        <Modal
          {...modalOptions}
          open={props.open}
          {...{
            'onUpdate:open': props.onOpenChange
          }}
        >
          {renderContent(props.options.content)}
        </Modal>
      )
    }
  }
})

export function openModal(options: ModalOpenOptions): ModalController {
  if (typeof document === 'undefined') {
    throw new Error('modal.open() can only be used in a browser environment.')
  }

  const container = document.createElement('div')
  document.body.appendChild(container)

  const open = ref(true)
  const currentOptions = shallowRef<ModalOpenOptions>({ ...options })
  let app: ReturnType<typeof createApp> | undefined

  function destroy() {
    window.setTimeout(() => {
      app?.unmount()
      container.remove()
      currentOptions.value.afterClose?.()
    }, 160)
  }

  const controller: ModalController = {
    close() {
      open.value = false
      destroy()
    },
    update(nextOptions) {
      currentOptions.value = {
        ...currentOptions.value,
        ...nextOptions
      }
    }
  }

  app = createApp(() =>
    h(ImperativeModalHost as any, {
      options: currentOptions.value,
      open: open.value,
      onOpenChange(value: boolean) {
        open.value = value
        if (!value) destroy()
      }
    })
  )
  app.mount(container)

  return controller
}

export function confirm(options: ModalConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const controller = openModal({
      okButtonType: 'danger',
      ...options,
      onOk: async () => {
        const result = await options.onOk?.()
        if (result === false) return false
        settled = true
        resolve(true)
      },
      onCancel: async () => {
        const result = await options.onCancel?.()
        if (result === false) return false
        settled = true
        resolve(false)
      },
      afterClose: () => {
        options.afterClose?.()
        if (!settled) resolve(false)
      }
    })

    return controller
  })
}

export const modal = {
  open: openModal,
  confirm
}

export default Modal
