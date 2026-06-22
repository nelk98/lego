import { Icon, type IconName } from '@lego/mobile-ui'
import { defineStory } from '../../../runtime'

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
  title: '移动端/Icon',
  platform: 'mobile',
  component: Icon,
  docs: () => import('./docs.md'),
  demos: [
    {
      name: '基础用法',
      category: 'Basics',
      description: '最常见的图标形态，默认跟随当前文字颜色。',
      props: {
        name: 'search',
        size: 24,
        color: 'currentColor'
      },
      source: `<Icon name="search" size={24} />`,
      render: renderIcon
    },
    {
      name: '图标类型',
      category: 'Variants',
      description: '对比 search、close、check 三种内置图标。',
      props: {
        size: 24,
        color: 'currentColor'
      },
      source: `const names = ['search', 'close', 'check']

names.map(name => <Icon name={name} size={props.size} />)`,
      render: (props) => (
        <div class="lego-demo-row">
          {(['search', 'close', 'check'] as const).map((name) => (
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
        name: 'search',
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
        name: 'close',
        size: 24
      },
      source: `<Icon name="close" size={24} color="#ef4444" />
<Icon name="check" size={24} color="#22c55e" />`,
      render: () => (
        <div class="lego-demo-row">
          <Icon name="close" size={24} color="#ef4444" />
          <Icon name="check" size={24} color="#22c55e" />
          <Icon name="search" size={24} color="#3b82f6" />
        </div>
      )
    }
  ]
})
