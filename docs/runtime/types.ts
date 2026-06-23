export type StoryPlatform = 'web' | 'mobile'

/** component：文档 + 变体示例；page：独立页面（如图标库浏览） */
export type StoryKind = 'component' | 'page'

export interface StoryDemo<TProps = any> {
  name: string
  category?: string
  description?: string
  props?: TProps
  source?: string
  render: (props: TProps) => any
}

export interface StoryDefine<TProps = any> {
  title: string
  kind?: StoryKind
  platform?: StoryPlatform
  component?: any
  docs?: () => Promise<any>
  /** kind=page 时渲染的独立页面 */
  page?: () => any
  demos?: StoryDemo<TProps>[]
}

export interface StoryModuleRecord {
  id: string
  path: string
  story: StoryDefine
}

export interface StoryRecord extends StoryModuleRecord {
  title: string
}
