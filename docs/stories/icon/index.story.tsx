import { Icon, type IconName } from '@lego/ui'
import { defineStory } from '../../runtime'

interface IconStoryProps {
  name?: IconName
  size?: number | string
  color?: string
  class?: string
}

function renderIcon(props: IconStoryProps) {
  return <Icon {...props} />
}

export default defineStory<IconStoryProps>({
  title: '图标/Icon',
  component: Icon,
  docs: () => import('./docs.md'),
  demos: [
    {
      name: '基础用法',
      category: 'Basics',
      description: '默认从 open-icon 图标库加载，颜色跟随当前文字色。',
      props: {
        name: 'phone',
        size: 24,
        color: 'currentColor'
      },
      source: `<Icon name="phone" size={24} />`,
      render: renderIcon
    },
    {
      name: '跨库引用',
      category: 'Variants',
      description: 'name 支持 @库名/图标名，未指定库时使用 open-icon。',
      props: {
        size: 24,
        color: 'currentColor'
      },
      source: `const names = ['phone', '@linear/eye', '@solid/home']

names.map(name => <Icon name={name} size={props.size} />)`,
      render: (props) => (
        <div class="lego-demo-row">
          {(['phone', '@linear/eye', '@solid/home'] as const).map((name) => (
            <Icon name={name} size={props.size} color={props.color} />
          ))}
        </div>
      )
    },
    {
      name: '图标尺寸',
      category: 'Variants',
      description: '展示 16、24、32 三种常见尺寸。',
      props: {
        name: '@linear/eye',
        color: 'currentColor'
      },
      source: `const sizes = [16, 24, 32]

sizes.map(size => <Icon name={props.name} size={size} />)`,
      render: (props) => (
        <div class="lego-demo-row">
          {[16, 24, 32].map((size) => (
            <Icon name={props.name} size={size} color={props.color} />
          ))}
        </div>
      )
    },
    {
      name: '自定义颜色',
      category: 'Variants',
      description: '通过 color 调整图标颜色，便于在不同背景上对比可读性。',
      props: {
        name: '@solid/home',
        size: 24
      },
      source: `<Icon name="@solid/home" size={24} color="#ef4444" />
<Icon name="@linear/eye" size={24} color="#22c55e" />`,
      render: () => (
        <div class="lego-demo-row">
          <Icon name="@solid/home" size={24} color="#ef4444" />
          <Icon name="@linear/eye" size={24} color="#22c55e" />
          <Icon name="phone" size={24} color="#3b82f6" />
        </div>
      )
    }
  ]
})
