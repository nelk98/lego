import {
  computed,
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Component,
  type PropType
} from 'vue'
import { getIn } from '../core/path'
import { createForm } from '../core/form'
import type {
  CompiledField,
  Dict,
  FieldHandleEntry,
  FormError,
  FormRuntime,
  JsfSchema,
  ResolvedField,
  WidgetDefinition
} from '../core/types'
import { provideJsfFormContext, provideWidgetContext, useJsfFormContext } from './context'

/**
 * 表单根组件。
 *
 * 推荐传入已经创建好的 form；也允许直接传 schema，组件内部会创建临时 runtime，
 * 方便 playground 和简单页面快速使用。
 */
export const JsfForm = defineComponent({
  name: 'JsfForm',
  props: {
    form: Object as PropType<FormRuntime>,
    schema: Object as PropType<JsfSchema>,
    defaultValues: Object as PropType<Dict>,
    values: Object as PropType<Dict>
  },
  setup(props, { slots }) {
    const version = ref(0)
    const localForm = shallowRef<FormRuntime>()

    const form = computed(() => {
      if (props.form) return props.form
      if (!localForm.value) {
        localForm.value = createForm({
          schema: props.schema ?? { fields: [] },
          defaultValues: props.defaultValues,
          values: props.values
        })
      }
      return localForm.value
    })

    let unsubscribe: (() => void) | undefined

    watch(
      form,
      (nextForm, _oldForm, onCleanup) => {
        unsubscribe?.()
        unsubscribe = nextForm.subscribe(() => {
          version.value += 1
        })
        onCleanup(() => unsubscribe?.())
      },
      { immediate: true }
    )

    provideJsfFormContext({
      form: form.value,
      version
    })

    onBeforeUnmount(() => {
      unsubscribe?.()
      localForm.value?.destroy()
    })

    return () => {
      // 读取 version 让 form 内部状态变更能触发整棵表单重新渲染。
      version.value
      const currentForm = form.value

      return (
        <form
          class="l-jsf-form"
          onSubmit={(event) => {
            event.preventDefault()
            void currentForm.submit()
          }}
        >
          {slots.default?.() ??
            currentForm.schema.fields.map((field) => <JsfField key={field.path} field={field} />)}
        </form>
      )
    }
  }
})

export const JsfField = defineComponent({
  name: 'JsfField',
  props: {
    field: {
      type: Object as PropType<CompiledField>,
      required: true
    }
  },
  setup(props) {
    const rootRef = ref<HTMLElement>()
    const widgetHandle = shallowRef<FieldHandleEntry['widget']>()
    const { form, version } = useJsfFormContext()

    const unregister = shallowRef<() => void>()

    const registerHandle = () => {
      unregister.value?.()
      unregister.value = form.registerFieldHandle(props.field.path, {
        field: {
          async scroll() {
            rootRef.value?.scrollIntoView({
              block: 'center',
              behavior: 'smooth'
            })
          },
          async highlight() {
            const element = rootRef.value
            if (!element) return
            element.classList.add('l-jsf-field--locating')
            window.setTimeout(() => element.classList.remove('l-jsf-field--locating'), 900)
          }
        },
        widget: widgetHandle.value
      })
    }

    onMounted(registerHandle)
    watch(widgetHandle, registerHandle)
    onBeforeUnmount(() => unregister.value?.())

    return () => {
      version.value
      const field = props.field
      const resolvedField = form.getResolvedField(field.path)
      const state = form.getFieldState(field.path)

      if (!resolvedField) return null
      if (!state?.visible) return null

      if (field.children?.length) {
        return (
          <fieldset ref={rootRef} class="l-jsf-group">
            {resolvedField.label ? <legend>{resolvedField.label}</legend> : null}
            {field.children.map((child) => (
              <JsfField key={child.path} field={child} />
            ))}
          </fieldset>
        )
      }

      const value = getIn(form.getValues(), field.path)

      return (
        <div ref={rootRef} class="l-jsf-field-anchor">
          <FieldFrame field={resolvedField} state={state}>
            <WidgetHost
              field={resolvedField}
              value={value}
              disabled={state.disabled}
              readonly={state.readonly}
              onExposeHandle={(handle) => {
                widgetHandle.value = handle
              }}
            />
          </FieldFrame>
        </div>
      )
    }
  }
})

/**
 * 字段外壳统一负责 label、helper、error。
 *
 * widget 默认只负责输入区域，这样不同控件的错误展示和定位高亮能保持一致。
 */
export const FieldFrame = defineComponent({
  name: 'FieldFrame',
  props: {
    field: {
      type: Object as PropType<ResolvedField>,
      required: true
    },
    state: {
      type: Object as PropType<NonNullable<ReturnType<FormRuntime['getFieldState']>>>,
      required: true
    }
  },
  setup(props, { slots, expose }) {
    const rootRef = ref<HTMLElement>()

    expose({
      element: rootRef
    })

    return () => (
      <div
        ref={rootRef}
        class={[
          'l-jsf-field',
          props.state.errors.length ? 'l-jsf-field--error' : '',
          props.state.disabled ? 'l-jsf-field--disabled' : ''
        ]}
        data-field-path={props.field.path}
      >
        {props.field.label ? (
          <label class="l-jsf-field__label">
            <span>{props.field.label}</span>
            {props.state.required ? <strong aria-hidden="true">*</strong> : null}
          </label>
        ) : null}

        <div class="l-jsf-field__control">{slots.default?.()}</div>

        {props.state.errors[0] ? (
          <div class="l-jsf-field__error">{props.state.errors[0].message}</div>
        ) : props.field.helper ? (
          <div class="l-jsf-field__helper">{props.field.helper}</div>
        ) : null}
      </div>
    )
  }
})

