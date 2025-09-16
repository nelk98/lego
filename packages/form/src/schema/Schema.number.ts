import { BaseSchema } from './Schema.base'
import type { SchemaDefine } from './Schema.type'

/** 数字类型 Schema */
export class NumberSchema extends BaseSchema {
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
