import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import type { StoryKind, StoryRecord } from '../types'
import {
  ChevronIcon,
  ComponentIcon,
  DocsIcon,
  FolderCollapsedIcon,
  FolderExpandedIcon,
  PageIcon,
  VariantIcon
} from './StoryNavIcons'

export type StoryNavSection = 'docs' | 'demo' | 'page'

export interface StoryNavTarget {
  story: StoryRecord
  section: StoryNavSection
  demoIndex?: number
}

type StoryTreeNodeKind = 'directory' | 'component' | 'page'

interface StoryTreeNode {
  key: string
  label: string
  kind: StoryTreeNodeKind
  children: StoryTreeNode[]
  story?: StoryRecord
}

function getStoryKind(story: StoryRecord): StoryKind {
  return story.story.kind ?? 'component'
}

function buildStoryTree(stories: StoryRecord[]) {
  const root: StoryTreeNode[] = []

  for (const story of stories) {
    const parts = story.title.split('/').filter(Boolean)
    let children = root
    let key = ''

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1
      key = key ? `${key}/${part}` : part
      let node = children.find((item) => item.label === part)

      if (!node) {
        node = {
          key,
          label: part,
          kind: isLeaf ? (getStoryKind(story) === 'page' ? 'page' : 'component') : 'directory',
          children: []
        }
        children.push(node)
      }

      if (isLeaf) {
        node.kind = getStoryKind(story) === 'page' ? 'page' : 'component'
        node.story = story
      }

      children = node.children
    })
  }

  return root
}

function getExpandedKeysForStory(stories: StoryRecord[], storyId: string) {
  const keys = new Set<string>()
  if (!storyId) return keys

  const story = stories.find((item) => item.id === storyId)
  if (!story) return keys

  const parts = story.title.split('/').filter(Boolean)
  let key = ''
  for (const part of parts) {
    key = key ? `${key}/${part}` : part
    keys.add(key)
  }

  return keys
}

function getSelectedKey(
  storyId: string,
  section: StoryNavSection,
  demoIndex: number,
  storyKind: StoryKind
) {
  if (!storyId) return ''
  if (section === 'page' || storyKind === 'page') return `${storyId}::page`
  if (section === 'demo') return `${storyId}::demo::${demoIndex}`
  return `${storyId}::docs`
}

function navDepthStyle(depth: number) {
  return { '--nav-depth': String(depth) }
}

