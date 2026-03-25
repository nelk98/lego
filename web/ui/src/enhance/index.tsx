import {
  defineComponent,
  ref,
  h,
  mergeProps,
  useAttrs,
  useSlots,
  type Component,
  type EmitFn,
  type EmitsOptions,
  type EmitsToProps,
  type ExtractPublicPropTypes,
  type PropType,
  type VNode,
} from 'vue'

/* ---------------- 类型工具 ---------------- */

/** 从 Vue 3 组件提取 props 类型（支持 constructor、options.props） */
type PropsOf<T> = T extends new (...args: any) => infer I
  ? I extends { $props: infer P }
    ? P
    : T extends { props?: infer P }
      ? P extends object
        ? ExtractPublicPropTypes<P>
        : Record<string, unknown>
      : Record<string, unknown>
  : T extends { props?: infer P }
    ? P extends object
      ? ExtractPublicPropTypes<P>
      : Record<string, unknown>
    : Record<string, unknown>

export type ForwardRef<T = any> = ((instance: T | null) => void) | { value: T | null } | null

/* ---------------- Options ---------------- */

export interface EnhanceOptions<
  C extends Component,
  RuntimeProps extends Record<string, any>,
  ExtraEmits extends EmitsOptions,
  OmitProps extends readonly string[] = readonly string[],
> {
  /** 组件名称 */
  name?: string

  /** 运行时属性（与 Vue defineComponent 的 props 格式一致；required: true 需对 props 对象使用 as const 方能正确推导） */
  props?: RuntimeProps

  /** 自定义事件 */
  emits?: ExtraEmits

  /** 默认属性 */
  defaultProps?: Partial<PropsOf<C>>

  /** 属性转换函数 */
  transformProps?: (props: any) => any

  /** 禁用的原组件 props，这些属性将不会透传且不会出现在类型中 */
  omitProps?: OmitProps

  /** 静态属性（如 Select.Option、Select.OptGroup），挂载到增强组件上 */
  statics?: Record<string, any>

  /** 自定义 setup 函数 */
  setup?: (ctx: {
    Component: C
    props: any
    attrs: Record<string, any>
    slots: any
    emit: EmitFn<ExtraEmits>
    expose: (exposed: Record<string, any>) => void
    forwardRef: ForwardRef
  }) => () => VNode
}

/* ---------------- utils ---------------- */

function omit(obj: Record<string, any>, keys: readonly string[]): Record<string, any> {
  if (!keys?.length || !obj) return obj
  const result = { ...obj }
  keys.forEach((k) => delete result[k])
  return result
}

/* ---------------- enhanceComponent ---------------- */

export function enhanceComponent<
  C extends Component,
  RuntimeProps extends Record<string, any> = Record<string, never>,
  ExtraProps = ExtractPublicPropTypes<RuntimeProps>,
  ExtraEmits extends EmitsOptions = Record<string, never>,
  Statics extends Record<string, any> = Record<string, never>,
  OmitProps extends readonly string[] = readonly string[],
