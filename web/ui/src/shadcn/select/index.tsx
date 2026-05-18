import { Check, ChevronDown, ChevronUp } from '@lucide/vue'
import {
  SelectContent,
  SelectGroup,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectPortal,
  SelectRoot,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  type SelectContentProps,
  type SelectItemProps,
  type SelectRootProps,
  type SelectSeparatorProps,
  type SelectTriggerProps,
  type SelectValueProps
} from 'reka-ui'
import { defineComponent, mergeProps, useAttrs, type PropType } from 'vue'

import { cn } from '../utils'

export type UiSelectValueType = string | number | bigint | Record<string, any> | null
export type UiSelectModelValue = UiSelectValueType | UiSelectValueType[] | undefined

export interface UiSelectOption<T extends UiSelectValueType = UiSelectValueType> {
  /** 选项展示文案；复杂展示可配合 `description` 或 `option` slot。 */
  label: string
  /** 选项真实值。对象值建议配合 `by` 指定比较字段或比较函数。 */
  value: T
  /** 禁用单个选项。 */
  disabled?: boolean
  /** 第二行辅助说明，适合复杂业务选项。 */
  description?: string
  /** 键盘 typeahead 使用的纯文本；默认使用 label。 */
  textValue?: string
}

export interface UiSelectOptionGroup<T extends UiSelectValueType = UiSelectValueType> {
  /** 分组标题。 */
  label: string
  /** 分组内选项。 */
  options: UiSelectOption<T>[]
}

export type UiSelectOptionInput<T extends UiSelectValueType = UiSelectValueType> =
  | UiSelectOption<T>
  | UiSelectOptionGroup<T>

type SelectBy<T extends UiSelectValueType> = string | ((a: T, b: T) => boolean)

/**
 * 低阶 primitive escape hatch。
 *
 * 业务默认使用下方数据驱动 `UiSelect`；只有需要完全自定义 Trigger / Content /
 * Item 结构时，才直接组合这些 Root/Trigger/Item 子组件。
 */
export const UiSelectRoot = SelectRoot

export type UiSelectRootProps<T = SelectRootProps['modelValue']> = SelectRootProps<T>

export const UiSelectGroup = SelectGroup

export const UiSelectValue = defineComponent({
  name: 'UiSelectValue',
  inheritAttrs: false,
  props: {
    /** 无选中项时显示的占位文案。 */
    placeholder: String
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <SelectValue
        {...mergeProps(attrs, { placeholder: props.placeholder } satisfies SelectValueProps)}
      >
        {slots.default?.()}
      </SelectValue>
    )
  }
})

export const UiSelectTrigger = defineComponent({
  name: 'UiSelectTrigger',
  inheritAttrs: false,
  props: {
    /** Reka Primitive 的 asChild，用于把触发器行为合并到唯一子节点。 */
    asChild: Boolean,
    /** 触发器默认渲染标签；保持与 Reka Primitive props 对齐。 */
    as: {
      type: [String, Object] as PropType<SelectTriggerProps['as']>,
      default: 'button'
    },
    /** 禁用后由 Reka 设置 aria/data 属性，这里只补充视觉状态。 */
    disabled: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <SelectTrigger
        as={props.as}
        asChild={props.asChild}
        disabled={props.disabled}
        {...mergeProps(attrs, {
          class: cn(
            [
              'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[var(--l-shadcn-input)]',
              'bg-[var(--l-shadcn-background)] px-3 py-2 text-sm text-[var(--l-shadcn-foreground)] shadow-xs outline-none',
              'transition-colors hover:bg-[var(--l-shadcn-accent)]',
              'focus-visible:border-[var(--l-shadcn-ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--l-shadcn-ring)]/30',
              'disabled:cursor-not-allowed disabled:opacity-50',
              '[&>span]:min-w-0 [&>span]:truncate'
            ],
            attrs.class
          )
        })}
      >
        {slots.default?.()}
        <SelectIcon asChild>
          <ChevronDown class="size-4 shrink-0 opacity-50" aria-hidden="true" />
        </SelectIcon>
      </SelectTrigger>
    )
  }
})

