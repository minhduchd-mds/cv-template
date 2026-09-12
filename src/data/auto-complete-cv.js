import { profileCompletenessReport } from './profile-autofill'

const clone = (value) => JSON.parse(JSON.stringify(value))
const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value)
const isBlank = (value) => value === null || value === undefined || (typeof value === 'string' && !value.trim())

const isDemoProfile = (profile = {}) => (
  profile.name === 'Alex Chen' ||
  /@example\.com$/i.test(String(profile.email || ''))
)

const draftReference = (profile = {}) => {
  const role = String(profile.role || '').trim() || 'your target role'
  return {
    name: '[Review: add full name]',
    role: '[Review: add target role]',
    location: '[Review: add location]',
    email: '[Review: add email]',
    phone: '[Review: add phone]',
    website: '[Review: add portfolio URL]',
    avatar: '',
    headline: `[Review: add a one-line value proposition for ${role}]`,
    availability: '[Review: add availability or preferred work mode]',
    summary: `[Review: write a concise professional summary for ${role}, covering scope, strengths and the kind of problems you solve.]`,
    sections: [
      { id: 'summary', label: 'Profile', enabled: true },
      { id: 'highlights', label: 'Impact', enabled: true },
      { id: 'experience', label: 'Experience', enabled: true },
      { id: 'projects', label: 'Projects', enabled: true },
      { id: 'skills', label: 'Skills', enabled: true },
      { id: 'education', label: 'Education', enabled: true },
      { id: 'certificates', label: 'Certificates', enabled: true },
      { id: 'languages', label: 'Languages', enabled: true },
    ],
    highlights: [
      { value: '—', label: '[Review: add a measurable outcome]' },
      { value: '—', label: '[Review: add scale, quality or efficiency impact]' },
      { value: '—', label: '[Review: add another concrete result]' },
    ],
    experience: [{
      role: role === 'your target role' ? '[Review: role title]' : role,
      company: '[Review: company]',
      period: '[Review: period]',
      location: '[Review: location]',
      bullets: [
        '[Review: describe scope and ownership.]',
        '[Review: add an achievement with action and measurable outcome.]',
      ],
    }],
    projects: [{
      id: 'draft-project',
      name: '[Review: project name]',
      type: '[Review: product / domain]',
      impact: '[Review: measurable project impact]',
      description: '[Review: summarize the problem, your role, solution and result.]',
      image: '',
      problem: '[Review: what problem existed?]',
      solution: '[Review: what did you change?]',
      result: '[Review: what improved?]',
      role,
      period: '[Review: period]',
      tags: [],
    }],
    skills: ['[Review: primary skill]', '[Review: secondary skill]', '[Review: domain or technical skill]'],
    tools: [],
    education: [{ title: '[Review: degree or program]', place: '[Review: institution]', period: '[Review: period]' }],
    certificates: [],
    languages: ['[Review: language · proficiency]'],
    recognition: [],
    testimonials: [],
    interests: [],
  }
}

const fillMissing = (current, fallback, path, changes) => {
  if (isBlank(current)) {
    if (isBlank(fallback)) return current
    changes.push(path || 'profile')
    return clone(fallback)
  }

  if (Array.isArray(fallback)) {
    if (!Array.isArray(current) || current.length === 0) {
      if (!fallback.length) return Array.isArray(current) ? clone(current) : []
      changes.push(path || 'profile')
      return clone(fallback)
    }

    return current.map((item, index) => {
      if (!isRecord(item)) return item
      const itemFallback = fallback[index] || fallback[0]
      return isRecord(itemFallback)
        ? fillMissing(item, itemFallback, `${path}.${index}`, changes)
        : clone(item)
    })
  }

  if (!isRecord(fallback)) return current
  const source = isRecord(current) ? current : {}
  const output = { ...source }
  Object.entries(fallback).forEach(([key, value]) => {
    const childPath = path ? `${path}.${key}` : key
    output[key] = fillMissing(source[key], value, childPath, changes)
  })
  return output
}

const topLevelSections = (paths) => [...new Set(paths.map((path) => String(path).split('.')[0]).filter(Boolean))]

export function candidateCompletionReport(profile) {
  return profileCompletenessReport(profile || {})
}

export function autoCompleteCv(profile, sampleReference) {
  const before = candidateCompletionReport(profile)
  const demoMode = isDemoProfile(profile)
  const reference = demoMode ? clone(sampleReference) : draftReference(profile)
  const changes = []
  const completed = fillMissing(clone(profile || {}), reference, '', changes)
  const after = candidateCompletionReport(completed)

  return {
    profile: completed,
    summary: {
      mode: demoMode ? 'sample' : 'draft',
      changedFields: changes.length,
      changedSections: topLevelSections(changes),
      before: before.percent,
      after: after.percent,
      reviewRequired: !demoMode && changes.length > 0,
    },
  }
}
