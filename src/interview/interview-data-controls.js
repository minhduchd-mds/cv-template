// Only keys owned by Interview Studio are cleared here.
// Never erase the shared CV Studio profile or ATS applications automatically.
export const INTERVIEW_LOCAL_KEYS = Object.freeze([
  'interview-studio-sessions-v2',
  'interview-studio-claim-evidence-v1',
  'interview-studio-story-bank-v1',
  'interview-studio-preferences-v1',
  'cv-studio-interview-sessions-v1',
])

export const buildInterviewDataExport = (storage, now = new Date().toISOString()) => {
  const localStorageEntries = {}
  for (const key of INTERVIEW_LOCAL_KEYS) {
    const value = storage.getItem(key)
    if (value !== null) localStorageEntries[key] = value
  }
  let sharedApplications = []
  let selectedTemplateId = ''
  try {
    const workspace = JSON.parse(storage.getItem('cv-studio-workspace-v3') || 'null')
    if (workspace?.format === 'cv-studio-workspace' && Number(workspace.schemaVersion) === 3) {
      sharedApplications = Array.isArray(workspace.ats?.applications) ? workspace.ats.applications : []
      selectedTemplateId = String(workspace.studio?.selectedId || '')
    }
  } catch { /* Malformed shared workspace must not block backup. */ }
  return {
    format: 'interview-studio-backup',
    version: 1,
    exportedAt: now,
    warning: 'This JSON backup is unencrypted and may contain personal CV evidence and job application details.',
    localStorageEntries,
    sharedReadOnlyContext: {
      selectedTemplateId,
      applications: sharedApplications,
    },
  }
}

export const clearInterviewLocalData = (storage) => {
  for (const key of INTERVIEW_LOCAL_KEYS) storage.removeItem(key)
  return INTERVIEW_LOCAL_KEYS.length
}

export const downloadInterviewDataExport = (storage, doc, URLApi, BlobApi) => {
  const backup = buildInterviewDataExport(storage)
  const blob = new BlobApi([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URLApi.createObjectURL(blob)
  try {
    const anchor = doc.createElement('a')
    anchor.href = url
    anchor.download = 'interview-studio-backup-' + backup.exportedAt.slice(0, 10) + '.json'
    anchor.style.display = 'none'
    doc.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    // Release the object URL after the click event completes.
    if (typeof queueMicrotask === 'function') queueMicrotask(() => URLApi.revokeObjectURL(url))
    else URLApi.revokeObjectURL(url)
  }
  return backup
}
