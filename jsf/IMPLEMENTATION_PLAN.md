# @lego/jsf 实现方案

## 1. 目标定位

`@lego/jsf` 是一个基于 Vue 3 的动态表单库，目标是为 Web 和 Taro Vue 3 场景提供统一的表单生成、编排、联动、校验和低代码扩展能力。

库本身默认不内置任何具体控件。表单核心只关心 schema、运行时状态、字段关系、校验、数据转换和交互定位。具体控件由 Web、Taro、业务物料包或低代码物料包通过插件注册。

核心设计原则：

- 一个 `FormRuntime` 作为表单状态和行为中心。
- schema 只引用稳定、可序列化的 `widget` 名称。
- widget 通过 registry 解析为具体 Vue 组件或异步组件。
- 运行时与渲染层统一在 `@lego/jsf` 内，但模块边界保持清晰。
- 低代码场景优先使用可序列化 DSL，工程代码允许函数增强。
- 错误定位、设计器选中、字段激活使用同一套定位链路。

## 2. 包结构建议

初期可以只发布一个包：

```text
@lego/jsf
```

内部按模块拆分：

```text
src/
  core/          # schema、runtime、校验、联动、数据转换
  renderer/      # SchemaForm、SchemaField、SchemaProvider 等 Vue 渲染层
  registry/      # widget、validator、transformer、dataSource 注册
  widgets/       # 可选：仅放基础类型定义，不放默认控件
  designer/      # 低代码元信息、schema 编辑、预览能力
  taro/          # Taro 适配点，可后续拆包
  web/           # Web 适配点，可后续拆包
```

后续如果体积或平台差异变大，再拆为：

```text
@lego/jsf
@lego/jsf-web
@lego/jsf-taro
@lego/jsf-designer
```

或者保留一个包，通过 subpath export 暴露：

```text
@lego/jsf
@lego/jsf/web
@lego/jsf/taro
@lego/jsf/designer
```

## 3. 核心运行时

`createForm` 是主要入口，返回 `FormRuntime`。

```ts
const form = createForm({
  schema,
  defaultValues,
  model,
  retrieve,
  format,
  registry,
  mode: 'runtime',
})
```

`FormRuntime` 需要提供：

```ts
form.getValues()
form.setValue(path, value)
form.setValues(values)
form.patchValues(patch)
form.replaceValues(values)

form.setModel(model)
form.getModel()
form.retrieve(model)
form.format(values?)

form.validate()
form.validateField(path)
form.getErrors()
form.clearErrors(path?)

form.getFieldState(path)
form.setFieldVisible(path, visible)
form.setFieldDisabled(path, disabled)
form.setFieldReadonly(path, readonly)

form.locateField(path, options?)
form.revealField(path)
form.activateField(path)
form.focusField(path)

form.submit()
form.reset(nextValues?)
form.destroy()
```

推荐心智是：`SchemaForm` 只负责渲染，真正的外部控制入口是 `form` 实例。

## 4. 受控与非受控

默认支持非完全受控：

```ts
const form = createForm({
  schema,
  defaultValues: {
    name: 'Tom',
  },
})
```

`defaultValues` 只用于初始化，之后由 form runtime 维护状态。

同时支持受控模式：

```ts
const values = ref({})

const form = createForm({
  schema,
  values,
  onValuesChange(nextValues) {
    values.value = nextValues
  },
})
```

外部修改 `values` 时，表单应自动同步字段值、联动状态、校验状态和展示状态。

组件层也可以支持：

```vue
<SchemaForm v-model:values="values" :schema="schema" />
```

但推荐复杂场景显式创建 `form`：

```vue
<SchemaForm :form="form" />
```

## 5. Schema 设计

基础 schema：

```ts
const schema = defineSchema({
  version: '1.0.0',
  fields: [
    {
      name: 'userType',
      label: '用户类型',
      widget: 'radio',
      props: {
        options: [
          { label: '个人', value: 'person' },
          { label: '企业', value: 'company' },
        ],
      },
      required: true,
      requiredMessage: '请选择用户类型',
    },
    {
      name: 'companyName',
      label: '企业名称',
      widget: 'input',
      visible: {
        field: 'userType',
        op: 'eq',
        value: 'company',
      },
      required: {
        field: 'userType',
        op: 'eq',
        value: 'company',
      },
      requiredMessage: '请输入企业名称',
    },
  ],
})
```

字段建议拆分以下概念：

