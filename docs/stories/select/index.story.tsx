import {
  Select,
  type SelectColor,
  type SelectLabelPlacement,
  type SelectOptionInput,
  type SelectRadius,
  type SelectVariant
} from '@lego/ui'
import { defineStory } from '../../runtime'

interface SelectStoryProps {
  value?: string | string[]
  modelValue?: string | string[]
  defaultValue?: string | string[]
  items?: SelectOptionInput[]
  label?: string
  placeholder?: string
  description?: string
  errorMessage?: string
  variant?: SelectVariant
  color?: SelectColor
  size?: 'sm' | 'md' | 'lg'
  radius?: SelectRadius
  labelPlacement?: SelectLabelPlacement
  selectionMode?: 'single' | 'multiple'
  isDisabled?: boolean
  isRequired?: boolean
  isInvalid?: boolean
  isLoading?: boolean
  isClearable?: boolean
  fullWidth?: boolean
}

const variants: SelectVariant[] = ['flat', 'bordered', 'faded', 'underlined']
const colors: SelectColor[] = ['default', 'primary', 'secondary', 'success', 'warning', 'danger']
const placements: SelectLabelPlacement[] = ['outside', 'inside', 'outside-left']

const frameworks: SelectOptionInput[] = [
  {
    label: 'Web stack',
    items: [
      { value: 'vue', label: 'Vue' },
      { value: 'nuxt', label: 'Nuxt' },
      { value: 'vite', label: 'Vite' },
      { value: 'storybook', label: 'Storybook', disabled: true }
    ]
  }
]

const regions: SelectOptionInput[] = [
  { value: 'cn-east', label: '华东区', description: '低延迟，适合国内主站' },
  { value: 'sg', label: '新加坡', description: '适合东南亚业务' },
  { value: 'us-west', label: '美西区', description: '适合北美测试环境' }
]

function renderSelect(props: SelectStoryProps) {
  return (
    <div class="lego-demo-field">
      <Select {...props} />
    </div>
  )
}

export default defineStory<SelectStoryProps>({
  title: '基础组件/Select',
  component: Select,
  docs: () => import('./docs.md'),
  demos: [
    {
      name: '基础用法',
      category: 'Basics',
      description:
        '业务侧传 items、value 和 onChange，不需要拼 SelectTrigger / SelectContent / SelectItem。',
      props: {
        value: 'vue',
        label: '技术栈',
        placeholder: '请选择技术栈',
        items: frameworks,
        variant: 'flat',
        color: 'default'
      },
      source: `<Select
  value={framework.value}
  label="技术栈"
  placeholder="请选择技术栈"
  items={frameworks}
  onChange={(value) => {
    framework.value = String(value)
  }}
/>`,
      render: renderSelect
    },
    {
      name: '变体',
      category: 'Variants',
      description: 'variant 控制输入框视觉层级。',
      props: {
        value: 'vue',
        label: '技术栈',
        items: frameworks,
        color: 'primary'
      },
      source: `const variants = ['flat', 'bordered', 'faded', 'underlined']

variants.map(variant => (
  <Select variant={variant} color="primary" items={items} value="vue" />
))`,
      render: (props) => (
        <div class="lego-demo-column is-narrow">
          {variants.map((variant) => (
            <Select
              key={variant}
              value={props.value}
              label={variant}
              items={props.items}
              variant={variant}
              color={props.color}
            />
          ))}
        </div>
      )
    },
    {
      name: '语义色',
      category: 'Variants',
      description: 'color 影响 label、focus ring 与错误/状态语义。',
      props: {
        value: 'cn-east',
        label: '发布区域',
        items: regions,
        variant: 'bordered'
      },
      source: `const colors = ['default', 'primary', 'secondary', 'success', 'warning', 'danger']

colors.map(color => (
  <Select variant="bordered" color={color} items={regions} value="cn-east" />
))`,
      render: (props) => (
        <div class="lego-demo-column is-narrow">
          {colors.map((color) => (
            <Select
              key={color}
              value={props.value}
              label={color}
              items={props.items}
              variant={props.variant}
              color={color}
            />
          ))}
        </div>
      )
    },
    {
      name: '标签位置',
      category: 'Layout',
      description: 'labelPlacement 对齐 HeroUI 的 inside、outside、outside-left。',
      props: {
        value: 'sg',
        label: '发布区域',
        placeholder: '选择区域',
        description: 'label 和 helper 文案都由 props 控制。',
        items: regions,
        variant: 'faded'
      },
      source: `<Select label="发布区域" labelPlacement="outside" items={regions} />
<Select label="发布区域" labelPlacement="inside" items={regions} />
<Select label="发布区域" labelPlacement="outside-left" items={regions} />`,
      render: (props) => (
        <div class="lego-demo-column is-narrow">
          {placements.map((labelPlacement) => (
            <Select key={labelPlacement} {...props} labelPlacement={labelPlacement} />
          ))}
        </div>
      )
    },
    {
      name: '状态',
      category: 'States',
      description: '加载、禁用、必填、错误、可清除都通过 props 控制。',
      props: {
        value: 'cn-east',
        label: '发布区域',
        items: regions,
        variant: 'bordered'
      },
      source: `<Select isLoading items={regions} />
<Select isDisabled items={regions} />
<Select isRequired label="发布区域" items={regions} />
<Select errorMessage="请选择发布区域" items={regions} />
<Select isClearable value="cn-east" items={regions} />`,
      render: (props) => (
        <div class="lego-demo-column is-narrow">
          <Select {...props} isLoading label="加载状态" />
          <Select {...props} isDisabled label="禁用状态" />
          <Select {...props} isRequired label="必填状态" />
          <Select {...props} color="danger" errorMessage="请选择发布区域" label="错误状态" />
          <Select {...props} isClearable label="可清除" />
        </div>
      )
    },
    {
      name: '多选',
      category: 'Behavior',
      description: 'selectionMode="multiple" 时 value/modelValue 使用数组。',
      props: {
        value: ['vue', 'vite'],
        label: '技术栈',
        placeholder: '请选择技术栈',
        items: frameworks,
        selectionMode: 'multiple',
        isClearable: true
      },
      source: `<Select
  value={['vue', 'vite']}
  label="技术栈"
  selectionMode="multiple"
  isClearable
  items={frameworks}
/>`,
      render: renderSelect
    }
  ]
})
