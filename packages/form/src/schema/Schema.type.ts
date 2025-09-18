export enum SchemaType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Object = 'object',
  Array = 'array',
  Any = 'any'
}

/** 数据类型，undefined 表示任意类型将不进行属性、行为约束 */
export type SchemaTypes =
  /** 字符串类型 */
  | 'string'
  /** 数字类型 */
  | 'number'
  /** 布尔类型 */
  | 'boolean'
  /** 对象类型 */
  | 'object'
  /** 数组类型 */
  | 'array'
  /** 任意类型 */
  | undefined

type SchemaContext<T> = T | ((context: unknown) => T)

export interface BaseSchemaDefine {
  /** 数据类型 */
  type?: SchemaTypes
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string

  /**
   * 控件，用于渲染表单项
   * 按type类型，默认使用内置控件，也可以自定义控件，
   * 可以指定一个已注册的控件名称 string，也可以指定一个函数，函数返回一个控件渲染
   */
  widget?: string | ((props: unknown) => unknown)

  /** 是否必填 */
  required?: SchemaContext<boolean>
  /** 是否禁用 */
  disabled?: SchemaContext<boolean>
  /** 是否只读 */
  readonly?: SchemaContext<boolean>

  /** 是否显示，优先级低于 hidden */
  visible?: SchemaContext<boolean>
  /** 是否隐藏，优先级高于 visible */
  hidden?: SchemaContext<boolean>

  /** 配置 */
  config?: Record<string, unknown>

  /** 自定义属性 */
  attrs?: Record<string, unknown>
}

/** 对象类型 */
export interface ObjectSchemaDefine extends BaseSchemaDefine {
  type: 'object'
  properties: Record<string, SchemaDefine>
}

/** 数组类型 */
export interface ArraySchemaDefine extends BaseSchemaDefine {
  type: 'array'
  items: SchemaDefine
  minItems?: number
  maxItems?: number
}

export interface StringSchemaDefine extends BaseSchemaDefine {
  type: 'string'
}

export interface NumberSchemaDefine extends BaseSchemaDefine {
  type: 'number'
}

export interface BooleanSchemaDefine extends BaseSchemaDefine {
  type: 'boolean'
}

export interface AnySchemaDefine extends BaseSchemaDefine {
  type?: undefined
}

/** 表单项类型 */
export type SchemaDefine =
  | ObjectSchemaDefine
  | ArraySchemaDefine
  | StringSchemaDefine
  | NumberSchemaDefine
  | BooleanSchemaDefine
  | AnySchemaDefine
