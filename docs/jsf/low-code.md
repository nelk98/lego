# 低代码预留

JSF 需要支持工程代码，也要能服务后续可视化表单搭建。当前版本已经预留了几个关键边界。

## 可序列化 schema

低代码保存到后端时，应优先使用可序列化结构：

- widget 使用字符串名称。
- 条件使用 DSL。
- 动态表达式使用 `DynamicExpression`。
- 数据转换优先使用 mapping。
- 业务能力通过 registry 名称引用。

## bindings

字段上保留 `bindings`：

```ts
{
  bindings: {
    options: {
      type: 'computed',
      code: 'loadSourceChannels(values.customer.type)'
    },
    onChange: {
      type: 'action',
      actionId: 'syncCustomerProfile'
    }
  }
}
```

当前 core 只保留结构，不执行表达式。后续可以接入表达式引擎和动作流。

## 动态绑定按钮

可视化设计器可以在每个字段控件旁展示“动态绑定”按钮。绑定后写入：

- `bindings`
- `DynamicExpression`
- `dataSource`
- `rules`
- `retrieve/format mapping`

运行态通过 `getFieldTrace(path)` 展示当前字段依赖和值，设计态可以用它做预览和调试。

## 设计器生成 Schema

可行路径：

1. 设计器读取 widget 的 `designer` 元信息。
2. 用户选择控件并填写配置。
3. 设计器生成 `FieldSchema`。
4. 保存到后端或复制到代码。
5. 工程侧用 schema patch 补充权限、平台差异和业务函数。

## 需要补齐

- 表达式执行沙箱。
- 动作流 runtime。
- schema migration。
- widget designer 元信息规范。
- schema diff 和版本管理。
