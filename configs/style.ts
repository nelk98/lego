import { fileURLToPath } from 'node:url'

function normalizePath(path: string) {
  return path.replace(/\\/g, '/')
}

export const sharedSassVariablesPath = normalizePath(
  fileURLToPath(new URL('../shared/src/style/variables.scss', import.meta.url))
)

export const sharedSassFunctionsPath = normalizePath(
  fileURLToPath(new URL('../shared/src/style/functions.scss', import.meta.url))
)

export const sharedSassResources = [
  `@use '${sharedSassVariablesPath}' as *;`,
  `@use '${sharedSassFunctionsPath}' as *;`
].join('\n')

export const unoConfigFile = fileURLToPath(new URL('../uno.config.ts', import.meta.url))

export function withSharedSassResources(source: string, filename = '') {
  const normalizedFilename = normalizePath(filename)
  if (normalizedFilename.includes('/shared/src/style/')) {
    return source
  }
  return `${sharedSassResources}\n${source}`
}
