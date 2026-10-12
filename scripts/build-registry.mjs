import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * @typedef {Object} PluginMeta
 * @property {string} name
 * @property {string} displayName
 * @property {string} description
 * @property {string} [category]
 * @property {string[]} [keywords]
 * @property {{name?: string, url?: string}} [author]
 * @property {string} [repository]
 * @property {{type?: string, value?: string}} [icon]
 * @property {boolean} verified
 * @property {{type?: string, url?: string}} [source]
 * @property {string} [readme]
 * @property {string} [updatedAt]
 */

/**
 * Read the plugin JSON file in the specified directory
 */
function readPluginsFromDir(dir, verified) {
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  const plugins = []

  for (const file of files) {
    const filePath = path.join(dir, file)
    try {
      const plugin = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      plugin.verified = verified
      plugin.updatedAt = plugin.updatedAt || new Date().toISOString()
      plugins.push(plugin)
    } catch (err) {
      console.error(`❌ Failed to parse ${filePath}:`, err)
    }
  }

  return plugins
}

/**
 * Main construction function
 */
function buildRegistry() {
  const rootDir = path.resolve(__dirname, '..')
  const officialDir = path.join(rootDir, 'official')
  const partnerDir = path.join(rootDir, 'partner')
  const communityDir = path.join(rootDir, 'community')
  const outputDir = path.join(rootDir, 'plugins')
  const outputFile = path.join(outputDir, 'index.json')

  const officialPlugins = readPluginsFromDir(officialDir, true)
  const partnerPlugins = readPluginsFromDir(partnerDir, false)
  const communityPlugins = readPluginsFromDir(communityDir, false)
  const allPlugins = [...officialPlugins, ...partnerPlugins, ...communityPlugins]

  const registry = {
    updatedAt: new Date().toISOString(),
    total: allPlugins.length,
    official: officialPlugins.map((p) => p.name),
    community: communityPlugins.map((p) => p.name),
    plugins: allPlugins
  }

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputFile, JSON.stringify(registry, null, 2), 'utf-8')

  console.log(`✅ Registry built successfully: ${outputFile}`)
  console.log(`📦 Total plugins: ${registry.total}`)
  console.log(`🏷️ Official: ${registry.official.length}, Community: ${registry.community.length}`)
}

buildRegistry()
