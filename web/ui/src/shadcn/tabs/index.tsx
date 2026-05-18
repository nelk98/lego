import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  type TabsContentProps,
  type TabsListProps,
  type TabsRootProps,
  type TabsTriggerProps
} from 'reka-ui'
import { defineComponent, mergeProps, useAttrs, type PropType } from 'vue'

import { cn } from '../utils'

type TabValue = string | number

export const UiTabs = defineComponent({
  name: 'UiTabs',
  inheritAttrs: false,
  props: {
    /** 受控选中项；TSX 下用 `modelValue` + `onUpdate:modelValue`。 */
    modelValue: [String, Number] as PropType<TabValue>,
    /** 非受控场景下的默认选中项。 */
    defaultValue: [String, Number] as PropType<TabValue>,
    /** 横向或纵向键盘导航。 */
    orientation: String as PropType<TabsRootProps['orientation']>,
    /** 自动激活或手动点击激活。 */
    activationMode: String as PropType<TabsRootProps['activationMode']>,
    /** 隐藏时是否卸载面板；复杂表单一般传 false 保留状态。 */
    unmountOnHide: {
      type: Boolean,
      default: undefined
    }
  },
  emits: {
    'update:modelValue': (_value: TabValue) => true
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs()

    return () => (
      <TabsRoot
        modelValue={props.modelValue}
        defaultValue={props.defaultValue}
        orientation={props.orientation}
        activationMode={props.activationMode}
        unmountOnHide={props.unmountOnHide}
        {...mergeProps(attrs, {
          'onUpdate:modelValue': (value: TabValue) => emit('update:modelValue', value)
        })}
      >
        {slots.default?.()}
      </TabsRoot>
    )
  }
})

export const UiTabsList = defineComponent({
  name: 'UiTabsList',
  inheritAttrs: false,
  props: {
    /** 键盘导航到末尾时是否回到首项。 */
    loop: {
      type: Boolean,
      default: true
    },
    as: [String, Object] as PropType<TabsListProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <TabsList
        as={props.as}
        asChild={props.asChild}
        loop={props.loop}
        {...mergeProps(attrs, {
          class: cn(
            'inline-flex h-9 items-center justify-center rounded-lg bg-[var(--l-shadcn-muted)] p-1 text-[var(--l-shadcn-muted-foreground)]',
            attrs.class
          )
        })}
      >
        {slots.default?.()}
      </TabsList>
    )
  }
})

export const UiTabsTrigger = defineComponent({
  name: 'UiTabsTrigger',
  inheritAttrs: false,
  props: {
    /** 与 TabsContent 对应的唯一值。 */
    value: {
      type: [String, Number] as PropType<TabsTriggerProps['value']>,
      required: true
    },
    disabled: Boolean,
    as: [String, Object] as PropType<TabsTriggerProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <TabsTrigger
        value={props.value}
        disabled={props.disabled}
        as={props.as}
        asChild={props.asChild}
        {...mergeProps(attrs, {
          class: cn(
            [
              'inline-flex h-7 items-center justify-center whitespace-nowrap rounded-md px-3 text-sm font-medium',
              'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-shadcn-ring)]',
              'disabled:pointer-events-none disabled:opacity-50',
              'data-[state=active]:bg-[var(--l-shadcn-background)] data-[state=active]:text-[var(--l-shadcn-foreground)] data-[state=active]:shadow-xs'
            ],
            attrs.class
          )
        })}
      >
        {slots.default?.()}
      </TabsTrigger>
    )
  }
})

export const UiTabsContent = defineComponent({
  name: 'UiTabsContent',
  inheritAttrs: false,
  props: {
    /** 与 TabsTrigger 对应的唯一值。 */
    value: {
      type: [String, Number] as PropType<TabsContentProps['value']>,
      required: true
    },
    forceMount: Boolean,
    as: [String, Object] as PropType<TabsContentProps['as']>,
    asChild: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <TabsContent
        value={props.value}
        forceMount={props.forceMount}
        as={props.as}
        asChild={props.asChild}
        {...mergeProps(attrs, {
          class: cn(
            'mt-2 rounded-lg border border-[var(--l-shadcn-border)] p-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--l-shadcn-ring)]',
            attrs.class
          )
        })}
      >
        {slots.default?.()}
      </TabsContent>
    )
  }
})