export const UiSelectContent = defineComponent({
  name: 'UiSelectContent',
  inheritAttrs: false,
  props: {
    /** 默认使用 popper，让下拉层宽度和位置更接近 shadcn-vue 的 Web 体验。 */
    position: {
      type: String as PropType<SelectContentProps['position']>,
      default: 'popper'
    },
    /** 控制挂载时机；动画或测试需要稳定 DOM 时可传 true。 */
    forceMount: Boolean,
    /** Reka 定位配置，按需透传即可。 */
    side: String as PropType<SelectContentProps['side']>,
    sideOffset: Number,
    align: String as PropType<SelectContentProps['align']>,
    alignOffset: Number,
    avoidCollisions: {
      type: Boolean,
      // Reka 自身有默认碰撞检测；undefined 表示不覆盖它的默认值。
      default: undefined
    },
    collisionPadding: [Number, Object] as PropType<SelectContentProps['collisionPadding']>
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <SelectPortal>
        <SelectContent
          position={props.position}
          forceMount={props.forceMount}
          side={props.side}
          sideOffset={props.sideOffset}
          align={props.align}
          alignOffset={props.alignOffset}
          avoidCollisions={props.avoidCollisions}
          collisionPadding={props.collisionPadding}
          {...mergeProps(attrs, {
            class: cn(
              [
                'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border border-[var(--l-shadcn-border)]',
                'bg-[var(--l-shadcn-popover)] text-[var(--l-shadcn-popover-foreground)] shadow-md',
                'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
                props.position === 'popper' &&
                  'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1'
              ],
              attrs.class
            )
          })}
        >
          <UiSelectScrollUpButton />
          <SelectViewport
            class={cn(
              'p-1',
              props.position === 'popper' &&
                'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)]'
            )}
          >
            {slots.default?.()}
          </SelectViewport>
          <UiSelectScrollDownButton />
        </SelectContent>
      </SelectPortal>
    )
  }
})

export const UiSelectLabel = defineComponent({
  name: 'UiSelectLabel',
  inheritAttrs: false,
  props: {
    /** 与原生 label 的 for 一致；分组选项标题一般不需要传。 */
    for: String
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <SelectLabel
        for={props.for}
        {...mergeProps(attrs, {
          class: cn(
            'px-2 py-1.5 text-xs font-medium text-[var(--l-shadcn-muted-foreground)]',
            attrs.class
          )
        })}
      >
        {slots.default?.()}
      </SelectLabel>
    )
  }
})

export const UiSelectItem = defineComponent({
  name: 'UiSelectItem',
  inheritAttrs: false,
  props: {
    /** 选项值，类型由 SelectRoot 的 modelValue 决定；对象值可配合 by 使用。 */
    value: {
      type: [String, Number, BigInt, Object, null] as PropType<SelectItemProps['value']>,
      required: true
    },
    /** 禁用单个选项；键盘导航会自动跳过。 */
    disabled: Boolean,
    /** 复杂内容选项用于 typeahead 搜索的纯文本。 */
    textValue: String
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <SelectItem
        value={props.value}
        disabled={props.disabled}
        textValue={props.textValue}
        {...mergeProps(attrs, {
          class: cn(
            [
              'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none',
              'text-[var(--l-shadcn-popover-foreground)]',
              'focus:bg-[var(--l-shadcn-accent)] focus:text-[var(--l-shadcn-accent-foreground)]',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
            ],
            attrs.class
          )
        })}
      >
        <span class="absolute right-2 flex size-3.5 items-center justify-center">
          <SelectItemIndicator>
            <Check class="size-4" aria-hidden="true" />
          </SelectItemIndicator>
        </span>
        <SelectItemText>{slots.default?.()}</SelectItemText>
      </SelectItem>
    )
  }
})

export const UiSelectSeparator = defineComponent({
  name: 'UiSelectSeparator',
  inheritAttrs: false,
  props: {
    /** 透传给 Reka Primitive，用于自定义分隔符根节点。 */
    as: [String, Object] as PropType<SelectSeparatorProps['as']>,
    asChild: Boolean
  },
  setup(props) {
    const attrs = useAttrs()

    return () => (
      <SelectSeparator
        as={props.as}
        asChild={props.asChild}
        {...mergeProps(attrs, {
          class: cn('-mx-1 my-1 h-px bg-[var(--l-shadcn-border)]', attrs.class)
        })}
      />
    )
  }
})

export const UiSelectScrollUpButton = defineComponent({
  name: 'UiSelectScrollUpButton',
  setup() {
    return () => (
      <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
        <ChevronUp class="size-4" aria-hidden="true" />
      </SelectScrollUpButton>
    )
  }
})

export const UiSelectScrollDownButton = defineComponent({
  name: 'UiSelectScrollDownButton',
  setup() {
    return () => (
      <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
        <ChevronDown class="size-4" aria-hidden="true" />
      </SelectScrollDownButton>
    )
  }
})

function isOptionGroup<T extends UiSelectValueType>(
  option: UiSelectOptionInput<T>
): option is UiSelectOptionGroup<T> {
  return 'options' in option
}

function flattenOptions<T extends UiSelectValueType>(
  options: UiSelectOptionInput<T>[]
): UiSelectOption<T>[] {
  return options.flatMap((option) => (isOptionGroup(option) ? option.options : [option]))
}

function matchesValue<T extends UiSelectValueType>(
  optionValue: T,
  value: UiSelectModelValue,
  by?: SelectBy<T>
): boolean {
  if (Array.isArray(value)) {
    return value.some((item): boolean => matchesValue(optionValue, item, by))
  }
  if (typeof by === 'function') {
    return by(optionValue, value as T)
  }
  if (typeof by === 'string' && optionValue && value) {
    return (optionValue as Record<string, any>)[by] === (value as Record<string, any>)[by]
  }
  return Object.is(optionValue, value)
}

