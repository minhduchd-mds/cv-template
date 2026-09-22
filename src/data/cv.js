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
  {
    id: 'product-ivory',
    name: 'Product Ivory',
    category: 'Product',
    variant: 'product',
    theme: 'ivory',
    accent: '#315C55',
    description: 'Warm editorial product CV with softer contrast and generous whitespace.',
  },
  {
    id: 'product-midnight',
    name: 'Product Midnight',
    category: 'Product',
    variant: 'product',
    theme: 'midnight',
    accent: '#7C6DFF',
    description: 'Dark-side product direction with a stronger visual identity for senior portfolios.',
  },
  {
    id: 'ats-compact',
    name: 'ATS Compact',
    category: 'ATS',
    variant: 'ats',
    theme: 'compact',
    accent: '#334155',
    description: 'Dense recruiter-first layout tuned for one-page applications and ATS scanning.',
  },
  {
    id: 'ats-serif',
    name: 'ATS Serif',
    category: 'ATS',
    variant: 'ats',
    theme: 'serif',
    accent: '#7C2D12',
    description: 'Classic serif résumé direction for strategy, research and senior design roles.',
  },
  {
    id: 'creative-swiss',
    name: 'Swiss Grid',
    category: 'Creative',
    variant: 'creative',
    theme: 'swiss',
    accent: '#E10600',
    description: 'Graphic Swiss-inspired hierarchy with clean grid rhythm and strong typographic contrast.',
  },
  {
    id: 'executive-navy',
    name: 'Executive Navy',
    category: 'Leadership',
    variant: 'executive',
    theme: 'navy',
    accent: '#244A73',
    description: 'Leadership-focused executive layout with a cooler, corporate presentation.',
  },
]

export const candidate = completeCandidate(resumeCandidateFrom360(sampleProfile360), {
  fillEmptyArrays: true,
})
