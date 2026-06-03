# 模块关系

JSF 当前由四层组成：core、registry、renderer、widget。业务应用只组合这些模块，不直接改 core 内部状态。

## 总览

```mermaid
flowchart LR
  App["业务入口 / Playground"] --> Registry["registry / createJsf"]
  App --> Schema["schema 定义"]
  App --> Form["createForm / FormRuntime"]
  App --> Renderer["Vue Renderer"]

  Registry --> Widgets["widget 注册"]
  Registry --> Validators["validator 注册"]
  Registry --> Transformers["transformer 注册"]
  Registry --> DataSources["dataSource 注册"]
  Registry --> Operators["operator 注册"]

  Schema --> SchemaCore["core/schema"]
  SchemaCore --> Form

  Form --> Dynamic["core/dynamic"]
  Form --> Condition["core/condition"]
  Form --> Transform["core/transform"]
  Form --> Validate["core/validate"]
  Form --> Path["core/path"]
  Form --> Registry

  Renderer --> Form
  Renderer --> Registry
  Renderer --> FieldFrame["FieldFrame"]
  Renderer --> WidgetHost["WidgetHost"]
  WidgetHost --> Widgets

  Widgets --> WidgetContext["useWidgetContext"]
  WidgetContext --> Form
```

## 分层职责

```mermaid
flowchart TB
  subgraph Core["Core: 平台无关"]
    Types["types"]
    SchemaCompiler["schema / merge / compile"]
    DynamicResolver["dynamic / resolveField"]
    FormRuntime["form runtime"]
    Validation["validate"]
    Transform["retrieve / format"]
    ConditionDsl["condition / operators"]
    PathUtils["path utils"]
  end

  subgraph Extension["Extension: 注册中心"]
    Registry["registry"]
    WidgetDefs["widget definitions"]
    Validators["validators"]
    Transformers["transformers"]
    DataSources["dataSources"]
  end

  subgraph VueLayer["Vue Renderer: Vue3 相关"]
    JsfForm["JsfForm"]
    JsfField["JsfField"]
    FieldFrame["FieldFrame"]
    ErrorSummary["JsfErrorSummary"]
    WidgetHost["WidgetHost"]
    Context["provide / use context"]
  end

  subgraph Widgets["Widgets: 控件实现"]
    BasicWidgets["input / select / radio / switch / textarea"]
    BusinessWidgets["customerSelect / stakeholderList"]
  end

  Core --> Extension
  VueLayer --> Core
  VueLayer --> Extension
  Widgets --> VueLayer
```

## 数据流

```mermaid
sequenceDiagram
  participant App as "业务代码"
  participant Registry as "Registry"
  participant Form as "FormRuntime"
  participant Renderer as "JsfForm / JsfField"
  participant Widget as "Widget"
  participant Validator as "Validator / DataSource"

  App->>Registry: "注册 widget / validator / dataSource / operator"
  App->>Form: "createForm({ schema, registry, model })"
  Form->>Form: "mergeSchemas + compileSchema"
  Form->>Form: "retrieve(model) -> values"
  Renderer->>Form: "subscribe + getResolvedField(path)"
  Renderer->>Registry: "解析 widget / lazy widget"
  Renderer->>Widget: "传入 value / props / disabled / readonly / options"
  Widget->>Form: "setValue(path, value)"
  Form->>Form: "重算 visible / disabled / readonly / required"
  Form->>Renderer: "notify() 触发刷新"
  App->>Form: "validate() / submit()"
  Form->>Validator: "执行规则和自定义 validator"
  Form->>Renderer: "errors"
  Renderer->>Form: "locateField(error.field)"
```

## 文件位置

- `jsf/src/core`：平台无关运行时。
- `jsf/src/registry`：扩展注册中心。
- `jsf/src/renderer`：Vue 渲染层。
- `jsf/src/widgets`：基础 Web 控件。
- `web/playground/src/views/jsf`：完整示例。
