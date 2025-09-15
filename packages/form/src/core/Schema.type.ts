import type Schema from '../core/Schema'

/** 数据类型 */
export type SchemaTypes =
  | 'string' // 字符串类型，结果会执行 toSting() 操作
  | 'number' // 数字类型，结果会进行 Number() 操作
  | 'boolean' // 布尔类型，结果会进行 Boolean() 操作，注意：任意 falsy 值都会变成 false，否则为 true
  | 'object' // 对象类型，结果会进行 Object() 操作
  | 'array' // 数组类型，结果会进行 Array() 操作
  | undefined // 任意类型，对结果不会进行任何类型处理和校验

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

  /** 值 */
  value?: unknown

  /** 父节点 */
  parentSchema?: Schema
  /** 根节点 */
  rootSchema?: Schema
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

/** 表单项类型 */
export type SchemaDefine =
  | ObjectSchemaDefine
  | ArraySchemaDefine
  | ({
      type?: Exclude<SchemaTypes, 'object' | 'array'>
    } & BaseSchemaDefine)
