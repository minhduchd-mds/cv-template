export const WORKSPACE_KEY = 'cv-studio-workspace-v3'
export const WORKSPACE_FORMAT = 'cv-studio-workspace'
export const WORKSPACE_SCHEMA = 3

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value))
const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value)
const emptyAts = () => ({ target: {}, versions: [], applications: [] })

const normalize = (value) => {
  if (!isRecord(value) || value.format !== WORKSPACE_FORMAT || Number(value.schemaVersion) !== WORKSPACE_SCHEMA) return null
  return {
    format: WORKSPACE_FORMAT,
    schemaVersion: WORKSPACE_SCHEMA,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
    source: typeof value.source === 'string' ? value.source : 'unknown',
    profile: isRecord(value.profile) ? clone(value.profile) : {},
    studio: isRecord(value.studio) ? clone(value.studio) : {},
    ats: {
      target: isRecord(value.ats?.target) ? clone(value.ats.target) : {},
      versions: Array.isArray(value.ats?.versions) ? clone(value.ats.versions) : [],
      applications: Array.isArray(value.ats?.applications) ? clone(value.ats.applications) : [],
    },
  }
}

export const readCanonicalWorkspace = () => {
  if (typeof window === 'undefined') return null
  try {
    return normalize(JSON.parse(window.localStorage.getItem(WORKSPACE_KEY) || 'null'))
  } catch {
    return null
  }
}

export const patchCanonicalWorkspace = (patch = {}, source = 'unknown') => {
  if (typeof window === 'undefined') return null
  const current = readCanonicalWorkspace() || {
    format: WORKSPACE_FORMAT,
    schemaVersion: WORKSPACE_SCHEMA,
    updatedAt: new Date().toISOString(),
    source,
    profile: {},
    studio: {},
    ats: emptyAts(),
  }
  const next = {
    ...current,
    format: WORKSPACE_FORMAT,
    schemaVersion: WORKSPACE_SCHEMA,
    updatedAt: new Date().toISOString(),
    source,
    profile: isRecord(patch.profile) ? clone(patch.profile) : current.profile,
    studio: isRecord(patch.studio) ? { ...current.studio, ...clone(patch.studio) } : current.studio,
    ats: {
      target: isRecord(patch.ats?.target) ? clone(patch.ats.target) : current.ats.target,
      versions: Array.isArray(patch.ats?.versions) ? clone(patch.ats.versions) : current.ats.versions,
      applications: Array.isArray(patch.ats?.applications) ? clone(patch.ats.applications) : current.ats.applications,
    },
  }
  try {
    window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next))
    return next
  } catch (error) {
    console.warn('Unable to persist canonical CV Studio workspace.', error)
    return current
  }
}

export const hasWorkspaceProfile = (workspace) =>
  Boolean(workspace && isRecord(workspace.profile) && Object.keys(workspace.profile).length)
