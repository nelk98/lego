import linearIconConfig from './libs/linear.json'
import openIconConfig from './libs/open-icon.json'
import solidIconConfig from './libs/solid.json'
import type { IconFontConfig, IconLibraryMap } from './types'

const BUNDLED_ICON_LIBRARY_PREFIX = 'lego-icon:'

const bundledIconLibraryConfigs = {
  linear: linearIconConfig,
  'open-icon': openIconConfig,
  solid: solidIconConfig
} satisfies Record<string, IconFontConfig>

export const ICON_LIBRARY_MAP: IconLibraryMap = {
  linear: `${BUNDLED_ICON_LIBRARY_PREFIX}linear`,
  'open-icon': `${BUNDLED_ICON_LIBRARY_PREFIX}open-icon`,
  solid: `${BUNDLED_ICON_LIBRARY_PREFIX}solid`
}

export function getBundledIconLibraryConfig(url: string): IconFontConfig | null {
  if (!url.startsWith(BUNDLED_ICON_LIBRARY_PREFIX)) return null
  const libraryId = url.slice(BUNDLED_ICON_LIBRARY_PREFIX.length)
  return bundledIconLibraryConfigs[libraryId as keyof typeof bundledIconLibraryConfigs] ?? null
}
