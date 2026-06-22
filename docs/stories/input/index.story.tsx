import { Input } from '@lego/ui'
import { defineStory } from '../../runtime'

interface InputStoryProps {
  value?: string | number
  modelValue?: string | number
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  type?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  allowClear?: boolean
  name?: string
  autocomplete?: string
}

function renderInput(props: InputStoryProps) {
  return (
    <div class="lego-demo-field">
      <Input {...props} />
    </div>
  )
}

export default defineStory<InputStoryProps>({
  title: '基础组件/Input',
  component: Input,
  docs: () => import('./docs.md'),
  demos: [
    {
      name: '基础用法',
      category: 'Basics',
      description: '最基础的单行文本输入框。',
      props: {
        value: 'Lego',
        placeholder: '请输入内容',
        size: 'md'
      },
      source: `<Input value="Lego" placeholder="请输入内容" size="md" />`,
      render: renderInput
    },
    {
      name: '尺寸',
      category: 'Variants',
      description: '对比 sm、md、lg 三种输入框高度。',
      props: {
        value: '组件库',
        placeholder: '请输入内容'
      },
      source: `const sizes = ['sm', 'md', 'lg']

sizes.map(size => (
  <Input value={props.value} placeholder={props.placeholder} size={size} />
))`,
      render: (props) => (
        <div class="lego-demo-column is-narrow">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Input value={props.value} placeholder={props.placeholder} size={size} />
          ))}
        </div>
      )
    },
    {
      name: '可清除',
      category: 'States',
      description: 'clearable 会在有值时展示清除按钮，适合搜索和筛选输入。',
      props: {
        value: '可清除内容',
        placeholder: '请输入内容',
        clearable: true
      },
      source: `<Input value="可清除内容" clearable placeholder="请输入内容" />`,
      render: renderInput
    },
    {
      name: '禁用与只读',
      category: 'States',
      description: 'disabled 阻止交互，readonly 保留可聚焦与文本选择能力。',
      props: {
        value: '当前内容',
        placeholder: '请输入内容'
      },
      source: `<Input value="当前内容" disabled />
<Input value="当前内容" readonly />`,
      render: (props) => (
        <div class="lego-demo-column is-narrow">
          <Input {...props} disabled />
          <Input {...props} readonly />
        </div>
      )
    },
    {
      name: '输入类型',
      category: 'Behavior',
      description: 'type 会透传到原生 input，可用于密码、邮箱、数字等输入场景。',
      props: {
        type: 'password',
        value: 'secret',
        placeholder: '请输入密码',
        autocomplete: 'current-password'
      },
      source: `<Input type="password" value="secret" autocomplete="current-password" />`,
      render: renderInput
    }
  ]
})
