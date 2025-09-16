import type { SchemaDefine } from './Schema.type'
import { BaseSchema } from './Schema.base'
import { NumberSchema } from './Schema.number'
import { StringSchema } from './Schema.string'
import { BooleanSchema } from './Schema.boolean'
import { ArraySchema } from './Schema.array'
import { ObjectSchema } from './Schema.object'
import { AnySchema } from './Schema.any'

/** Schema 工厂类 */
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
        return new AnySchema(options)
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
    isStudent: { type: 'boolean' },
    hobbies: { type: 'array', items: { type: 'string' } },
    extra: {
      widget: 'xxxx'
    }
  }
})

console.log(schema)
