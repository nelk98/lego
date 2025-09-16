import { BaseSchema } from './Schema.base'
import type { SchemaDefine } from './Schema.type'

/** 布尔类型 Schema */
export class BooleanSchema extends BaseSchema {
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
