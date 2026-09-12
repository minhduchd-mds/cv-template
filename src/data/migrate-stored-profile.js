import { candidate as defaultCandidate } from './cv'

const STORAGE_KEY = 'cv-studio-profile-v1'
const clone = (value) => JSON.parse(JSON.stringify(value))
const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value)

function fillMissingShape(current, fallback) {
  if (current === undefined || current === null) return clone(fallback)
  if (Array.isArray(fallback)) return Array.isArray(current) ? clone(current) : clone(fallback)
  if (!isRecord(fallback)) return current

  const source = isRecord(current) ? current : {}
  const output = { ...source }
  for (const [key, fallbackValue] of Object.entries(fallback)) {
    output[key] = fillMissingShape(source[key], fallbackValue)
  }
  return output
}

/**
 * Upgrade older localStorage profiles to the current candidate schema.
 * Missing keys are added, while intentional blank strings and empty arrays
 * remain untouched so a user's edits are never replaced by demo content.
 */
export function migrateStoredProfile() {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return

    const migrated = fillMissingShape(saved, defaultCandidate)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
  } catch (error) {
    console.warn('Unable to migrate saved CV profile data.', error)
  }
}
