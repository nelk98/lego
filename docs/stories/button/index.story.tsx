import { Spin } from '@lego/shared'
import { Button, Icon, type ButtonRenderProps, type ButtonVariant } from '@lego/ui'
import { defineComponent, ref } from 'vue'
import { defineStory } from '../../runtime'

const ICON_SIZE = 16

interface ButtonStoryProps {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  isDisabled?: boolean
  isPending?: boolean
  fullWidth?: boolean
  isIconOnly?: boolean
  children?: string
}

const variants: ButtonVariant[] = [
  'primary',
  'secondary',
  'tertiary',
  'outline',
  'ghost',
  'danger',
  'danger-soft'
]

function ButtonSpinner() {
  return (
    <span class="inline-flex shrink-0 items-center justify-center [&_.c_dot-spin]:size-4 [&_.c_dot-spin]:h-4 [&_.c_dot-spin]:w-4 [&_.c_dot-spin]:before:top-1 [&_.c_dot-spin]:after:left-8">
      <Spin />
    </span>
  )
}

const LoadingStateDemo = defineComponent({
  name: 'ButtonLoadingStateDemo',
  setup() {
    const isLoading = ref(false)

    function handlePress() {
      isLoading.value = true
      window.setTimeout(() => {
        isLoading.value = false
      }, 2000)
    }

    return () => (
      <Button isPending={isLoading.value} onPress={handlePress}>
        {{
          default: ({ isPending }: ButtonRenderProps) => (
            <>
              {isPending ? <ButtonSpinner /> : <Icon name="@linear/paperclip" size={ICON_SIZE} />}
              {isPending ? 'Uploading...' : 'Upload File'}
            </>
          )
        }}
      </Button>
    )
  }
})

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
      name: '用法',
      category: 'Basics',
      description: '最基础的按钮用法。',
      props: {
        children: 'Click me'
      },
      source: `<Button onPress={() => console.log('Button pressed')}>Click me</Button>`,
      render: renderButton
    },
    {
      name: '变体',
      category: 'Variants',
      description: 'variant 决定视觉层级，包含 danger-soft。',
      props: {},
      source: `<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="danger-soft">Danger Soft</Button>`,
      render: () => (
        <div class="lego-demo-row">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="danger-soft">Danger Soft</Button>
        </div>
      )
    },
    {
      name: '带图标',
      category: 'Variants',
      description: '图标与文案都通过默认 slot 传入。',
      props: {},
      source: `<Button><Icon name="globe" size={16} />Search</Button>
<Button variant="secondary"><Icon name="add" size={16} />Add Member</Button>
<Button variant="tertiary"><Icon name="mail" size={16} />Email</Button>
<Button variant="danger"><Icon name="delete" size={16} />Delete</Button>`,
      render: () => (
        <div class="lego-demo-row">
          <Button>
            <Icon name="globe" size={ICON_SIZE} />
            Search
          </Button>
          <Button variant="secondary">
            <Icon name="add" size={ICON_SIZE} />
            Add Member
          </Button>
          <Button variant="tertiary">
            <Icon name="mail" size={ICON_SIZE} />
            Email
          </Button>
          <Button variant="danger">
            <Icon name="delete" size={ICON_SIZE} />
            Delete
          </Button>
        </div>
      )
    },
    {
      name: '仅图标',
      category: 'Variants',
      description: 'isIconOnly 固定正方形尺寸。',
      props: {},
      source: `<Button isIconOnly variant="tertiary"><Icon name="@linear/more" size={16} /></Button>
<Button isIconOnly variant="secondary"><Icon name="settings" size={16} /></Button>
<Button isIconOnly variant="danger"><Icon name="delete" size={16} /></Button>`,
      render: () => (
        <div class="lego-demo-row">
          <Button isIconOnly variant="tertiary" aria-label="More">
            <Icon name="@linear/more" size={ICON_SIZE} />
          </Button>
          <Button isIconOnly variant="secondary" aria-label="Settings">
            <Icon name="settings" size={ICON_SIZE} />
          </Button>
          <Button isIconOnly variant="danger" aria-label="Delete">
            <Icon name="delete" size={ICON_SIZE} />
          </Button>
        </div>
      )
    },
    {
      name: '加载中',
      category: 'States',
      description: 'isPending 时通过 scoped slot 自行渲染 Spinner。',
      props: {
        isPending: true
      },
      source: `<Button isPending>
  {({ isPending }) => (
    <>
      {isPending ? <Spinner /> : null}
      Uploading...
    </>
  )}
</Button>`,
      render: (props) => (
        <Button isPending={props.isPending}>
          {{
            default: ({ isPending }: ButtonRenderProps) => (
              <>
                {isPending ? <ButtonSpinner /> : null}
                Uploading...
              </>
            )
          }}
        </Button>
      )
    },
    {
      name: '加载状态',
      category: 'States',
      description: 'onPress 触发异步流程，pending 期间切换图标与文案。',
      props: {},
      source: `const [isLoading, setLoading] = useState(false)

<Button isPending={isLoading} onPress={handlePress}>
  {({ isPending }) => (
    <>
      {isPending ? <Spinner /> : <Icon name="@linear/paperclip" size={16} />}
      {isPending ? 'Uploading...' : 'Upload File'}
    </>
  )}
</Button>`,
      render: () => <LoadingStateDemo />
    },
    {
      name: '尺寸',
      category: 'Variants',
      description: 'size 控制按钮高度与内边距。',
      props: {},
      source: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
      render: () => (
        <div class="lego-demo-row">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      )
    },
    {
      name: '全宽',
      category: 'Layout',
      description: 'fullWidth 让按钮占满容器宽度。',
      props: {},
      source: `<Button fullWidth>Primary Button</Button>
<Button fullWidth><Icon name="add" size={16} />With Icon</Button>`,
      render: () => (
        <div class="lego-demo-column is-narrow" style={{ width: '400px', maxWidth: '100%' }}>
          <Button fullWidth>Primary Button</Button>
          <Button fullWidth>
            <Icon name="add" size={ICON_SIZE} />
            With Icon
          </Button>
        </div>
      )
    },
    {
      name: '禁用状态',
      category: 'States',
      description: '各变体在 isDisabled 下的表现。',
      props: {},
      source: `<Button isDisabled>Primary</Button>
<Button isDisabled variant="secondary">Secondary</Button>
<Button isDisabled variant="outline">Outline</Button>`,
      render: () => (
        <div class="lego-demo-row">
          {variants.map((variant) => (
            <Button key={variant} variant={variant} isDisabled>
              {variant}
            </Button>
          ))}
        </div>
      )
    },
    {
      name: '社交按钮',
      category: 'Layout',
      description: 'tertiary 变体适合第三方登录场景。',
      props: {},
      source: `<Button class="w-full" variant="tertiary"><Icon name="@linear/google" size={16} />Sign in with Google</Button>
<Button class="w-full" variant="tertiary">Sign in with GitHub</Button>
<Button class="w-full" variant="tertiary"><Icon name="apple" size={16} />Sign in with Apple</Button>`,
      render: () => (
        <div class="lego-demo-column is-narrow" style={{ width: '320px', maxWidth: '100%' }}>
          <Button class="w-full" variant="tertiary">
            <Icon name="@linear/google" size={ICON_SIZE} />
            Sign in with Google
          </Button>
          <Button class="w-full" variant="tertiary">
            Sign in with GitHub
          </Button>
          <Button class="w-full" variant="tertiary">
            <Icon name="apple" size={ICON_SIZE} />
            Sign in with Apple
          </Button>
        </div>
      )
    },
    {
      name: '自定义 render',
      category: 'Behavior',
      description: 'render 可覆盖默认 button 根节点。',
      props: {
        children: 'Press me'
      },
      source: `<Button
  render={(props, { isPressed }, children) => (
    <button {...props} data-custom={isPressed ? 'pressed' : 'bar'}>
      {children}
    </button>
  )}
>
  Press me
</Button>`,
      render: (props) => (
        <Button
          render={(domProps, { isPressed }, children) => (
            <button {...domProps} data-custom={isPressed ? 'pressed' : 'bar'}>
              {children}
            </button>
          )}
        >
          {props.children}
        </Button>
      )
    }
  ]
})
