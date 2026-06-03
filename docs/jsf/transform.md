# retrieve / format

前端表单数据通常和后端接口结构不一致。JSF 使用 `retrieve / format` 固定双向转换方向。

```text
retrieve: external model -> internal form values
format: internal form values -> external model
```

## 函数写法

```ts
const form = createForm({
  schema,
  registry: jsf.registry,
  model: apiModel,

  retrieve(model) {
    return {
      userType: model.user_type,
      companyName: model.company_name,
      customerId: model.customer_id
    }
  },

  format(values) {
    return {
      user_type: values.userType,
      company_name: values.companyName,
      customer_id: values.customerId
    }
  }
})
```

## mapping 写法

mapping 更适合低代码保存：

```ts
const form = createForm({
  schema,
  registry: jsf.registry,
  model,
  retrieve: [
    { source: 'user_name', target: 'userName' },
    { source: 'province_code', target: 'region[0]' },
    { source: 'city_code', target: 'region[1]' }
  ],
  format: [
    { source: 'userName', target: 'user_name' },
    { source: 'region[0]', target: 'province_code' },
    { source: 'region[1]', target: 'city_code' }
  ]
})
```

## transformer

```ts
jsf.registerTransformer('centToYuan', value => Number(value) / 100)
jsf.registerTransformer('yuanToCent', value => Math.round(Number(value) * 100))
```

使用：

```ts
retrieve: [
  { source: 'amount_cent', target: 'amount', transform: 'centToYuan' }
],
format: [
  { source: 'amount', target: 'amount_cent', transform: 'yuanToCent' }
]
```

## 字段级转换

字段也可以声明 `retrieve/format`。它适合局部复杂字段，例如上传文件、地址组件、日期范围。