```ts
{
  name: string
  label?: string
  helper?: string
  widget: string | WidgetDefinition
  defaultValue?: unknown
  props?: Record<string, unknown>
  layout?: FieldLayout
  behavior?: FieldBehavior
  bindings?: Record<string, Binding>
  rules?: Rule[]
  visible?: DynamicBoolean
  disabled?: DynamicBoolean
  readonly?: DynamicBoolean
  required?: DynamicBoolean
  requiredMessage?: string
  retrieve?: FieldRetrieve
  format?: FieldFormat
  children?: FieldSchema[]
}
```

其中：

- `props` 传给控件。
- `helper` 是字段辅助说明，由字段外壳统一渲染。
- `layout` 是字段布局语义，不直接绑定具体平台视图。
- `behavior` 是表单引擎理解的行为。
- `bindings` 是低代码动态绑定。
- `visible` / `disabled` / `readonly` / `required` 支持 boolean、函数和可序列化 DSL。
- `retrieve` / `format` 处理前端表单值与后端 model 之间的双向转换。

### 5.1 Field、Widget 与 Layout 边界

需要从第一版开始区分三个概念：

```text
Field   # 字段语义：name、label、rules、visible、errors、helper
Widget  # 输入控件：value/change、自身交互、自定义 reveal/activate/focus
Layout  # 展示结构：label/helper/error/栅格/分组/步骤/tabs
```

`core` 不负责渲染，但要产出足够明确的布局语义。renderer 根据这些语义渲染统一的字段外壳。

推荐默认渲染结构：

```text
SchemaForm
  -> SchemaLayout
    -> SchemaField
      -> FieldFrame
        -> Label
        -> WidgetHost
        -> Helper / Error
```

其中 `FieldFrame` 负责统一展示：

- label。
- required 标记。
- helper。
- error。
- disabled / readonly / hidden 的外观状态。
- 错误定位时的高亮区域。

业务 widget 默认只渲染输入区域，不重复处理 label 和错误。特殊控件可以 opt out：

```ts
defineWidget({
  name: 'addressCard',
  fieldFrame: false,
})
```

或字段级指定：

```ts
{
  name: 'address',
  widget: 'addressCard',
  renderMode: 'bare',
}
```

默认推荐使用 `FieldFrame`，否则统一错误展示、低代码选中区域、字段定位都会变得不稳定。

## 6. 多 Schema 组合

支持一个表单由多个 schema fragment 组合：

```ts
const form = createForm({
  schemas: [
    baseSchema,
    permissionSchema,
    webPatchSchema,
  ],
})
```

内部流程：

```text
schema fragments
  -> merge / patch
  -> normalize
  -> compile
  -> runtime
```

默认合并策略建议：

- `fields` 按 `name/path` 合并。
- `props` 默认深合并。
- `rules` 默认追加，可通过 `replaceRules: true` 覆盖。
- `visible` / `disabled` / `readonly` / `required` 默认覆盖。
- `layout` 可以作为独立 fragment 覆盖。
- 同名字段冲突应在 debug 模式给出 warning。

典型用途：

- 基础 schema + 平台差异 schema。
- 基础 schema + 权限 schema。
- 基础 schema + 低代码 schema。
- 分步表单按 step 拆 schema。
- 后端 schema + 前端增强 patch。

## 7. Widget Registry

`@lego/jsf` 默认没有控件。使用方需要注册控件：

```ts
const jsf = createJsf()

jsf.use(webBasicWidgets())
jsf.register('input', inputWidget)
jsf.register('radio', radioWidget)
```

业务控件可以按需异步加载：

```ts
jsf.registerLazy('customerSelect', () => import('@/widgets/customer-select.widget'))
jsf.registerLazy('projectPicker', () => import('@/widgets/project-picker.widget'))
```

schema 仍然只写字符串：

```ts
{
  name: 'customerId',
  label: '客户',
  widget: 'customerSelect'
}
```

渲染时如果 widget 未加载，renderer 负责展示 loading、失败重试或 fallback。

注意：普通“动态 select”优先建议用通用 `select + dataSource` 表达，不一定都做成业务 widget。

```ts
{
  name: 'customerId',
  widget: 'select',
  dataSource: {
    type: 'remote',
    sourceId: 'customerList',
    params: {
      keyword: '$search',
      orgId: '$values.orgId',
    },
  },
}
```

### 7.1 DataSource 作为一等能力

