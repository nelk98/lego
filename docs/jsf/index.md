# @lego/jsf

`@lego/jsf` 是基于 Vue 3 的动态表单库。它把表单核心能力和具体控件解耦：core 负责 schema、values、联动、校验、数据转换、dataSource 和定位链路；renderer 负责 Vue 渲染；widget 负责具体输入交互。

## 当前定位

- 面向 Web Vue 3 和后续 Taro Vue 3 的统一动态表单运行时。
- core 尽量保持平台无关。
- 控件、业务数据源、业务校验、平台 UI 差异都通过 registry 或 renderer 扩展。
- 支持工程态函数能力，也为低代码保存可序列化 schema 预留表达式结构。

## 阅读路径

第一次了解建议按下面顺序阅读：

1. [模块关系](/jsf/architecture)
2. [Schema](/jsf/schema)
3. [Condition DSL](/jsf/condition)
4. [DynamicValue](/jsf/dynamic-value)
5. [FormRuntime](/jsf/runtime)
6. [Renderer](/jsf/renderer)
7. [Widget](/jsf/widgets)

然后根据功能查看：

- [校验](/jsf/validation)
- [DataSource](/jsf/data-source)
- [retrieve / format](/jsf/transform)
- [数组字段](/jsf/array)
- [低代码预留](/jsf/low-code)
- [Lab](/jsf/lab)
- [限制与演进](/jsf/roadmap)

## 快速示例

```tsx
import { createForm, createJsf, defineSchema, SchemaForm, webBasicWidgets } from '@lego/jsf'

const jsf = createJsf()
jsf.use(webBasicWidgets())

const schema = defineSchema({
  fields: [
    {
      name: 'customerType',
      label: '客户类型',
      widget: 'radio',
      defaultValue: 'company',
      required: true,
      props: {
        options: [
          { label: '个人客户', value: 'person' },
          { label: '企业客户', value: 'company' }
        ]
      }
    },
    {
      name: 'companyName',
      label: '企业名称',
      widget: 'input',
      visible: { field: 'customerType', op: 'eq', value: 'company' },
      required: { field: 'customerType', op: 'eq', value: 'company' }
    }
  ]
})

const form = createForm({
  schema,
  registry: jsf.registry
})

export default () => <SchemaForm form={form} />
```
