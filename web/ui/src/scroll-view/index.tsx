/**
 * ScrollView（Vue 3 + TSX）
 *
 * ## 整体思路
 *
 * 用 OverlayScrollbars（OS）在宿主 div 上接管滚动：隐藏系统滚动条、提供自定义滚动条与尺寸观察等能力。
 * 本组件只做三件事：
 * 1. 生命周期里创建 / 销毁 OS 实例，避免泄漏；
 * 2. 把 `options` 与 OS 同步，并在变更后 `update` 布局；
 * 3. 对业务暴露「原生滚动语义」：`scroll` 事件、`scrollTo` / `scrollBy`（作用在 OS 的 `scrollOffsetElement` 上）、以及类小程序的 `scrollToLower`；
 * 4. **`trigger`（hover / always）通过样式表控制滚动条显隐**：在 OS 的 `elements().host` 上挂 BEM 类名，由 `scroll-view.scss` 覆盖 `.os-scrollbar`（滚动条与内容为兄弟节点，类只能加在 host 上才能选中滚动条）。
 *
 * ## scrollToLower 的实现思路（为何不用「进入区间只触发一次」的简单布尔）
 *
 * 若仅用「在阈值内则 emit，离开则重置」的布尔，容易在以下情况漏触发：例如某些帧未收到 scroll、或滚动条拖拽导致
 * 连续多帧都落在阈值内但首帧已把布尔置 false，而用户主观上认为「再次触底」应再加载一页。
 *
 * 更稳妥的做法是 **边界穿越检测**：
 * - 每次 scroll 计算当前 `distanceToBottom = scrollHeight - scrollTop - clientHeight`（距内容底部的可滚距离）；
 * - 与 **上一帧** 的 `prevDistanceToBottom` 比较：仅当 `prev > lowerThreshold` 且 `curr <= lowerThreshold` 时认为
 *   「从敏感区外进入敏感区内」，触发一次 `scrollToLower`；
 * - 无纵向溢出（`scrollHeight <= clientHeight`）时不触发，并把 `prev` 置为 `+Infinity`，避免把「贴底」误判为穿越。
 *
 * 这样：快速滑到底、反复进出底部区域、或子像素取整导致的边界抖动，只要存在「从外到内」的跨越就会触发；
 * 在敏感区内来回小范围移动不会重复触发，除非先滚出敏感区再进入。
 *
 * `options` 变更或重新 mount 时重置 `prevDistanceToBottom`，便于列表配置或数据更新后再次从「未定义」状态检测穿越。
 */

import {
  defineComponent,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
  type PropType
} from 'vue'
import 'overlayscrollbars/overlayscrollbars.css'
import './scroll-view.scss'
import {
  OverlayScrollbars,
  ScrollbarsHidingPlugin,
  SizeObserverPlugin,
  ClickScrollPlugin
} from 'overlayscrollbars'
import type {
  OverlayScrollbars as OverlayScrollbarsInstance,
  PartialOptions
} from 'overlayscrollbars'

/** OS 官方推荐：在创建实例前注册插件（可重复调用，内部会去重） */
OverlayScrollbars.plugin([ScrollbarsHidingPlugin, SizeObserverPlugin, ClickScrollPlugin])

const TRIGGER_HOST_CLASS = {
  hover: 'l-scroll-view--trigger-hover',
  always: 'l-scroll-view--trigger-always'
} as const

/** OS 的 host 包裹 viewport 与 `.os-scrollbar`，必须把触发器类挂在 host 上，CSS 才能命中滚动条节点 */
function applyScrollViewHostClasses(
  instance: OverlayScrollbarsInstance,
  trigger: 'hover' | 'always'
) {
  const host = instance.elements().host
  host.classList.add('l-scroll-view')
  host.classList.remove(TRIGGER_HOST_CLASS.hover, TRIGGER_HOST_CLASS.always)
  host.classList.add(trigger === 'hover' ? TRIGGER_HOST_CLASS.hover : TRIGGER_HOST_CLASS.always)
}