`dataSource` 应该作为 registry 能力，而不是某个 select widget 的私有实现。这样通用 select、radio、checkbox、cascader、treeSelect、业务 picker 都可以复用同一套数据源协议。

示例注册：

```ts
jsf.registerDataSource('customerList', async ctx => {
  return api.customer.list({
    keyword: ctx.params.keyword,
    orgId: ctx.values.orgId,
    pageNo: ctx.pageNo,
    pageSize: ctx.pageSize,
  })
})
```

schema 使用：

```ts
{
  name: 'customerId',
  widget: 'select',
  dataSource: {
    sourceId: 'customerList',
    search: true,
    pagination: true,
    cache: {
      enabled: true,
      key: ['orgId'],
    },
    params: {
      keyword: '$search',
      orgId: '$values.orgId',
    },
    reloadWhen: ['orgId'],
  },
}
```

运行时需要考虑：

- 请求 loading / error / empty / retry 状态。
- 搜索关键字防抖。
- 分页加载。
- 依赖字段变化后自动刷新。
- 旧请求晚返回不能覆盖新请求。
- 字典类数据可以缓存，强业务数据可以禁用缓存。
- 低代码里通过 `dataSourcePicker` 选择数据源和参数绑定。

## 8. defineWidget

`defineWidget` 是 Vue `defineComponent` 的超集。它直接接管 Vue 组件声明体验，同时补充 jsf 所需的协议。

```ts
export default defineWidget({
  name: 'customerSelect',

  props: {
    placeholder: String,
    multiple: Boolean,
    orgId: String,
  },

  emits: ['focus', 'blur'],

  value: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },

  defaults: {
    props: {
      placeholder: '请选择客户',
      multiple: false,
    },
    behavior: {
      validateTrigger: 'change',
    },
  },

  setup(props) {
    const widget = useWidgetContext()

    widget.exposeHandle({
      async reveal() {
        // 控件内部切换 tab、展开区域等
      },
      async activate() {
        // 打开选择弹窗或进入可交互状态
      },
      async focus() {
        // 聚焦内部搜索框；没有可聚焦节点时可以 no-op
      },
      async highlight() {
        // 自定义错误高亮
      },
    })

    return () => null
  },

  designer: {
    title: '客户选择器',
    group: '业务控件',
    icon: 'database',
    defaultSchema: {
      widget: 'customerSelect',
      props: {
        placeholder: '请选择客户',
      },
    },
    propsSchema: [
      { name: 'placeholder', label: '占位文案', widget: 'input' },
      { name: 'multiple', label: '是否多选', widget: 'switch' },
      { name: 'orgId', label: '所属组织', widget: 'input' },
    ],
  },
})
```

同时支持包装第三方组件：

```ts
const inputWidget = defineWidget({
  name: 'input',
  component: ElInput,
  value: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  defaults: {
    props: {
      clearable: true,
    },
  },
})
```

底层实现上，`defineWidget` 应该抽取 Vue 组件选项并调用 Vue `defineComponent`，最终返回 `WidgetDefinition`。

## 9. Widget Context

控件内部通过 `useWidgetContext()` 获取表单上下文：

```ts
const widget = useWidgetContext()
```

上下文建议包含：

```ts
{
  form,
  field,
  fieldPath,
  schema,
  value,
  setValue,
  errors,
  disabled,
  readonly,
  visible,
  mode,      // runtime / designer / preview
  platform,  // web / taro
  exposeHandle,
}
```

这样业务控件可以读取表单状态、更新自身值、注册定位能力，也可以在低代码设计器和运行态做差异化行为。

## 10. 默认属性与行为覆盖

控件属性和行为建议按以下优先级合并：

```text
系统默认 < 插件默认 < Form 默认 < Schema props/behavior < Runtime override
```

示例：

```ts
const form = createForm({
  schema,
  widgetDefaults: {
    input: {
      props: {
        clearable: true,
        maxlength: 50,
      },
      behavior: {
        validateTrigger: 'blur',
      },
    },
  },
})
```

字段级覆盖：

```ts
{
  name: 'name',
  widget: 'input',
  props: {
    clearable: false,
  },
  behavior: {
    validateTrigger: 'change',
  },
}
```

不建议把所有内容都混进 Vue props。推荐分为：

```text
props       # 真实控件属性
behavior    # 表单引擎理解的行为
adapter     # value/change/blur/focus 适配
bindings    # 动态绑定
designer    # 低代码设计时元信息
```

## 11. 校验与错误收集

校验输出统一结构：

