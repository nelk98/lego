/**
 * 与 `shared/src/style/a.scss` 中 `$_rgb-channel-tokens` 的键保持一致（用于展示页枚举）。
 */
export const PALETTE_TOKEN_NAMES = [
  'white',
  'black',
  'primary-50',
  'primary-100',
  'primary-200',
  'primary-300',
  'primary-400',
  'primary-500',
  'primary-600',
  'primary-700',
  'primary-800',
  'primary-900',
  'neutral-50',
  'neutral-100',
  'neutral-200',
  'neutral-300',
  'neutral-400',
  'neutral-500',
  'neutral-600',
  'neutral-700',
  'neutral-800',
  'neutral-900',
  'neutral-950',
  'neutral-1000',
  'green-50',
  'green-100',
  'green-200',
  'green-300',
  'green-400',
  'green-500',
  'green-600',
  'green-700',
  'green-800',
  'green-900',
  'yellow-50',
  'yellow-100',
  'yellow-200',
  'yellow-300',
  'yellow-400',
  'yellow-500',
  'yellow-600',
  'yellow-700',
  'yellow-800',
  'yellow-900',
  'blue-50',
  'blue-100',
  'blue-200',
  'blue-300',
  'blue-400',
  'blue-500',
  'blue-600',
  'blue-700',
  'blue-800',
  'blue-900',
  'lake-blue-50',
  'lake-blue-100',
  'lake-blue-200',
  'lake-blue-300',
  'lake-blue-400',
  'lake-blue-500',
  'lake-blue-600',
  'lake-blue-700',
  'lake-blue-800',
  'lake-blue-900',
  'dark-blue-50',
  'dark-blue-100',
  'dark-blue-200',
  'dark-blue-300',
  'dark-blue-400',
  'dark-blue-500',
  'dark-blue-600',
  'dark-blue-700',
  'dark-blue-800',
  'dark-blue-900',
  'purple-50',
  'purple-100',
  'purple-200',
  'purple-300',
  'purple-400',
  'purple-500',
  'purple-600',
  'purple-700',
  'purple-800',
  'purple-900',
  'cyan-50',
  'cyan-100',
  'cyan-200',
  'cyan-300',
  'cyan-400',
  'cyan-500',
  'cyan-600',
  'cyan-700',
  'cyan-800',
  'cyan-900',
  'light-green-50',
  'light-green-100',
  'light-green-200',
  'light-green-300',
  'light-green-400',
  'light-green-500',
  'light-green-600',
  'light-green-700',
  'light-green-800',
  'light-green-900',
  'orange-red-50',
  'orange-red-100',
  'orange-red-200',
  'orange-red-300',
  'orange-red-400',
  'orange-red-500',
  'orange-red-600',
  'orange-red-700',
  'orange-red-800',
  'orange-red-900',
  'red-50',
  'red-100',
  'red-200',
  'red-300',
  'red-400',
  'red-500',
  'red-600',
  'red-700',
  'red-800',
  'red-900',
  'orange-50',
  'orange-100',
  'orange-200',
  'orange-300',
  'orange-400',
  'orange-500',
  'orange-600',
  'orange-700',
  'orange-800',
  'orange-900',
  'gold-50',
  'gold-100',
  'gold-200',
  'gold-300',
  'gold-400',
  'gold-500',
  'gold-600',
  'gold-700',
  'gold-800',
  'gold-900',
  'dark-50',
  'dark-100',
  'dark-200'
] as const

export type PaletteTokenName = (typeof PALETTE_TOKEN_NAMES)[number]

const FAMILY_ORDER = [
  'base',
  'primary',
  'neutral',
  'green',
  'yellow',
  'blue',
  'lake-blue',
  'dark-blue',
  'purple',
  'cyan',
  'light-green',
  'orange-red',
  'red',
  'orange',
  'gold',
  'dark'
] as const

function shadeSortKey(name: string): number {
  const m = name.match(/-(\d+)$/)
  return m?.[1] != null ? parseInt(m[1], 10) : 0
}

export function groupPaletteByFamily(
  names: readonly string[]
): { family: string; tokens: string[] }[] {
  const map = new Map<string, string[]>()
  for (const name of names) {
    const m = name.match(/^(.+)-(\d+)$/)
    const family = m?.[1] ?? 'base'
    const list = map.get(family) ?? []
    list.push(name)
    map.set(family, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => shadeSortKey(a) - shadeSortKey(b))
  }

  const ordered: { family: string; tokens: string[] }[] = []
  for (const f of FAMILY_ORDER) {
    const tokens = map.get(f)
    if (tokens?.length) {
      ordered.push({ family: f, tokens })
      map.delete(f)
    }
  }
  const rest = [...map.keys()].sort()
  for (const family of rest) {
    const tokens = map.get(family)
    if (tokens?.length) {
      ordered.push({ family, tokens })
    }
  }
  return ordered
}