const WidgetHost = defineComponent({
  name: 'WidgetHost',
  props: {
    field: {
      type: Object as PropType<ResolvedField>,
      required: true
    },
    value: null,
    disabled: Boolean,
    readonly: Boolean,
    onExposeHandle: Function as PropType<(handle: FieldHandleEntry['widget']) => void>
  },
  setup(props) {
    const { form, version } = useJsfFormContext()
    const loadedWidget = shallowRef<WidgetDefinition>()
    const loading = ref(false)
    const loadError = shallowRef<unknown>()
    const lastDataSourceKey = ref<string>()

    const resolveWidget = async () => {
      const widgetRef = props.field.widget
      if (!widgetRef) return

      if (typeof widgetRef !== 'string') {
        loadedWidget.value = widgetRef
        return
      }

      const cached = form.registry.resolveWidget(widgetRef)
      if (cached) {
        loadedWidget.value = cached
        return
      }

      loading.value = true
      loadError.value = null
      try {
        loadedWidget.value = await form.registry.loadWidget(widgetRef)
      } catch (error) {
        loadError.value = error
      } finally {
        loading.value = false
      }
    }

    /**
     * renderer 负责把 dataSource 状态接到 widget props。
     *
     * core 只知道怎么加载数据源，不知道哪个 widget 需要 options。这里约定基础选择类控件
     * 使用 `options` 属性；业务 widget 仍然可以自己调用 form.loadDataSource。
     */
    const loadDataSourceIfNeeded = () => {
      const dataSource = props.field.dataSource
      if (!dataSource) return

      const reloadValues = dataSource.reloadWhen?.map((path) => getIn(form.getValues(), path)) ?? []
      const nextKey = JSON.stringify([props.field.path, dataSource.sourceId, reloadValues])

      if (lastDataSourceKey.value === nextKey && form.getDataSourceState(props.field.path)) return

      lastDataSourceKey.value = nextKey
      void form.loadDataSource(props.field.path)
    }

    // widget context 在 setup 中 provide 一次；其中 value/field 用 getter 保持最新。
    provideWidgetContext({
      form,
      get field() {
        return props.field
      },
      get fieldPath() {
        return props.field.path
      },
      get value() {
        return props.value
      },
      setValue: (value) => form.setValue(props.field.path, value),
      exposeHandle: (handle) => props.onExposeHandle?.(handle)
    })

    watch(
      () => props.field.widget,
      () => void resolveWidget(),
      { immediate: true }
    )
    watch(() => [props.field.path, version.value], loadDataSourceIfNeeded, { immediate: true })

    return () => {
      version.value

      if (loading.value) return <div class="l-jsf-widget-state">加载控件中...</div>
      if (loadError.value) return <div class="l-jsf-widget-state">控件加载失败</div>
      if (!loadedWidget.value?.component) {
        return <div class="l-jsf-widget-state">未注册控件：{String(props.field.widget)}</div>
      }

      const widget = loadedWidget.value
      const valueProp = widget.value?.prop ?? 'modelValue'
      const eventName = widget.value?.event ?? 'update:modelValue'
      const dataSourceState = props.field.dataSource
        ? form.getDataSourceState(props.field.path)
        : undefined
      const fieldProps = {
        ...(widget.defaults?.props ?? {}),
        ...(props.field.props ?? {}),
        ...(dataSourceState
          ? { options: dataSourceState.options, loading: dataSourceState.loading }
          : {}),
        disabled: props.disabled,
        readonly: props.readonly,
        [valueProp]: props.value,
        [`on${eventName[0]?.toUpperCase() ?? ''}${eventName.slice(1)}`]: (value: unknown) => {
          form.setValue(props.field.path, value)
        },
        onBlur: () => {
          form.notifyFieldBlur(props.field.path)
        }
      }

      return h(widget.component as Component, mergeProps(fieldProps))
    }
  }
})

/** 展示所有校验错误，并支持点击后走 form.locateField 定位字段。 */
export const JsfErrorSummary = defineComponent({
  name: 'JsfErrorSummary',
  props: {
    form: Object as PropType<FormRuntime>
  },
  setup(props) {
    const injected = props.form ? undefined : useJsfFormContext()
    const version = ref(0)

    const form = computed(() => props.form ?? injected?.form)
    let unsubscribe: (() => void) | undefined

    onMounted(() => {
      unsubscribe = form.value?.subscribe(() => {
        version.value += 1
      })
    })
    onBeforeUnmount(() => unsubscribe?.())

    return () => {
      version.value
      const errors = form.value?.getErrors() ?? []
      if (!errors.length) return null

      return (
        <div class="l-jsf-error-summary">
          {errors.map((error: FormError) => (
            <button
              key={`${error.field}-${error.message}`}
              type="button"
              onClick={() => void form.value?.locateField(error.field)}
            >
              <span>{error.field}</span>
              <strong>{error.message}</strong>
            </button>
          ))}
        </div>
      )
    }
  }
})