```ts
{
  field: 'company.contact.phone',
  message: '请输入联系电话',
  type: 'required',
}
```

支持：

- 字段级校验。
- 表单级校验。
- 同步校验。
- 异步校验。
- 跨字段校验。
- blur/change/submit 触发。
- 隐藏字段是否校验可配置。

错误面板可以这样使用：

```vue
<SchemaErrorSummary
  :form="form"
  @select="error => form.locateField(error.field)"
/>
```

点击错误后，执行字段定位链路。

## 12. 字段定位链路

不要把定位等同于 DOM `focus`。实际需要的是链路式定位：

```text
reveal    -> 让字段可见，例如切换 step/tab、展开 collapse
scroll    -> 滚动到字段区域
activate  -> 让控件进入交互状态，例如打开弹窗、切换内部 tab
focus     -> 聚焦真实输入点，如果存在
highlight -> 临时高亮错误区域
```

示例：

```ts
await form.locateField('customerId', {
  reason: 'validation-error',
  behavior: ['reveal', 'scroll', 'activate', 'focus', 'highlight'],
})
```

renderer 需要维护字段实例注册表：

```ts
fieldPath -> {
  fieldHandle,
  widgetHandle,
  containerHandles,
}
```

容器控件也需要暴露定位能力：

```ts
ctx.exposeContainerHandle({
  async revealField(fieldPath) {
    // 判断字段在哪个 tab/step/collapse 中，并切换到对应位置
  },
})
```

这样错误面板、低代码画布选中、外部工具栏定位字段都可以复用同一能力。

## 13. 联动与动态绑定

普通工程场景支持函数：

```ts
visible: ({ values }) => values.userType === 'company'
```

低代码和后端下发场景优先支持可序列化 DSL：

```ts
visible: {
  field: 'userType',
  op: 'eq',
  value: 'company',
}
```

动态布尔字段统一使用 `visible`、`disabled`、`readonly`、`required`。

动态绑定单独放到 `bindings`：

```ts
{
  name: 'amount',
  widget: 'input',
  bindings: {
    'props.placeholder': {
      type: 'expression',
      code: '`请输入${ctx.values.currency}金额`',
    },
    'props.disabled': {
      type: 'expression',
      code: 'ctx.values.status === "locked"',
    },
    value: {
      type: 'computed',
      code: 'ctx.values.price * ctx.values.count',
    },
  },
}
```

低代码模式下应避免直接执行任意 JS。建议支持受限表达式 DSL，并允许工程代码注册表达式引擎：

```ts
const form = createForm({
  schema,
  expressionEngine,
  actionEngine,
  dataSourceEngine,
})
```

动态绑定需要支持预览：

```ts
const preview = form.previewBinding('amount', 'props.disabled', draftBinding)
```

返回：

```ts
{
  value: true,
  dependencies: ['status'],
  errors: [],
}
```

运行时应建立依赖图，避免所有字段全量重算，并能检测循环依赖。

## 14. 数据转换：retrieve / format

前端表单值和后端接口结构往往不一致，应该内置双向转换。

方向约定：

```text
retrieve: external model -> internal form values
format: internal form values -> external model
```

示例：

```ts
const form = createForm({
  schema,
  model: apiData,

  retrieve(model) {
    return {
      userName: model.user_name,
      region: [model.province_code, model.city_code],
      dateRange: [model.start_time, model.end_time],
    }
  },

  format(values) {
    return {
      user_name: values.userName,
      province_code: values.region?.[0],
      city_code: values.region?.[1],
      start_time: values.dateRange?.[0],
      end_time: values.dateRange?.[1],
    }
  },
})
```

字段级转换：

```ts
{
  name: 'region',
  widget: 'cascader',

  retrieve(model) {
    return [model.province_code, model.city_code]
  },

  format(value, model) {
    model.province_code = value?.[0]
    model.city_code = value?.[1]
  },
}
```

低代码可序列化版本：

```ts
retrieve: [
  { target: 'userName', source: 'user_name' },
  { target: 'region[0]', source: 'province_code' },
  { target: 'region[1]', source: 'city_code' },
],

format: [
  { target: 'user_name', source: 'userName' },
  { target: 'province_code', source: 'region[0]' },
  { target: 'city_code', source: 'region[1]' },
],
```

复杂转换通过 transformer registry 支持：

```ts
jsf.registerTransformer('centToYuan', value => value / 100)
jsf.registerTransformer('yuanToCent', value => Math.round(value * 100))
```

