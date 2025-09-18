import type { SchemaDefine, StringSchemaDefine, NumberSchemaDefine } from './Schema.type'
import type { BooleanSchemaDefine } from './Schema.type'
import type { ArraySchemaDefine } from './Schema.type'
import type { ObjectSchemaDefine } from './Schema.type'
import { NumberSchema } from './Schema.number'
import { StringSchema } from './Schema.string'
import { BooleanSchema } from './Schema.boolean'
import { ArraySchema } from './Schema.array'
import { ObjectSchema } from './Schema.object'
import { AnySchema } from './Schema.any'

/** 根据传入的 define 推断返回的 Schema 实例类型 */
type InferSchema<T extends SchemaDefine> = T extends StringSchemaDefine
  ? StringSchema
  : T extends NumberSchemaDefine
    ? NumberSchema
    : T extends BooleanSchemaDefine
      ? BooleanSchema
      : T extends ArraySchemaDefine
        ? ArraySchema
        : T extends ObjectSchemaDefine
          ? ObjectSchema
          : AnySchema

class Schema {
  private constructor() {}

  // ✅ 泛型方法：传入 T extends SchemaDefine，返回 InferSchema<T>
  static create<T extends SchemaDefine>(options: T): InferSchema<T> {
    // 调用内部统一实现，但返回值会被正确推断！
    return Schema.createInternal(options) as InferSchema<T>
  }

  // ✅ 内部实现：实际创建逻辑
  private static createInternal(options: SchemaDefine) {
    switch (options.type) {
      case 'string':
        return new StringSchema(options)
      case 'number':
        return new NumberSchema(options)
      case 'boolean':
        return new BooleanSchema(options)
      case 'object':
        return new ObjectSchema(options)
      case 'array':
        return new ArraySchema(options)
      default:
        return new AnySchema(options)
    }
  }
}

export default Schema

// 测试用例

const schema = Schema.create({
  type: 'array',
  properties: {},
  items: {
    hidden: () => false
  },
  maxItems: 2
})

const schema2 = Schema.create({
  type: 'object',
  properties: {
    name: {}
  },
  items: {}
})

const schema3 = Schema.create({
  type: 'array',
  properties: {},
  items: {},
  minItems: 2,
  maxItems: false
})

console.log(schema, schema2, schema3)
