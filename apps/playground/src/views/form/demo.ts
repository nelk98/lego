// schema.ts
export type SchemaType = 'object' | 'string' | 'number' | 'boolean' | 'array'

// 上下文类型
export interface SchemaContext {
  rootSchema: ObjectSchemaNode
  rootValue: Record<string, unknown>
  parentSchema?: BaseSchema
  parentValue?: unknown
  key?: string // 当前节点 key
}

// 基础 Schema 选项
export interface BaseSchemaOptions {
  type?: SchemaType
  title?: string
  description?: string
  widget?: string | ((props: unknown) => unknown)

  required?: boolean

  visible?: boolean | ((ctx: SchemaContext) => boolean)
  hidden?: boolean | ((ctx: SchemaContext) => boolean)
  disabled?: boolean | ((ctx: SchemaContext) => boolean)
  readonly?: boolean | ((ctx: SchemaContext) => boolean)

  config?: Record<string, unknown>
  attrs?: Record<string, unknown>
}

// 各种 Schema Options
export interface ObjectSchemaOptions extends BaseSchemaOptions {
  type: 'object'
  properties?: Record<string, Schema | BaseSchemaOptions>
}

export interface ArraySchemaOptions extends BaseSchemaOptions {
  type: 'array'
  items?: Schema | BaseSchemaOptions
  minItems?: number
  maxItems?: number
}

export interface StringSchemaOptions extends BaseSchemaOptions {
  type: 'string'
}

export interface NumberSchemaOptions extends BaseSchemaOptions {
  type: 'number'
}

export interface BooleanSchemaOptions extends BaseSchemaOptions {
  type: 'boolean'
}

export type SchemaOptions =
  | ObjectSchemaOptions
  | ArraySchemaOptions
  | StringSchemaOptions
  | NumberSchemaOptions
  | BooleanSchemaOptions

// ================= 基础 Schema 类 =================

export abstract class BaseSchema {
  type?: SchemaType
  title?: string
  description?: string
  widget?: string | ((props: unknown) => unknown)

  required?: boolean

  visible?: boolean | ((ctx: SchemaContext) => boolean)
  hidden?: boolean | ((ctx: SchemaContext) => boolean)
  disabled?: boolean | ((ctx: SchemaContext) => boolean)
  readonly?: boolean | ((ctx: SchemaContext) => boolean)

  config?: Record<string, unknown>
  attrs?: Record<string, unknown>

  /** 内部引用父节点，用于自动生成 context */
  __parent?: BaseSchema
  __parentKey?: string

  constructor(options: BaseSchemaOptions) {
    Object.assign(this, options)
  }

  abstract toValue(value: unknown): unknown

  protected evaluateProp(
    prop: boolean | ((ctx: SchemaContext) => boolean) | undefined,
    ctx: SchemaContext
  ): boolean | undefined {
    if (typeof prop === 'function') return prop(ctx)
    return prop
  }

  isVisible(ctx: SchemaContext): boolean {
    if (this.hidden !== undefined) return !this.evaluateProp(this.hidden, ctx)
    return this.evaluateProp(this.visible, ctx) ?? true
  }

  isDisabled(ctx: SchemaContext): boolean {
    return this.evaluateProp(this.disabled, ctx) ?? false
  }

  isReadonly(ctx: SchemaContext): boolean {
    return this.evaluateProp(this.readonly, ctx) ?? false
  }
}

// ================= 具体 Schema 类 =================

export class StringSchema extends BaseSchema {
  constructor(options: StringSchemaOptions) {
    super(options)
    this.type = 'string'
  }
  toValue(v: unknown): string {
    return v != null ? String(v) : ''
  }
}

export class NumberSchema extends BaseSchema {
  constructor(options: NumberSchemaOptions) {
    super(options)
    this.type = 'number'
  }
  toValue(v: unknown): number {
    return Number(v)
  }
}

export class BooleanSchema extends BaseSchema {
  constructor(options: BooleanSchemaOptions) {
    super(options)
    this.type = 'boolean'
  }
  toValue(v: unknown): boolean {
    return Boolean(v)
  }
}

export class ArraySchemaNode extends BaseSchema {
  type: 'array' = 'array'
  items?: BaseSchema
  minItems?: number
  maxItems?: number

