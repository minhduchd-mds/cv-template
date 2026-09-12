import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sampleProfile360 as rawSampleProfile360, resumeCandidateFrom360 } from '../src/data/sample-profile-360.js'
import { completeCandidate, completeProfile360, profileCompletenessReport } from '../src/data/profile-autofill.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const generatedDataDir = path.join(root, 'src/data/generated')
const generatedMediaDir = path.join(root, 'public/sample/generated')
const checkOnly = process.argv.includes('--check')

const knownArtwork = {
  'atlas-ops': 'atlas-ops.svg',
  'signal-ai': 'signal-ai.svg',
  'northstar-system': 'northstar-system.svg',
  'pulse-dashboard': 'pulse-dashboard.svg',
}

const slugify = (value) => String(value || 'project')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'project'

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const paletteFor = (index) => [
  ['#111827', '#6d5dfc', '#4fd1ff'],
  ['#082f49', '#0ea5e9', '#22d3ee'],
  ['#052e16', '#10b981', '#86efac'],
  ['#3b0764', '#a855f7', '#f0abfc'],
  ['#451a03', '#f59e0b', '#fde68a'],
  ['#172554', '#3b82f6', '#93c5fd'],
][index % 6]

const projectSvg = (project, index) => {
  const [ink, accent, glow] = paletteFor(index)
  const name = escapeXml(project.name)
  const type = escapeXml(project.type)
  const impact = escapeXml(project.impact)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="${name} project cover">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${ink}"/><stop offset="1" stop-color="${accent}"/></linearGradient>
    <radialGradient id="orb"><stop stop-color="${glow}" stop-opacity=".95"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="720" rx="48" fill="url(#bg)"/>
  <circle cx="970" cy="110" r="310" fill="url(#orb)" opacity=".42"/>
  <rect x="86" y="78" width="1028" height="564" rx="34" fill="#fff" fill-opacity=".10" stroke="#fff" stroke-opacity=".20"/>
  <rect x="120" y="116" width="440" height="490" rx="26" fill="#fff" fill-opacity=".93"/>
  <rect x="602" y="116" width="478" height="144" rx="24" fill="#fff" fill-opacity=".13"/>
  <rect x="602" y="280" width="228" height="326" rx="24" fill="#fff" fill-opacity=".10"/>
  <rect x="850" y="280" width="230" height="326" rx="24" fill="#fff" fill-opacity=".16"/>
  <rect x="152" y="158" width="240" height="18" rx="9" fill="${accent}" opacity=".82"/>
  <rect x="152" y="202" width="350" height="12" rx="6" fill="#cbd5e1"/>
  <rect x="152" y="228" width="290" height="12" rx="6" fill="#e2e8f0"/>
  <rect x="152" y="292" width="376" height="112" rx="18" fill="${accent}" opacity=".12"/>
  <rect x="152" y="428" width="176" height="142" rx="18" fill="#eef2ff"/>
  <rect x="346" y="428" width="182" height="142" rx="18" fill="#f1f5f9"/>
  <text x="642" y="174" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="24" font-weight="700">${name}</text>
  <text x="642" y="212" fill="#fff" fill-opacity=".72" font-family="Inter,Arial,sans-serif" font-size="16">${type}</text>
  <text x="638" y="350" fill="#fff" fill-opacity=".72" font-family="Inter,Arial,sans-serif" font-size="14">IMPACT</text>
  <text x="638" y="388" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="700">${impact}</text>
  <path d="M638 520 C706 430 750 548 804 430" stroke="${glow}" stroke-width="14" stroke-linecap="round" fill="none"/>
  <circle cx="925" cy="405" r="58" fill="none" stroke="${glow}" stroke-width="18" opacity=".85"/>
  <circle cx="925" cy="405" r="30" fill="${glow}" opacity=".45"/>
</svg>\n`
}

const fallbackProjectSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720" role="img" aria-label="Sample project cover">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset=".55" stop-color="#4338ca"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
  <rect width="1200" height="720" rx="48" fill="url(#g)"/>
  <rect x="90" y="86" width="1020" height="548" rx="36" fill="#fff" fill-opacity=".10" stroke="#fff" stroke-opacity=".22"/>
  <rect x="140" y="140" width="420" height="444" rx="28" fill="#fff" fill-opacity=".94"/>
  <rect x="610" y="140" width="450" height="120" rx="24" fill="#fff" fill-opacity=".14"/>
  <rect x="610" y="292" width="212" height="292" rx="24" fill="#fff" fill-opacity=".11"/>
  <rect x="848" y="292" width="212" height="292" rx="24" fill="#fff" fill-opacity=".17"/>
  <text x="650" y="204" fill="#fff" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="700">Project cover</text>
  <text x="650" y="244" fill="#fff" fill-opacity=".7" font-family="Inter,Arial,sans-serif" font-size="17">Auto-generated sample artwork</text>
</svg>\n`

const fallbackProfileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640" viewBox="0 0 640 640" role="img" aria-label="Sample profile avatar">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#111827"/><stop offset="1" stop-color="#6d5dfc"/></linearGradient></defs>
  <rect width="640" height="640" rx="160" fill="url(#g)"/>
  <circle cx="320" cy="246" r="116" fill="#fff" fill-opacity=".88"/>
  <path d="M120 590c18-132 94-208 200-208s182 76 200 208" fill="#fff" fill-opacity=".88"/>
  <circle cx="510" cy="116" r="74" fill="#4fd1ff" fill-opacity=".72"/>
</svg>\n`

const completedProfile = completeProfile360(rawSampleProfile360, {
  fillEmptyArrays: true,
  ensureMinimums: true,
})

completedProfile.identity.avatar = '/sample/alex-profile.svg'
completedProfile.projects = completedProfile.projects.map((project, index) => {
  const slug = slugify(project.id || project.name)
  const artwork = knownArtwork[project.id] || `generated/${slug}.svg`
  return { ...project, image: `/sample/${artwork}`, _artworkIndex: index }
})
completedProfile.seo.shareImage = '/sample/generated/fallback-project.svg'

const candidate = completeCandidate(resumeCandidateFrom360(completedProfile), { fillEmptyArrays: true })
const profileReport = profileCompletenessReport(completedProfile)
const candidateReport = profileCompletenessReport(candidate)

const outputs = new Map()
outputs.set(path.join(generatedDataDir, 'sample-profile-complete.json'), `${JSON.stringify(completedProfile, null, 2)}\n`)
outputs.set(path.join(generatedDataDir, 'sample-candidate-complete.json'), `${JSON.stringify(candidate, null, 2)}\n`)
outputs.set(path.join(generatedDataDir, 'sample-data-report.json'), `${JSON.stringify({ profile: profileReport, candidate: candidateReport }, null, 2)}\n`)
outputs.set(path.join(generatedMediaDir, 'fallback-project.svg'), fallbackProjectSvg)
outputs.set(path.join(generatedMediaDir, 'profile-fallback.svg'), fallbackProfileSvg)

for (const project of completedProfile.projects) {
  if (knownArtwork[project.id]) continue
  const slug = slugify(project.id || project.name)
  outputs.set(path.join(generatedMediaDir, `${slug}.svg`), projectSvg(project, project._artworkIndex || 0))
}

const cleanProfile = cloneWithoutInternal(completedProfile)
outputs.set(path.join(generatedDataDir, 'sample-profile-complete.json'), `${JSON.stringify(cleanProfile, null, 2)}\n`)

function cloneWithoutInternal(value) {
  if (Array.isArray(value)) return value.map(cloneWithoutInternal)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).filter(([key]) => !key.startsWith('_')).map(([key, nested]) => [key, cloneWithoutInternal(nested)]))
}

function differs(file, content) {
  try { return fs.readFileSync(file, 'utf8') !== content } catch { return true }
}

const stale = [...outputs.entries()].filter(([file, content]) => differs(file, content))

if (checkOnly) {
  if (stale.length) {
    console.error('Generated sample data is stale or missing:')
    stale.forEach(([file]) => console.error(`- ${path.relative(root, file)}`))
    process.exit(1)
  }
  console.log(`Sample data is synchronized · profile ${profileReport.percent}% · candidate ${candidateReport.percent}%`)
  process.exit(0)
}

fs.mkdirSync(generatedDataDir, { recursive: true })
fs.mkdirSync(generatedMediaDir, { recursive: true })
for (const [file, content] of outputs) fs.writeFileSync(file, content)

console.log(`Sample data synchronized · profile ${profileReport.percent}% · candidate ${candidateReport.percent}%`)
console.log(`Generated ${outputs.size} deterministic data/media artifacts.`)