## 15. 低代码设计器预留

可视化表单搭建可行，但需要提前规定 widget 的设计时元信息。

设计器读取 registry：

```ts
const designer = createJsfDesigner({
  registry: jsf.registry,
})

const materials = designer.getWidgetMaterials()
```

物料配置来自 `widget.designer`：

```ts
designer: {
  title: '远程选择器',
  group: '业务控件',
  icon: 'database',
  defaultSchema: {
    widget: 'remoteSelect',
    props: {
      placeholder: '请选择',
    },
  },
  propsSchema: [
    { name: 'placeholder', label: '占位文案', widget: 'input' },
    { name: 'dataSource.sourceId', label: '数据源', widget: 'dataSourcePicker' },
  ],
}
```

低代码流程：

```text
读取 Widget Registry
  -> 左侧物料面板
  -> 拖拽生成 field schema
  -> 右侧配置面板读取 propsSchema
  -> 修改 schema
  -> 中间画布用真实 renderer 预览
  -> 导出 JSON / TS 代码 / 保存数据库
```

设计器 API 草案：

```ts
designer.addField('customerSelect')
designer.updateField('customerId', patch)
designer.removeField('customerId')
designer.moveField('customerId', target)

designer.setBinding('customerId', 'props.orgId', binding)
designer.previewBinding('customerId', 'props.orgId')

designer.toSchema()
designer.toCode()
```

保存到后端数据库时应保存 JSON schema，不保存真实函数。复制到代码中时可以输出：

```ts
export const schema = defineSchema({})
```

设计态和运行态需要分离。后端持久化建议保存运行时 schema、必要的 designer metadata、schema version，不保存画布选中状态、临时拖拽状态、配置面板展开状态等编辑器 UI 状态。

## 16. 扩展 Hooks、调试与版本迁移

### 16.1 Hooks

表单需要预留 hooks，避免后续埋点、权限、动作流、日志和业务插件只能侵入核心实现。

建议支持：

```ts
createForm({
  schema,
  hooks: {
    onFieldChange(ctx) {},
    onFieldBlur(ctx) {},
    onValidateStart(ctx) {},
    onValidateEnd(ctx) {},
    onSubmitStart(ctx) {},
    onSubmitEnd(ctx) {},
    onWidgetLoadError(ctx) {},
    onLocateField(ctx) {},
  },
})
```

插件也可以注册 hooks：

```ts
jsf.use({
  name: 'analytics',
  hooks: {
    onFieldChange(ctx) {
      analytics.track('form_field_change', ctx)
    },
  },
})
```

hooks 默认不应该中断主流程。需要中断时使用明确的返回协议，例如 `return false` 或抛出特定错误。

### 16.2 Debug Trace

动态表单后期最难排查的是“为什么这个字段变成这样”。开发态应提供 trace 能力：

```ts
form.debug()
form.getDependencyGraph()
form.getFieldTrace('customerId')
```

`getFieldTrace` 建议能看到：

- 字段来自哪个 schema fragment。
- 哪个 fragment 覆盖了 props、rules、visible。
- 当前值来自 defaultValues、retrieve、setValue 还是 binding。
- 哪条规则影响了 visible / disabled / readonly。
- 哪个 dataSource 最近一次请求成功或失败。
- 哪个 validator 产生了错误。
- 哪个定位 handle 被执行。

这部分可以先不做完整 UI，但数据结构要预留。

### 16.3 Schema Version 与 Migration

如果 schema 会保存到后端数据库，必须从第一版就带 `version`。

```ts
{
  version: '1.0.0',
  fields: [],
}
```

后续需要支持迁移：

```ts
jsf.registerSchemaMigration('1.0.0', '1.1.0', schema => {
  return migrateSchema(schema)
})

const nextSchema = jsf.migrateSchema(oldSchema)
```

需要迁移的典型场景：

- widget 改名。
- props 改名。
- dataSource 协议升级。
- binding DSL 升级。
- rules 结构变化。
- layout 结构变化。

版本迁移要尽量自动化，同时在 debug 模式输出迁移报告。

## 17. 使用示例

Web 入口注册：

```ts
import { createJsf } from '@lego/jsf'
import { webBasicWidgets } from '@lego/jsf-web-widgets'

export const jsf = createJsf()

jsf.use(webBasicWidgets())
jsf.registerLazy('customerSelect', () => import('@/widgets/customer-select.widget'))
```

页面使用：

