import { BaseSchema } from './Schema.base'
import type { SchemaDefine } from './Schema.type'

/** 字符串类型 Schema */
export class StringSchema extends BaseSchema {
  constructor(options: SchemaDefine) {
    super(options)
  }

  toValue(value: unknown): string {
    return String(value) || ''
  }
}
