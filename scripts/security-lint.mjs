import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const roots = ['src', 'public']
const extensions = new Set(['.js', '.ts', '.vue', '.html'])

const forbidden = [
  { label: 'eval()', pattern: /\beval\s*\(/ },
  { label: 'new Function()', pattern: /\bnew\s+Function\s*\(/ },
  { label: 'document.write()', pattern: /\bdocument\.write\s*\(/ },
  { label: 'Vue v-html', pattern: /\bv-html\s*=/ },
  { label: 'remote script element source', pattern: /<script[^>]+src=["']https?:\/\//i },
]

// Legacy DOM-rendering debt is tracked as a ratchet rather than ignored.
// CI fails if any existing file gains another direct innerHTML assignment,
// or if a new source file introduces one. Reducing these counts is always safe.
const innerHtmlBaseline = new Map([
  ['public/interview-studio/app.js', 14],
  ['public/studio/app.js', 30],
  ['public/studio/ats.js', 53],
])

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
const debt = []

for (const file of files) {
  const source = readFileSync(file, 'utf8')

  for (const rule of forbidden) {
    if (rule.pattern.test(source)) violations.push(`${file}: ${rule.label}`)
  }

  const innerHtmlCount = (source.match(/\.innerHTML\s*=/g) || []).length
  const allowedCount = innerHtmlBaseline.get(file) ?? 0

  if (innerHtmlCount > allowedCount) {
    violations.push(
      `${file}: direct innerHTML assignments increased from ${allowedCount} to ${innerHtmlCount}`,
    )
  } else if (innerHtmlCount > 0) {
    debt.push(`${file}: ${innerHtmlCount}/${allowedCount} legacy innerHTML assignments`)
  }
}

for (const [file, baselineCount] of innerHtmlBaseline) {
  if (!files.includes(file)) {
    violations.push(`${file}: security baseline references a missing file (${baselineCount} innerHTML assignments)`)
  }
}

if (debt.length) {
  console.warn('Frontend security debt (ratcheted; no increase allowed):')
  for (const item of debt) console.warn(`- ${item}`)
}

if (violations.length) {
  console.error('Frontend security lint failed:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log(`Frontend security lint passed across ${files.length} source files in src and public.`)
