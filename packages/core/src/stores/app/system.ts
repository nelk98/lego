import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

/**
 * 默认情况下禁用了 html、body 的滚动，需要自行在需要滚动的元素上添加 `overflow: auto`，最好指定 x、y 方向，通常只设置一个方向。
 */

const useAppSystemStore = defineStore('App.System', () => {
  /** 视口/视窗 宽度 */
  const viewportWidth = ref(1920)
  /** 视口/视窗 高度 */
  const viewportHeight = ref(1080)

  /** 计算视口尺寸 */
  const calcViewportSize = () => {
    const { innerWidth, innerHeight } = window
    viewportWidth.value = innerWidth
    viewportHeight.value = innerHeight
  }

  /** 初始化时立即计算一次 */
  calcViewportSize()

  // 监听 html（100vw * 100vh） 尺寸变化
  const viewportResizeObserver = new ResizeObserver(calcViewportSize)
  viewportResizeObserver.observe(document.documentElement)

  return {
    viewportWidth: readonly(viewportWidth),
    viewportHeight: readonly(viewportHeight)
  }
})

export default useAppSystemStore
