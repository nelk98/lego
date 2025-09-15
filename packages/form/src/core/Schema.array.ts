import Schema from './Schema'
import { BaseSchema } from './Schema.base'
import type { ArraySchemaDefine } from './Schema.type'

/** 数组类型 Schema */
export class ArraySchema extends BaseSchema {
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
