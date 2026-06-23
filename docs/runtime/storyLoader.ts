import rawStories from 'virtual:lego-stories'
import type { StoryModuleRecord, StoryRecord } from './types'

function isValidStoryRecord(record: StoryModuleRecord) {
  const story = record.story
  if (!story?.title) return false
  if (story.kind === 'page') return typeof story.page === 'function'
  return Array.isArray(story.demos)
}

export function normalizeStoryRecords(records: StoryModuleRecord[] = rawStories): StoryRecord[] {
  return records
    .filter(isValidStoryRecord)
    .map((record) => ({
      ...record,
      title: record.story.title
    }))
    .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'))
}

export function getStoryRecords(): StoryRecord[] {
  return normalizeStoryRecords(rawStories)
}