export default defineComponent({
  name: 'StoryNav',
  props: {
    stories: {
      type: Array as PropType<StoryRecord[]>,
      required: true
    },
    selectedId: {
      type: String,
      default: ''
    },
    selectedSection: {
      type: String as PropType<StoryNavSection>,
      default: 'docs'
    },
    selectedDemoIndex: {
      type: Number,
      default: 0
    }
  },
  emits: {
    select: (_target: StoryNavTarget) => true
  },
  setup(props, { emit }) {
    const tree = computed(() => buildStoryTree(props.stories))
    const expandedKeys = ref(getExpandedKeysForStory(props.stories, props.selectedId))
    const selectedStoryKind = computed(() => {
      const story = props.stories.find((item) => item.id === props.selectedId)
      return story ? getStoryKind(story) : 'component'
    })
    const selectedKey = computed(() =>
      getSelectedKey(
        props.selectedId,
        props.selectedSection,
        props.selectedDemoIndex,
        selectedStoryKind.value
      )
    )

    watch(
      () => [props.stories, props.selectedId] as const,
      ([stories, storyId]) => {
        expandedKeys.value = getExpandedKeysForStory(stories, storyId)
      }
    )

    function isExpanded(key: string) {
      return expandedKeys.value.has(key)
    }

    function toggle(key: string) {
      const nextKeys = new Set(expandedKeys.value)
      if (nextKeys.has(key)) {
        nextKeys.delete(key)
      } else {
        nextKeys.add(key)
      }
      expandedKeys.value = nextKeys
    }

    function renderCaret(expanded: boolean) {
      return (
        <span class={['lego-story-nav-caret', expanded && 'is-expanded']} aria-hidden="true">
          <ChevronIcon />
        </span>
      )
    }

    function renderIcon(
      kind: 'folder' | 'component' | 'docs' | 'story' | 'page',
      expanded = false
    ) {
      const className = ['lego-story-nav-icon', `is-${kind}`]
      let icon

      if (kind === 'folder') {
        icon = expanded ? <FolderExpandedIcon /> : <FolderCollapsedIcon />
      } else if (kind === 'component') {
        icon = <ComponentIcon />
      } else if (kind === 'page') {
        icon = <PageIcon />
      } else if (kind === 'docs') {
        icon = <DocsIcon />
      } else {
        icon = <VariantIcon />
      }

      return (
        <span class={className} aria-hidden="true">
          {icon}
        </span>
      )
    }

    function renderComponentChildren(story: StoryRecord, depth: number) {
      const docsKey = getSelectedKey(story.id, 'docs', 0, 'component')
      const demos = story.story.demos ?? []

      return (
        <ul class="lego-story-nav-list lego-story-nav-children">
          {story.story.docs ? (
            <li
              class={[
                'lego-story-nav-node',
                'is-docs',
                selectedKey.value === docsKey && 'is-selected'
              ]}
              style={navDepthStyle(depth)}
            >
              <button
                type="button"
                class="lego-story-nav-item"
                onClick={() => emit('select', { story, section: 'docs' })}
              >
                {renderIcon('docs')}
                <span class="lego-story-nav-label">使用文档</span>
              </button>
            </li>
          ) : null}
          {demos.map((demo, index) => {
            const key = getSelectedKey(story.id, 'demo', index, 'component')

            return (
              <li
                class={[
                  'lego-story-nav-node',
                  'is-demo',
                  selectedKey.value === key && 'is-selected'
                ]}
                style={navDepthStyle(depth)}
              >
                <button
                  type="button"
                  class="lego-story-nav-item"
                  onClick={() => emit('select', { story, section: 'demo', demoIndex: index })}
                >
                  {renderIcon('story')}
                  <span class="lego-story-nav-label">{demo.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )
    }

    function renderNode(node: StoryTreeNode, depth = 0) {
      const expanded = isExpanded(node.key)

      if (node.kind === 'page' && node.story) {
        const pageKey = getSelectedKey(node.story.id, 'page', 0, 'page')

        return (
          <li
            class={[
              'lego-story-nav-node',
              'is-page',
              selectedKey.value === pageKey && 'is-selected'
            ]}
            style={navDepthStyle(depth)}
          >
            <button
              type="button"
              class="lego-story-nav-item"
              onClick={() => emit('select', { story: node.story!, section: 'page' })}
            >
              <span class="lego-story-nav-caret-spacer" aria-hidden="true" />
              {renderIcon('page')}
              <span class="lego-story-nav-label">{node.label}</span>
            </button>
          </li>
        )
      }

      if (node.kind === 'component' && node.story) {
        const hasChildren =
          Boolean(node.story.story.docs) || (node.story.story.demos?.length ?? 0) > 0

        return (
          <li
            class={['lego-story-nav-node', 'is-component', expanded && 'is-expanded']}
            style={navDepthStyle(depth)}
          >
            <button
              type="button"
              class="lego-story-nav-item"
              onClick={() => {
                if (hasChildren && !expanded) toggle(node.key)
                emit('select', {
                  story: node.story!,
                  section: node.story!.story.docs ? 'docs' : 'demo',
                  demoIndex: 0
                })
              }}
            >
              {hasChildren ? (
                <span
                  class="lego-story-nav-caret-wrap"
                  onClick={(event) => {
                    event.stopPropagation()
                    toggle(node.key)
                  }}
                >
                  {renderCaret(expanded)}
                </span>
              ) : (
                <span class="lego-story-nav-caret-spacer" aria-hidden="true" />
              )}
              {renderIcon('component')}
              <span class="lego-story-nav-label">{node.label}</span>
            </button>
            {expanded && hasChildren ? renderComponentChildren(node.story, depth + 1) : null}
          </li>
        )
      }

      return (
        <li
          class={['lego-story-nav-node', 'is-directory', expanded && 'is-expanded']}
          style={navDepthStyle(depth)}
        >
          <button type="button" class="lego-story-nav-group" onClick={() => toggle(node.key)}>
            {renderCaret(expanded)}
            {renderIcon('folder', expanded)}
            <span class="lego-story-nav-label">{node.label}</span>
          </button>
          {expanded && node.children.length ? (
            <ul class="lego-story-nav-list lego-story-nav-children">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </ul>
          ) : null}
        </li>
      )
    }

    return () => (
      <nav class="lego-story-nav" aria-label="组件演练场导航">
        <div class="lego-story-nav-title">Components</div>
        {tree.value.length ? (
          <ul class="lego-story-nav-list">{tree.value.map((node) => renderNode(node))}</ul>
        ) : (
          <div class="lego-story-empty">暂无 story</div>
        )}
      </nav>
    )
  }
})
