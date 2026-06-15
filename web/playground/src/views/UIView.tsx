import { defineComponent, ref } from 'vue'
import { Button, Input, Modal, ScrollView, Select, modal } from '@lego/web-ui'

import styles from './UIView.module.css'

// Playground 只维护示例数据；组件源码与样式逻辑都留在 @lego/web-ui 内。
const buttonTypes = ['primary', 'default', 'danger', 'text'] as const
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
    // 业务组件使用 value + onChange 的数据驱动 API。
    const keyword = ref('')
    const framework = ref('vue')
    const region = ref('cn-east')
    const modalOpen = ref(false)

    return () => (
      <div class={styles.uiPlayground}>
        <header class={styles.hero}>
          <div>
            <p class={styles.eyebrow}>shadcn-vue on TSX + UnoCSS</p>
            <h1>组件库调试</h1>
            <p class={styles.desc}>shadcn-vue 风格组件调试与示例。</p>
          </div>
          <div class={styles.statusPanel}>
            <span>Keyword: {keyword.value || '-'}</span>
            <span>Framework: {framework.value}</span>
            <span>Region: {region.value}</span>
          </div>
        </header>

        <section class={styles.block}>
          <div class={styles.blockHeader}>
            <h2>Button</h2>
            <p>业务侧使用 AntD-like type / size / loading / block API。</p>
          </div>
          <div class={styles.flex}>
            {buttonTypes.map((type) => (
              <Button key={type} type={type}>
                {type}
              </Button>
            ))}
          </div>
          <div class={styles.flex}>
            <Button size="sm">Small</Button>
            <Button type="primary">Default</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button type="primary" loading>
              Loading
            </Button>
            <Button block>Block Button</Button>
          </div>
        </section>

        <section class={styles.block}>
          <div class={styles.blockHeader}>
            <h2>Input & Select</h2>
            <p>业务侧只传 value / options / onChange，内部再组合 shadcn-vue/Reka。</p>
          </div>
          <div class={styles.grid}>
            <div class={styles.field}>
              <label>搜索关键字</label>
              <Input
                value={keyword.value}
                placeholder="请输入关键字"
                clearable
                onChange={(value) => {
                  keyword.value = String(value ?? '')
                }}
              />
            </div>

            <div class={styles.field}>
              <label>基础选择</label>
              <Select
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
              <Select
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
            <h2>Modal</h2>
            <p>业务侧使用声明式 Modal，也可以通过 modal.open / modal.confirm 命令式调用。</p>
          </div>
          <div class={styles.flex}>
            <Button
              onClick={() => {
                modalOpen.value = true
              }}
            >
              声明式 Modal
            </Button>
            <Button
              onClick={() => {
                modal.open({
                  title: '编辑用户',
                  description: '命令式打开，适合跨页面动作或快速确认。',
                  content: () => (
                    <div class={styles.dialogForm}>
                      <label>姓名</label>
                      <Input value={keyword.value} placeholder="请输入姓名" clearable />
                    </div>
                  )
                })
              }}
            >
              modal.open
            </Button>
            <Button
              type="danger"
              onClick={async () => {
                await modal.confirm({
                  title: '删除确认',
                  description: 'confirm 返回 Promise<boolean>，可直接 await。',
                  content: '确定要删除这条配置吗？'
                })
              }}
            >
              modal.confirm
            </Button>
          </div>
          <Modal
            open={modalOpen.value}
            title="发布配置"
            description="Modal 对业务暴露 title / onOk / onCancel，而不是 Dialog 组合结构。"
            {...{
              'onUpdate:open': (value: boolean) => {
                modalOpen.value = value
              }
            }}
            onOk={() => {
              modalOpen.value = false
            }}
          >
            <div class={styles.dialogForm}>
              <label>发布区域</label>
              <Select
                value={region.value}
                placeholder="选择发布区域"
                options={regions}
                onChange={(value) => {
                  region.value = String(value)
                }}
              />
            </div>
          </Modal>
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
