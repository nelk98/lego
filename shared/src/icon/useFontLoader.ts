import { ref, shallowRef } from 'vue'
import { codeToChar, getCachedConfig, loadLibraryConfig } from './registry'
import type { IconFontConfig } from './types'

export function useFontLoader(getConfigUrl: () => string) {
  const config = shallowRef<IconFontConfig | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  let lastLoadedUrl = ''

  async function load() {
    const url = getConfigUrl()
    if (!url) return null
    if (config.value && lastLoadedUrl === url) return config.value

    const cached = getCachedConfig(url)
    if (cached) {
      config.value = cached
      lastLoadedUrl = url
      return cached
    }

    if (lastLoadedUrl !== url) {
      config.value = null
    }

    loading.value = true
    error.value = null

    try {
      const data = await loadLibraryConfig(url)
      if (data) {
        config.value = data
        lastLoadedUrl = url
      }
      return data
    } catch (reason) {
      error.value = reason instanceof Error ? reason : new Error(String(reason))
      throw error.value
    } finally {
      loading.value = false
    }
  }

  function getIconChar(iconId: string): string {
    const icon = config.value?.icons.find((item) => item.id === iconId)
    return icon ? codeToChar(icon.code) : ''
  }

  function getIconCode(iconId: string): string {
    const icon = config.value?.icons.find((item) => item.id === iconId)
    return icon?.code ?? ''
  }

  return { config, loading, error, load, getIconChar, getIconCode, codeToChar }
}
