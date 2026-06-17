const path = require('node:path')

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/')
}

const sharedSassVariablesPath = normalizePath(
  path.resolve(__dirname, '../shared/src/style/variables.scss')
)

const sharedSassFunctionsPath = normalizePath(
  path.resolve(__dirname, '../shared/src/style/functions.scss')
)

const sharedSassResources = [
  `@use '${sharedSassVariablesPath}' as *;`,
  `@use '${sharedSassFunctionsPath}' as *;`
].join('\n')

const unoConfigFile = path.resolve(__dirname, '../uno.config.ts')

function withSharedSassResources(source, filename = '') {
  const normalizedFilename = normalizePath(filename)
  if (normalizedFilename.includes('/shared/src/style/')) {
    return source
  }
  return `${sharedSassResources}\n${source}`
}

/** workspace 包不走依赖预构建（与 configs/vite.config.base.ts 保持一致）。 */
const legoWorkspaceOptimizeDepsExclude = ['@lego/shared', '@lego/web-ui', '@lego/mobile-ui']

const legoMobileTaroVite = {
  optimizeDeps: {
    exclude: legoWorkspaceOptimizeDepsExclude
  }
}

module.exports = {
  sharedSassVariablesPath,
  sharedSassFunctionsPath,
  sharedSassResources,
  unoConfigFile,
  withSharedSassResources,
  legoMobileTaroVite
}
