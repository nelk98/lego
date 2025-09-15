import type { ArraySchemaDefine, ObjectSchemaDefine, SchemaDefine, SchemaTypes } from '../types/schema'

abstract class BaseSchema {
  type?: SchemaTypes
  title?: string
  constructor(options: SchemaDefine) {
    Object.assign(this, options)
  }
  abstract toValue(value: unknown): unknown
}

class StringSchema extends BaseSchema {
  constructor(options: SchemaDefine) {
    super(options)
  }

  toValue(value: unknown): string {
    return String(value) || ''
  }
}

class NumberSchema extends BaseSchema {
  constructor(options: SchemaDefine) {
    super(options)
  }

  toValue(value: unknown): number | null {
    if (value === null || value === undefined) {
      return null
    }

    // 如果是数字类型，直接返回
    if (typeof value === 'number') {
      return value
    }

    // 如果是字符串，尝试转换为数字
    if (typeof value === 'string') {
      const num = Number(value)
      // 检查转换结果是否为有效数字（不是 NaN，并且不是空字符串等情况）
      if (!isNaN(num) && isFinite(num)) {
        return num
      }
    }

    // 其他情况：布尔值、对象、数组等，都返回 null
    return null
  }
}

class BooleanSchema extends BaseSchema {
  constructor(options: SchemaDefine) {
    super(options)
  }

  toValue(value: unknown): boolean | null {
    if (value === null || value === undefined) {
      return null
    }
    return Boolean(value)
  }
}

class ArraySchema extends BaseSchema {
  type: 'array' = 'array' as const
  items: Schema
  constructor(options: ArraySchemaDefine) {
    super(options)
    this.items = new Schema(options.items)
  }

  toValue(value: unknown): unknown[] {
    return Array.isArray(value) ? value : []
  }
}

class ObjectSchema extends BaseSchema {
  type: 'object' = 'object' as const
  properties: Record<string, Schema> = {}
  constructor(options: ObjectSchemaDefine) {
    super(options)
    this.properties = Object.fromEntries(
      Object.entries(options.properties).map(([key, value]) => [key, new Schema(value)])
    )
  }

  toValue(value: unknown): Record<string, unknown> {
    return (value || {}) as Record<string, unknown>
  }
}

class Schema {
  constructor(options: SchemaDefine) {
    if (options instanceof BaseSchema) return options
    switch (options.type) {
      case 'string':
        return new StringSchema(options)
      case 'number':
        return new NumberSchema(options)
      case 'boolean':
        return new BooleanSchema(options)
      case 'array':
        return new ArraySchema(options)
      case 'object':
        return new ObjectSchema(options)
      default:
        return this
    }
  }
}

export default Schema

// 测试用例

const schema = new Schema({
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    isStudent: { type: 'boolean' }
  }
})

console.log(schema)
