export type StoryPlatform = 'web' | 'mobile'

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
  platform?: StoryPlatform
  component?: any
  docs?: () => Promise<any>
  demos: StoryDemo<TProps>[]
}

export interface StoryModuleRecord {
  id: string
  path: string
  story: StoryDefine
}

export interface StoryRecord extends StoryModuleRecord {
  title: string
}