/**
 * 数据驱动 Select，业务默认使用这个组件。
 *
 * 它内部仍然由 shadcn-vue/Reka primitives 组合而成，但调用侧只需要像 AntD
 * 一样传 `options`、`value/modelValue`、`onChange`。
 */
export const UiSelect = defineComponent({
  name: 'UiSelect',
  inheritAttrs: false,
  props: {
    /** AntD 风格受控值别名；优先级高于 modelValue。 */
    value: [String, Number, BigInt, Object, Array, null] as PropType<UiSelectModelValue>,
    /** Vue 风格受控值。 */
    modelValue: [String, Number, BigInt, Object, Array, null] as PropType<UiSelectModelValue>,
    /** 非受控初始值。 */
    defaultValue: [String, Number, BigInt, Object, Array, null] as PropType<UiSelectModelValue>,
    /** 数据驱动选项；支持普通选项和分组选项。 */
    options: {
      type: Array as PropType<UiSelectOptionInput[]>,
      default: () => []
    },
    placeholder: String,
    disabled: Boolean,
    name: String,
    required: Boolean,
    /** 对象值比较规则，透传给 Reka SelectRoot。 */
    by: [String, Function] as PropType<SelectBy<UiSelectValueType>>,
    /** 是否支持多选；多选时 value/modelValue 传数组。 */
    multiple: Boolean,
    /** 受控打开状态；不传时必须保持 undefined，让 Reka 自己管理开合。 */
    open: {
      type: Boolean,
      default: undefined
    },
    /** 非受控初始打开状态。 */
    defaultOpen: {
      type: Boolean,
      default: undefined
    },
    position: {
      type: String as PropType<SelectContentProps['position']>,
      default: 'popper'
    },
    sideOffset: {
      type: Number,
      default: 4
    },
    align: String as PropType<SelectContentProps['align']>,
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    triggerClass: String,
    contentClass: String,
    itemClass: String
  },
  emits: {
    'update:modelValue': (_value: UiSelectModelValue) => true,
    'update:open': (_value: boolean) => true,
    /** AntD 风格事件：第一个参数是值，第二个参数是命中的 option。 */
    change: (_value: UiSelectModelValue, _option?: UiSelectOption | null) => true
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs()

    function getCurrentValue() {
      return props.value !== undefined ? props.value : props.modelValue
    }

    function handleValueChange(value: UiSelectModelValue) {
      const matchedOption = flattenOptions(props.options).find((option) =>
        matchesValue(option.value, value, props.by)
      )
      emit('update:modelValue', value)
      emit('change', value, matchedOption ?? null)
    }

    function renderOption(option: UiSelectOption) {
      return (
        <UiSelectItem
          key={`${String(option.value)}-${option.label}`}
          value={option.value}
          disabled={option.disabled}
          textValue={option.textValue ?? option.label}
          class={props.itemClass}
        >
          {slots.option ? (
            slots.option({ option })
          ) : option.description ? (
            <span class="grid min-w-0 gap-0.5">
              <span>{option.label}</span>
              <small class="text-xs leading-4 text-[var(--l-shadcn-muted-foreground)]">
                {option.description}
              </small>
            </span>
          ) : (
            option.label
          )}
        </UiSelectItem>
      )
    }

    function renderOptions() {
      if (!props.options.length) {
        return (
          <div class="px-2 py-1.5 text-sm text-[var(--l-shadcn-muted-foreground)]">
            {slots.empty?.() ?? props.emptyText}
          </div>
        )
      }
      return props.options.map((option, index) => {
        if (!isOptionGroup(option)) {
          return renderOption(option)
        }
        return (
          <UiSelectGroup key={`group-${option.label}-${index}`}>
            <UiSelectLabel>{option.label}</UiSelectLabel>
            {option.options.map(renderOption)}
          </UiSelectGroup>
        )
      })
    }

    return () => {
      const { class: className, style, ...restAttrs } = attrs as Record<string, any>

      return (
        <UiSelectRoot
          modelValue={getCurrentValue()}
          defaultValue={props.defaultValue}
          by={props.by}
          multiple={props.multiple}
          disabled={props.disabled}
          name={props.name}
          required={props.required}
          open={props.open}
          defaultOpen={props.defaultOpen}
          {...{
            'onUpdate:modelValue': handleValueChange,
            'onUpdate:open': (value: boolean) => emit('update:open', value)
          }}
        >
          <UiSelectTrigger
            {...restAttrs}
            disabled={props.disabled}
            style={style}
            class={cn(props.triggerClass, className)}
          >
            <UiSelectValue placeholder={props.placeholder} />
          </UiSelectTrigger>
          <UiSelectContent
            position={props.position}
            sideOffset={props.sideOffset}
            align={props.align}
            class={props.contentClass}
          >
            {renderOptions()}
          </UiSelectContent>
        </UiSelectRoot>
      )
    }
  }
})

export default UiSelect
