# DataSource

`dataSource` 用于给 select、radio、picker、业务选择器等字段加载候选数据。core 只定义协议和状态，不绑定具体 UI。

## 注册

```ts
jsf.registerDataSource('customerList', async ctx => {
  return api.customer.list({
    keyword: ctx.params.keyword,
    orgId: ctx.params.orgId,
    pageNo: ctx.pageNo,
    pageSize: ctx.pageSize
  })
})
```

返回值可以是数组：

```ts
return [
  { label: '星河制造', value: 'c-1001' }
]
```

也可以是带 raw 的结构：

```ts
return {
  options,
  raw: response
}
```

## schema 使用

```ts
{
  name: 'customerId',
  widget: 'select',
  dataSource: {
    sourceId: 'customerList',
    search: true,
    pagination: true,
    params: {
      keyword: '$search',
      orgId: '$values.orgId'
    },
    reloadWhen: ['orgId']
  }
}
```

## 动态参数

`params` 可以使用 DynamicValue：

```ts
{
  dataSource: {
    sourceId: 'sourceChannels',
    params: {
      customerType: dynamic(['customer.type'], ({ values }) => values.customer?.type)
    },
    reloadWhen: ['customer.type']
  }
}
```

## 手动加载

```ts
await form.loadDataSource('customerId', {
  search: '星河',
  pageNo: 1,
  pageSize: 20
})

const state = form.getDataSourceState('customerId')
```

状态结构：

```ts
{
  loading: boolean
  error: unknown
  options: unknown[]
  raw?: unknown
  requestId: number
}
```

当前已有 requestId 竞态保护。Vue renderer 会把字段 dataSource 的 `options/loading` 注入给 widget，基础 `select` 可以直接消费 `options`。
