export type PathSegment = string | number

/**
 * 将字段路径解析为可遍历的片段。
 *
 * 支持 `user.name` 和 `items[0].name` 两种常见写法。核心运行时只处理
 * path，不关心字段来自对象还是数组，这样 renderer 和低代码编辑器都能复用。
 */
export function parsePath(path: string): PathSegment[] {
  const segments: PathSegment[] = []
  const pattern = /[^.[\]]+|\[(\d+)\]/g
  let match: RegExpExecArray | null

  while ((match = pattern.exec(path))) {
    const bracketIndex = match[1]
    const raw = match[0]
    segments.push(bracketIndex === undefined ? raw : Number(bracketIndex))
  }

  return segments
}

/**
 * 拼接父子字段路径。
 *
 * 子字段以 `[0]` 开头时表示数组下标，不额外插入 `.`。
 */
export function joinPath(parent: string | undefined, child: string): string {
  if (!parent) return child
  if (!child) return parent
  if (child.startsWith('[')) return `${parent}${child}`
  return `${parent}.${child}`
}

/** 判断值是否是普通对象；数组和 null 都不算。 */
export function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 递归克隆 values/schema 中的普通数据。
 *
 * 这里不使用 structuredClone，是为了避免函数、RegExp 等工程态 schema 能力
 * 被浏览器原生克隆限制卡住。函数会按引用保留。
 */
export function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T

  if (isObjectLike(value)) {
    const output: Record<string, unknown> = {}
    Object.keys(value).forEach((key) => {
      output[key] = cloneValue(value[key])
    })
    return output as T
  }

  return value
}

/** 按字段路径读取值，路径不存在时返回 undefined。 */
export function getIn(source: unknown, path: string): unknown {
  if (!path) return source

  let current = source

  for (const segment of parsePath(path)) {
    if (current == null) return undefined
    current = (current as Record<string | number, unknown>)[segment]
  }

  return current
}

/** 判断字段路径是否真实存在，区别于值刚好是 undefined。 */
export function hasIn(source: unknown, path: string): boolean {
  if (!path) return true

  let current = source

  for (const segment of parsePath(path)) {
    if (current == null) return false
    if (!(segment in Object(current))) return false
    current = (current as Record<string | number, unknown>)[segment]
  }

  return true
}

/**
 * 按字段路径写入值。
 *
 * 中间对象不存在时会自动创建；下一个片段是数字时创建数组，否则创建对象。
 */
export function setIn<T extends Record<string, unknown>>(
  source: T,
  path: string,
  value: unknown
): T {
  const segments = parsePath(path)
  if (!segments.length) return source

  let current: Record<string | number, unknown> = source

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1

    if (isLast) {
      current[segment] = value
      return
    }

    const nextSegment = segments[index + 1]
    const nextValue = current[segment]

    if (nextValue == null || typeof nextValue !== 'object') {
      current[segment] = typeof nextSegment === 'number' ? [] : {}
    }

    current = current[segment] as Record<string | number, unknown>
  })

  return source
}

/** 删除某个字段路径上的值；父级空对象不会自动清理。 */
export function unsetIn(source: Record<string, unknown>, path: string): void {
  const segments = parsePath(path)
  if (!segments.length) return

  let current: Record<string | number, unknown> | undefined = source

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]
    if (segment === undefined || current == null) return

    const next = current[segment]
    if (next == null || typeof next !== 'object') return
    current = next as Record<string | number, unknown>
  }

  const last = segments[segments.length - 1]
  if (current && last !== undefined) delete current[last]
}

/**
 * 面向 schema patch 的深合并。
 *
 * 普通对象递归合并，数组按整体替换处理，避免 rules/options 等数组被意外按索引合并。
 */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (Array.isArray(base) || Array.isArray(patch)) {
    return cloneValue(patch === undefined ? base : patch) as T
  }

  if (!isObjectLike(base) || !isObjectLike(patch)) {
    return cloneValue(patch === undefined ? base : patch) as T
  }

  const output: Record<string, unknown> = cloneValue(base)

  Object.keys(patch).forEach((key) => {
    if (key in output) {
      output[key] = deepMerge(output[key], patch[key])
      return
    }

    output[key] = cloneValue(patch[key])
  })

  return output as T
}

/** 只比较对象第一层，用于避免明显无效的状态通知。 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (!isObjectLike(a) || !isObjectLike(b)) return false

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  return aKeys.every((key) => Object.is(a[key], b[key]))
}
