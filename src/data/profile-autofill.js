const clone = (value) => JSON.parse(JSON.stringify(value))

const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value)
const isBlank = (value) => value === null || value === undefined || (typeof value === 'string' && !value.trim())

const DEFAULT_SECTIONS = [
  { id: 'summary', label: 'Profile', enabled: true },
  { id: 'highlights', label: 'Impact', enabled: true },
  { id: 'experience', label: 'Experience', enabled: true },
  { id: 'projects', label: 'Projects', enabled: true },
  { id: 'skills', label: 'Skills', enabled: true },
  { id: 'education', label: 'Education', enabled: true },
  { id: 'certificates', label: 'Certificates', enabled: true },
  { id: 'languages', label: 'Languages', enabled: true },
]

const PROFILE_360_DEFAULTS = {
  id: 'complete-product-designer-profile',
  identity: {
    name: 'Alex Chen',
    preferredName: 'Alex',
    pronouns: 'he/him',
    role: 'Senior Product Designer · Design Engineer',
    headline: 'I turn complex product workflows into clear, measurable experiences.',
    location: 'Singapore',
    timezone: 'GMT+8',
    availability: 'Open to senior product design and design engineering roles',
    workMode: 'Hybrid · Remote-friendly',
    email: 'alex.chen@example.com',
    phone: '+65 8123 4567',
    website: 'alexchen.design',
    github: 'github.com/alexchen-design',
    linkedin: 'linkedin.com/in/alexchen-design',
    avatar: '',
  },
  positioning: {
    shortBio: 'Product-minded designer focused on complex B2B products, design systems and code-aware delivery.',
    longBio: 'I work across product strategy, interaction design, prototyping and implementation review. I simplify complex workflows, create reusable product patterns and stay close to engineering until the experience ships.',
    valueProposition: [
      'Turn complex workflows into clear product journeys.',
      'Create scalable design systems that survive production.',
      'Use prototypes and code awareness to shorten handoff.',
      'Design trustworthy AI-assisted workflows.',
    ],
    principles: ['Clarity before decoration', 'Evidence before opinion', 'Systems before one-off screens', 'Ship quality, not just mockups'],
  },
  proof: {
    years: '8+',
    shippedProducts: '18+',
    auditedModules: '42+',
    designSystemCoverage: '85%',
    handoffImprovement: '40%',
    usabilityImprovement: '31%',
    teamsSupported: '7',
    workshopsLed: '24+',
  },
  experience: [],
  projects: [],
  capabilities: {
    product: ['Product strategy', 'Problem framing', 'User flows', 'Information architecture', 'Interaction design', 'Prototyping', 'Usability testing'],
    systems: ['Design systems', 'Design tokens', 'Component governance', 'Accessibility', 'Design QA', 'Documentation'],
    technical: ['HTML/CSS', 'SCSS', 'Vue', 'React awareness', 'TypeScript awareness', 'Git', 'Vite', 'Responsive implementation'],
    ai: ['AI product UX', 'Prompt flows', 'Human-in-the-loop patterns', 'Explainability UX', 'AI-assisted design QA'],
  },
  tools: ['Figma', 'FigJam', 'Jira', 'GitHub', 'VS Code', 'Vue', 'Vite', 'Storybook'],
  education: [{ title: 'B.Sc. Information Systems', place: 'Technology University', period: '2014 — 2018' }],
  certificates: [{ title: 'UX Design Professional Certificate', issuer: 'Professional Learning Program', period: '2024', url: '' }],
  recognition: [{ year: '2026', title: 'Product Craft Recognition', detail: 'Recognized for measurable product and system impact.' }],
  testimonials: [{ quote: 'A strong design partner who turns ambiguity into clear product decisions and follows through to implementation quality.', author: 'Product Lead', role: 'Cross-functional partner' }],
  interests: ['Design tooling', 'AI product UX', 'Data visualization', 'Photography'],
  languages: ['English · Professional proficiency'],
  career: {
    targetRoles: ['Senior Product Designer', 'Design Engineer', 'Design System Lead'],
    seniority: 'Senior · Lead track',
    industries: ['B2B SaaS', 'AI products', 'Enterprise software'],
    relocation: 'Open to discussion',
    noticePeriod: '4 weeks',
  },
  services: ['Product UX audit', 'Design systems', 'Complex workflow redesign', 'Prototype-to-code collaboration'],
  methods: ['Discovery mapping', 'Task-flow analysis', 'Rapid prototyping', 'Usability testing', 'Design QA'],
  publications: [{ title: 'Designing trustworthy AI-assisted workflows', type: 'Article', year: '2026', url: '' }],
  speaking: [{ title: 'From design system to delivery system', event: 'Product design community session', year: '2026' }],
  volunteering: [{ role: 'Design mentor', organization: 'Local design community', period: '2025 — Present' }],
  references: [{ name: 'Available on request', role: 'Professional reference', contact: '' }],
  seo: {
    title: 'Alex Chen · Senior Product Designer',
    description: 'Senior Product Designer and Design Engineer working across complex B2B products, design systems and AI-assisted workflows.',
    keywords: ['Product Design', 'UI/UX', 'Design Systems', 'Design Engineer', 'AI UX'],
    shareImage: '',
  },
}

