const mediaUrl = (filename) => `${import.meta.env.BASE_URL}sample/${filename}`

const projectArtwork = {
  'atlas-ops': 'atlas-ops.svg',
  'signal-ai': 'signal-ai.svg',
  'northstar-system': 'northstar-system.svg',
  'pulse-dashboard': 'pulse-dashboard.svg',
  'studio-commerce': 'generated/studio-commerce.svg',
  'forge-portal': 'generated/forge-portal.svg',
}

const slugify = (value) => String(value || 'project')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'project'

export const sampleMediaManifest = {
  avatar: 'alex-profile.svg',
  fallbackAvatar: 'generated/profile-fallback.svg',
  fallbackProject: 'generated/fallback-project.svg',
  projects: { ...projectArtwork },
}

export function sampleProjectArtwork(project = {}) {
  const id = slugify(project.id || project.name)
  return projectArtwork[project.id] || `generated/${id}.svg`
}

export function withLocalSampleMedia(profile) {
  if (!profile || typeof profile !== 'object') return profile

  return {
    ...profile,
    identity: {
      ...profile.identity,
      avatar: mediaUrl(profile.identity?.avatar ? sampleMediaManifest.avatar : sampleMediaManifest.fallbackAvatar),
    },
    projects: Array.isArray(profile.projects)
      ? profile.projects.map((project) => ({
          ...project,
          image: mediaUrl(sampleProjectArtwork(project)),
        }))
      : [],
    seo: {
      ...(profile.seo || {}),
      shareImage: mediaUrl(profile.seo?.shareImage ? sampleMediaManifest.avatar : sampleMediaManifest.fallbackProject),
    },
  }
}
