/** 组件库类名前缀 */
export const PREFIX_CLS = 'kacat'

/** 商户控制台 */
export const SCOPE_CS = 'cs'
/** 运营后台 */
export const SCOPE_SU = 'su'

/** 应用场景：数字家园 */
export const SCENE_HOME = 'home'
/** 应用场景：微店 */
export const SCENE_STORE = 'microstore'
/** 应用场景：平台中心 */
export const SCENE_CENTER = 'center'
/** 应用场景：智慧文旅 */
export const SCENE_TOURISM = 'tourism'

/** 应用场景，与 apps/cs 下的目录对应 */
export const SCENE_OPTIONS = [
  { label: '平台中心', value: SCENE_CENTER },
  { label: '数字家园', value: SCENE_HOME },
  { label: '微店', value: SCENE_STORE },
  { label: '智慧文旅', value: SCENE_TOURISM }
]

/** 应用归属：数字家园 */
export const ORIGIN_HOME = 0
/** 应用归属：微店 */
export const ORIGIN_STORE = 1
/** 应用归属：智慧文旅 */
export const ORIGIN_TOURISM = 2

/** 浅色模式 */
export const THEME_MODE_LIGHT = 'light'
/** 深色模式 */
export const THEME_MODE_DARK = 'dark'
/** 跟随系统 */
export const THEME_MODE_SYSTEM = 'system'

export const BASE_FONT_SIZE_SMALL = 13
export const BASE_FONT_SIZE_NORMAL = 14
export const BASE_FONT_SIZE_MEDIUM = 15
export const BASE_FONT_SIZE_LARGE = 16

/** 通用状态：禁用 */
export const COMMON_STATUS_OFF = 0
/** 通用状态：启用 */
export const COMMON_STATUS_ON = 1
/** 通用状态选项 */
export const COMMON_STATUS_OPTIONS = [
  { label: '禁用', value: COMMON_STATUS_OFF },
  { label: '启用', value: COMMON_STATUS_ON }
]

/** 颜色 蓝色：加载中、进程中、待办 */
export const COLOR_PROCESSING = '#1677ff'
/** 颜色 绿色：成功 */
export const COLOR_SUCCESS = '#27ae60'
/** 颜色 红色：失败 */
export const COLOR_ERROR = '#eb2f06'
/** 颜色 黄色：警告 */
export const COLOR_WARNING = '#f1c40f'
/** 颜色 灰色：禁用、关闭、失效 */
export const COLOR_DISABLED = '#c4c6ca'
