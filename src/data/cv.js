import { resumeCandidateFrom360, sampleProfile360 as rawSampleProfile360 } from './sample-profile-360'
import { withLocalSampleMedia } from './sample-media'
import { completeCandidate, completeProfile360 } from './profile-autofill'

const completedSampleProfile360 = completeProfile360(rawSampleProfile360, {
  fillEmptyArrays: true,
  ensureMinimums: true,
})

export const sampleProfile360 = withLocalSampleMedia(completedSampleProfile360)

export const templates = [
  {
    id: 'product-slate',
    name: 'Senior Product Designer',
    category: 'Product',
    variant: 'product',
    theme: 'slate',
    accent: '#6d5dfc',
    description: 'Portfolio-led layout with a strong product design hierarchy.',
  },
  {
    id: 'ats-clean',
    name: 'ATS Clean',
    category: 'ATS',
    variant: 'ats',
    theme: 'clean',
    accent: '#0f766e',
    description: 'Single-column, recruiter-friendly and intentionally minimal.',
  },
  {
    id: 'creative-grid',
    name: 'Creative Portfolio',
    category: 'Creative',
    variant: 'creative',
    theme: 'editorial',
    accent: '#e44d7a',
    description: 'Editorial composition for designers who want more personality.',
  },
  {
    id: 'executive-ink',
    name: 'Executive Minimal',
    category: 'Leadership',
    variant: 'executive',
    theme: 'ink',
    accent: '#b7791f',
    description: 'Calm, premium direction for senior and lead-level profiles.',
  },
  {
    id: 'design-system-lead',
    name: 'Design System Lead',
    category: 'Product',
    variant: 'product',
    theme: 'light-grid',
    accent: '#2563eb',
    description: 'A lighter product layout for system thinking, governance and cross-team impact.',
  },
  {
    id: 'design-engineer',
    name: 'Design Engineer',
    category: 'Tech',
    variant: 'ats',
    theme: 'tech',
    accent: '#111827',
    description: 'Code-aware, compact résumé direction for hybrid design and front-end roles.',
  },
]

export const candidate = completeCandidate(resumeCandidateFrom360(sampleProfile360), {
  fillEmptyArrays: true,
})
