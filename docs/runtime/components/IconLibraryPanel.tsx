import { Icon, useDynamicIcons, type IconItem } from '@lego/ui'
import {
  computed,
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
  type PropType,
  type Ref
} from 'vue'

const GRID_GAP_PX = 8
const GRID_MIN_COL_PX = 88
const LAZY_ROWS_PER_CHUNK = 4
const DEFAULT_LIBRARY = 'open-icon'

function gridColumnCount(widthPx: number) {
  if (widthPx <= 0) return 4
  return Math.max(1, Math.floor((widthPx + GRID_GAP_PX) / (GRID_MIN_COL_PX + GRID_GAP_PX)))
}

function formatIconName(libraryId: string, iconId: string) {
  return libraryId === DEFAULT_LIBRARY ? iconId : `@${libraryId}/${iconId}`
}

async function copyToClipboard(text: string) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fallback
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

function useLazyPagination(
  total: Ref<number>,
  batch: Ref<number>,
  scrollRootRef: Ref<HTMLElement | null>
) {
  const visibleCount = ref(0)
  const sentinelRef = ref<HTMLDivElement | null>(null)

  watch(
    [total, batch] as const,
    ([nextTotal, nextBatch], prev) => {
      if (nextTotal <= 0) {
        visibleCount.value = 0
        return
      }
      if (!prev || prev[0] === 0) {
        visibleCount.value = Math.min(nextBatch, nextTotal)
        return
      }
      if (nextTotal < visibleCount.value) {
        visibleCount.value = nextTotal
      }
    },
    { immediate: true }
  )

  let observer: IntersectionObserver | null = null

  function loadMore() {
    const nextTotal = total.value
    const nextBatch = batch.value
    if (visibleCount.value >= nextTotal) return
    visibleCount.value = Math.min(visibleCount.value + nextBatch, nextTotal)
  }

  function bindObserver() {
    observer?.disconnect()
    const sentinel = sentinelRef.value
    const root = scrollRootRef.value
    if (!sentinel) return

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore()
        }
      },
      {
        root: root ?? null,
        rootMargin: '240px',
        threshold: 0
      }
    )
    observer.observe(sentinel)
  }

  watch(
    () => [sentinelRef.value, scrollRootRef.value, total.value, batch.value] as const,
    async () => {
      await nextTick()
      bindObserver()
    },
    { flush: 'post' }
  )

  onUnmounted(() => observer?.disconnect())

  const hasMore = computed(() => visibleCount.value < total.value)

  return { visibleCount, sentinelRef, hasMore }
}

const IconLibraryGrid = defineComponent({
  name: 'IconLibraryGrid',
  props: {
    libraryId: { type: String, required: true },
    icons: { type: Array as PropType<IconItem[]>, required: true },
    scrollRootRef: {
      type: Object as PropType<Ref<HTMLElement | null>>,
      required: true
    },
    copiedName: { type: String, default: '' },
    onCopy: { type: Function as PropType<(value: string) => void>, required: true }
  },
  setup(props) {
    const gridRef = ref<HTMLElement | null>(null)
    const gridWidthPx = ref(0)
    const total = computed(() => props.icons.length)
    const columnCount = computed(() => gridColumnCount(gridWidthPx.value))
    const batch = computed(() => columnCount.value * LAZY_ROWS_PER_CHUNK)
    const { visibleCount, sentinelRef, hasMore } = useLazyPagination(
      total,
      batch,
      props.scrollRootRef
    )

    let resizeObserver: ResizeObserver | null = null

    onMounted(() => {
      const el = gridRef.value
      if (!el) return
      const update = () => {
        gridWidthPx.value = el.getBoundingClientRect().width
      }
      update()
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(update)
        resizeObserver.observe(el)
      }
    })

    onUnmounted(() => resizeObserver?.disconnect())

    return () => {
      const shown = props.icons.slice(0, visibleCount.value)

      return (
        <div class="lego-icon-library__grid-wrap">
          <div ref={gridRef} class="lego-icon-library__grid">
            {shown.map((item) => {
              const stored = formatIconName(props.libraryId, item.id)
              const copied = props.copiedName === stored

              return (
                <button
                  type="button"
                  key={`${props.libraryId}-${item.id}`}
                  class={['lego-icon-library__cell', copied && 'is-copied']}
                  title={`复制 ${stored}`}
                  aria-label={`复制图标 ${stored}`}
                  onClick={() => props.onCopy(stored)}
                >
                  <span class="lego-icon-library__glyph">
                    <Icon name={stored} size={28} />
                  </span>
                  <span class="lego-icon-library__name">{item.id}</span>
                  <span class="lego-icon-library__code">{stored}</span>
                </button>
              )
            })}
          </div>
          {hasMore.value ? (
            <>
              <div ref={sentinelRef} class="lego-icon-library__sentinel" aria-hidden="true" />
              <p class="lego-icon-library__progress">
                已加载 {visibleCount.value} / {props.icons.length}
              </p>
            </>
          ) : null}
        </div>
      )
    }
  }
})

