import rawStories from 'virtual:lego-stories'
import type { StoryModuleRecord, StoryRecord } from './types'

export function normalizeStoryRecords(records: StoryModuleRecord[] = rawStories): StoryRecord[] {
  return records
    .filter((record) => record.story?.title && Array.isArray(record.story.demos))
    .map((record) => ({
      ...record,
      title: record.story.title
    }))
    .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'))
}

export function getStoryRecords(): StoryRecord[] {
  return normalizeStoryRecords(rawStories)
}