const EXTRA_PROJECTS = [
  {
    id: 'studio-commerce',
    name: 'Studio Commerce',
    type: 'Commerce · Product platform',
    role: 'Lead Product Designer',
    period: '2026',
    impact: '22% improvement in assisted conversion',
    description: 'A modular commerce workspace that connects catalog operations, campaign setup and conversion insights in one responsive product surface.',
    problem: 'Teams switched between disconnected tools to prepare campaigns, validate content and understand conversion performance.',
    solution: 'Created a unified workflow with guided setup, reusable content blocks and contextual performance feedback.',
    result: 'Pilot teams completed recurring campaign tasks faster and improved assisted conversion by 22%.',
    image: '',
    tags: ['Commerce', 'Workflow UX', 'Design System', 'Analytics'],
  },
  {
    id: 'forge-portal',
    name: 'Forge Developer Portal',
    type: 'Developer experience · Platform',
    role: 'Design Engineer',
    period: '2025 — 2026',
    impact: 'Reduced setup time from 45 minutes to 12 minutes',
    description: 'A developer portal for onboarding, API credentials, environments, documentation and deployment health.',
    problem: 'New developers relied on fragmented docs and manual support to configure environments and validate integrations.',
    solution: 'Combined guided onboarding, environment status, copy-ready snippets and actionable error states.',
    result: 'Median setup time dropped to 12 minutes in the pilot and support requests decreased materially.',
    image: '',
    tags: ['Developer Experience', 'API UX', 'Design Engineering', 'Documentation'],
  },
]

const EXTRA_CERTIFICATES = [
  { title: 'Design Systems', issuer: 'Professional Development Program', period: '2025', url: '' },
  { title: 'Accessibility for Digital Products', issuer: 'Professional Learning Program', period: '2025', url: '' },
]

const EXTRA_RECOGNITION = [
  { year: '2025', title: 'Design Systems Champion', detail: 'Recognized for cross-team component adoption and governance.' },
  { year: '2024', title: 'Customer Experience Impact', detail: 'Recognized for simplifying a high-friction operational workflow.' },
]

const EXTRA_TESTIMONIALS = [
  {
    quote: 'He brings product thinking, interaction detail and implementation awareness into the same conversation, which makes delivery noticeably smoother.',
    author: 'Engineering Manager',
    role: 'Platform Engineering',
  },
]

const mergeMissing = (current, fallback, fillEmptyArrays = false) => {
  if (isBlank(current)) return clone(fallback)
  if (Array.isArray(fallback)) {
    if (!Array.isArray(current)) return clone(fallback)
    if (fillEmptyArrays && current.length === 0) return clone(fallback)
    return clone(current)
  }
  if (!isRecord(fallback)) return current
  const source = isRecord(current) ? current : {}
  const output = { ...source }
  Object.keys(fallback).forEach((key) => {
    output[key] = mergeMissing(source[key], fallback[key], fillEmptyArrays)
  })
  return output
}

const appendUnique = (items, extras, key, minimum) => {
  const list = Array.isArray(items) ? clone(items) : []
  const seen = new Set(list.map((item) => String(item?.[key] || '').toLowerCase()).filter(Boolean))
  for (const extra of extras) {
    if (list.length >= minimum) break
    const identity = String(extra?.[key] || '').toLowerCase()
    if (!seen.has(identity)) {
      list.push(clone(extra))
      seen.add(identity)
    }
  }
  return list
}

export function completeProfile360(profile, options = {}) {
  const { fillEmptyArrays = false, ensureMinimums = false } = options
  const completed = mergeMissing(profile, PROFILE_360_DEFAULTS, fillEmptyArrays)

  if (!completed.identity.preferredName) completed.identity.preferredName = String(completed.identity.name || '').split(' ')[0] || 'Alex'
  if (!completed.seo.title) completed.seo.title = `${completed.identity.name} · ${completed.identity.role}`
  if (!completed.seo.description) completed.seo.description = completed.positioning.shortBio

  if (ensureMinimums) {
    completed.projects = appendUnique(completed.projects, EXTRA_PROJECTS, 'id', 6)
    completed.certificates = appendUnique(completed.certificates, EXTRA_CERTIFICATES, 'title', 4)
    completed.recognition = appendUnique(completed.recognition, EXTRA_RECOGNITION, 'title', 3)
    completed.testimonials = appendUnique(completed.testimonials, EXTRA_TESTIMONIALS, 'author', 2)
  }

  return completed
}

