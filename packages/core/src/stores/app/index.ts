import { defineStore, storeToRefs } from 'pinia'
import { readonly, ref } from 'vue'
import useAppThemeStore from './theme'
import useAppSystemStore from './system'

const useAppStore = defineStore('App', () => {
  const appThemeStore = useAppThemeStore()

  const appSystemStore = useAppSystemStore()
  const { setTheme } = appThemeStore

  /** 项目名称 */
  const name = ref<string>(import.meta.env.VITE_APP_NAME)
  /** 项目版本号 */
  const version = ref<string>(import.meta.env.VITE_APP_VERSION)
  /** 项目作用域 */
  const scope = ref<string>(import.meta.env.VITE_APP_SCOPE)
  /** 应用场景值 */
  const scene = ref<string>(import.meta.env.VITE_APP_SCENE)
  /** 应用来源，说实话不清楚为什么不直接复用 scene ？？多此一举 */
  const origin = ref<number>(import.meta.env.VITE_APP_ORIGIN)

  /** 初始化应用 */
  const initApp = (options?: {
    name?: string
    version?: string
    scope?: string
    scene?: string
    origin?: number
  }) => {
    name.value = options?.name ?? import.meta.env.VITE_APP_NAME
    version.value = options?.version ?? import.meta.env.VITE_APP_VERSION
    scope.value = options?.scope ?? import.meta.env.VITE_APP_SCOPE
    scene.value = options?.scene ?? import.meta.env.VITE_APP_SCENE
    origin.value = options?.origin ?? import.meta.env.VITE_APP_ORIGIN
  }

  /**
   * 加载中的路由完整路径，将根据这个值判断 RouterView 是否需要显示加载动画
   */
  const loadingRoute = ref('')
  /** 设置加载中的路由完整路径 */
  const setLoadingRoute = (path: string) => {
    loadingRoute.value = path
  }
  return {
    // 主题
    ...storeToRefs(appThemeStore),
    setTheme,

    // 系统
    ...storeToRefs(appSystemStore),

    // 应用
    initApp,

    // 路由
    loadingRoute: readonly(loadingRoute),
    setLoadingRoute
  }
})

export default useAppStore
