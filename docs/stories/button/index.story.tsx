import { Button } from '@lego/ui'
import { defineStory } from '../../runtime'

interface ButtonStoryProps {
  type?: 'primary' | 'default' | 'danger' | 'text'
  size?: 'sm' | 'md' | 'lg'
  htmlType?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  children?: string
}

function renderButton(props: ButtonStoryProps) {
  const { children, ...buttonProps } = props
  return <Button {...buttonProps}>{children}</Button>
}

export default defineStory<ButtonStoryProps>({
  title: '基础组件/Button',
  component: Button,
  docs: () => import('./docs.md'),
  demos: [
    {
      name: '基础用法',
      category: 'Basics',
      description: '最常见的按钮形态，适合作为主操作或普通操作入口。',
      props: {
        type: 'primary',
        size: 'md',
        children: '按钮'
      },
      source: `<Button type="primary" size="md">按钮</Button>`,
      render: renderButton
    },
    {
      name: '按钮类型',
      category: 'Variants',
      description: '对比 primary、default、danger、text 四种视觉层级。',
      props: {
        size: 'md',
        disabled: false,
        children: '按钮'
      },
      source: `const types = ['primary', 'default', 'danger', 'text']

types.map(type => (
  <Button type={type} size={props.size} disabled={props.disabled}>
    {props.children}
  </Button>
))`,
      render: (props) => (
        <div class="lego-demo-row">
          {(['primary', 'default', 'danger', 'text'] as const).map((type) => (
            <Button type={type} size={props.size} disabled={props.disabled}>
              {props.children}
            </Button>
          ))}
        </div>
      )
    },
    {
      name: '按钮尺寸',
      category: 'Variants',
      description: '展示 sm、md、lg 三种尺寸，方便检查高度、内边距和文字对齐。',
      props: {
        type: 'primary',
        children: '按钮'
      },
      source: `const sizes = ['sm', 'md', 'lg']

sizes.map(size => (
  <Button type={props.type} size={size}>{props.children}</Button>
))`,
      render: (props) => (
        <div class="lego-demo-row">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button type={props.type} size={size}>
              {props.children}
            </Button>
          ))}
        </div>
      )
    },
    {
      name: '加载状态',
      category: 'States',
      description: 'loading 会自动禁用点击，并在按钮内展示加载指示。',
      props: {
        type: 'primary',
        loading: true,
        children: '提交中'
      },
      source: `<Button type="primary" loading>提交中</Button>`,
      render: renderButton
    },
    {
      name: '禁用状态',
      category: 'States',
      description: 'disabled 用于表达当前操作不可用，所有类型都应保持一致的禁用反馈。',
      props: {
        size: 'md',
        disabled: true,
        children: '禁用'
      },
      source: `const types = ['primary', 'default', 'danger', 'text']

types.map(type => (
  <Button type={type} disabled>{props.children}</Button>
))`,
      render: (props) => (
        <div class="lego-demo-row">
          {(['primary', 'default', 'danger', 'text'] as const).map((type) => (
            <Button type={type} size={props.size} disabled={props.disabled}>
              {props.children}
            </Button>
          ))}
        </div>
      )
    },
    {
      name: '通栏按钮',
      category: 'Layout',
      description: 'block 适合移动端或表单底部的整行提交按钮。',
      props: {
        type: 'primary',
        size: 'lg',
        block: true,
        children: '确认提交'
      },
      source: `<Button type="primary" size="lg" block>确认提交</Button>`,
      render: (props) => {
        const { children, ...buttonProps } = props

        return (
          <div class="lego-demo-column is-narrow">
            <Button {...buttonProps}>{children}</Button>
            <Button type="default" size={props.size} block={props.block}>
              取消
            </Button>
          </div>
        )
      }
    },
    {
      name: '原生类型',
      category: 'Behavior',
      description: 'htmlType 映射到原生 button type，避免视觉 type 与表单行为混用。',
      props: {
        type: 'primary',
        htmlType: 'submit',
        children: '提交表单'
      },
      source: `<form>
  <Button type="primary" htmlType="submit">提交表单</Button>
  <Button htmlType="reset">重置</Button>
</form>`,
      render: (props) => {
        const { children, ...buttonProps } = props

        return (
          <form class="lego-demo-row" onSubmit={(event) => event.preventDefault()}>
            <Button {...buttonProps}>{children}</Button>
            <Button htmlType="reset">重置</Button>
          </form>
        )
      }
    }
  ]
})
