const mediaUrl = (filename) => `${import.meta.env.BASE_URL}sample/${filename}`

const projectArtwork = {
  'atlas-ops': 'atlas-ops.svg',
  'signal-ai': 'signal-ai.svg',
  'northstar-system': 'northstar-system.svg',
  'pulse-dashboard': 'pulse-dashboard.svg',
}

export function withLocalSampleMedia(profile) {
  if (!profile || typeof profile !== 'object') return profile

  return {
    ...profile,
    identity: {
      ...profile.identity,
      avatar: mediaUrl('alex-profile.svg'),
    },
    projects: Array.isArray(profile.projects)
      ? profile.projects.map((project) => ({
          ...project,
          image: projectArtwork[project.id] ? mediaUrl(projectArtwork[project.id]) : '',
        }))
      : [],
  }
}
