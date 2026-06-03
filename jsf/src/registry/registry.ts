import type {
  DataSourceLoader,
  FieldValidator,
  JsfInstance,
  JsfPlatform,
  Operator,
  Transformer,
  WidgetDefinition
} from '../core/types'

/**
 * JSF 的扩展注册中心。
 *
 * core 不内置任何控件，但会依赖 registry 查找 widget、validator、transformer、
 * dataSource 和条件操作符。renderer 也会通过同一份 registry 解析真实控件。
 */
export interface JsfRegistry {
  widgets: Map<string, WidgetDefinition>
  lazyWidgets: Map<string, () => Promise<{ default?: WidgetDefinition } | WidgetDefinition>>
  validators: Map<string, FieldValidator>
  transformers: Map<string, Transformer>
  dataSources: Map<string, DataSourceLoader>
  operators: Map<string, Operator>

  registerWidget(name: string, widget: WidgetDefinition): void
  registerLazyWidget(
    name: string,
    loader: () => Promise<{ default?: WidgetDefinition } | WidgetDefinition>
  ): void
  resolveWidget(name: string): WidgetDefinition | undefined
  loadWidget(name: string): Promise<WidgetDefinition | undefined>

  registerValidator(name: string, validator: FieldValidator): void
  registerTransformer(name: string, transformer: Transformer): void
  registerDataSource(name: string, loader: DataSourceLoader): void
  registerOperator(name: string, operator: Operator): void
}

/** 支持 `import()` 返回模块对象和直接返回 widget definition 两种懒加载写法。 */
function normalizeLoadedWidget(
  name: string,
  result: { default?: WidgetDefinition } | WidgetDefinition
): WidgetDefinition {
  const moduleLike = result as { default?: WidgetDefinition }
  const widget = moduleLike.default ?? (result as WidgetDefinition)
  return {
    ...widget,
    name: widget.name || name
  }
}

/** 创建一份独立 registry；每个应用或平台入口可以维护自己的注册中心。 */
export function createRegistry(): JsfRegistry {
  const registry: JsfRegistry = {
    widgets: new Map(),
    lazyWidgets: new Map(),
    validators: new Map(),
    transformers: new Map(),
    dataSources: new Map(),
    operators: new Map(),

    registerWidget(name, widget) {
      registry.widgets.set(name, { ...widget, name: widget.name || name })
    },

    registerLazyWidget(name, loader) {
      registry.lazyWidgets.set(name, loader)
    },

    resolveWidget(name) {
      return registry.widgets.get(name)
    },

    async loadWidget(name) {
      const existing = registry.widgets.get(name)
      if (existing) return existing

      const loader = registry.lazyWidgets.get(name)
      if (!loader) return undefined

      const loaded = normalizeLoadedWidget(name, await loader())
      registry.widgets.set(name, loaded)
      return loaded
    },

    registerValidator(name, validator) {
      registry.validators.set(name, validator)
    },

    registerTransformer(name, transformer) {
      registry.transformers.set(name, transformer)
    },

    registerDataSource(name, loader) {
      registry.dataSources.set(name, loader)
    },

    registerOperator(name, operator) {
      registry.operators.set(name, operator)
    }
  }

  registerDefaultOperators(registry)

  return registry
}

/**
 * 创建 JSF 应用级实例。
 *
 * 它是 registry 的轻量门面，用于插件安装和链式注册；FormRuntime 仍然可以直接接收
 * registry，方便测试和多实例隔离。
 */
export function createJsf(
  options: { platform?: JsfPlatform; registry?: JsfRegistry } = {}
): JsfInstance {
  const registry = options.registry ?? createRegistry()

  const jsf: JsfInstance = {
    registry,
    platform: options.platform,

    use(plugin) {
      if (typeof plugin === 'function') {
        plugin(jsf)
        return jsf
      }

      plugin.install?.(jsf)
      return jsf
    },

    register(name, widget) {
      registry.registerWidget(name, widget)
      return jsf
    },

    registerLazy(name, loader) {
      registry.registerLazyWidget(name, loader)
      return jsf
    },

    registerValidator(name, validator) {
      registry.registerValidator(name, validator)
      return jsf
    },

    registerTransformer(name, transformer) {
      registry.registerTransformer(name, transformer)
      return jsf
    },

    registerDataSource(name, loader) {
      registry.registerDataSource(name, loader)
      return jsf
    }
  }

  return jsf
}

/**
 * 声明 widget definition。
 *
 * 当前核心层不依赖 Vue，因此这里不接管 Vue defineComponent；后续 renderer 层可以在
 * 此基础上扩展为“Vue 组件声明 + JSF 元信息”的超集。
 */
export function defineWidget<T extends WidgetDefinition>(widget: T): T {
  return widget
}

/** 条件操作符里的空值判断。 */
function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/** 注册内置条件操作符，供 visible/disabled/required/rule.when 等 DSL 使用。 */
function registerDefaultOperators(registry: JsfRegistry) {
  registry.registerOperator('eq', (left, right) => Object.is(left, right))
  registry.registerOperator('ne', (left, right) => !Object.is(left, right))
  registry.registerOperator('gt', (left, right) => Number(left) > Number(right))
  registry.registerOperator('gte', (left, right) => Number(left) >= Number(right))
  registry.registerOperator('lt', (left, right) => Number(left) < Number(right))
  registry.registerOperator('lte', (left, right) => Number(left) <= Number(right))
  registry.registerOperator('in', (left, right) => Array.isArray(right) && right.includes(left))
  registry.registerOperator(
    'notIn',
    (left, right) => !(Array.isArray(right) && right.includes(left))
  )
  registry.registerOperator('contains', (left, right) => {
    if (Array.isArray(left)) return left.includes(right)
    if (typeof left === 'string') return left.includes(String(right))
    return false
  })
  registry.registerOperator('empty', (left) => isEmpty(left))
  registry.registerOperator('notEmpty', (left) => !isEmpty(left))
  registry.registerOperator('truthy', (left) => Boolean(left))
  registry.registerOperator('falsy', (left) => !left)
}
