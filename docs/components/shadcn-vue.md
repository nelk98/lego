# Web UI

Web 端组件库采用“Reka UI → shadcn-vue → @lego/web-ui 业务组件”的三层封装方式：

- `reka-ui` 负责无样式交互、可访问性、键盘导航和 Portal。
- `shadcn-vue` 作为源码模板和默认结构参考。
- `@lego/web-ui` 对业务暴露稳定、Ant Design-like 的 API。

业务侧只从 `@lego/web-ui` 引入 `Button`、`Input`、`Select`、`Modal`、`modal` 等封装，不直接依赖 shadcn-vue 或低阶 primitives。Lab 路径为 `/ui`。

## CLI 添加组件

配置位于 `web/ui/components.json`，**需在 Node ≥ 22 下运行**（与仓库 `engines` 一致）。

```bash
# 从仓库根目录
pnpm ui:shadcn card

# 或在 web/ui 包内
pnpm -C web/ui shadcn:add badge
pnpm -C web/ui shadcn:info
```

组件会安装到 `web/ui/src/shadcn/<name>/`（与 `aliases.ui` 一致）。`cn()` 工具路径为 `@/shadcn/utils`。

### 主题变量（已对齐 @lego/shared）

CLI 默认写入 `--background`、`--primary` 等 shadcn 语义变量；本仓库在 `web/ui/src/styles/shadcn-theme.css` 中把它们**映射到 shared 已有 token**（如 `--color-bg-0`、`--color-primary-500`），因此：

- `pnpm shadcn:add` 生成的 `bg-background`、`text-primary` 会跟随 `[data-theme]`、`[data-primary]` 切换；
- 历史组件使用的 `--l-shadcn-*` 与上述变量保持同步，无需改类名。

**不要**对 `shadcn-theme.css` 执行 `shadcn-vue init` 覆盖；若误跑 init，恢复该文件中的映射表即可。UnoCSS 主题色见根目录 `uno.config.ts` 的 `theme.colors`。

CLI 生成的是 `.vue` 文件；若团队规范为 TSX，需要先整理到 `web/ui/src/shadcn/<name>/` 作为内部实现，再在 `web/ui/src/components/<name>/` 封装业务 API，最后从 `web/ui/src/index.ts` 导出业务组件。

## 使用方式

```tsx
import { Button, Input, Select, modal } from '@lego/web-ui'
import { ref } from 'vue'

const keyword = ref('')
const framework = ref('vue')
const frameworkOptions = [
  {
    label: 'Web stack',
    options: [
      { value: 'vue', label: 'Vue' },
      { value: 'nuxt', label: 'Nuxt' }
    ]
  }
]

export default () => (
  <>
    <Input value={keyword.value} placeholder="请输入关键字" clearable />

    <Button type="primary">保存</Button>

    <Select
      value={framework.value}
      placeholder="选择框架"
      options={frameworkOptions}
      onChange={(value) => {
        framework.value = String(value)
      }}
    />

    <Button
      onClick={() => {
        modal.confirm({ title: '删除确认' })
      }}
    >
      删除
    </Button>
  </>
)
```

## Button

`Button` 使用业务友好的 `type` / `size` API，内部再映射到 shadcn 的视觉变体。

| Prop       | 说明                                                              |
| ---------- | ----------------------------------------------------------------- |
| `type`     | `primary`、`default`、`danger`、`text`                            |
| `size`     | `sm`、`md`、`lg`                                                  |
| `loading`  | 加载中，自动禁用点击                                              |
| `block`    | 宽度撑满父容器                                                    |
| `disabled` | 原生禁用态，默认 `false`                                          |
| `htmlType` | 原生按钮类型，默认 `button`，避免表单内误触发 submit              |

调用方可通过 `class` 做局部覆盖；组件内部使用 `cn()` 合并，后传入的冲突原子类会覆盖默认值。

## Input

`Input` 是普通业务输入框，支持受控值和清空按钮。

| Prop         | 说明                                      |
| ------------ | ----------------------------------------- |
| `value`      | AntD 风格受控值，优先级高于 `modelValue` |
| `modelValue` | Vue 风格受控值                            |
| `placeholder`| 占位文案                                  |
| `clearable`  | 展示清空按钮                              |
| `allowClear` | `clearable` 别名                          |
| `size`       | `sm`、`md`、`lg`                          |

## Select

`Select` 是基于 Reka UI Select primitives 的数据驱动封装。业务侧默认按 Ant Design Vue 的使用心智传 `options`、`value/modelValue`、`onChange`，不需要手写 Trigger、Content、Item 那串组合结构。

