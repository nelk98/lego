import type { BaseSchemaDefine } from './Schema.type'

/** Schema 基类 */
export abstract class BaseSchema implements BaseSchemaDefine {
  type?: BaseSchemaDefine['type']
  title?: BaseSchemaDefine['title']
  description?: BaseSchemaDefine['description']
  widget?: BaseSchemaDefine['widget']
  required?: BaseSchemaDefine['required']
  disabled?: BaseSchemaDefine['disabled']
  readonly?: BaseSchemaDefine['readonly']
  visible?: BaseSchemaDefine['visible']
  hidden?: BaseSchemaDefine['hidden']
  config?: BaseSchemaDefine['config']
  attrs?: BaseSchemaDefine['attrs']
  value?: BaseSchemaDefine['value']
  parentSchema?: BaseSchemaDefine['parentSchema']
  rootSchema?: BaseSchemaDefine['rootSchema']
  constructor(options: BaseSchemaDefine) {
    Object.assign(this, options)
  }
  abstract toValue(value: unknown): unknown
}
