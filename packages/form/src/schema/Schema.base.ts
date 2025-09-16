import type { BaseSchemaDefine } from './Schema.type'

/** Schema 基类 */
export abstract class BaseSchema implements BaseSchemaDefine {
  public type
  public title
  public description
  public widget
  public required
  public disabled
  public readonly
  public visible
  public hidden
  public config
  public attrs
  public value
  public parentSchema
  public rootSchema
  constructor(options: BaseSchemaDefine) {
    this.type = options.type
    this.title = options.title
    this.description = options.description
    this.widget = options.widget
    this.required = options.required
    this.disabled = options.disabled
    this.readonly = options.readonly
    this.visible = options.visible
    this.hidden = options.hidden
    this.config = options.config
    this.attrs = options.attrs
    this.value = options.value
    this.parentSchema = options.parentSchema
    this.rootSchema = options.rootSchema
  }
  abstract toValue(value: unknown): unknown
}
