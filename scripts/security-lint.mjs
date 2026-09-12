import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const roots = ['src']
const extensions = new Set(['.js', '.ts', '.vue', '.html'])
const forbidden = [
  { label: 'eval()', pattern: /\beval\s*\(/ },
  { label: 'new Function()', pattern: /\bnew\s+Function\s*\(/ },
  { label: 'document.write()', pattern: /\bdocument\.write\s*\(/ },
  { label: 'direct innerHTML assignment', pattern: /\.innerHTML\s*=/ },
  { label: 'Vue v-html', pattern: /\bv-html\s*=/ },
  { label: 'remote script element source', pattern: /<script[^>]+src=["']https?:\/\//i },
]

const files = []
function walk(path) {
  for (const name of readdirSync(path)) {
    const fullPath = join(path, name)
    if (statSync(fullPath).isDirectory()) walk(fullPath)
    else if (extensions.has(extname(fullPath))) files.push(fullPath)
  }
}

for (const root of roots) walk(root)

const violations = []
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  for (const rule of forbidden) {
    if (rule.pattern.test(source)) violations.push(`${file}: ${rule.label}`)
  }
}

if (violations.length) {
  console.error('Frontend security lint failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log(`Frontend security lint passed across ${files.length} source files.`)
