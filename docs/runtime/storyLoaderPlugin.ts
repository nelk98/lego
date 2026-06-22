import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ViteDevServer } from 'vite'

const virtualModuleId = 'virtual:lego-stories'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

export interface StoryLoaderPluginOptions {
  storiesDir: string
}

function normalizePath(filePath: string) {
  return filePath.split(path.sep).join('/')
}

function isStoryFile(filePath: string) {
  return filePath.endsWith('.story.tsx')
}

function isStoryAsset(filePath: string) {
  return isStoryFile(filePath) || filePath.endsWith('.md')
}

function scanStories(storiesDir: string): string[] {
  if (!fs.existsSync(storiesDir)) {
    return []
  }

  const files: string[] = []
  const visit = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
        continue
      }
      if (entry.isFile() && isStoryFile(fullPath)) {
        files.push(fullPath)
      }
    }
  }

  visit(storiesDir)
  return files.sort((left, right) => left.localeCompare(right))
}

function createStoryId(storiesDir: string, filePath: string) {
  const relativePath = normalizePath(path.relative(storiesDir, filePath))
  return relativePath.replace(/\.story\.tsx$/, '').replace(/\/index$/, '') || 'index'
}

function createVirtualModuleCode(storiesDir: string) {
  const files = scanStories(storiesDir)
  const imports = files
    .map(
      (file, index) => `import story${index} from ${JSON.stringify(`/@fs/${normalizePath(file)}`)}`
    )
    .join('\n')
  const records = files
    .map((file, index) => {
      const relativePath = normalizePath(path.relative(storiesDir, file))
      return `  { id: ${JSON.stringify(createStoryId(storiesDir, file))}, path: ${JSON.stringify(
        relativePath
      )}, story: story${index} }`
    })
    .join(',\n')

  return `${imports}

export default [
${records}
]
`
}

function reloadStories(server: ViteDevServer) {
  const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
  if (module) {
    server.moduleGraph.invalidateModule(module)
  }
  server.ws.send({ type: 'full-reload' })
}

export function createStoryLoaderPlugin(options: StoryLoaderPluginOptions): Plugin {
  const storiesDir = path.resolve(options.storiesDir)

  return {
    name: 'lego-story-loader',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return undefined
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return createVirtualModuleCode(storiesDir)
      }
      return undefined
    },
    buildStart() {
      for (const file of scanStories(storiesDir)) {
        this.addWatchFile(file)
      }
    },
    configureServer(server) {
      server.watcher.add(storiesDir)
      server.watcher.on('add', (file) => {
        if (file.startsWith(storiesDir) && isStoryAsset(file)) {
          reloadStories(server)
        }
      })
      server.watcher.on('unlink', (file) => {
        if (file.startsWith(storiesDir) && isStoryAsset(file)) {
          reloadStories(server)
        }
      })
    },
    handleHotUpdate(context) {
      if (context.file.startsWith(storiesDir) && isStoryAsset(context.file)) {
        reloadStories(context.server)
        return []
      }
      return undefined
    }
  }
}
