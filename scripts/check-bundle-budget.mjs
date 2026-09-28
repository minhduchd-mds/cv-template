import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const assetsDir = 'dist/assets'
const toKb = (bytes) => bytes / 1024
const formatKb = (bytes) => `${toKb(bytes).toFixed(2)} KB`

const assets = readdirSync(assetsDir)
  .filter((name) => name.endsWith('.js') || name.endsWith('.css'))
  .map((name) => {
    const path = join(assetsDir, name)
    const raw = statSync(path).size
    const gzip = gzipSync(readFileSync(path), { level: 9 }).length
    return { name, path, raw, gzip, type: name.endsWith('.js') ? 'js' : 'css' }
  })

const jsAssets = assets.filter((item) => item.type === 'js')
const cssAssets = assets.filter((item) => item.type === 'css')
const entry = jsAssets.find((item) => item.name === 'app.js')
const lazyJs = jsAssets.filter((item) => item !== entry)

if (!entry) {
  console.error('Bundle budget failed: dist/assets/app.js is missing.')
  process.exit(1)
}

const sum = (items, field) => items.reduce((total, item) => total + item[field], 0)
const largest = (items, field) => items.reduce((max, item) => Math.max(max, item[field]), 0)

const metrics = [
  { label: 'Entry JS raw', value: entry.raw, maxKb: 160 },
  { label: 'Entry JS gzip', value: entry.gzip, maxKb: 50 },
  { label: 'Largest lazy JS raw', value: largest(lazyJs, 'raw'), maxKb: 220 },
  { label: 'Largest lazy JS gzip', value: largest(lazyJs, 'gzip'), maxKb: 60 },
  { label: 'Total JS gzip', value: sum(jsAssets, 'gzip'), maxKb: 165 },
  { label: 'Largest CSS raw', value: largest(cssAssets, 'raw'), maxKb: 250 },
  { label: 'Total CSS raw', value: sum(cssAssets, 'raw'), maxKb: 340 },
  { label: 'Total CSS gzip', value: sum(cssAssets, 'gzip'), maxKb: 65 },
]

let failed = false

console.log('Production bundle assets:')
for (const item of assets.sort((a, b) => b.raw - a.raw)) {
  console.log(`- ${item.name}: ${formatKb(item.raw)} raw · ${formatKb(item.gzip)} gzip`)
}

console.log('\nBundle budgets:')
for (const metric of metrics) {
  const maxBytes = metric.maxKb * 1024
  const passed = metric.value <= maxBytes
  console.log(`${passed ? '✓' : '✗'} ${metric.label}: ${formatKb(metric.value)} / ${metric.maxKb} KB`)
  if (!passed) failed = true
}

if (failed) {
  console.error('Bundle budget exceeded. Reduce initial payload or route chunk size before merge.')
  process.exit(1)
}
