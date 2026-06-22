import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  shallowRef,
  watch,
  type Component
} from 'vue'
import ScrollView from '@lego/web-ui/scroll-view'
import { getStoryRecords } from '../storyLoader'
import type { StoryDemo, StoryPlatform, StoryRecord } from '../types'
import DemoRenderer from './DemoRenderer'
import JsonPropsEditor from './JsonPropsEditor'
import PreviewContainer, { type StoryViewport } from './PreviewContainer'
import SourceViewer from './SourceViewer'
import StoryNav, { type StoryNavSection, type StoryNavTarget } from './StoryNav'

type ScrollViewInstance = {
  scrollTo: (options?: ScrollToOptions) => void
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value ?? {}))
}

function getDemoProps(demo: StoryDemo | undefined) {
  return cloneJson((demo?.props ?? {}) as Record<string, unknown>)
}

function getStoryName(story: StoryRecord | undefined) {
  return story?.title.split('/').filter(Boolean).at(-1) ?? '组件演练场'
}

function getStoryGroup(story: StoryRecord | undefined) {
  const parts = story?.title.split('/').filter(Boolean) ?? []
  return parts.slice(0, -1).join(' / ') || 'Component'
}

function toDomId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '-')
}

export default defineComponent({
  name: 'StoryLayout',
  setup() {
    const stories = shallowRef<StoryRecord[]>(getStoryRecords())
    const selectedStoryId = ref(stories.value[0]?.id ?? '')
    const selectedDemoIndex = ref(0)
    const selectedSection = ref<StoryNavSection>('docs')
    const viewport = ref<StoryViewport>('desktop')
    const activeProps = ref<Record<string, unknown>>({})
    const docsComponent = shallowRef<Component | null>(null)
    const docsError = ref('')
    const contentScrollRef = ref<ScrollViewInstance>()
    const activeOutlineKey = ref('docs')
    let hasMounted = false
    let docsLoadId = 0

    const currentStory = computed(() => {
      return stories.value.find((story) => story.id === selectedStoryId.value) ?? stories.value[0]
    })

    const demos = computed(() => currentStory.value?.story.demos ?? [])

    const currentDemo = computed(() => {
      return demos.value[selectedDemoIndex.value] ?? demos.value[0]
    })

    const currentPlatform = computed<StoryPlatform>(() => {
      return currentStory.value?.story.platform ?? 'web'
    })

    const storyDomId = computed(() => toDomId(currentStory.value?.id ?? 'story'))

    function getDocsId() {
      return `${storyDomId.value}-docs`
    }

    function getExamplesId() {
      return `${storyDomId.value}-examples`
    }

    function getDemoId(index: number) {
      return `${storyDomId.value}-demo-${index}`
    }

    function syncUrl() {
      if (!hasMounted || typeof window === 'undefined' || !currentStory.value) {
        return
      }

      const url = new URL(window.location.href)
      url.searchParams.set('story', currentStory.value.id)
      url.searchParams.set('view', selectedSection.value)
      if (selectedSection.value === 'demo') {
        url.searchParams.set('demo', String(selectedDemoIndex.value))
      } else {
        url.searchParams.delete('demo')
      }
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }

    function scrollContentToTop(behavior: ScrollBehavior = 'smooth') {
      contentScrollRef.value?.scrollTo({ top: 0, behavior })
    }

    async function selectDemo(index: number) {
      selectedDemoIndex.value = index
      selectedSection.value = 'demo'
      await nextTick()
      scrollContentToTop()
    }

    async function selectDocsOutline(targetId: string) {
      selectedSection.value = 'docs'
      activeOutlineKey.value = targetId
      await nextTick()

      if (targetId === 'docs') {
        scrollContentToTop()
        return
      }

      document.getElementById(targetId)?.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
      })
    }

    async function selectNavTarget(target: StoryNavTarget) {
      selectedStoryId.value = target.story.id
      selectedSection.value = target.section

      if (target.section === 'demo') {
        selectedDemoIndex.value = target.demoIndex ?? 0
        activeOutlineKey.value = ''
      } else {
        selectedDemoIndex.value = 0
        activeOutlineKey.value = 'docs'
      }

      await nextTick()
      scrollContentToTop()
    }

    watch(
      currentDemo,
      (demo) => {
        activeProps.value = getDemoProps(demo)
      },
      { immediate: true }
    )

    watch(
      demos,
      (items) => {
        if (items.length && selectedDemoIndex.value >= items.length) {
          selectedDemoIndex.value = 0
        }
      },
      { immediate: true }
    )

    watch(
      currentStory,
      (story) => {
        if (story?.story.platform === 'mobile') {
          viewport.value = 'mobile'
        }
      },
      { immediate: true }
    )

    watch(
      currentStory,
      async (story) => {
        const loadId = ++docsLoadId
        docsComponent.value = null
        docsError.value = ''

        if (!story?.story.docs) {
          return
        }

        try {
          const module = await story.story.docs()
          if (loadId === docsLoadId) {
            docsComponent.value = module.default ?? module
          }
        } catch (error) {
          if (loadId === docsLoadId) {
            docsError.value = error instanceof Error ? error.message : String(error)
          }
        }
      },
      { immediate: true }
    )

    watch([selectedStoryId, selectedDemoIndex, selectedSection], syncUrl)

    onMounted(() => {
      hasMounted = true
      const url = new URL(window.location.href)
      const storyParam = url.searchParams.get('story')
      const demoParam = Number(url.searchParams.get('demo'))
      const viewParam = url.searchParams.get('view')
      const story = stories.value.find(
        (item) => item.id === storyParam || item.title === storyParam
      )

      if (story) {
        selectedStoryId.value = story.id
      }
      if (Number.isInteger(demoParam) && demoParam >= 0) {
        selectedDemoIndex.value = demoParam
      }
      if (viewParam === 'docs' || viewParam === 'demo') {
        selectedSection.value = viewParam
      } else if (url.searchParams.has('demo') && Number.isInteger(demoParam)) {
        selectedSection.value = 'demo'
      }

      syncUrl()
    })

    function renderDocsContent() {
      return (
        <section id={getDocsId()} class="lego-story-docs">
          {docsError.value ? (
            <div class="lego-docs-error">{docsError.value}</div>
          ) : docsComponent.value ? (
            h(docsComponent.value)
          ) : (
            <p class="lego-story-muted">当前 story 暂无 Markdown 文档。</p>
          )}
        </section>
      )
    }

    function renderDocsExamples() {
      return (
        <section id={getExamplesId()} class="lego-docs-examples">
          <div class="lego-docs-section-heading">
            <span>Examples</span>
            <span>{demos.value.length} demos</span>
          </div>
          {demos.value.map((item, index) => (
            <article id={getDemoId(index)} class="lego-docs-example">
              <header class="lego-docs-example-header">
                <div>
                  <h2>{item.name}</h2>
                  {item.description ? <p>{item.description}</p> : null}
                </div>
                <button
                  type="button"
                  class="lego-docs-example-action"
                  onClick={() => selectDemo(index)}
                >
                  调试此示例
                </button>
              </header>

              <section class="lego-demo-workbench is-documentation">
                <PreviewContainer viewport={viewport.value}>
                  <DemoRenderer
                    demo={item}
                    propsValue={getDemoProps(item)}
                    platform={currentPlatform.value}
                  />
                </PreviewContainer>
                <SourceViewer demo={item} />
              </section>
            </article>
          ))}
        </section>
      )
    }

    function renderDemoWorkbench(demo: StoryDemo | undefined) {
      return (
        <section class="lego-demo-workbench is-single">
          {demo?.description ? (
            <div class="lego-demo-summary">
              <div class="lego-demo-summary-title">{demo.name}</div>
              <p>{demo.description}</p>
            </div>
          ) : null}

          <PreviewContainer viewport={viewport.value}>
            <DemoRenderer
              demo={demo}
              propsValue={activeProps.value}
              platform={currentPlatform.value}
            />
          </PreviewContainer>

          <SourceViewer demo={demo} />
        </section>
      )
    }

    function renderOutline() {
      const outlineItems = [
        { key: 'docs', label: '使用文档', targetId: 'docs' },
        { key: 'examples', label: 'Examples', targetId: getExamplesId() },
        ...demos.value.map((item, index) => ({
          key: `demo-${index}`,
          label: item.name,
          targetId: getDemoId(index)
        }))
      ]

      return (
        <section class="lego-outline-panel">
          <div class="lego-panel-heading">On this page</div>
          <nav class="lego-outline-list" aria-label="当前页面大纲">
            {outlineItems.map((item) => (
              <button
                type="button"
                class={[
                  'lego-outline-item',
                  activeOutlineKey.value === item.targetId && 'is-active'
                ]}
                onClick={() => selectDocsOutline(item.targetId)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </section>
      )
    }

    function renderInspector() {
      if (selectedSection.value === 'docs') {
        return renderOutline()
      }

      return (
        <JsonPropsEditor
          modelValue={activeProps.value}
          {...{
            'onUpdate:modelValue': (value: Record<string, unknown>) => {
              activeProps.value = value
            }
          }}
        />
      )
    }

    return () => {
      const story = currentStory.value
      const demo = currentDemo.value
      const isDocs = selectedSection.value === 'docs'

      return (
        <div class="lego-story-shell">
          <div class={['lego-story-body', isDocs ? 'is-docs-view' : 'is-demo-view']}>
            <aside class="lego-story-sidebar">
              <ScrollView class="lego-story-scroll lego-story-sidebar-scroll" trigger="hover">
                <StoryNav
                  stories={stories.value}
                  selectedId={story?.id ?? ''}
                  selectedSection={selectedSection.value}
                  selectedDemoIndex={selectedDemoIndex.value}
                  onSelect={selectNavTarget}
                />
              </ScrollView>
            </aside>

            <ScrollView
              ref={contentScrollRef}
              class="lego-story-scroll lego-story-content-scroll"
              trigger="hover"
            >
              <main class="lego-story-content">
                <header class={['lego-story-header', isDocs ? 'is-docs' : 'is-demo']}>
                  <div>
                    <div class="lego-story-kicker">
                      {isDocs ? getStoryGroup(story) : story?.title}
                    </div>
                    <h1>{isDocs ? getStoryName(story) : (demo?.name ?? getStoryName(story))}</h1>
                    {!isDocs && demo?.description ? (
                      <p class="lego-story-subtitle">{demo.description}</p>
                    ) : null}
                  </div>
                </header>

                {isDocs ? (
                  <>
                    {renderDocsContent()}
                    {renderDocsExamples()}
                  </>
                ) : (
                  renderDemoWorkbench(demo)
                )}
              </main>
            </ScrollView>

            <aside class="lego-story-inspector">
              <ScrollView class="lego-story-scroll lego-story-inspector-scroll" trigger="hover">
                <div class="lego-story-inspector-inner">{renderInspector()}</div>
              </ScrollView>
            </aside>
          </div>
        </div>
      )
    }
  }
})
