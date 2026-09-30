import { candidate as defaultCandidate } from './cv'
import { ensureItemIds, fillMissingWithEmpty } from './profile-schema'

const STORAGE_KEY = 'cv-studio-profile-v1'

/**
 * Upgrade older localStorage profiles to the current candidate schema.
 * Missing keys are added as empty values, and intentional blank strings and
 * empty arrays remain untouched, so a user's profile never receives demo content.
 * Unreadable data is left in place for the Studio restore step to preserve.
 */
export function migrateStoredProfile() {
  if (typeof window === 'undefined') return

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return

    const migrated = fillMissingWithEmpty(saved, defaultCandidate)
    ensureItemIds(migrated)
    const next = JSON.stringify(migrated)
    if (next !== raw) window.localStorage.setItem(STORAGE_KEY, next)
  } catch (error) {
    console.warn('Unable to migrate saved CV profile data.', error)
  }
}
