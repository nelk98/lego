import { defineComponent, ref } from 'vue'
import {
  ScrollView,
  UiButton,
  UiDialog,
  UiDialogClose,
  UiDialogContent,
  UiDialogDescription,
  UiDialogFooter,
  UiDialogHeader,
  UiDialogTitle,
  UiDialogTrigger,
  UiSelect,
  UiSwitch,
  UiTabs,
  UiTabsContent,
  UiTabsList,
  UiTabsTrigger
} from '@lego/web-ui'

import styles from './UIView.module.css'

// Playground 只维护示例数据；组件源码与样式逻辑都留在 @lego/web-ui 内。
const buttonVariants = ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const
const frameworks = [
  { value: 'vue', label: 'Vue', disabled: false },
  { value: 'nuxt', label: 'Nuxt', disabled: false },
  { value: 'vite', label: 'Vite', disabled: false },
  { value: 'storybook', label: 'Storybook', disabled: true }
]
const frameworkGroups = [{ label: 'Web stack', options: frameworks }]
const regions = [
  { value: 'cn-east', label: '华东区', description: '低延迟，适合国内主站' },
  { value: 'sg', label: '新加坡', description: '适合东南亚业务' },
  { value: 'us-west', label: '美西区', description: '适合北美测试环境' }
]

export default defineComponent({
  name: 'UIView',
  setup() {
    // ScrollView 示例需要动态内容高度，用来验证 scrollToLower 是否能重复触发。
    const height = ref(310)
    // Select 使用 value + onChange 的数据驱动 API。
    const framework = ref('vue')
    const region = ref('cn-east')
    const activeTab = ref('account')
    const notifications = ref(true)
    const dialogOpen = ref(false)

    return () => (
      <div class={styles.uiPlayground}>
        <header class={styles.hero}>
          <div>
            <p class={styles.eyebrow}>shadcn-vue on TSX + UnoCSS</p>
            <h1>组件库调试</h1>
            <p class={styles.desc}>shadcn-vue 风格组件调试与示例。</p>
          </div>
          <div class={styles.statusPanel}>
            <span>Framework: {framework.value}</span>
            <span>Region: {region.value}</span>
            <span>Tab: {activeTab.value}</span>
            <span>Notify: {notifications.value ? 'on' : 'off'}</span>
          </div>
        </header>

        <section class={styles.block}>
          <div class={styles.blockHeader}>
            <h2>Button</h2>
            <p>本地 TSX 实现，基于 cva 管理 variant / size。</p>
          </div>
          <div class={styles.flex}>
            {buttonVariants.map((variant) => (
              <UiButton key={variant} variant={variant}>
                {variant}
              </UiButton>
            ))}
          </div>
          <div class={styles.flex}>
            <UiButton size="sm" variant="secondary">
              Small
            </UiButton>
            <UiButton>Default</UiButton>
            <UiButton size="lg" variant="outline">
              Large
            </UiButton>
            <UiButton size="icon" aria-label="Add" loading>
              +
            </UiButton>
            <UiButton disabled>Disabled</UiButton>
            <UiButton loading>Loading</UiButton>
          </div>
        </section>

        <section class={styles.block}>
          <div class={styles.blockHeader}>
            <h2>UiSelect</h2>
            <p>业务侧只传 options / value / onChange，内部再组合 Reka UI primitives。</p>
          </div>
          <div class={styles.grid}>
            <div class={styles.field}>
              <label>基础选择</label>
              <UiSelect
                value={framework.value}
                placeholder="选择框架"
                options={frameworkGroups}
                onChange={(value) => {
                  framework.value = String(value)
                }}
              />
            </div>

            <div class={styles.field}>
              <label>复杂内容</label>
              <UiSelect
                value={region.value}
                placeholder="选择部署区域"
                options={regions}
                sideOffset={6}
                onChange={(value) => {
                  region.value = String(value)
                }}
              />
            </div>
          </div>
        </section>

        <section class={styles.block}>
          <div class={styles.blockHeader}>
            <h2>Complex Primitives</h2>
            <p>Dialog、Tabs、Switch 都基于 Reka UI primitives，覆盖 Portal、受控状态与组合内容。</p>
          </div>
          <div class={styles.complexGrid}>
            <UiTabs
              modelValue={activeTab.value}
              {...{
                'onUpdate:modelValue': (value: string | number) => {
                  activeTab.value = String(value)
                }
              }}
              class={styles.tabsDemo}
            >
              <UiTabsList>
                <UiTabsTrigger value="account">Account</UiTabsTrigger>
                <UiTabsTrigger value="deploy">Deploy</UiTabsTrigger>
                <UiTabsTrigger value="disabled" disabled>
                  Disabled
                </UiTabsTrigger>
              </UiTabsList>
              <UiTabsContent value="account">
                <div class={styles.settingRow}>
                  <div class={styles.settingCopy}>
                    <strong>通知提醒</strong>
                    <span>用于验证 Switch 在 Tabs 面板里的受控状态是否保持。</span>
                  </div>
                  <UiSwitch
                    modelValue={notifications.value}
                    aria-label="Toggle notifications"
                    {...{
                      'onUpdate:modelValue': (value: boolean) => {
                        notifications.value = value
                      }
                    }}
                  />
                </div>
              </UiTabsContent>
              <UiTabsContent value="deploy">
                <div class={styles.settingRow}>
                  <div class={styles.settingCopy}>
                    <strong>部署区域</strong>
                    <span>当前区域为 {region.value}，Select 与 Tabs 状态互不影响。</span>
                  </div>
                  <UiButton variant="outline" size="sm">
                    Sync
                  </UiButton>
                </div>
              </UiTabsContent>
            </UiTabs>

            <UiDialog
              open={dialogOpen.value}
              {...{
                'onUpdate:open': (value: boolean) => {
                  dialogOpen.value = value
                }
              }}
            >
              <UiDialogTrigger asChild>
                <UiButton variant="outline">Open Dialog</UiButton>
              </UiDialogTrigger>
              <UiDialogContent>
                <UiDialogHeader>
                  <UiDialogTitle>发布配置</UiDialogTitle>
                  <UiDialogDescription>
                    Dialog 默认通过 Portal 渲染，关闭按钮、遮罩和焦点管理都由封装处理。
                  </UiDialogDescription>
                </UiDialogHeader>
                <div class={styles.dialogForm}>
                  <label>发布区域</label>
                  <UiSelect
                    value={region.value}
                    placeholder="选择发布区域"
                    options={regions}
                    onChange={(value) => {
                      region.value = String(value)
                    }}
                  />
                </div>
                <UiDialogFooter>
                  <UiDialogClose asChild>
                    <UiButton variant="outline">取消</UiButton>
                  </UiDialogClose>
                  <UiButton
                    onClick={() => {
                      dialogOpen.value = false
                    }}
                  >
                    确认发布
                  </UiButton>
                </UiDialogFooter>
              </UiDialogContent>
            </UiDialog>
          </div>
        </section>

        <section class={styles.block}>
          <div class={styles.blockHeader}>
            <h2>ScrollView</h2>
            <p>触底后动态增高，用来验证滚动事件和滚动条样式。</p>
          </div>
          <ScrollView
            class={styles.scrollBox}
            lowerThreshold={50}
            onScrollToLower={() => {
              height.value += 100
            }}
          >
            <div class={styles.scrollInner} style={{ height: `${height.value}px` }}>
              Scroll content height: {height.value}px
            </div>
          </ScrollView>
        </section>
      </div>
    )
  }
})
