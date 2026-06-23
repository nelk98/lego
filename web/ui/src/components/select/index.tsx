import { Check, ChevronDown, ChevronUp, LoaderCircle, X } from '@lucide/vue'
import type { ClassValue } from 'clsx'
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
import { defineComponent, mergeProps, useAttrs, type PropType, type StyleValue } from 'vue'

import { cn } from '../../utils/cn'
import { lazyRenderablePropType, resolveLazyRenderable, type LazyRenderable } from '../../vue'

export type SelectValueType = string | number | bigint | Record<string, any> | null
export type SelectModelValue = SelectValueType | SelectValueType[] | undefined

export interface SelectOption<T extends SelectValueType = SelectValueType> {
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

export interface SelectOptionGroup<T extends SelectValueType = SelectValueType> {
  /** 分组标题。 */
  label: string
  /** 分组内选项。 */
  items: SelectOption<T>[]
}

export type SelectOptionInput<T extends SelectValueType = SelectValueType> =
  | SelectOption<T>
  | SelectOptionGroup<T>

type SelectBy<T extends SelectValueType> = string | ((a: T, b: T) => boolean)

export type SelectVariant = 'flat' | 'bordered' | 'faded' | 'underlined'
export type SelectColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'
export type SelectLabelPlacement = 'inside' | 'outside' | 'outside-left'
export type SelectSelectionMode = 'single' | 'multiple'

const selectSizeClass: Record<SelectSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base'
}

const selectInsideSizeClass: Record<SelectSize, string> = {
  sm: 'min-h-12 px-3 py-2 text-xs',
  md: 'min-h-14 px-3 py-2 text-sm',
  lg: 'min-h-16 px-4 py-2.5 text-base'
}

const selectRadiusClass: Record<SelectRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full'
}

const selectVariantClass: Record<SelectVariant, string> = {
  flat: 'border border-transparent bg-bg-2 shadow-none hover:bg-bg-3',
  bordered: 'border border-line-2 bg-transparent shadow-none hover:border-line-1',
  faded: 'border border-line-3 bg-bg-1 shadow-none hover:bg-bg-2',
  underlined: 'rounded-none border-0 border-b border-line-2 bg-transparent px-0 shadow-none'
}

const selectFocusColorClass: Record<SelectColor, string> = {
  default: 'focus-visible:border-line-1 focus-visible:ring-line-3',
  primary: 'focus-visible:border-primary focus-visible:ring-primary/25',
  secondary: 'focus-visible:border-violet-500 focus-visible:ring-violet-500/25',
  success: 'focus-visible:border-success focus-visible:ring-success/25',
  warning: 'focus-visible:border-warning focus-visible:ring-warning/25',
  danger: 'focus-visible:border-danger focus-visible:ring-danger/25'
}

const selectLabelColorClass: Record<SelectColor, string> = {
  default: 'text-text-2',
  primary: 'text-primary',
  secondary: 'text-violet-600',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger'
}