| Prop           | 说明                                                   |
| -------------- | ------------------------------------------------------ |
| `options`      | 选项数组，支持普通选项和 `{ label, options }` 分组选项 |
| `value`        | AntD 风格受控值，优先级高于 `modelValue`               |
| `modelValue`   | Vue 风格受控值                                         |
| `defaultValue` | 非受控初始值                                           |
| `placeholder`  | 占位文案                                               |
| `disabled`     | 禁用整个 Select                                        |
| `by`           | 对象值比较字段或比较函数                               |
| `multiple`     | 多选模式，多选时值传数组                               |
| `onChange`     | 值变化事件，参数为 `(value, option)`                   |

复杂选项可以直接在 option 上写 `description`：

```tsx
const regions = [
  { value: 'cn-east', label: '华东区', description: '低延迟，适合国内主站' },
  { value: 'sg', label: '新加坡', description: '适合东南亚业务' }
]

<Select value={region.value} options={regions} onChange={(value) => (region.value = String(value))} />
```

Select 下拉层默认通过 `Portal` 渲染到 `body`，并使用 `position="popper"`。如果业务弹层有裁剪、层级或滚动容器问题，优先检查 Portal、`z-index` 与父级 transform。

## Modal

`Modal` 把 Dialog 的 Root、Portal、Overlay、Content、Footer 组合收束成业务 API。

```tsx
<Modal
  open={open.value}
  title="发布配置"
  onOk={submit}
  onUpdate:open={(value) => {
    open.value = value
  }}
>
  内容
</Modal>
```

命令式场景使用 `modal`：

```tsx
modal.open({
  title: '编辑用户',
  content: () => <UserForm />
})

const ok = await modal.confirm({
  title: '删除确认',
  content: '确定要删除这条数据吗？'
})
```

## 新组件开发

推荐流程：

1. `pnpm ui:shadcn <component>` 拉取官方实现（或继续在 `web/ui/src/shadcn/<component>/index.tsx` 手写）。
2. 将 `.vue` 调整为 TSX 并放入 `web/ui/src/shadcn/<component>`，这层只作为内部实现。
3. 在 `web/ui/src/components/<component>` 封装业务 API，例如 `Button type="primary"`、`Select options={[]}`、`Modal title="..."`。
4. 交互复杂的组件优先使用 `reka-ui` primitives；对业务暴露数据驱动或声明式 API，不从根入口暴露 primitive 组合结构。
5. 样式使用 UnoCSS 原子类（`bg-primary`、`border-border` 等）；**不要**在组件里写死色值，语义色由 `shadcn-theme.css` → shared token 提供。
6. 需要变体的组件使用 `cva`；需要 class 合并时统一使用 `cn()`。
7. 从 `web/ui/src/index.ts` 导出业务组件，保持按需命名导出。
8. 在 `web-lab/src/views/UIView.tsx` 增加可交互案例，覆盖基础态、禁用态、复杂内容与受控值。
9. 在 `docs/components` 补充文档，并更新 `docs/preset/sidebar.ts`。

## 维护约定

- 不直接修改 `node_modules` 中的 shadcn-vue 或 Reka UI 文件；组件源码以本仓库为准。
- 新增依赖先放在 `@lego/web-ui`，只有 lab 自己直接 import 时才放到 `@lego/web-lab`。
- 组件默认样式不要写业务色值，优先使用 `bg-background`、`text-primary` 等语义类（底层变量见 `shadcn-theme.css`）。
- shadcn/Reka 组合组件留在内部目录，不从包根入口导出；业务只使用稳定组件和服务对象。
- UnoCSS 已启用 `@unocss/preset-wind4`，但全局 reset 仍由 `@lego/shared/web` 管理。

## 常见坑

- TSX 中普通业务优先使用 `value` + `onChange`；只有需要 Vue 标准双向绑定语义时再用 `modelValue` + `onUpdate:modelValue`。
- Reka UI 的 Select item 如果展示复杂内容，记得传 `textValue`，否则键盘 typeahead 会读取完整 DOM 文本。
- Select 的对象值需要使用 `by` 指定比较字段或比较函数。
- Dialog、Select 这类 Portal 组件遇到层级问题时，先查父级 `transform`、全局 `z-index` 和 Teleport 目标。
- Tabs 内容里有未提交表单时，考虑 `unmountOnHide={false}`，否则隐藏面板可能被卸载。
- 组件里的原子类必须出现在源码字符串中；动态拼完整 class 名可能导致 UnoCSS 扫描不到。
- 如果下拉层样式缺失，确认应用入口是否从 `@lego/web-ui` 引入过组件包入口，因为 `src/index.ts` 会注入 `styles/index.css`。
