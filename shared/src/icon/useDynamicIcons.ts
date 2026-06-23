import { computed, shallowRef } from 'vue'
import {
  getCachedConfig,
  getLibraryMapRef,
  getLibraryUrl,
  loadLibraryConfig,
  registerLibraries as registerLibrariesRegistry
} from './registry'
import type { IconFontConfig, IconItem, IconLibraryInfo, IconLibraryMap } from './types'

const libraryConfigRefs = new Map<string, ReturnType<typeof shallowRef<IconFontConfig | null>>>()

function getOrCreateConfigRef(libraryId: string) {
  let configRef = libraryConfigRefs.get(libraryId)
  if (!configRef) {
    configRef = shallowRef<IconFontConfig | null>(null)
    libraryConfigRefs.set(libraryId, configRef)
  }
  return configRef
}

export interface UseDynamicIconsOptions {
  libraryMap?: IconLibraryMap
}

export interface UseDynamicIconsReturn {
  registeredLibraries: import('vue').ComputedRef<Array<{ id: string; url: string }>>
  registerLibraries: (map: IconLibraryMap) => void
  getLibraryInfo: (libraryId: string) => import('vue').ComputedRef<IconLibraryInfo | null>
  getIconList: (libraryId: string) => import('vue').ComputedRef<IconItem[]>
  loadLibrary: (libraryId: string) => Promise<boolean>
  isLibraryLoaded: (libraryId: string) => boolean
}

export function useDynamicIcons(options?: UseDynamicIconsOptions): UseDynamicIconsReturn {
  if (options?.libraryMap) {
    registerLibrariesRegistry(options.libraryMap)
  }

  const loadingPromises = new Map<string, Promise<boolean>>()
  const libraryMapRef = getLibraryMapRef()

  const registeredLibraries = computed(() =>
    Object.entries(libraryMapRef.value).map(([id, url]) => ({
      id,
      url
    }))
  )

  function registerLibraries(map: IconLibraryMap) {
    registerLibrariesRegistry(map)
  }

  async function loadLibrary(libraryId: string): Promise<boolean> {
    const url = getLibraryUrl(libraryId)
    if (!url) return false

    const configRef = getOrCreateConfigRef(libraryId)
    const cached = getCachedConfig(url)
    if (cached) {
      configRef.value = cached
      return true
    }

    let promise = loadingPromises.get(libraryId)
    if (promise) return promise

    promise = (async () => {
      try {
        const config = await loadLibraryConfig(url)
        if (!config) return false
        configRef.value = config
        return true
      } finally {
        loadingPromises.delete(libraryId)
      }
    })()

    loadingPromises.set(libraryId, promise)
    return promise
  }

  function isLibraryLoaded(libraryId: string): boolean {
    const url = getLibraryUrl(libraryId)
    return url ? !!getCachedConfig(url) : false
  }

  function getLibraryInfo(libraryId: string) {
    const configRef = getOrCreateConfigRef(libraryId)
    const url = getLibraryUrl(libraryId)
    if (url && !getCachedConfig(url)) {
      loadLibrary(libraryId).catch(() => undefined)
    }

    return computed<IconLibraryInfo | null>(() => {
      const libraryUrl = getLibraryUrl(libraryId)
      if (!libraryUrl) return null

      const config = configRef.value ?? getCachedConfig(libraryUrl)
      return {
        id: libraryId,
        url: libraryUrl,
        family: config?.font.family,
        iconCount: config?.icons.length,
        loaded: !!config
      }
    })
  }

  function getIconList(libraryId: string) {
    const configRef = getOrCreateConfigRef(libraryId)
    const url = getLibraryUrl(libraryId)
    if (url && !getCachedConfig(url)) {
      loadLibrary(libraryId).catch(() => undefined)
    }

    return computed<IconItem[]>(() => {
      const libraryUrl = getLibraryUrl(libraryId)
      if (!libraryUrl) return []

      const config = configRef.value ?? getCachedConfig(libraryUrl)
      return config?.icons ?? []
    })
  }

  return {
    registeredLibraries,
    registerLibraries,
    getLibraryInfo,
    getIconList,
    loadLibrary,
    isLibraryLoaded
  }
}