```vue
<script setup lang="ts">
import { createForm, SchemaErrorSummary, SchemaForm } from '@lego/jsf'
import { jsf } from './web-jsf'
import { baseSchema } from './user-form.schema'
import { webPatchSchema } from './user-form.web.schema'

const form = createForm({
  schemas: [baseSchema, webPatchSchema],
  registry: jsf.registry,
  defaultValues: {
    userType: 'company',
  },
})

async function submit() {
  const result = await form.validate()

  if (!result.valid) {
    await form.locateField(result.errors[0].field, {
      behavior: ['reveal', 'scroll', 'activate', 'focus', 'highlight'],
    })
    return
  }

  await api.save(form.getModel())
}
</script>

<template>
  <SchemaErrorSummary
    :form="form"
    @select="error => form.locateField(error.field)"
  />

  <SchemaForm :form="form" />

  <button @click="form.setValue('companyName', '乐高科技')">
    修改企业名称
  </button>

  <button @click="submit">
    提交
  </button>
</template>
```

Taro 入口注册：

```ts
import { createJsf } from '@lego/jsf'
import { taroBasicWidgets } from '@lego/jsf-taro-widgets'

export const jsf = createJsf({
  platform: 'taro',
})

jsf.use(taroBasicWidgets())
jsf.registerLazy('customerSelect', () => import('@/widgets/customer-select.taro.widget'))
```

Taro 页面：

```vue
<script setup lang="ts">
import { createForm, SchemaForm } from '@lego/jsf'
import { jsf } from './mobile-jsf'
import { baseSchema } from './user-form.schema'

const form = createForm({
  schema: baseSchema,
  registry: jsf.registry,
})
</script>

<template>
  <SchemaForm :form="form" />
</template>
```

## 18. 阶段规划

### 阶段一：最小可用 Runtime

- `defineSchema`
- `createForm`
- 字段路径工具
- values 状态
- schema normalize / compile
- `visible` / `disabled` / `readonly` / `required` 动态布尔 DSL
- 同步校验
- `SchemaForm` / `SchemaField`
- `FieldFrame`
- widget registry
- `defineWidget`
- 基础错误收集

### 阶段二：控件协议与交互定位

- `useWidgetContext`
- `exposeHandle`
- container handle
- `locateField`
- `SchemaErrorSummary`
- Web 滚动定位
- Taro 滚动定位适配
- 异步 widget loading / error / retry

### 阶段三：数据转换与异步能力

- `retrieve` / `format`
- field-level retrieve / format
- transformer registry
- async validator
- dataSource engine
- 异步联动竞态控制
- 依赖图和循环检测
- hooks 基础机制

### 阶段四：低代码预留与设计器基础

- widget designer metadata
- propsSchema 驱动配置面板
- binding DSL
- binding preview
- schema editor API
- schema JSON export
- schema version / migration
- debug trace 数据结构

### 阶段五：高级能力

- array field
- object field
- step / tabs / collapse 容器
- 表单草稿
- 权限 patch
- devtools / debug log
- schema diff / migration 工具

## 19. 主要风险与约束

- 不要把 schema 设计成一门失控的编程语言。
- 低代码 schema 中不要保存真实函数。
- core 不应直接依赖 DOM 或 Taro 节点。
- widget 名称需要稳定，否则后端保存的 schema 会失效。
- 异步 dataSource、异步 validator、异步 widget 都要处理竞态。
- 不要让业务 widget 默认接管 label/helper/error，否则统一体验会失控。
- 低代码设计器状态不要污染运行时 schema。
- 数组字段、嵌套字段、容器定位是复杂区，需要分阶段实现。
- 受控模式需要避免外部 values 与内部 values 无限同步。
- Web 与 Taro 控件行为无法完全一致，schema 可以统一，但 props 需要支持平台扩展。

## 20. 推荐优先级

第一版不要追求完整低代码设计器。优先把运行时、widget 协议、校验、定位链路、retrieve/format 做稳。

建议第一版验收目标：

- 可以用 schema 渲染一个 Web 表单。
- 可以通过 `FieldFrame` 统一渲染 label、helper 和 error。
- 可以注册基础 widget。
- 可以注册一个异步业务 widget。
- 可以完成显隐联动和同步校验。
- 可以收集所有错误并点击定位字段。
- 可以通过 form 实例从外部 setValue、validate、locateField。
- 可以从后端 model retrieve 为表单 values，并在提交时 format 为后端 model。
