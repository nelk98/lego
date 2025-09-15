import { BaseSchema } from './Schema.base'
import type { SchemaDefine } from './Schema.type'

/** 任意类型 Schema */
export class AnySchema extends BaseSchema {
  constructor(options: SchemaDefine) {
    super(options)
  }

  toValue(value: unknown) {
    return value
  }
}
