import fs from 'node:fs'

const reportPath = process.argv[2] || 'lighthouse-report.json'
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

const categories = report.categories || {}
const audits = report.audits || {}

const scoreBudgets = {
  performance: 0.82,
  accessibility: 0.95,
  'best-practices': 0.95,
  seo: 0.9,
}

const metricBudgets = [
  { id: 'largest-contentful-paint', label: 'LCP', max: 4000, unit: 'ms' },
  { id: 'total-blocking-time', label: 'TBT', max: 400, unit: 'ms' },
  { id: 'cumulative-layout-shift', label: 'CLS', max: 0.1, unit: '' },
]

let failed = false

console.log('\nLighthouse score budgets')
for (const [id, minimum] of Object.entries(scoreBudgets)) {
  const score = categories[id]?.score
  if (typeof score !== 'number') {
    console.error(`✗ ${id}: missing score`)
    failed = true
    continue
  }

  const passed = score >= minimum
  console.log(`${passed ? '✓' : '✗'} ${id}: ${(score * 100).toFixed(0)} (minimum ${(minimum * 100).toFixed(0)})`)
  if (!passed) failed = true
}

console.log('\nLighthouse metric budgets')
for (const budget of metricBudgets) {
  const value = audits[budget.id]?.numericValue
  if (typeof value !== 'number') {
    console.error(`✗ ${budget.label}: missing metric`)
    failed = true
    continue
  }

  const passed = value <= budget.max
  const formatted = budget.id === 'cumulative-layout-shift' ? value.toFixed(3) : Math.round(value)
  console.log(`${passed ? '✓' : '✗'} ${budget.label}: ${formatted}${budget.unit} (max ${budget.max}${budget.unit})`)
  if (!passed) failed = true
}

if (failed) {
  console.error('\nLighthouse quality gate failed.')
  process.exit(1)
}

console.log('\nLighthouse quality gate passed.')
