import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type {
  CompiledField,
  FieldPath,
  FormRuntime,
  ResolvedField,
  WidgetHandle
} from '../core/types'

export interface JsfFormContext {
  form: FormRuntime
  version: Ref<number>
}

export interface JsfWidgetContext {
  form: FormRuntime
  field: CompiledField | ResolvedField
  fieldPath: FieldPath
  value: unknown
  setValue: (value: unknown) => void
  exposeHandle: (handle: WidgetHandle) => void
}

const formContextKey: InjectionKey<JsfFormContext> = Symbol('JsfFormContext')
const widgetContextKey: InjectionKey<JsfWidgetContext> = Symbol('JsfWidgetContext')

/** 给 JsfForm 子树提供当前 form runtime。 */
export function provideJsfFormContext(ctx: JsfFormContext): void {
  provide(formContextKey, ctx)
}

/** 在 JsfField/JsfErrorSummary 等组件中读取当前 form runtime。 */
export function useJsfFormContext(): JsfFormContext {
  const ctx = inject(formContextKey)
  if (!ctx) throw new Error('Jsf form context not found. Did you forget to render <JsfForm />?')
  return ctx
}

/** 给具体 widget 提供字段级上下文。 */
export function provideWidgetContext(ctx: JsfWidgetContext): void {
  provide(widgetContextKey, ctx)
}

/**
 * widget 内部读取字段上下文。
 *
 * 业务控件可以通过 exposeHandle 暴露自定义 reveal/activate/focus/highlight 能力。
 */
export function useWidgetContext(): JsfWidgetContext {
  const ctx = inject(widgetContextKey)
  if (!ctx)
    throw new Error(
      'JSF widget context not found. defineWidget components must render in JsfField.'
    )
  return ctx
}
