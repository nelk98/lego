import { ref } from 'vue'
import { ICON_LIBRARY_MAP, getBundledIconLibraryConfig } from './config'
import type { IconConfigRequest, IconFontConfig, IconFontFaceLoader, IconLibraryMap } from './types'

let customRequest: IconConfigRequest | null = null
let customFontFaceLoader: IconFontFaceLoader | null = null

const configCache = new Map<string, IconFontConfig>()
const fontLoaded = new Set<string>()
const loadPromises = new Map<string, Promise<IconFontConfig | null>>()
const libraryMapRef = ref<IconLibraryMap>({ ...ICON_LIBRARY_MAP })

const libraryAliasMap: Record<string, string> = {
  'linear-icon': 'linear',
  'line-icon': 'linear',
  'solid-icon': 'solid'
}

export function setIconConfigRequest(fn: IconConfigRequest | null) {
  customRequest = fn
}

export function setIconFontFaceLoader(fn: IconFontFaceLoader | null) {
  customFontFaceLoader = fn
}

function syncLibraryMap() {
  libraryMapRef.value = { ...ICON_LIBRARY_MAP }
}

export function registerLibraries(map: IconLibraryMap) {
  Object.assign(ICON_LIBRARY_MAP, map)
  syncLibraryMap()
}

export function getLibraryMap(): IconLibraryMap {
  return ICON_LIBRARY_MAP
}

export function getLibraryMapRef() {
  return libraryMapRef
}

export function getLibraryUrl(libraryId: string): string {
  const resolvedLibraryId = libraryAliasMap[libraryId] || libraryId
  return ICON_LIBRARY_MAP[resolvedLibraryId] || libraryMapRef.value[resolvedLibraryId] || ''
}

function resolveIconConfigUrl(url: string): string {
  if (typeof window !== 'undefined' && url.startsWith('/')) {
    return `${window.location.origin}${url}`
  }
  return url
}

function injectFontFaceBrowser(config: IconFontConfig): boolean {
  if (typeof document === 'undefined') return false

  const { family, urls } = config.font
  const id = `lego-icon-font-${family}`
  if (document.getElementById(id)) return true

  const sources: string[] = []
  if (urls.woff2) sources.push(`url('${urls.woff2}') format('woff2')`)
  if (urls.woff) sources.push(`url('${urls.woff}') format('woff')`)
  if (urls.ttf) sources.push(`url('${urls.ttf}') format('truetype')`)
  if (!sources.length) return false

  const style = document.createElement('style')
  style.id = id
  style.textContent = `@font-face{font-family:'${family}';src:${sources.join(',')};}`
  document.head.appendChild(style)
  return true
}

async function ensureFontLoaded(config: IconFontConfig) {
  const { family } = config.font
  if (fontLoaded.has(family)) return

  if (customFontFaceLoader) {
    const handled = await customFontFaceLoader(config)
    if (handled !== false) {
      fontLoaded.add(family)
      return
    }
  }

  if (injectFontFaceBrowser(config)) {
    fontLoaded.add(family)
  }
}

async function requestIconConfig(url: string): Promise<IconFontConfig | null> {
  if (customRequest) {
    return (await customRequest(url)) as IconFontConfig
  }

  if (typeof fetch !== 'function') return null

  const response = await fetch(url)
  if (!response.ok) return null
  return (await response.json()) as IconFontConfig
}

export async function loadLibraryConfig(url: string): Promise<IconFontConfig | null> {
  if (!url) return null
  if (configCache.has(url)) return configCache.get(url)!

  let promise = loadPromises.get(url)
  if (promise) return promise

  promise = (async () => {
    try {
      const resolvedUrl = resolveIconConfigUrl(url)
      const config = getBundledIconLibraryConfig(url) ?? (await requestIconConfig(resolvedUrl))
      if (!config) return null

      configCache.set(url, config)
      await ensureFontLoaded(config)
      return config
    } catch {
      return null
    } finally {
      loadPromises.delete(url)
    }
  })()

  loadPromises.set(url, promise)
  return promise
}

export function getCachedConfig(url: string): IconFontConfig | null {
  return configCache.get(url) ?? null
}

export function normalizeIconCodeHex(code: string): string {
  if (!code) return ''
  return code.trim().replace(/^\\+/, '')
}

export function codeToChar(code: string): string {
  const hex = normalizeIconCodeHex(code)
  if (!/^[0-9a-fA-F]+$/.test(hex)) return ''

  const codePoint = Number.parseInt(hex, 16)
  return Number.isNaN(codePoint) ? '' : String.fromCharCode(codePoint)
}

export function cssIconContentVarFromCode(code: string): string {
  const hex = normalizeIconCodeHex(code)
  if (!hex) return ''

  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    return `'${code.replace(/'/g, "\\'")}'`
  }

  return `'\\${hex}'`
}
