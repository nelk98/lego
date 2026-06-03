import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type {
  CompiledField,
  FieldPath,
  FormRuntime,
  ResolvedField,
  WidgetHandle
} from '../core/types'

export interface SchemaFormContext {
  form: FormRuntime
  version: Ref<number>
}

export interface SchemaWidgetContext {
  form: FormRuntime
  field: CompiledField | ResolvedField
  fieldPath: FieldPath
  value: unknown
  setValue: (value: unknown) => void
  exposeHandle: (handle: WidgetHandle) => void
}

const formContextKey: InjectionKey<SchemaFormContext> = Symbol('SchemaFormContext')
const widgetContextKey: InjectionKey<SchemaWidgetContext> = Symbol('SchemaWidgetContext')

/** 给 SchemaForm 子树提供当前 form runtime。 */
export function provideSchemaFormContext(ctx: SchemaFormContext): void {
  provide(formContextKey, ctx)
}

/** 在 SchemaField/SchemaErrorSummary 等组件中读取当前 form runtime。 */
export function useSchemaFormContext(): SchemaFormContext {
  const ctx = inject(formContextKey)
  if (!ctx)
    throw new Error('Schema form context not found. Did you forget to render <SchemaForm />?')
  return ctx
}

/** 给具体 widget 提供字段级上下文。 */
export function provideWidgetContext(ctx: SchemaWidgetContext): void {
  provide(widgetContextKey, ctx)
}

/**
 * widget 内部读取字段上下文。
 *
 * 业务控件可以通过 exposeHandle 暴露自定义 reveal/activate/focus/highlight 能力。
 */
export function useWidgetContext(): SchemaWidgetContext {
  const ctx = inject(widgetContextKey)
  if (!ctx)
    throw new Error(
      'Schema widget context not found. defineWidget components must render in SchemaField.'
    )
  return ctx
}