const CANDIDATE_DEFAULTS = {
  name: 'Alex Chen',
  role: 'Senior Product Designer · Design Engineer',
  location: 'Singapore',
  email: 'alex.chen@example.com',
  phone: '+65 8123 4567',
  website: 'alexchen.design',
  avatar: '',
  headline: 'I turn complex product workflows into clear, measurable experiences.',
  quote: 'I turn complex challenges into clear momentum.',
  availability: 'Open to senior product design and design engineering roles',
  summary: 'Product-minded designer focused on complex B2B products, design systems and code-aware delivery.',
  sections: DEFAULT_SECTIONS,
  highlights: [
    { value: '8+', label: 'Years designing digital products' },
    { value: '18+', label: 'Products and major releases shipped' },
    { value: '40%', label: 'Faster design-to-dev handoff' },
  ],
  experience: [{ role: 'Senior Product Designer', company: 'Product Team', period: '2023 — Present', location: 'Singapore', bullets: ['Led complex product workflows from problem framing through implementation review.', 'Built reusable design patterns and measurable UX improvements with engineering.'] }],
  projects: [{ id: 'sample-project', name: 'Selected product project', type: 'Product · Design', impact: 'Measurable user or business outcome', description: 'Describe the problem, your role, the solution and the outcome.', image: '', problem: '', solution: '', result: '', role: 'Product Designer', period: '2026', tags: ['Product Design'] }],
  skills: ['Product Design', 'UI/UX', 'Design Systems', 'Interaction Design', 'Accessibility', 'Figma', 'Prototyping', 'Design QA', 'HTML/CSS', 'Vue'],
  tools: ['Figma', 'GitHub', 'VS Code'],
  education: [{ title: 'Software & Product Design', place: 'Technology Program', period: '2018' }],
  certificates: [{ title: 'UX Design Professional Certificate', issuer: 'Professional Learning Program', period: '2024', url: '' }],
  languages: ['English · Professional proficiency'],
  recognition: [],
  testimonials: [],
  interests: [],
}

const ITEM_DEFAULTS = {
  highlights: { value: '10+', label: 'Meaningful outcome' },
  experience: { role: 'Role title', company: 'Company', period: '2026 — Present', location: '', bullets: ['Describe scope, action and measurable outcome.'] },
  projects: { id: '', name: 'Project name', type: 'Product · Design', impact: 'Key measurable outcome', description: 'Describe the problem, your role, the solution and what changed.', image: '', problem: '', solution: '', result: '', role: '', period: '', tags: [] },
  education: { title: 'Program or degree', place: 'Institution', period: '2026' },
  certificates: { title: 'Professional certificate', issuer: 'Issuer', period: '2026', url: '' },
}

export function completeCandidate(profile, options = {}) {
  const { fillEmptyArrays = false } = options
  const completed = mergeMissing(profile, CANDIDATE_DEFAULTS, fillEmptyArrays)

  for (const [section, itemDefault] of Object.entries(ITEM_DEFAULTS)) {
    if (!Array.isArray(completed[section])) completed[section] = []
    completed[section] = completed[section].map((item) => mergeMissing(item, itemDefault, false))
  }

  if (!Array.isArray(completed.sections) || !completed.sections.length) completed.sections = clone(DEFAULT_SECTIONS)
  return completed
}

const countLeaves = (value, prefix = '', result = { total: 0, missing: [] }) => {
  if (Array.isArray(value)) {
    result.total += 1
    if (!value.length) result.missing.push(prefix || 'root')
    return result
  }
  if (isRecord(value)) {
    Object.entries(value).forEach(([key, nested]) => countLeaves(nested, prefix ? `${prefix}.${key}` : key, result))
    return result
  }
  result.total += 1
  if (isBlank(value)) result.missing.push(prefix || 'root')
  return result
}

export function profileCompletenessReport(profile) {
  const result = countLeaves(profile)
  const complete = Math.max(0, result.total - result.missing.length)
  return {
    totalFields: result.total,
    completeFields: complete,
    missingFields: result.missing,
    percent: result.total ? Math.round((complete / result.total) * 100) : 0,
  }
}

export const profileAutofillDefaults = clone(PROFILE_360_DEFAULTS)
export const candidateAutofillDefaults = clone(CANDIDATE_DEFAULTS)
