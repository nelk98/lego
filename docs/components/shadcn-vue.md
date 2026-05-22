# shadcn-vue Web UI

Web 端组件库已接入 shadcn-vue 的落地方式：组件源码放在 `@lego/web-ui` 内，业务侧按需从包入口引入，不需要全局注册。

当前示例组件包含 `UiButton`、`UiSelect`、`UiDialog`、`UiTabs`、`UiSwitch` 及其组合子组件。Playground 路径为 `/ui`。

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

CLI 生成的是 `.vue` 文件；若团队规范为 TSX + `Ui*` 前缀，添加后需手工重命名/封装并从 `web/ui/src/index.ts` 导出。

## 使用方式

```tsx
import { UiButton, UiSelect } from '@lego/web-ui'
import { ref } from 'vue'

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
    <UiButton variant="secondary">保存</UiButton>

    <UiSelect
      value={framework.value}
      placeholder="选择框架"
      options={frameworkOptions}
      onChange={(value) => {
        framework.value = String(value)
      }}
    />
  </>
)
```

## Button

`UiButton` 使用 `class-variance-authority` 维护样式变体。

| Prop       | 说明                                                              |
| ---------- | ----------------------------------------------------------------- |
| `variant`  | `default`、`secondary`、`outline`、`ghost`、`destructive`、`link` |
| `size`     | `default`、`sm`、`lg`、`icon`                                     |
| `as`       | 透传给 Reka UI `Primitive`，可渲染为 `a` 等标签                   |
| `asChild`  | 把按钮行为与样式合并到唯一子节点                                  |
| `disabled` | 原生禁用态，默认 `false`                                          |
| `type`     | 原生按钮类型，默认 `button`，避免表单内误触发 submit              |

调用方可通过 `class` 做局部覆盖；组件内部使用 `cn()` 合并，后传入的冲突原子类会覆盖默认值。

## Select

`UiSelect` 是基于 Reka UI Select primitives 的数据驱动封装。业务侧默认按 Ant Design Vue 的使用心智传 `options`、`value/modelValue`、`onChange`，不需要手写 Trigger、Content、Item 那串组合结构。

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

<UiSelect value={region.value} options={regions} onChange={(value) => (region.value = String(value))} />
```

如果需要完全自定义内部结构，仍然保留 primitive escape hatch：

- `UiSelectRoot`
- `UiSelectTrigger`
- `UiSelectValue`
- `UiSelectContent`
- `UiSelectGroup`
- `UiSelectLabel`
- `UiSelectItem`
- `UiSelectSeparator`

Select 下拉层默认通过 `Portal` 渲染到 `body`，并使用 `position="popper"`。如果业务弹层有裁剪、层级或滚动容器问题，优先检查 Portal、`z-index` 与父级 transform。

## Dialog

`UiDialog` 封装了 Reka UI Dialog 的 Root、Portal、Overlay、Content 与 Close 组合。推荐使用 `UiDialogTrigger asChild` 搭配 `UiButton`，这样按钮样式和 Dialog 触发语义会合并到同一个 DOM 节点。

```tsx
<UiDialog>
  <UiDialogTrigger asChild>
    <UiButton variant="outline">打开</UiButton>
  </UiDialogTrigger>
  <UiDialogContent>
    <UiDialogHeader>
      <UiDialogTitle>发布配置</UiDialogTitle>
      <UiDialogDescription>说明文字放在这里。</UiDialogDescription>
    </UiDialogHeader>
    <UiDialogFooter>
      <UiDialogClose asChild>
        <UiButton variant="outline">取消</UiButton>
      </UiDialogClose>
      <UiButton>确认</UiButton>
    </UiDialogFooter>
  </UiDialogContent>
</UiDialog>
```

## Tabs

`UiTabs` 支持受控和非受控两种模式。复杂表单放在 Tab 面板里时，可把 `unmountOnHide={false}` 传给 `UiTabs`，避免切换后丢失未提交状态。

```tsx
<UiTabs defaultValue="account">
  <UiTabsList>
    <UiTabsTrigger value="account">Account</UiTabsTrigger>
    <UiTabsTrigger value="deploy">Deploy</UiTabsTrigger>
  </UiTabsList>
  <UiTabsContent value="account">账户设置</UiTabsContent>
  <UiTabsContent value="deploy">部署设置</UiTabsContent>
</UiTabs>
```

## Switch

`UiSwitch` 是一个受控表单控件，适合在设置项、筛选条件、弹窗表单里使用。

```tsx
const enabled = ref(true)

<UiSwitch
  modelValue={enabled.value}
  {...{
    'onUpdate:modelValue': (value: boolean) => {
      enabled.value = value
    }
  }}
/>
```

## 新组件开发

推荐流程：

1. `pnpm ui:shadcn <component>` 拉取官方实现（或继续在 `web/ui/src/shadcn/<component>/index.tsx` 手写）。
2. 将 `.vue` 调整为 TSX + `Ui*` 导出（若需要与现有 API 一致）。
3. 交互复杂的组件优先使用 `reka-ui` primitives；对业务暴露的数据驱动 API，对极端场景再保留 primitive escape hatch。
4. 样式使用 UnoCSS 原子类（`bg-primary`、`border-border` 等）；**不要**在组件里写死色值，语义色由 `shadcn-theme.css` → shared token 提供。
5. 需要变体的组件使用 `cva`；需要 class 合并时统一使用 `cn()`。
6. 从 `web/ui/src/index.ts` 导出组件，保持按需命名导出。
7. 在 `web/playground/src/views/UIView.tsx` 增加可交互案例，覆盖基础态、禁用态、复杂内容与受控值。
8. 在 `docs/components` 补充文档，并更新 `docs/preset/sidebar.ts`。

## 维护约定

- 不直接修改 `node_modules` 中的 shadcn-vue 或 Reka UI 文件；组件源码以本仓库为准。
- 新增依赖先放在 `@lego/web-ui`，只有 playground 自己直接 import 时才放到 `@lego/web-playground`。
- 组件默认样式不要写业务色值，优先使用 `bg-background`、`text-primary` 等语义类（底层变量见 `shadcn-theme.css`）。
- 继续保留 Ant Design Vue 旧导出；新组件使用 `Ui*` 前缀，避免与历史 `Button`、`Select` 冲突。
- UnoCSS 已启用 `@unocss/preset-wind4`，但全局 reset 仍由 `@lego/shared/web` 管理。

## 常见坑

- TSX 中普通业务优先使用 `value` + `onChange`；只有需要 Vue 标准双向绑定语义时再用 `modelValue` + `onUpdate:modelValue`。
- Reka UI 的 Select item 如果展示复杂内容，记得传 `textValue`，否则键盘 typeahead 会读取完整 DOM 文本。
- Select 的对象值需要使用 `by` 指定比较字段或比较函数。
- Dialog、Select 这类 Portal 组件遇到层级问题时，先查父级 `transform`、全局 `z-index` 和 Teleport 目标。
- Tabs 内容里有未提交表单时，考虑 `unmountOnHide={false}`，否则隐藏面板可能被卸载。
- 组件里的原子类必须出现在源码字符串中；动态拼完整 class 名可能导致 UnoCSS 扫描不到。
- 如果下拉层样式缺失，确认应用入口是否从 `@lego/web-ui` 引入过组件包入口，因为 `src/index.ts` 会注入 `styles/index.css`。