/**
 * 低阶 primitive escape hatch。
 *
 * 业务默认使用下方数据驱动 `Select`；只有需要完全自定义 Trigger / Content /
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
        {...mergeProps(attrs, {
          'data-slot': 'select-value',
          placeholder: props.placeholder
        } satisfies SelectValueProps & { 'data-slot': string })}
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
    disabled: Boolean,
    size: {
      type: String as PropType<SelectSize>,
      default: 'md'
    },
    radius: {
      type: String as PropType<SelectRadius>,
      default: 'md'
    },
    variant: {
      type: String as PropType<SelectVariant>,
      default: 'flat'
    },
    color: {
      type: String as PropType<SelectColor>,
      default: 'default'
    },
    invalid: Boolean,
    insideLabel: Boolean
  },
  setup(props, { slots }) {
    const attrs = useAttrs()

    return () => (
      <SelectTrigger
        as={props.as}
        asChild={props.asChild}
        disabled={props.disabled}
        {...mergeProps(attrs, {
          'data-slot': 'select-trigger',
          'data-size': props.size,
          'data-variant': props.variant,
          'data-color': props.color,
          'data-invalid': props.invalid ? true : undefined,
          class: cn(
            [
              'data-[placeholder]:text-text-3 [&_svg:not([class*=text-])]:text-text-3',
              'focus-visible:ring-3',
              selectFocusColorClass[props.color],
              'aria-invalid:border-danger aria-invalid:ring-danger/25',
              'flex w-full items-center justify-between gap-2 whitespace-nowrap',
              props.insideLabel ? selectInsideSizeClass[props.size] : selectSizeClass[props.size],
              selectRadiusClass[props.radius],
              selectVariantClass[props.variant],
              'transition-[color,box-shadow] outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
              props.invalid &&
                'border-danger focus-visible:border-danger focus-visible:ring-danger/25'
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
    /** 默认使用 popper，让下拉层宽度和位置更接近常见 Web 体验。 */
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
            'data-slot': 'select-content',
            class: cn(
              [
                'relative z-50 max-h-(--reka-select-content-available-height) min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border border-line-3 bg-bg-0 text-text-0 shadow-md',
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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
                'h-[var(--reka-select-trigger-height)] w-full min-w-[var(--reka-select-trigger-width)] scroll-my-1'
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
          class: cn('px-2 py-1.5 text-xs font-medium text-text-3', attrs.class)
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
          'data-slot': 'select-item',
          class: cn(
            [
              'focus:bg-bg-2 focus:text-text-0 [&_svg:not([class*=text-])]:text-text-3',
              'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden',
              'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
              '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2'
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
          class: cn('-mx-1 my-1 h-px bg-line-3', attrs.class)
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

function isOptionGroup<T extends SelectValueType>(
  option: SelectOptionInput<T>
): option is SelectOptionGroup<T> {
  return 'items' in option
}

function flattenOptions<T extends SelectValueType>(
  items: SelectOptionInput<T>[]
): SelectOption<T>[] {
  return items.flatMap((item) => (isOptionGroup(item) ? item.items : [item]))
}

function matchesValue<T extends SelectValueType>(
  optionValue: T,
  value: SelectModelValue,
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
 * 它内部仍然由 Reka UI primitives 组合而成，但调用侧只需要传
 * `items`、`value/modelValue`、`onChange`。
 */
export const Select = defineComponent({
  name: 'Select',
  inheritAttrs: false,
  props: {
    /** AntD 风格受控值别名；优先级高于 modelValue。 */
    value: [String, Number, BigInt, Object, Array, null] as PropType<SelectModelValue>,
    /** Vue 风格受控值。 */
    modelValue: [String, Number, BigInt, Object, Array, null] as PropType<SelectModelValue>,
    /** 非受控初始值。 */
    defaultValue: [String, Number, BigInt, Object, Array, null] as PropType<SelectModelValue>,
    /** 数据驱动选项；支持普通选项和分组选项。 */
    items: {
      type: Array as PropType<SelectOptionInput[]>,
      default: () => []
    },
    label: lazyRenderablePropType(),
    placeholder: String,
    description: lazyRenderablePropType(),
    errorMessage: lazyRenderablePropType(),
    isDisabled: Boolean,
    name: String,
    isRequired: Boolean,
    isInvalid: Boolean,
    isLoading: Boolean,
    isClearable: Boolean,
    fullWidth: {
      type: Boolean,
      default: true
    },
    variant: {
      type: String as PropType<SelectVariant>,
      default: 'flat'
    },
    color: {
      type: String as PropType<SelectColor>,
      default: 'default'
    },
    size: {
      type: String as PropType<SelectSize>,
      default: 'md'
    },
    radius: {
      type: String as PropType<SelectRadius>,
      default: 'md'
    },
    labelPlacement: {
      type: String as PropType<SelectLabelPlacement>,
      default: 'outside'
    },
    selectionMode: String as PropType<SelectSelectionMode>,
    /** 对象值比较规则，透传给 Reka SelectRoot。 */
    by: [String, Function] as PropType<SelectBy<SelectValueType>>,
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
    itemClass: String,
    rootClass: String,
    helperClass: String,
    labelClass: String
  },
  emits: {
    'update:modelValue': (_value: SelectModelValue) => true,
    'update:open': (_value: boolean) => true,
    /** AntD 风格事件：第一个参数是值，第二个参数是命中的 option。 */
    change: (_value: SelectModelValue, _option?: SelectOption | null) => true,
    clear: () => true
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs()

    function getOptions() {
      return props.items
    }

    function getCurrentValue() {
      return props.value !== undefined ? props.value : props.modelValue
    }

    function getMultiple() {
      return props.selectionMode === 'multiple'
    }

    function getDisabled() {
      return props.isDisabled
    }

    function getRequired() {
      return props.isRequired
    }

    function getInvalid() {
      return props.isInvalid || Boolean(props.errorMessage)
    }

    function hasValue() {
      const value = getCurrentValue()
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== null && value !== ''
    }

    function renderNode(value: LazyRenderable | undefined) {
      return resolveLazyRenderable(value)
    }

    function handleValueChange(value: SelectModelValue) {
      const matchedOption = flattenOptions(getOptions()).find((option) =>
        matchesValue(option.value, value, props.by)
      )
      emit('update:modelValue', value)
      emit('change', value, matchedOption ?? null)
    }

    function handleClear(event: MouseEvent) {
      event.preventDefault()
      event.stopPropagation()

      const value = getMultiple() ? [] : undefined
      emit('update:modelValue', value)
      emit('change', value, null)
      emit('clear')
    }

    function renderOption(option: SelectOption) {
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
              <small class="text-text-3 text-xs leading-4">{option.description}</small>
            </span>
          ) : (
            option.label
          )}
        </UiSelectItem>
      )
    }

    function renderOptions() {
      const options = getOptions()
      if (!options.length) {
        return (
          <div class="px-2 py-1.5 text-sm text-text-3">{slots.empty?.() ?? props.emptyText}</div>
        )
      }
      return options.map((option, index) => {
        if (!isOptionGroup(option)) {
          return renderOption(option)
        }
        return (
          <UiSelectGroup key={`group-${option.label}-${index}`}>
            <UiSelectLabel>{option.label}</UiSelectLabel>
            {option.items.map(renderOption)}
          </UiSelectGroup>
        )
      })
    }

    function renderRequiredMark() {
      return getRequired() ? (
        <span class="text-danger" aria-hidden="true">
          *
        </span>
      ) : null
    }

    function renderLabel(placement: SelectLabelPlacement) {
      const label = slots.label?.() ?? renderNode(props.label)
      if (!label) return null

      return (
        <label
          class={cn(
            'inline-flex min-w-0 items-center gap-1 text-sm font-medium',
            placement === 'inside' ? 'text-xs leading-4' : 'leading-5',
            getInvalid() ? 'text-danger' : selectLabelColorClass[props.color],
            props.labelClass
          )}
        >
          {label}
          {renderRequiredMark()}
        </label>
      )
    }

    function renderHelper() {
      const error = slots.errorMessage?.() ?? renderNode(props.errorMessage)
      const description = slots.description?.() ?? renderNode(props.description)
      const content = getInvalid() ? error : description
      if (!content) return null

      return (
        <div
          class={cn(
            'text-xs leading-4',
            getInvalid() ? 'text-danger' : 'text-text-3',
            props.helperClass
          )}
        >
          {content}
        </div>
      )
    }

    function renderTriggerValue() {
      const insideLabel = props.labelPlacement === 'inside'

      return (
        <span
          class={cn(
            'flex min-w-0 flex-1',
            insideLabel ? 'flex-col items-start gap-0.5' : 'items-center'
          )}
        >
          {insideLabel ? renderLabel('inside') : null}
          <UiSelectValue
            placeholder={props.placeholder}
            class="line-clamp-1 flex min-w-0 items-center gap-2"
          />
        </span>
      )
    }

    function renderTriggerActions() {
      const canClear = props.isClearable && hasValue() && !getDisabled() && !props.isLoading

      return (
        <>
          {props.isLoading ? (
            <LoaderCircle class="size-4 shrink-0 animate-spin text-text-3" aria-hidden="true" />
          ) : null}
          {canClear ? (
            <span
              role="button"
              aria-label="Clear select"
              tabindex={0}
              class="inline-flex size-5 shrink-0 items-center justify-center rounded-sm text-text-3 transition-colors hover:text-text-0"
              onMousedown={(event) => event.preventDefault()}
              onClick={handleClear}
            >
              <X class="size-3.5" aria-hidden="true" />
            </span>
          ) : null}
        </>
      )
    }

    function renderControl(
      restAttrs: Record<string, unknown>,
      className: ClassValue,
      style: StyleValue | undefined
    ) {
      return (
        <UiSelectRoot
          modelValue={getCurrentValue()}
          defaultValue={props.defaultValue}
          by={props.by}
          multiple={getMultiple()}
          disabled={getDisabled()}
          name={props.name}
          required={getRequired()}
          open={props.open}
          defaultOpen={props.defaultOpen}
          {...{
            'onUpdate:modelValue': handleValueChange,
            'onUpdate:open': (value: boolean) => emit('update:open', value)
          }}
        >
          <UiSelectTrigger
            {...restAttrs}
            disabled={getDisabled()}
            size={props.size}
            radius={props.radius}
            variant={props.variant}
            color={props.color}
            invalid={getInvalid()}
            insideLabel={props.labelPlacement === 'inside'}
            aria-invalid={getInvalid() ? true : undefined}
            style={style}
            class={cn(props.triggerClass, className)}
          >
            {renderTriggerValue()}
            {renderTriggerActions()}
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

    return () => {
      const {
        class: className,
        style,
        ...restAttrs
      } = attrs as Record<string, unknown> & {
        class?: ClassValue
        style?: StyleValue
      }
      const control = renderControl(restAttrs, className, style)
      const helper = renderHelper()

      if (props.labelPlacement === 'outside-left') {
        return (
          <div
            class={cn(
              'grid items-start gap-3',
              props.fullWidth
                ? 'w-full grid-cols-[max-content_minmax(0,1fr)]'
                : 'inline-grid grid-cols-[max-content_minmax(12rem,1fr)]',
              props.rootClass
            )}
          >
            <div class="pt-2">{renderLabel('outside-left')}</div>
            <div class="grid min-w-0 gap-1.5">
              {control}
              {helper}
            </div>
          </div>
        )
      }

      return (
        <div
          class={cn(
            'grid gap-1.5',
            props.fullWidth ? 'w-full' : 'inline-grid min-w-48',
            props.rootClass
          )}
        >
          {props.labelPlacement === 'outside' ? renderLabel('outside') : null}
          {control}
          {helper}
        </div>
      )
    }
  }
})

export default Select
