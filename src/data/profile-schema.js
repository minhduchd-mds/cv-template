const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value)
const clone = (value) => JSON.parse(JSON.stringify(value))

export const ITEM_LIST_KEYS = ['highlights', 'experience', 'projects', 'education', 'certificates', 'recognition', 'testimonials']

// Section config is layout structure, not authored content, so it may come from the template.
const STRUCTURAL_KEYS = new Set(['sections'])

let idCounter = 0
export const createItemId = (prefix = 'item') => {
  idCounter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${idCounter.toString(36)}${random}`
}

function emptyLike(value) {
  if (Array.isArray(value)) return []
  if (isRecord(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, emptyLike(item)]))
  if (typeof value === 'string') return ''
  if (typeof value === 'number') return 0
  return value
}

/**
 * Adds keys that exist in `template` but are missing from `current`.
 * Missing content becomes an empty value of the same type; existing values,
 * blank strings and empty arrays are never replaced.
 */
export function fillMissingWithEmpty(current, template) {
  const source = isRecord(current) ? current : {}
  const output = { ...source }
  for (const [key, templateValue] of Object.entries(template || {})) {
    const value = source[key]
    if (STRUCTURAL_KEYS.has(key)) {
      output[key] = Array.isArray(value) && value.length ? value : clone(templateValue)
    } else if (value === undefined || value === null) {
      output[key] = emptyLike(templateValue)
    } else if (Array.isArray(templateValue) && !Array.isArray(value)) {
      output[key] = []
    } else if (isRecord(templateValue) && isRecord(value)) {
      output[key] = fillMissingWithEmpty(value, templateValue)
    }
  }
  return output
}

/** Gives every list item a stable `id` so Vue keys survive edits. Mutates and returns whether anything changed. */
export function ensureItemIds(profile) {
  if (!isRecord(profile)) return false
  let changed = false
  for (const key of ITEM_LIST_KEYS) {
    if (!Array.isArray(profile[key])) continue
    const seen = new Set()
    profile[key] = profile[key].map((item) => {
      if (!isRecord(item)) return item
      if (typeof item.id === 'string' && item.id && !seen.has(item.id)) {
        seen.add(item.id)
        return item
      }
      changed = true
      const id = createItemId(key)
      seen.add(id)
      return { ...item, id }
    })
  }
  return changed
}