>(
  Component: C,
  options: EnhanceOptions<C, RuntimeProps, ExtraEmits, OmitProps> & {
    statics?: Statics
  } = {} as any,
) {
  type BaseProps = PropsOf<C>

  // 从 OmitProps 泛型推断需剔除的 key（仅字面量数组生效，避免 readonly string[] 时 Omit<..., string> 误删所有键）
  type OmitKeys = string extends OmitProps[number] ? never : OmitProps[number]

  // 先从 BaseProps 去掉与扩展 props 同名的键，再按 omitProps 从「基底」侧剔除（不把 ExtraProps 里的同名键误删）
  type FinalPropsBase = Omit<Omit<BaseProps, keyof ExtraProps>, OmitKeys> & ExtraProps
  type FinalProps = FinalPropsBase & {
    forwardRef?: ForwardRef
  } & EmitsToProps<ExtraEmits>

  const Enhanced = defineComponent({
    name: options.name || `Enhanced${Component.name || 'Component'}`,

    inheritAttrs: false,

    props: {
      forwardRef: {
        type: [Function, Object] as any,
        default: null,
      },
      // 占位符在前，options.props 在后，避免与 omit 同名的扩展 prop 被 never 覆盖
      ...(options.omitProps?.length
        ? Object.fromEntries(
            options.omitProps.map((k) => [
              k,
              { type: null as unknown as PropType<never>, default: undefined },
            ]),
          )
        : {}),
      ...(options.props ?? {}),
    },

    emits: options.emits,

    setup(props, ctx) {
      const attrs = useAttrs()
      const slots = useSlots()

      const { forwardRef, ...rest } = props as any

      try {
        // 合并 props
        let merged = mergeProps({}, rest, attrs)

        // 剔除禁用的 props
        if (options.omitProps?.length) {
          merged = omit(merged as Record<string, any>, options.omitProps)
        }

        // 应用默认属性
        if (options.defaultProps) {
          merged = mergeProps(options.defaultProps, merged)
        }

        // 转换属性
        if (options.transformProps) {
          try {
            merged = options.transformProps(merged)
          } catch (error) {
            console.error(`[${Enhanced.name}] transformProps error:`, error)
            // 转换失败时回退到原始属性
          }
        }

        // 如果有自定义 setup 函数
        if (options.setup) {
          try {
            const customRender = options.setup({
              Component: Component as any,
              props: merged,
              attrs,
              slots,
              emit: ctx.emit as EmitFn<ExtraEmits>,
              expose: ctx.expose,
              forwardRef,
            })

            if (customRender) {
              return customRender
            }
          } catch (error) {
            console.error(`[${Enhanced.name}] custom setup error:`, error)
            // 回退到默认渲染
          }
        }

        // 默认渲染
        return () => {
          try {
            return h(
              Component as any,
              {
                ...merged,
                ref: forwardRef,
              },
              slots,
            )
          } catch (error) {
            console.error(`[${Enhanced.name}] render error:`, error)
            // 渲染失败时返回空节点
            return null
          }
        }
      } catch (error) {
        console.error(`[${Enhanced.name}] setup execution error:`, error)
        return () => null
      }
    },
  })

  // 挂载静态属性
  if (options.statics && Object.keys(options.statics).length > 0) {
    Object.assign(Enhanced as object, options.statics)
  }

  type EnhancedInstance = C extends abstract new (...args: any) => infer I
    ? Omit<I, '$props' | '$emit'> & { $props: FinalProps; $emit: EmitFn<ExtraEmits> }
    : { $props: FinalProps; $emit: EmitFn<ExtraEmits> }

  return Enhanced as unknown as (new () => EnhancedInstance) & Statics
}

/* ---------------- 使用示例 ---------------- */

import { Button, Select } from 'ant-design-vue'
import type { RefSelectProps } from 'ant-design-vue/es/select'

const KSelect = enhanceComponent(Select, {
  name: 'KSelect',

  defaultProps: {
    allowClear: true,
    showSearch: true,
    placeholder: '请选择xxx',
  },

  props: {
    loadingText: {
      type: String,
    },
    size: {
      type: Object as PropType<{ size: number }>,
      required: true,
    },
  } as const,

  omitProps: ['size'] as const,
  statics: { Option: Select.Option, OptGroup: Select.OptGroup },
  emits: {
    focus: () => true,
  },
  // setup(ctx) {
  //   const { Component, props, slots, forwardRef, expose, emit } = ctx

  //   expose({
  //     aaa: () => {
  //       console.log('focus')
  //     }
  //   })

  //   return () => (
  //     <div>
  //       <span
  //         onClick={() => {
  //           emit('focus')
  //         }}
  //       >
  //         前缀：
  //       </span>
  //       <Component
  //         {...props}
  //         ref={forwardRef}
  //         v-slots={slots}
  //       ></Component>
  //       后缀。
  //     </div>
  //   )
  // }
})

export const Demo = defineComponent({
  setup() {
    const selectRef = ref<RefSelectProps | null>(null)

    return () => {
      return (
        <div>
          <h1>...</h1>
          <Button
            onClick={() => {
              selectRef.value?.focus()
            }}
          >
            点我
          </Button>
          <KSelect
            loadingText={'xx,..x'}
            size={{ size: 1 }}
            forwardRef={selectRef}
            onFocus={() => {
              console.log('focus')
            }}
          >
            <KSelect.Option value="1">1</KSelect.Option>
            <KSelect.Option value="2">2</KSelect.Option>
            <KSelect.Option value="3">3</KSelect.Option>
          </KSelect>
        </div>
      )
    }
  },
})
