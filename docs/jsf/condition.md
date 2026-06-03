# Condition DSL

`ConditionDefinition` 用于字段显隐、禁用、只读、必填和规则条件校验。它支持 boolean、函数和可序列化 DSL。

## 基础表达式

```ts
{
  field: 'customer.type',
  op: 'eq',
  value: 'company'
}
```

等价含义：

```ts
values.customer.type === 'company'
```

`field` 和 `path` 都可以指定字段路径，推荐使用 `field`。

## JSON Schema 风格组合

组合逻辑使用 JSON Schema 风格关键字：

- `allOf`
- `anyOf`
- `oneOf`
- `not`

这些关键字可以和基础表达式共存在同一个条件对象中。运行时会执行同一个对象里的所有判断，并按 AND 合并最终结果。

例如：

```ts
{
  field: 'customer.type',
  op: 'eq',
  value: 'company',
  allOf: [
    { field: 'customer.companyName', op: 'notEmpty' }
  ],
  not: { field: 'opportunity.signedContract', op: 'truthy' }
}
```

等价于：

```ts
customer.type === 'company'
  && customer.companyName is not empty
  && !opportunity.signedContract
```

## allOf

全部满足：

```ts
{
  allOf: [
    { field: 'customer.type', op: 'eq', value: 'company' },
    { field: 'customer.companyName', op: 'notEmpty' }
  ]
}
```

等价于：

```ts
A && B
```

## anyOf

任一满足：

```ts
{
  anyOf: [
    { field: 'source', op: 'eq', value: 'offline-expo' },
    { field: 'source', op: 'eq', value: 'offline-store' }
  ]
}
```

等价于：

```ts
A || B
```

## oneOf

有且只有一个满足：

```ts
{
  oneOf: [
    { field: 'customer.type', op: 'eq', value: 'person' },
    { field: 'customer.type', op: 'eq', value: 'company' }
  ]
}
```

等价于：

```ts
exactlyOne(A, B)
```

## not

取反：

```ts
{
  not: { field: 'opportunity.signedContract', op: 'truthy' }
}
```

等价于：

```ts
!A
```

## 嵌套组合

```ts
{
  allOf: [
    { field: 'customer.type', op: 'eq', value: 'company' },
    {
      anyOf: [
        { field: 'source', op: 'eq', value: 'offline-expo' },
        { field: 'source', op: 'eq', value: 'offline-store' }
      ]
    },
    {
      not: { field: 'opportunity.signedContract', op: 'truthy' }
    }
  ]
}
```

## 内置操作符

| 操作符 | 含义 |
| --- | --- |
| `eq` | 等于 |
| `ne` | 不等于 |
| `gt` | 大于 |
| `gte` | 大于等于 |
| `lt` | 小于 |
| `lte` | 小于等于 |
| `in` | 在数组内 |
| `notIn` | 不在数组内 |
| `contains` | 包含 |
| `empty` | 空 |
| `notEmpty` | 非空 |
| `truthy` | truthy |
| `falsy` | falsy |

## 自定义操作符

```ts
jsf.registry.registerOperator('startsWith', (left, right) => {
  return String(left).startsWith(String(right))
})
```

schema 中使用：

```ts
{
  field: 'opportunity.sourceChannel',
  op: 'startsWith',
  value: 'offline'
}
```
