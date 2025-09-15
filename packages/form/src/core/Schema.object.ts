import Schema from './Schema'
import { BaseSchema } from './Schema.base'
import type { ObjectSchemaDefine } from './Schema.type'

/** 对象类型 Schema */
export class ObjectSchema extends BaseSchema {
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
