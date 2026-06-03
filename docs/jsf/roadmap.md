# 限制与演进

当前版本是第一版可交互原型，核心边界已经明确，但还有一些能力需要继续演进。

## 已有边界

- core 与 renderer 分离。
- widget 通过 registry 注册。
- 业务数据源通过 dataSource loader 接入。
- 校验器、转换器、条件操作符都可注册。
- 动态字段属性通过 `DynamicValue` 解析。
- 低代码绑定通过 `bindings` 和可序列化表达式预留。

## 当前限制

- 表达式绑定执行尚未实现。
- schema 级 FieldArray 行模板尚未实现。
- tabs/steps/collapse 容器组件尚未实现。
- Taro renderer 尚未实现。
- async validator 的取消机制尚未实现。
- schema migration 尚未实现。
- devtools UI 尚未实现。

## 建议演进顺序

1. 稳定 core API 和类型边界。
2. 完善 Web renderer 的 layout 和 FieldFrame 插槽。
3. 增加 FieldArray 容器。
4. 增加表达式引擎和低代码预览。
5. 实现 Taro renderer。
6. 增加 schema migration 和 devtools。