export default defineComponent({
  name: 'ScrollView',
  inheritAttrs: false,
  props: {
    /** 透传至 OverlayScrollbars 的选项，见官方文档 Options */
    options: {
      type: Object as PropType<PartialOptions>,
      default: () => ({}) as PartialOptions
    },
    /**
     * 「触底」敏感区高度（px）。
     * 当距内容底部可滚距离 ≤ 该值时进入敏感区；与上一帧比较判断是否从区外刚进入区内，再触发 `scrollToLower`。
     */
    lowerThreshold: {
      type: Number,
      default: 150
    },
    /**
     * 滚动条显隐策略，由 `scroll-view.scss` 实现（不是 OS 的 visibility/autoHide 映射）。
     * - `always`：滚动条强制可见；
     * - `hover`：未悬停宿主时隐藏，悬停或拖拽交互时显示；纯触控设备见样式内 `@media (hover: none)` 回退。
     */
    trigger: {
      type: String as PropType<'hover' | 'always'>,
      default: 'always'
    }
  },
  emits: {
    scroll: (_instance: OverlayScrollbarsInstance, _event: Event) => true,
    scrollToLower: () => true
  },
  setup(props, { slots, emit, expose }) {
    /** 挂载 OS 的宿主节点（Vue ref） */
    const scrollRef = ref<HTMLDivElement>()
    /** 根上 class / data-* 等由父传入；inheritAttrs: false 时手动合并到根节点 */
    const attrs = useAttrs()

    /** 当前 OverlayScrollbars 实例；卸载或重挂前须 destroy */
    let os: OverlayScrollbarsInstance | undefined

    /**
     * 上一帧 scroll 回调里算出的「距底部可滚距离」。
     * 初始为 +∞，表示「上一帧不在敏感区内」，保证首帧若已在底部也能形成「从外到内」的穿越从而触发一次。
     */
    let prevDistanceToBottom = Number.POSITIVE_INFINITY

    /** OS 内部真正承担 scrollTop / 滚轮事件的元素，对业务暴露的 scrollTo/scrollBy 都作用在它上面 */
    function getScrollOffsetElement() {
      return os?.elements().scrollOffsetElement
    }

    /** 等价于在该滚动元素上调用原生 `element.scrollTo` */
    function scrollTo(options?: ScrollToOptions) {
      const el = getScrollOffsetElement()
      if (el && typeof el.scrollTo === 'function') {
        el.scrollTo(options ?? {})
      }
    }

    /** 等价于在该滚动元素上调用原生 `element.scrollBy`（仅支持对象参数，与当前 TS 类型一致） */
    function scrollBy(options?: ScrollToOptions) {
      const el = getScrollOffsetElement()
      if (el && typeof el.scrollBy === 'function' && options !== undefined) {
        el.scrollBy(options)
      }
    }

    /**
     * OS 的 scroll 回调：先透传 `scroll`，再计算是否应触发 `scrollToLower`。
     */
    function handleScroll(instance: OverlayScrollbarsInstance, event: Event) {
      emit('scroll', instance, event)

      const scrollEl = instance.elements().scrollOffsetElement
      if (!(scrollEl instanceof HTMLElement)) return

      const { scrollTop, scrollHeight, clientHeight } = scrollEl

      // 无溢出：不存在「触底」语义，不 emit；prev 置无穷大，避免后续首次有溢出时误判穿越
      if (scrollHeight <= clientHeight) {
        prevDistanceToBottom = Number.POSITIVE_INFINITY
        return
      }

      // 距内容底部的剩余可滚距离；max(0,…) 缓解子像素取整导致的微小负数
      const distanceToBottom = Math.max(0, scrollHeight - scrollTop - clientHeight)
      const threshold = props.lowerThreshold

      // 核心：仅「从阈值上方进入阈值及以下」时触发一次，等价于几何上的边界穿越
      const crossedIntoLower = prevDistanceToBottom > threshold && distanceToBottom <= threshold

      if (crossedIntoLower) {
        emit('scrollToLower')
      }

      prevDistanceToBottom = distanceToBottom
    }

    /**
     * 挂载阶段：在宿主 div 上初始化 OS。
     * 若重复调用（例如将来支持动态换根），先 destroy 再建，避免双实例。
     */
    function mountOs() {
      const el = scrollRef.value
      if (!el) return

      os?.destroy()
      prevDistanceToBottom = Number.POSITIVE_INFINITY

      os = OverlayScrollbars(el, props.options ?? {}, {
        scroll: (instance, event) => handleScroll(instance, event)
      })
      applyScrollViewHostClasses(os, props.trigger)
    }

    onMounted(mountOs)

    /**
     * options 深度变化时合并进 OS 并强制 update。
     * 重置 prev：列表/滚动条配置变化后，应允许再次检测「触底穿越」，避免沿用旧的上一帧距离。
     */
    watch(
      () => props.options,
      (next) => {
        if (!os) return
        os.options(next ?? {}, false)
        os.update(true)
        prevDistanceToBottom = Number.POSITIVE_INFINITY
      },
      { deep: true }
    )

    watch(
      () => props.trigger,
      (t) => {
        if (!os) return
        applyScrollViewHostClasses(os, t)
      }
    )

    onBeforeUnmount(() => {
      os?.destroy()
      os = undefined
    })

    expose({
      /** 当前 OverlayScrollbars 实例（未挂载或已销毁时为 undefined） */
      getOs: () => os,
      /** 对应 OS 的 `update(force?)`，用于外部在 DOM 变化后强制刷新布局 */
      update: (force?: boolean) => os?.update(force),
      /** 在滚动容器上调用原生 `scrollTo`（作用于库内部的 scrollOffsetElement） */
      scrollTo,
      /** 在滚动容器上调用原生 `scrollBy` */
      scrollBy
    })

    return () => (
      <div ref={scrollRef} {...mergeProps(attrs, { style: { minHeight: 0 } })}>
        {slots.default?.()}
      </div>
    )
  }
})
