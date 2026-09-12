import { statSync } from 'node:fs'

const limits = [
  { path: 'dist/assets/app.js', maxKb: 250, label: 'JavaScript' },
  { path: 'dist/assets/app.css', maxKb: 150, label: 'CSS' },
]

let failed = false
for (const item of limits) {
  const sizeKb = statSync(item.path).size / 1024
  console.log(`${item.label}: ${sizeKb.toFixed(2)} KB / ${item.maxKb} KB budget`)
  if (sizeKb > item.maxKb) {
    console.error(`Bundle budget exceeded for ${item.path}`)
    failed = true
  }
}

if (failed) process.exit(1)
