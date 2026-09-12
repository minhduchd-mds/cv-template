const DATA_IMAGE_PATTERN = /^data:image\/(?:png|jpe?g|webp|gif|avif);base64,[a-z0-9+/=\s]+$/i
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

const mediaBaseUrl = () => {
  if (typeof document !== 'undefined' && document.baseURI) return document.baseURI
  if (typeof window !== 'undefined' && window.location?.href) return window.location.href
  return 'https://localhost/'
}

export function safeImageSource(value) {
  if (typeof value !== 'string') return ''
  const source = value.trim()
  if (!source) return ''

  if (DATA_IMAGE_PATTERN.test(source)) return source
  if (source.startsWith('blob:')) return source

  try {
    const url = new URL(source, mediaBaseUrl())
    if (url.protocol === 'https:') return url.href
    if (url.protocol === 'http:' && LOCAL_HOSTS.has(url.hostname)) return url.href
  } catch {
    return ''
  }

  return ''
}

export function sanitizeProfileMedia(profile) {
  if (!profile || typeof profile !== 'object') return profile

  const sanitized = { ...profile }
  if ('avatar' in sanitized) sanitized.avatar = safeImageSource(sanitized.avatar)

  if (Array.isArray(sanitized.projects)) {
    sanitized.projects = sanitized.projects.map((project) => (
      project && typeof project === 'object'
        ? { ...project, image: safeImageSource(project.image) }
        : project
    ))
  }

  return sanitized
}

export function sanitizeStoredProfile(storageKey = 'cv-studio-profile-v1') {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return

    const sanitized = sanitizeProfileMedia(parsed)
    if (JSON.stringify(sanitized) !== JSON.stringify(parsed)) {
      localStorage.setItem(storageKey, JSON.stringify(sanitized))
    }
  } catch (error) {
    console.warn('Unable to sanitize stored CV profile media.', error)
  }
}
