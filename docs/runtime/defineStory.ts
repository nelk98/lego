import type { StoryDefine } from './types'

export function defineStory<TProps = any>(story: StoryDefine<TProps>): StoryDefine<TProps> {
  return story
}
