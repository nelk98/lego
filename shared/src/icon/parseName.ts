import type { ParsedIconName } from './types'

export function parseIconName(name: string, library?: string): ParsedIconName {
  if (name.startsWith('@') && name.includes('/')) {
    const [libraryId, iconId] = name.slice(1).split('/', 2)
    return {
      library: libraryId || 'open-icon',
      iconId: iconId || name
    }
  }

  return {
    library: library || 'open-icon',
    iconId: name
  }
}
