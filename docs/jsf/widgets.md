# Widget

JSF 默认不内置任何业务控件。所有控件都通过 registry 注册。

## 注册基础控件

```ts
import { createJsf, webBasicWidgets } from '@lego/jsf'

const jsf = createJsf()
jsf.use(webBasicWidgets())
```

当前基础 Web 控件：

- `input`
- `textarea`
- `select`
- `radio`
- `switch`

## 注册同步控件

```ts
jsf.register('input', inputWidget)
```

## 注册异步控件

```ts
jsf.registerLazy('customerSelect', () => import('./CustomerSelectWidget'))
```

schema 引用：

```ts
{
  name: 'customerId',
  label: '关联客户',
  widget: 'customerSelect'
}
```

## defineWidget

```tsx
import { defineComponent, ref } from 'vue'
import { defineWidget, useWidgetContext } from '@lego/jsf'

export default defineWidget({
  name: 'customerSelect',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  defaults: {
    props: {
      placeholder: '请选择客户'
    }
  },
  component: defineComponent({
    props: {
      modelValue: String,
      placeholder: String,
      disabled: Boolean,
      readonly: Boolean
    },
    emits: {
      'update:modelValue': (_value: string) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const inputRef = ref<HTMLInputElement>()
      const widget = useWidgetContext()

      widget.exposeHandle({
        async focus() {
          inputRef.value?.focus()
        },
        async activate() {
          // 打开弹窗、切换内部 tab 等
        }
      })

      return () => (
        <input
          ref={inputRef}
          value={props.modelValue ?? ''}
          disabled={props.disabled}
          readonly={props.readonly}
          onInput={event => {
            emit('update:modelValue', (event.target as HTMLInputElement).value)
          }}
          onBlur={() => emit('blur')}
        />
      )
    }
  })
})
```

## 默认属性覆盖

覆盖优先级：

```text
widget.defaults.props -> field.props -> runtime injected props
```

runtime 注入的属性包括：

- `disabled`
- `readonly`
- `modelValue`
- `onUpdate:modelValue`
- `options/loading`，仅 dataSource 字段。
