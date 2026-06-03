# Renderer

Vue renderer 负责把 `FormRuntime` 渲染成视图。它不决定字段语义，只消费 runtime 和 registry。

## 组件

- `JsfForm`
- `JsfField`
- `FieldFrame`
- `JsfErrorSummary`
- `useJsfFormContext`
- `useWidgetContext`

## JsfForm

推荐传入外部创建好的 `form`：

```tsx
<JsfForm form={form} />
```

也可以直接传 schema，由组件内部创建临时 runtime，适合轻量场景。

## JsfField

`JsfField` 做三件事：

- 读取字段状态，隐藏不可见字段。
- 读取 `getResolvedField(path)`，把动态属性解析后的字段交给 UI。
- 注册字段定位 handle。

## FieldFrame

`FieldFrame` 统一展示：

- label
- required 标记
- helper
- error
- 定位高亮区域

widget 默认只负责输入区域，不重复渲染 label/helper/error。

## WidgetHost

`WidgetHost` 负责：

- 从 registry 解析 widget。
- 加载 lazy widget。
- 把 `value/props/disabled/readonly` 传给 widget。
- 对带 `dataSource` 的字段注入 `options/loading`。
- 接收 widget 的 `update:modelValue` 并写回 runtime。

## ErrorSummary

`JsfErrorSummary` 展示所有错误。点击错误时会调用：

```ts
form.locateField(error.field)
```

定位链路是否能完整执行，取决于 FieldFrame、容器组件和业务 widget 是否注册对应 handle。