export default defineComponent({
  name: 'IconLibraryPanel',
  setup() {
    const { registeredLibraries, loadLibrary, getIconList } = useDynamicIcons()
    const activeLibraryId = ref(DEFAULT_LIBRARY)
    const searchQuery = ref('')
    const scrollRootRef = ref<HTMLElement | null>(null)
    const librariesReady = ref(false)
    const copiedName = ref('')
    const toastMessage = ref('')
    let toastTimer: ReturnType<typeof setTimeout> | undefined
    let copiedTimer: ReturnType<typeof setTimeout> | undefined

    const iconListCache = new Map<string, ReturnType<typeof getIconList>>()
    function iconsFor(libraryId: string) {
      let list = iconListCache.get(libraryId)
      if (!list) {
        list = getIconList(libraryId)
        iconListCache.set(libraryId, list)
      }
      return list
    }

    onMounted(async () => {
      const ids = registeredLibraries.value.map((item) => item.id)
      await Promise.all(ids.map((id) => loadLibrary(id)))
      librariesReady.value = true
    })

    onUnmounted(() => {
      if (toastTimer) clearTimeout(toastTimer)
      if (copiedTimer) clearTimeout(copiedTimer)
    })

    const searchTrim = computed(() => searchQuery.value.trim().toLowerCase())
    const isSearching = computed(() => searchTrim.value.length > 0)

    const filteredIcons = computed(() => {
      if (!librariesReady.value || !isSearching.value) return []
      const results: Array<{ libraryId: string; icon: IconItem }> = []

      for (const { id } of registeredLibraries.value) {
        for (const icon of iconsFor(id).value) {
          const stored = formatIconName(id, icon.id)
          if (
            icon.id.toLowerCase().includes(searchTrim.value) ||
            stored.toLowerCase().includes(searchTrim.value)
          ) {
            results.push({ libraryId: id, icon })
          }
        }
      }

      return results
    })

    const activeIcons = computed(() => {
      if (isSearching.value) return []
      return iconsFor(activeLibraryId.value).value
    })

    async function handleCopy(value: string) {
      const ok = await copyToClipboard(value)
      copiedName.value = value
      toastMessage.value = ok ? `已复制 ${value}` : '复制失败，请检查浏览器权限'
      if (copiedTimer) clearTimeout(copiedTimer)
      copiedTimer = setTimeout(() => {
        copiedName.value = ''
      }, 1200)
      if (toastTimer) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        toastMessage.value = ''
      }, 2200)
    }

    return () => {
      const libraries = registeredLibraries.value

      return (
        <div class="lego-icon-library">
          <div class="lego-icon-library__toolbar">
            <label class="lego-icon-library__search">
              <span class="lego-icon-library__search-label">搜索</span>
              <input
                type="search"
                value={searchQuery.value}
                placeholder="按图标 id 或完整 name 搜索"
                onInput={(event) => {
                  searchQuery.value = (event.target as HTMLInputElement).value
                }}
              />
            </label>

            {!isSearching.value ? (
              <div class="lego-icon-library__tabs" role="tablist" aria-label="图标库切换">
                {libraries.map(({ id }) => {
                  const active = activeLibraryId.value === id
                  const count = iconsFor(id).value.length
                  return (
                    <button
                      type="button"
                      key={id}
                      role="tab"
                      aria-selected={active}
                      class={['lego-icon-library__tab', active && 'is-active']}
                      onClick={() => {
                        activeLibraryId.value = id
                      }}
                    >
                      <span>{id}</span>
                      <span class="lego-icon-library__tab-count">{count}</span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p class="lego-icon-library__search-meta">
                {!librariesReady.value
                  ? '正在加载图标库…'
                  : filteredIcons.value.length
                    ? `找到 ${filteredIcons.value.length} 个匹配`
                    : '无匹配图标'}
              </p>
            )}
          </div>

          <div ref={scrollRootRef} class="lego-icon-library__body">
            {!librariesReady.value ? (
              <p class="lego-icon-library__empty">正在加载图标库…</p>
            ) : isSearching.value ? (
              filteredIcons.value.length ? (
                <div class="lego-icon-library__grid">
                  {filteredIcons.value.map(({ libraryId, icon }) => {
                    const stored = formatIconName(libraryId, icon.id)
                    const copied = copiedName.value === stored
                    return (
                      <button
                        type="button"
                        key={`${libraryId}-${icon.id}`}
                        class={['lego-icon-library__cell', copied && 'is-copied']}
                        title={`复制 ${stored}`}
                        onClick={() => handleCopy(stored)}
                      >
                        <span class="lego-icon-library__glyph">
                          <Icon name={stored} size={28} />
                        </span>
                        <span class="lego-icon-library__name">{icon.id}</span>
                        <span class="lego-icon-library__code">{stored}</span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p class="lego-icon-library__empty">无匹配图标</p>
              )
            ) : activeIcons.value.length ? (
              <IconLibraryGrid
                libraryId={activeLibraryId.value}
                icons={activeIcons.value}
                scrollRootRef={scrollRootRef}
                copiedName={copiedName.value}
                onCopy={handleCopy}
              />
            ) : (
              <p class="lego-icon-library__empty">暂无图标</p>
            )}
          </div>

          {toastMessage.value ? (
            <div class="lego-icon-library__toast" role="status">
              {toastMessage.value}
            </div>
          ) : null}
        </div>
      )
    }
  }
})
