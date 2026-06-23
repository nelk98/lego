import { Spin } from '@lego/shared'
import { Button, type ButtonRenderProps, type ButtonVariant } from '@lego/ui'
import { defineComponent, ref } from 'vue'
import { defineStory } from '../../runtime'

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

function IconGlobe() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-3.18a15.7 15.7 0 0 0-1.2-5.02A8.03 8.03 0 0 1 19.93 11ZM12 4c.95 1.6 1.6 3.6 1.86 5.86H10.14C10.4 7.6 11.05 5.6 12 4ZM8.45 5.98A15.7 15.7 0 0 0 7.25 11H4.07a8.03 8.03 0 0 1 4.38-5.02ZM4.07 13h3.18c.22 1.86.7 3.58 1.2 5.02A8.03 8.03 0 0 1 4.07 13Zm7.93 7c-.95-1.6-1.6-3.6-1.86-5.86h3.72C13.6 16.4 12.95 18.4 12 20Zm3.55-1.98c.5-1.44.98-3.16 1.2-5.02h3.18a8.03 8.03 0 0 1-4.38 5.02Z"
      />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path fill="currentColor" d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path
        fill="currentColor"
        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2 8 5 8-5v8H4V8Z"
      />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path
        fill="currentColor"
        d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v9h-2V9Zm4 0h2v9h-2V9ZM7 9h2v9H7V9Z"
      />
    </svg>
  )
}

function IconEllipsis() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path
        fill="currentColor"
        d="M6 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z"
      />
    </svg>
  )
}

function IconGear() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path
        fill="currentColor"
        d="m19.14 12.94.03-.24 1.02-.78-1.4-2.42-1.2.3-.22-.16a6.5 6.5 0 0 0-.56-.42l-.16-.22.3-1.2-2.42-1.4-.78 1.02-.24.03a6.4 6.4 0 0 0-.48 0l-.24-.03-.78-1.02-2.42 1.4.3 1.2-.16.22c-.2.15-.39.3-.56.46l-.22.16-1.2-.3-1.4 2.42 1.02.78.03.24a6.4 6.4 0 0 0 0 .48l-.03.24-1.02.78 1.4 2.42 1.2-.3.22.16c.17.16.36.31.56.46l.16.22-.3 1.2 2.42 1.4.78-1.02.24-.03c.16.02.32.03.48.03s.32-.01.48-.03l.24.03.78 1.02 2.42-1.4-.3-1.2.16-.22c.2-.15.39-.3.56-.46l.22-.16 1.2.3 1.4-2.42-1.02-.78-.03-.24a6.4 6.4 0 0 0 0-.48ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
      />
    </svg>
  )
}

function IconPaperclip() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" class="size-4">
      <path
        fill="currentColor"
        d="M16.5 6.5 9 14a2.12 2.12 0 1 0 3 3l7.5-7.5a3.63 3.63 0 0 0-5.12-5.12L5.5 13.38A5.62 5.62 0 0 0 13.5 21.38l8.25-8.25-1.42-1.42-8.25 8.25a3.62 3.62 0 0 1-5.12-5.12l9.88-9.88a1.63 1.63 0 1 1 2.3 2.3L9 17a.75.75 0 1 1-1.06-1.06l7.56-7.56Z"
      />
    </svg>
  )
}

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
              {isPending ? <ButtonSpinner /> : <IconPaperclip />}
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
      source: `<Button><GlobeIcon />Search</Button>
<Button variant="secondary"><PlusIcon />Add Member</Button>
<Button variant="tertiary"><MailIcon />Email</Button>
<Button variant="danger"><TrashIcon />Delete</Button>`,
      render: () => (
        <div class="lego-demo-row">
          <Button>
            <IconGlobe />
            Search
          </Button>
          <Button variant="secondary">
            <IconPlus />
            Add Member
          </Button>
          <Button variant="tertiary">
            <IconMail />
            Email
          </Button>
          <Button variant="danger">
            <IconTrash />
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
      source: `<Button isIconOnly variant="tertiary"><EllipsisIcon /></Button>
<Button isIconOnly variant="secondary"><GearIcon /></Button>
<Button isIconOnly variant="danger"><TrashIcon /></Button>`,
      render: () => (
        <div class="lego-demo-row">
          <Button isIconOnly variant="tertiary" aria-label="More">
            😄
          </Button>
          <Button isIconOnly variant="secondary" aria-label="Settings">
            <IconGear />
          </Button>
          <Button isIconOnly variant="danger" aria-label="Delete">
            <IconTrash />
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
      {isPending ? <Spinner /> : <PaperclipIcon />}
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
<Button fullWidth><PlusIcon />With Icon</Button>`,
      render: () => (
        <div class="lego-demo-column is-narrow" style={{ width: '400px', maxWidth: '100%' }}>
          <Button fullWidth>Primary Button</Button>
          <Button fullWidth>
            <IconPlus />
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
      source: `<Button class="w-full" variant="tertiary">Sign in with Google</Button>
<Button class="w-full" variant="tertiary">Sign in with GitHub</Button>
<Button class="w-full" variant="tertiary">Sign in with Apple</Button>`,
      render: () => (
        <div class="lego-demo-column is-narrow" style={{ width: '320px', maxWidth: '100%' }}>
          <Button class="w-full" variant="tertiary">
            <span aria-hidden="true">G</span>
            Sign in with Google
          </Button>
          <Button class="w-full" variant="tertiary">
            <span aria-hidden="true">GH</span>
            Sign in with GitHub
          </Button>
          <Button class="w-full" variant="tertiary">
            <span aria-hidden="true">A</span>
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
