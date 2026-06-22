import { computed, defineComponent, ref, watch, type PropType } from 'vue'
import type { StoryRecord } from '../types'
import {
  ChevronIcon,
  ComponentIcon,
  DocsIcon,
  FolderCollapsedIcon,
  FolderExpandedIcon,
  VariantIcon
} from './StoryNavIcons'

export type StoryNavSection = 'docs' | 'demo'

export interface StoryNavTarget {
  story: StoryRecord
  section: StoryNavSection
  demoIndex?: number
}

type StoryTreeNodeKind = 'directory' | 'component'

interface StoryTreeNode {
  key: string
  label: string
  kind: StoryTreeNodeKind
  children: StoryTreeNode[]
  story?: StoryRecord
}

function buildStoryTree(stories: StoryRecord[]) {
  const root: StoryTreeNode[] = []

  for (const story of stories) {
    const parts = story.title.split('/').filter(Boolean)
    let children = root
    let key = ''

    parts.forEach((part, index) => {
      const isComponent = index === parts.length - 1
      key = key ? `${key}/${part}` : part
      let node = children.find((item) => item.label === part)

      if (!node) {
        node = {
          key,
          label: part,
          kind: isComponent ? 'component' : 'directory',
          children: []
        }
        children.push(node)
      }

      if (isComponent) {
        node.kind = 'component'
        node.story = story
      }

      children = node.children
    })
  }

  return root
}

function getInitialExpandedKeys(nodes: StoryTreeNode[]) {
  const keys = new Set<string>()

  function walk(node: StoryTreeNode) {
    keys.add(node.key)
    node.children.forEach(walk)
  }

  nodes.forEach(walk)
  return keys
}

function getSelectedKey(storyId: string, section: StoryNavSection, demoIndex: number) {
  if (!storyId) return ''
  if (section === 'demo') return `${storyId}::demo::${demoIndex}`
  return `${storyId}::docs`
}

function navDepthStyle(depth: number) {
  return { '--nav-depth': String(depth) }
}

function navChildrenStyle(parentDepth: number) {
  return { '--parent-depth': String(parentDepth) }
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
    const expandedKeys = ref(getInitialExpandedKeys(tree.value))
    const selectedKey = computed(() =>
      getSelectedKey(props.selectedId, props.selectedSection, props.selectedDemoIndex)
    )

    watch(tree, (nodes) => {
      const nextKeys = new Set(expandedKeys.value)
      getInitialExpandedKeys(nodes).forEach((key) => nextKeys.add(key))
      expandedKeys.value = nextKeys
    })

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

    function renderIcon(kind: 'folder' | 'component' | 'docs' | 'story', expanded = false) {
      const className = ['lego-story-nav-icon', `is-${kind}`]
      let icon

      if (kind === 'folder') {
        icon = expanded ? <FolderExpandedIcon /> : <FolderCollapsedIcon />
      } else if (kind === 'component') {
        icon = <ComponentIcon />
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
      const docsKey = getSelectedKey(story.id, 'docs', 0)

      return (
        <ul class="lego-story-nav-list lego-story-nav-children" style={navChildrenStyle(depth - 1)}>
          <li
            class={[
              'lego-story-nav-node',
              'is-docs',
              selectedKey.value === docsKey && 'is-selected'
            ]}
          >
            <button
              type="button"
              class="lego-story-nav-item"
              style={navDepthStyle(depth)}
              onClick={() => emit('select', { story, section: 'docs' })}
            >
              {renderIcon('docs')}
              <span class="lego-story-nav-label">Docs</span>
            </button>
          </li>
          {story.story.demos.map((demo, index) => {
            const key = getSelectedKey(story.id, 'demo', index)

            return (
              <li
                class={[
                  'lego-story-nav-node',
                  'is-demo',
                  selectedKey.value === key && 'is-selected'
                ]}
              >
                <button
                  type="button"
                  class="lego-story-nav-item"
                  style={navDepthStyle(depth)}
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

      if (node.kind === 'component' && node.story) {
        return (
          <li class={['lego-story-nav-node', 'is-component', expanded && 'is-expanded']}>
            <button
              type="button"
              class="lego-story-nav-item"
              style={navDepthStyle(depth)}
              onClick={() => {
                if (!expanded) toggle(node.key)
                emit('select', { story: node.story!, section: 'docs' })
              }}
            >
              <span
                class="lego-story-nav-caret-wrap"
                onClick={(event) => {
                  event.stopPropagation()
                  toggle(node.key)
                }}
              >
                {renderCaret(expanded)}
              </span>
              {renderIcon('component')}
              <span class="lego-story-nav-label">{node.label}</span>
            </button>
            {expanded ? renderComponentChildren(node.story, depth + 1) : null}
          </li>
        )
      }

      return (
        <li class={['lego-story-nav-node', 'is-directory', expanded && 'is-expanded']}>
          <button
            type="button"
            class="lego-story-nav-group"
            style={navDepthStyle(depth)}
            onClick={() => toggle(node.key)}
          >
            {renderCaret(expanded)}
            {renderIcon('folder', expanded)}
            <span class="lego-story-nav-label">{node.label}</span>
          </button>
          {expanded && node.children.length ? (
            <ul class="lego-story-nav-list lego-story-nav-children" style={navChildrenStyle(depth)}>
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