  constructor(options: ArraySchemaOptions) {
    super(options)
    this.type = 'array'

    if (options.items instanceof BaseSchema) {
      this.items = options.items
    } else if (options.items) {
      this.items = new Schema(options.items) as BaseSchema
    }
    if (this.items) {
      this.items.__parent = this
      this.items.__parentKey = 'items'
    }

    this.minItems = options.minItems
    this.maxItems = options.maxItems
  }

  toValue(v: unknown): unknown[] {
    if (!Array.isArray(v)) return []
    return v.map(item => this.items?.toValue(item))
  }
}

export class ObjectSchemaNode extends BaseSchema {
  type: 'object' = 'object'
  properties: Record<string, BaseSchema> = {}

  constructor(options: ObjectSchemaOptions) {
    super(options)
    this.type = 'object'

    if (options.properties) {
      for (const [key, value] of Object.entries(options.properties)) {
        let schema: BaseSchema
        if (value instanceof BaseSchema) {
          schema = value
        } else {
          schema = new Schema(value) as BaseSchema
        }
        schema.__parent = this
        schema.__parentKey = key
        this.properties[key] = schema
      }
    }
  }

  toValue(v: Record<string, unknown> | undefined): Record<string, unknown> {
    const res: Record<string, unknown> = {}
    for (const [k, schema] of Object.entries(this.properties)) {
      res[k] = schema.toValue(v ? v[k] : undefined)
    }
    return res
  }
}

// ================= 对外统一入口 =================

export class Schema {
  constructor(options: Schema | SchemaOptions) {
    if (options instanceof BaseSchema) return options

    switch (options.type) {
      case 'object':
        return new ObjectSchemaNode(options as ObjectSchemaOptions)
      case 'string':
        return new StringSchema(options as StringSchemaOptions)
      case 'number':
        return new NumberSchema(options as NumberSchemaOptions)
      case 'boolean':
        return new BooleanSchema(options as BooleanSchemaOptions)
      case 'array':
        return new ArraySchemaNode(options as ArraySchemaOptions)
      default:
        throw new Error(`Unsupported schema type: ${(options as any).type}`)
    }
  }
}

// ================= FormState 管理表单值和自动 context =================

export class FormState {
  rootSchema: ObjectSchemaNode
  values: Record<string, unknown>

  constructor(rootSchema: ObjectSchemaNode, initialValues?: Record<string, unknown>) {
    if (rootSchema.type !== 'object') {
      throw new Error('Root schema must be an object')
    }
    this.rootSchema = rootSchema
    this.values = initialValues || {}
  }

  /** 获取指定节点的 context */
  getContext(schema: BaseSchema): SchemaContext {
    const context: SchemaContext = {
      rootSchema: this.rootSchema,
      rootValue: this.values,
      parentSchema: schema.__parent,
      parentValue: schema.__parent ? this.getValue(schema.__parent) : undefined,
      key: schema.__parentKey
    }
    return context
  }

  /** 获取节点对应的值 */
  getValue(schema: BaseSchema): unknown {
    const path: string[] = []
    let current: BaseSchema | undefined = schema
    while (current && current.__parentKey) {
      path.unshift(current.__parentKey)
      current = current.__parent
    }
    let v: any = this.values
    for (const p of path) {
      if (v == null) return undefined
      v = v[p]
    }
    return v
  }

  /** 计算节点是否可见 */
  isVisible(schema: BaseSchema): boolean {
    return schema.isVisible(this.getContext(schema))
  }

  isDisabled(schema: BaseSchema): boolean {
    return schema.isDisabled(this.getContext(schema))
  }

  isReadonly(schema: BaseSchema): boolean {
    return schema.isReadonly(this.getContext(schema))
  }
}

// ================= 使用示例 =================

const rootSchema = new Schema({
  type: 'object',
  readonly: true,
  properties: {
    name: { type: 'string', required: true },
    age: { type: 'number' },
    isAdmin: {
      type: 'boolean',
      visible: ctx => ctx.parentValue?.showAdmin === true
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      disabled: ctx => ctx.rootSchema.readonly === true
    }
  }
}) as ObjectSchemaNode

const formState = new FormState(rootSchema, {
  name: 'Alice',
  age: 30,
  showAdmin: false,
  readOnly: false
})

console.log(rootSchema)
console.log(formState.isVisible(rootSchema.properties.isAdmin)) // false
console.log(formState.isDisabled(rootSchema.properties.tags)) // false
