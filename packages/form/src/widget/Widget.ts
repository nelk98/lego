interface WidgetOptions {
  /** 控件唯一标识 */
  key: string
  /** 控件名称 */
  name: string
  /** 版本号，基于 semver 规范 */
  version: string
  /** 控件描述 */
  description: string
  /** 控件渲染组件，可以是函数，也可以是组件 */
  render: unknown
}

/**
 * 控件
 */
class Widget implements WidgetOptions {
  readonly key
  readonly name
  readonly version
  readonly description
  readonly render

  constructor(options: WidgetOptions) {
    this.key = options.key
    this.name = options.name
    this.version = options.version
    this.description = options.description
    this.render = options.render
  }
}

/**
 * 控件资源管理器，用于管理控件的注册和获取
 */
class WidgetManager {
  private static _instance: WidgetManager
  private widgets = new Map<string, Widget>()
  private constructor() {
    console.log('WidgetManager 实例化')
  }
  static getInstance() {
    if (!WidgetManager._instance) {
      WidgetManager._instance = new WidgetManager()
    }
    return WidgetManager._instance
  }

  static get instance() {
    return WidgetManager.getInstance()
  }

  registerWidget(
    widget: Widget,
    options?: {
      /** 是否覆盖已注册的控件 */
      cover?: boolean
    }
  ) {
    if (this.widgets.has(widget.key) && !options?.cover) {
      console.warn(`控件 ${widget.key} 已注册，如需覆盖请传入 options.cover 为 true`)
      return void 0
    }

    this.widgets.set(widget.key, widget)

    console.log(this.widgets)
  }

  getWidget(name: string) {
    return this.widgets.get(name)
  }
}

export { Widget, WidgetManager }

const widget = new Widget({
  key: 'xx',
  name: 'xx',
  version: '1.0.0',
  description: 'xx',
  render: () => {}
})

console.log(widget.name)
