# Playground

示例入口：

```text
web/playground/src/views/jsf/index.tsx
```

运行：

```bash
mise exec -- pnpm -C web/playground dev --host 127.0.0.1
```

访问：

```text
http://127.0.0.1:5100/jsf
```

## 示例场景

当前示例是“客户建档 + 商机信息”。

覆盖能力：

- 多 Schema 合并：基础 schema + 权限 patch + Web patch。
- 动态布尔字段：`visible/disabled/readonly/required`。
- DynamicValue：`label/helper/props/dataSource.params` 使用 `dynamic([...], fn)`。
- 值类型元信息：`valueType` 标记 `string/number/array`。
- 条件 DSL：`allOf/not` 嵌套组合、内置操作符和自定义 `startsWith`。
- 基础控件注册：`webBasicWidgets`。
- 异步业务控件：`customerSelect`。
- 直接 widget：`riskBadge`。
- 数组字段：`contacts` 使用业务 widget 维护联系人列表。
- dataSource：`sourceChannel` 根据 `customer.type` 自动重载。
- 校验：字段级 required、字符串 validator、函数 validator、规则预设、错误汇总。
- 定位链路：错误点击、外部按钮定位、业务 widget 自定义 focus。
- 外部 runtime 操作：`patchValues`、`setModel`、`setFieldReadonly`、`reset`。
- `retrieve/format`：后端扁平 model 与前端嵌套 values 双向转换。
- debug：values、model、field trace、dependency graph、hooks 日志。
