import { h, type PropType, type VNode } from 'vue'

// 定义支持的节点类型
export type AnyNodePropType = string | number | boolean | any[] | Record<string, any> | (() => VNode) | VNode

// 定义支持的节点类型的 PropType
export const AnyNodePropTypeDefine = [
  String,
  Number,
  Boolean,
  Array,
  Object,
  Function,
  Object as PropType<VNode>
] as PropType<AnyNodePropType>

// 渲染选项接口，包含 props、attrs、事件监听器、插槽、指令等
interface RenderOptions {
  props?: Record<string, any> // 组件的 props
  attrs?: Record<string, any> // 组件的 attrs
  on?: Record<string, Function> // 事件监听器
  slots?: Record<string, any> // 插槽内容
  directives?: Array<Object> // 指令
  key?: string | number // 节点的 key
  class?: string | Array<string> | Object // CSS 类
  style?: string | Object // 内联样式
}

/** 渲染任意类型节点 */
export const renderAnyNode = (
  node: AnyNodePropType, // 节点类型
  options: RenderOptions = {} // 渲染选项
): null | VNode | string | number | boolean | any[] => {
  if (!node) {
    return null // 如果节点为空，返回 null
  }

  // 解构渲染选项中的属性
  const { props, attrs, on, slots, directives, key, class: className, style } = options

  if (typeof node === 'object' && 'type' in node) {
    // 如果节点是一个 VNode 对象，使用 h 函数进行渲染
    return h(node as VNode, { ...props, ...attrs, on, key, class: className, style, directives }, slots)
  } else if (typeof node === 'function') {
    // 如果节点是一个函数，调用该函数返回 VNode
    return (node as () => VNode)()
  } else if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean' || Array.isArray(node)) {
    // 如果节点是基本数据类型或数组，直接返回
    return node
  } else if (typeof node === 'object') {
    // 如果节点是一个对象且不符合 VNode 类型，将其转换为 JSON 字符串
    return h('div', { ...props, ...attrs, on, key, class: className, style, directives }, JSON.stringify(node))
  } else {
    // 处理不支持的节点类型，输出警告信息
    console.warn('Unsupported node type:', typeof node)
    return null
  }
}
