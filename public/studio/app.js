(() => {
  'use strict'

  const PROFILE_KEY = 'cv-studio-static-v2'
  const SETTINGS_KEY = 'cv-studio-static-settings-v2'

  const templates = [
    { id: 'executive-edge', name: 'Executive Edge', category: 'Executive', role: 'Leadership & Senior Management', variant: 'executive', accent: '#b58a3a' },
    { id: 'soft-portfolio-pro', name: 'Soft Portfolio', category: 'Designer', role: 'UI/UX & Product Design', variant: 'product', accent: '#8b5cf6' },
    { id: 'product-operator', name: 'Product Operator', category: 'Product', role: 'Product Management & Product Ops', variant: 'product', accent: '#0e9eac' },
    { id: 'code-aware', name: 'Code Aware', category: 'Engineering', role: 'Design Engineer & Frontend', variant: 'ats', accent: '#2563eb' },
    { id: 'ats-precision', name: 'ATS Precision', category: 'ATS', role: 'Software & Technical Roles', variant: 'ats', accent: '#15803d' },
    { id: 'insight-grid', name: 'Insight Grid', category: 'Data', role: 'Data Analyst & Business Intelligence', variant: 'product', accent: '#2563eb' },
    { id: 'brand-motion', name: 'Brand Motion', category: 'Marketing', role: 'Marketing & Communications', variant: 'creative', accent: '#f25f5c' },
    { id: 'revenue-driver', name: 'Revenue Driver', category: 'Sales', role: 'Sales & Business Development', variant: 'executive', accent: '#0f8a4b' },
    { id: 'people-first', name: 'People First', category: 'People', role: 'HR, Talent & People Operations', variant: 'creative', accent: '#506b5d' },
    { id: 'next-start', name: 'Next Start', category: 'Graduate', role: 'Fresh Graduate & Entry Level', variant: 'creative', accent: '#3b82f6' },
    { id: 'modern-bento', name: 'Bento Resume', category: 'Designer', role: 'Design & Creative', variant: 'creative', accent: '#7c3aed' },
    { id: 'executive-navy', name: 'Executive Navy', category: 'Executive', role: 'Leadership & Corporate', variant: 'executive', accent: '#244a73' },
    { id: 'ats-clean', name: 'ATS Clean', category: 'ATS', role: 'All-purpose ATS', variant: 'ats', accent: '#0f766e' },
    { id: 'modern-mono', name: 'Mono Grid', category: 'Engineering', role: 'Technical & Systems', variant: 'ats', accent: '#111827' },
    { id: 'young-creator-cards', name: 'Creator Cards', category: 'Creative', role: 'Creative & Portfolio', variant: 'creative', accent: '#0ea5a4' },
    { id: 'strategy-brief', name: 'Strategy Brief', category: 'Consulting', role: 'Strategy, Consulting & Advisory', variant: 'executive', accent: '#2563eb' },
    { id: 'clinical-clean', name: 'Clinical Clean', category: 'Healthcare', role: 'Healthcare, Medical & Clinical', variant: 'ats', accent: '#0f766e' },
    { id: 'finance-ledger', name: 'Finance Ledger', category: 'Finance', role: 'Finance, Banking & Investment', variant: 'executive', accent: '#8b6b2e' },
    { id: 'studio-director', name: 'Studio Director', category: 'Creative', role: 'Creative Director & Brand Leadership', variant: 'creative', accent: '#e11d48' },
    { id: 'research-scholar', name: 'Research Scholar', category: 'Academic', role: 'Research, Education & Academia', variant: 'ats', accent: '#7c2d12' },
  ]

  /* STATIC_PRINT_POLICY_V1 */
  const stackSafeTemplates = new Set([
    'soft-portfolio-pro','product-operator','ats-precision','insight-grid','brand-motion',
    'revenue-driver','people-first','next-start','modern-bento','executive-navy',
    'young-creator-cards','strategy-brief','finance-ledger','studio-director'
  ])
  const templatePrintPolicyClass = (templateId) => stackSafeTemplates.has(templateId) ? 'print-stack-safe' : 'print-preserve-flow'

  const rolePresets = {
    recruiter: {
      templateId: 'ats-precision',
      accent: '#15803d',
      font: 'sans',
      density: 'compact',
      radius: 'sharp',
      projectLayout: 'list',
      textScale: 0.95,
      headingScale: 0.95,
      sectionSpacing: 'compact',
    },
    uiux: {
      templateId: 'soft-portfolio-pro',
      accent: '#8b5cf6',
      font: 'sans',
      density: 'balanced',
      radius: 'soft',
      projectLayout: 'cards',
      textScale: 1,
      headingScale: 1.05,
      sectionSpacing: 'balanced',
      avatarSize: 'large',
    },
    engineer: {
      templateId: 'code-aware',
      accent: '#2563eb',
      font: 'mono',
      density: 'compact',
      radius: 'sharp',
      projectLayout: 'list',
      textScale: 0.95,
      headingScale: 1,
      sectionSpacing: 'compact',
    },
    lead: {
      templateId: 'executive-edge',
      accent: '#b58a3a',
      font: 'serif',
      density: 'spacious',
      radius: 'soft',
      projectLayout: 'list',
      textScale: 1,
      headingScale: 1.05,
      sectionSpacing: 'airy',
    },
  }

  const appearancePresets = {
    classic: { font: 'serif', density: 'balanced', radius: 'soft', sectionSpacing: 'balanced', textScale: 1, headingScale: 1.05, projectLayout: 'list' },
    modern: { font: 'sans', density: 'balanced', radius: 'soft', sectionSpacing: 'balanced', textScale: 1, headingScale: 1, projectLayout: 'cards' },
    editorial: { font: 'serif', density: 'spacious', radius: 'soft', sectionSpacing: 'airy', textScale: 1.05, headingScale: 1.1, projectLayout: 'cards' },
    technical: { font: 'mono', density: 'compact', radius: 'sharp', sectionSpacing: 'compact', textScale: 0.95, headingScale: 1, projectLayout: 'list' },
    portfolio: { font: 'sans', density: 'spacious', radius: 'round', sectionSpacing: 'airy', textScale: 1.05, headingScale: 1.1, projectLayout: 'cards' },
    compact: { font: 'sans', density: 'compact', radius: 'sharp', sectionSpacing: 'compact', textScale: 0.9, headingScale: 0.95, projectLayout: 'list' },
  }

  const templateDesignMeta = {
    'executive-edge': { label: 'Executive', structure: 'Header → Summary → Leadership impact → Experience → Achievements → Education', projects: true },
    'soft-portfolio-pro': { label: 'Designer portfolio', structure: 'Hero → Metrics → Case studies → Skills & tools → Experience highlights', projects: true },
    'product-operator': { label: 'Product leadership', structure: 'Profile rail → Impact metrics → Experience → Product highlights → Roadmap', projects: true },
    'code-aware': { label: 'Design engineer', structure: 'Code hero → About → Experience → Skills → Selected work', projects: true },
    'ats-precision': { label: 'ATS / recruiter', structure: 'Profile → Experience & education → Skills → Selected projects → Certifications', projects: true },
    'insight-grid': { label: 'Data / BI', structure: 'Header → Data summary → Skills → Achievements → Tools → Experience', projects: true },
    'brand-motion': { label: 'Marketing', structure: 'Visual rail → Brand hero → Metrics → Experience → Campaigns', projects: true },
    'revenue-driver': { label: 'Sales', structure: 'Sales hero → Summary → KPI highlights → Experience → Skills & clients', projects: false },
    'people-first': { label: 'People / HR', structure: 'People hero → Competencies → Experience → Education → Additional info', projects: false },
    'next-start': { label: 'Fresh graduate', structure: 'Graduate hero → Skills rail → Education → Projects → Internships → Activities', projects: true },
    'modern-bento': { label: 'Designer', structure: 'Profile → Summary → Experience → Projects → Skills & languages', projects: true },
    'executive-navy': { label: 'Executive', structure: 'Executive profile → Summary → Experience → Projects → Skills', projects: true },
    'ats-clean': { label: 'ATS', structure: 'Recruiter-first profile → Experience → Projects → Skills & languages', projects: true },
    'modern-mono': { label: 'Engineering', structure: 'Technical profile → Experience → Projects → Skills & languages', projects: true },
    'young-creator-cards': { label: 'Creative', structure: 'Creative profile → Experience → Portfolio projects → Skills', projects: true },
    'strategy-brief': { label: 'Consulting', structure: 'Executive profile → Summary → Engagement impact → Experience → Selected work → Expertise', projects: true },
    'clinical-clean': { label: 'Healthcare', structure: 'Clinical profile → Experience → Selected work → Skills → Credentials & languages', projects: true },
    'finance-ledger': { label: 'Finance', structure: 'Executive profile → Summary → Quantified impact → Experience → Selected work → Expertise', projects: true },
    'studio-director': { label: 'Creative leadership', structure: 'Editorial hero → Summary → Experience → Portfolio work → Capabilities', projects: true },
    'research-scholar': { label: 'Academic', structure: 'Research profile → Experience → Selected work → Skills → Education & credentials', projects: true },
  }



  /* TEMPLATE_LAYOUT_CONTRACTS_V1 */
  const templateLayoutContracts = {
    'executive-edge': {
      mode:'fixed', label:'Executive hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Executive summary'},
        experience:{supported:true,limit:null,placement:'Primary content'},
        projects:{supported:true,limit:4,placement:'Selected achievements'},
        skills:{supported:false},
        languages:{supported:false},
      }
    },
    'soft-portfolio-pro': {
      mode:'fixed', label:'Portfolio hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Hero'},
        experience:{supported:true,limit:null,placement:'Experience highlights'},
        projects:{supported:true,limit:3,placement:'Selected case studies'},
        skills:{supported:true,limit:null,placement:'Skills + tools rail'},
        languages:{supported:false},
      }
    },
    'product-operator': {
      mode:'fixed', label:'Product leadership hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Profile rail'},
        experience:{supported:true,limit:null,placement:'Primary content'},
        projects:{supported:true,limit:null,placement:'Product highlights'},
        skills:{supported:true,limit:null,placement:'Profile rail'},
        languages:{supported:false},
      }
    },
    'code-aware': {
      mode:'fixed', label:'Technical hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'About'},
        experience:{supported:true,limit:null,placement:'Experience'},
        projects:{supported:true,limit:null,placement:'Selected work'},
        skills:{supported:true,limit:null,placement:'Skills'},
        languages:{supported:false},
      }
    },
    'ats-precision': {
      mode:'guided', label:'Recruiter-first hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Header'},
        experience:{supported:true,limit:null,placement:'Main column'},
        projects:{supported:true,limit:2,placement:'Side column'},
        skills:{supported:true,limit:null,placement:'Side column'},
        languages:{supported:false},
      }
    },
    'insight-grid': {
      mode:'fixed', label:'Analytics hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Data summary'},
        experience:{supported:true,limit:null,placement:'Bottom primary'},
        projects:{supported:true,limit:null,placement:'Key achievements'},
        skills:{supported:true,limit:null,placement:'Skills + tools'},
        languages:{supported:false},
      }
    },
    'brand-motion': {
      mode:'fixed', label:'Campaign hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Brand hero'},
        experience:{supported:true,limit:null,placement:'Work experience'},
        projects:{supported:true,limit:3,placement:'Selected campaigns'},
        skills:{supported:true,limit:null,placement:'Visual rail'},
        languages:{supported:true,limit:null,placement:'Visual rail'},
      }
    },
    'revenue-driver': {
      mode:'fixed', label:'Sales hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Primary column'},
        experience:{supported:true,limit:null,placement:'Primary column'},
        projects:{supported:false},
        skills:{supported:true,limit:null,placement:'Side column'},
        languages:{supported:false},
      }
    },
    'people-first': {
      mode:'fixed', label:'People hierarchy', page:'1–2 pages',
      sections:{
        summary:{supported:true,limit:null,placement:'Hero'},
        experience:{supported:true,limit:null,placement:'Primary content'},
        projects:{supported:false},
        skills:{supported:true,limit:null,placement:'Competencies rail'},
        languages:{supported:true,limit:null,placement:'Additional information'},
      }
    },
    'next-start': {
      mode:'fixed', label:'Early-career hierarchy', page:'1 page preferred',
      sections:{
        summary:{supported:false},
        experience:{supported:true,limit:null,placement:'Internships'},
        projects:{supported:true,limit:2,placement:'Projects'},
        skills:{supported:true,limit:null,placement:'Skills rail'},
        languages:{supported:false},
      }
    },
    'modern-bento': {mode:'flexible',label:'Two-column flexible',page:'1–2 pages'},
    'executive-navy': {mode:'flexible',label:'Executive flexible',page:'1–2 pages'},
    'ats-clean': {mode:'flexible',label:'ATS flexible',page:'1–2 pages'},
    'modern-mono': {mode:'flexible',label:'Technical flexible',page:'1–2 pages'},
    'young-creator-cards': {mode:'flexible',label:'Creative flexible',page:'1–2 pages'},
    'strategy-brief': {mode:'flexible',label:'Consulting flexible',page:'1–2 pages'},
    'clinical-clean': {mode:'flexible',label:'Clinical flexible',page:'1–2 pages'},
    'finance-ledger': {mode:'flexible',label:'Finance flexible',page:'1–2 pages'},
    'studio-director': {mode:'flexible',label:'Editorial flexible',page:'1–2 pages'},
    'research-scholar': {mode:'flexible',label:'Academic flexible',page:'1–2 pages'},
  }

  /* TEMPLATE_CONTRACT_V2_META */
  const templateContractV2Meta = {
    'executive-edge': {structure:'Header → Summary → Leadership impact → Experience → Achievements → Education',traits:['executive','impact'],fields:{avatar:false,headline:false,quote:false}},
    'soft-portfolio-pro': {structure:'Hero → Metrics → Case studies → Skills & tools → Experience highlights',traits:['portfolio','visual','avatar'],fields:{avatar:true,headline:false,quote:false},sections:{experience:{supported:true,limit:3,placement:'Experience highlights'}}},
    'product-operator': {structure:'Profile rail → Impact metrics → Experience → Product highlights → Roadmap',traits:['product','impact','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'code-aware': {structure:'Code hero → About → Experience → Skills → Selected work',traits:['technical','ats-readable'],fields:{avatar:false,headline:false,quote:false}},
    'ats-precision': {structure:'Profile → Experience & education → Skills → Selected projects → Certifications',traits:['ats','recruiter'],fields:{avatar:false,headline:false,quote:false}},
    'insight-grid': {structure:'Header → Data summary → KPI metrics → Skills → Achievements → Experience → Credentials',traits:['data','impact'],fields:{avatar:false,headline:false,quote:false}},
    'brand-motion': {structure:'Visual rail → Brand hero → Metrics → Experience → Campaigns',traits:['portfolio','visual','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'revenue-driver': {structure:'Sales hero → Summary → KPI highlights → Experience → Skills & clients → Quote',traits:['sales','impact','avatar'],fields:{avatar:true,headline:true,quote:true}},
    'people-first': {structure:'People hero → Competencies → Experience → Education → Additional info',traits:['people','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'next-start': {structure:'Graduate hero → Skills rail → Education → Projects → Internships → Activities',traits:['entry-level','one-page','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'modern-bento': {structure:'Profile → Summary → Impact → Experience → Projects → Skills & credentials',traits:['portfolio','visual','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'executive-navy': {structure:'Executive profile → Summary → Impact → Experience → Projects → Expertise & credentials',traits:['executive','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'ats-clean': {structure:'Recruiter-first profile → Summary → Impact → Experience → Projects → Skills & credentials',traits:['ats','recruiter','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'modern-mono': {structure:'Technical profile → Summary → Impact → Experience → Projects → Skills & credentials',traits:['technical','ats-readable','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'young-creator-cards': {structure:'Creative profile → Summary → Impact → Experience → Portfolio projects → Skills & credentials',traits:['portfolio','visual','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'strategy-brief': {structure:'Executive profile → Summary → Engagement impact → Experience → Selected work → Expertise',traits:['consulting','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'clinical-clean': {structure:'Clinical profile → Summary → Experience → Selected work → Skills → Credentials & languages',traits:['ats','healthcare','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'finance-ledger': {structure:'Executive profile → Summary → Quantified impact → Experience → Selected work → Expertise',traits:['finance','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'studio-director': {structure:'Editorial hero → Summary → Experience → Portfolio work → Capabilities',traits:['portfolio','visual','avatar'],fields:{avatar:true,headline:false,quote:false}},
    'research-scholar': {structure:'Research profile → Summary → Experience → Selected work → Skills → Education & credentials',traits:['ats-readable','academic','avatar'],fields:{avatar:true,headline:false,quote:false}},
  }
  Object.entries(templateContractV2Meta).forEach(([id,meta]) => {
    const base=templateLayoutContracts[id]||{}
    templateLayoutContracts[id]={
      ...base,
      ...meta,
      fields:{avatar:true,headline:false,quote:false,...(base.fields||{}),...(meta.fields||{})},
      traits:[...(meta.traits||[])],
      sections:{...(base.sections||{}),...(meta.sections||{})},
    }
  })

  const sectionSettingKey = {
    summary:'showSummary',
    skills:'showSkills',
    experience:'showExperience',
    projects:'showProjects',
    languages:'showLanguages',
  }

  const sectionLabels = {
    summary:'Summary',
    experience:'Experience',
    projects:'Projects',
    skills:'Skills',
    languages:'Languages',
  }

  const genericLayoutSections = {
    summary:{supported:true,limit:null,placement:'Main column'},
    experience:{supported:true,limit:null,placement:'Main column'},
    projects:{supported:true,limit:null,placement:'Main column'},
    skills:{supported:true,limit:null,placement:'Side column'},
    languages:{supported:true,limit:null,placement:'Side column'},
  }

  const activeLayoutContract = () => {
    const template=activeTemplate()
    const contract=templateLayoutContracts[template.id] || {mode:'flexible',label:'Flexible layout',page:'1–2 pages'}
    return {
      ...contract,
      sections:{...genericLayoutSections,...(contract.sections||{})}
    }
  }

  const sectionVisible = (section) => {
    const key=sectionSettingKey[section]
    return key ? settings[key] !== false : true
  }

  const sectionSourceCount = (section) => {
    if(section==='summary') return String(profile.summary||'').trim()?1:0
    if(section==='experience') return Array.isArray(profile.experience)?profile.experience.length:0
    if(section==='projects') return Array.isArray(profile.projects)?profile.projects.length:0
    if(section==='skills') return Array.isArray(profile.skills)?profile.skills.length:0
    if(section==='languages') return Array.isArray(profile.languages)?profile.languages.length:0
    return 0
  }

  const layoutModeLabel = (mode) => mode==='fixed'?'Fixed hierarchy':mode==='guided'?'Guided hierarchy':'Flexible hierarchy'

  const demoProfile = {
    avatar: '',
    name: 'Alex Chen',
    role: 'Senior Product Designer',
    headline: 'Driving revenue. Building partnerships. Creating opportunity.',
    quote: "I don't just meet targets. I create momentum.",
    email: 'alex.chen@example.com',
    phone: '+84 900 000 000',
    location: 'Hanoi, Vietnam',
    website: 'alexchen.design',
    summary:
      'Senior product designer focused on complex enterprise workflows, design systems and code-aware delivery. I connect product thinking, interface craft and implementation constraints to ship clearer digital products.',
    experience: [
      {
        role: 'Senior Product Designer',
        company: 'Product Platform',
        period: '2022 — Present',
        location: 'Hanoi',
        bullets: [
          'Led workflow redesign across complex enterprise surfaces.',
          'Built reusable design-system patterns with engineering.',
          'Improved design-to-development handoff through shared component contracts.',
        ],
      },
      {
        role: 'UI/UX Designer',
        company: 'Digital Products',
        period: '2019 — 2022',
        location: 'Hanoi',
        bullets: [
          'Designed responsive web applications and dashboards.',
          'Ran usability reviews and accessibility-focused UI QA.',
        ],
      },
    ],
    projects: [
      {
        name: 'Design QA Agent',
        type: 'AI · Design Ops',
        impact: 'Faster UI review',
        description:
          'Design-to-code review workflow with evidence, severity and exportable findings.',
      },
      {
        name: 'Enterprise Dashboard',
        type: 'Data · Platform',
        impact: 'Unified reporting',
        description:
          'Decision-focused analytics workspace with progressive drill-down.',
      },
    ],
    skills: [
      'Product strategy',
      'UI/UX Design',
      'Design Systems',
      'Accessibility',
      'Figma',
      'Vue / React',
      'HTML / CSS',
      'AI Product UX',
    ],
    languages: ['Vietnamese · Native', 'English · Professional'],
  }

  const defaultSettings = {
    templateId: 'soft-portfolio-pro',
    accent: '#8b5cf6',
    zoom: 0.85,
    font: 'sans',
    density: 'balanced',
    radius: 'soft',
    projectLayout: 'cards',
    textScale: 1,
    headingScale: 1,
    sectionSpacing: 'balanced',
    avatarShape: 'circle',
    avatarSize: 'medium',
    avatarX: 50,
    avatarY: 50,
    avatarZoom: 1,
    avatarRotate: 0,
    sectionOrder: ['summary', 'experience', 'projects', 'skills', 'languages'],
    showSummary: true,
    showSkills: true,
    showExperience: true,
    showProjects: true,
    showLanguages: true,
  }

  const clone = (value) => JSON.parse(JSON.stringify(value))
  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector))

  const safeParse = (value) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  const restoreObject = (key, fallback) => {
    const saved = safeParse(localStorage.getItem(key) || '')
    if (!saved || typeof saved !== 'object') return clone(fallback)
    return { ...clone(fallback), ...saved }
  }

  const safeAvatar = (value) => (
    typeof value === 'string' && /^data:image\/(?:png|jpe?g|webp);base64,/i.test(value) ? value : ''
  )

  const profileInitials = () =>
    String(profile.name || 'CV').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()

  const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char]))

  const workspaceStore = window.CVStudioWorkspace
  const canonicalWorkspace = workspaceStore?.read?.() || null
  const legacyProfileExists = Boolean(localStorage.getItem(PROFILE_KEY))
  const legacySettingsExists = Boolean(localStorage.getItem(SETTINGS_KEY))
  const legacyProfile = restoreObject(PROFILE_KEY, demoProfile)
  const legacySettings = restoreObject(SETTINGS_KEY, defaultSettings)

  const settingsFromWorkspace = (workspace, fallback) => {
    if (!workspace) return fallback
    const studio = workspace.studio || {}
    const appearance = studio.appearance || {}
    const next = {
      ...fallback,
      ...appearance,
      templateId: typeof studio.selectedId === 'string' ? studio.selectedId : fallback.templateId,
      accent: typeof studio.accent === 'string' ? studio.accent : fallback.accent,
      zoom: [0.75, 0.85, 1].includes(studio.zoom) ? studio.zoom : fallback.zoom,
    }
    const supported = ['summary','experience','projects','skills','languages']
    const sections = Array.isArray(workspace.profile?.sections) ? workspace.profile.sections : []
    const ordered = sections.map((item) => item?.id).filter((id) => supported.includes(id))
    if (ordered.length) next.sectionOrder = ordered
    const visibility = {summary:'showSummary',experience:'showExperience',projects:'showProjects',skills:'showSkills',languages:'showLanguages'}
    sections.forEach((item) => {
      const key = visibility[item?.id]
      if (key) next[key] = item.enabled !== false
    })
    return next
  }

  let profile = canonicalWorkspace?.profile && Object.keys(canonicalWorkspace.profile).length
    ? { ...clone(demoProfile), ...clone(canonicalWorkspace.profile) }
    : legacyProfile
  if (!String(profile.headline || '').trim()) profile.headline = demoProfile.headline
  if (!String(profile.quote || '').trim()) profile.quote = demoProfile.quote
  let settings = settingsFromWorkspace(canonicalWorkspace, legacySettings)
  let avatarDrag = null
  let sectionDrag = null
  let sectionDragJustEnded = false
  let undoStack = []
  let redoStack = []
  let historyRestoring = false
  let lastHistoryState = null
  let templateQuickFilter = 'all'

  if (!Array.isArray(profile.experience)) profile.experience = clone(demoProfile.experience)
  if (!Array.isArray(profile.projects)) profile.projects = clone(demoProfile.projects)
  if (!Array.isArray(profile.skills)) profile.skills = clone(demoProfile.skills)
  if (!Array.isArray(profile.languages)) profile.languages = clone(demoProfile.languages)
  if (!templates.some((item) => item.id === settings.templateId)) settings.templateId = defaultSettings.templateId
  if (!Array.isArray(settings.sectionOrder) || !settings.sectionOrder.length) settings.sectionOrder = clone(defaultSettings.sectionOrder)

  const mergedCanonicalSections = () => {
    const current = workspaceStore?.read?.()
    const existing = Array.isArray(current?.profile?.sections) ? clone(current.profile.sections) : []
    const staticIds = ['summary','experience','projects','skills','languages']
    const label = {summary:'Profile',experience:'Experience',projects:'Projects',skills:'Skills',languages:'Languages'}
    const enabled = {
      summary:settings.showSummary !== false,
      experience:settings.showExperience !== false,
      projects:settings.showProjects !== false,
      skills:settings.showSkills !== false,
      languages:settings.showLanguages !== false,
    }
    const desired = settings.sectionOrder.filter((id) => staticIds.includes(id))
    staticIds.forEach((id) => { if (!desired.includes(id)) desired.push(id) })
    const byId = new Map(existing.map((item) => [item?.id,item]))
    const desiredRows = desired.map((id) => ({ ...(byId.get(id)||{}), id, label:byId.get(id)?.label||label[id], enabled:enabled[id] }))
    if (!existing.length) return desiredRows
    let cursor = 0
    const merged = existing.map((item) => staticIds.includes(item?.id) ? desiredRows[cursor++] : item)
    while (cursor < desiredRows.length) merged.push(desiredRows[cursor++])
    return merged
  }

  const syncCanonicalWorkspace = () => {
    if (!workspaceStore?.patch) return
    const current = workspaceStore.read?.()
    const existingProfile = current?.profile && typeof current.profile === 'object' ? current.profile : {}
    const existingStudio = current?.studio && typeof current.studio === 'object' ? current.studio : {}
    workspaceStore.patch({
      profile: {
        ...clone(existingProfile),
        ...clone(profile),
        availability: typeof existingProfile.availability === 'string' ? existingProfile.availability : '',
        highlights: Array.isArray(existingProfile.highlights) ? clone(existingProfile.highlights) : [],
        education: Array.isArray(existingProfile.education) ? clone(existingProfile.education) : [],
        certificates: Array.isArray(existingProfile.certificates) ? clone(existingProfile.certificates) : [],
        sections: mergedCanonicalSections(),
      },
      studio: {
        ...clone(existingStudio),
        selectedId: settings.templateId,
        accent: settings.accent,
        zoom: settings.zoom,
        appearance: {
          ...(existingStudio.appearance || {}),
          font:settings.font,
          density:settings.density,
          radius:settings.radius,
          projectLayout:settings.projectLayout,
          textScale:settings.textScale,
          headingScale:settings.headingScale,
          sectionSpacing:settings.sectionSpacing,
          avatarShape:settings.avatarShape,
          avatarSize:settings.avatarSize,
          avatarX:settings.avatarX,
          avatarY:settings.avatarY,
          avatarZoom:settings.avatarZoom,
          avatarRotate:settings.avatarRotate,
        },
      },
    }, 'static')
  }

  if (!canonicalWorkspace && (legacyProfileExists || legacySettingsExists)) syncCanonicalWorkspace()

  const activeTemplate = () =>
    templates.find((item) => item.id === settings.templateId) || templates[0]

  const captureHistoryState = () => JSON.stringify({ profile, settings })

  const syncHistoryControls = () => {
    const undo = $('#undoStatic')
    const redo = $('#redoStatic')
    if (undo) undo.disabled = undoStack.length === 0
    if (redo) redo.disabled = redoStack.length === 0
  }

  const persist = () => {
    const currentState = captureHistoryState()
    if (!historyRestoring && lastHistoryState && currentState !== lastHistoryState) {
      undoStack.push(lastHistoryState)
      if (undoStack.length > 30) undoStack.shift()
      redoStack = []
    }
    lastHistoryState = currentState
    syncHistoryControls()

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      syncCanonicalWorkspace()
    } catch (error) {
      console.warn('Unable to persist CV Studio fallback state.', error)
    }
  }

  const restoreHistoryState = (serialized) => {
    const state = safeParse(serialized)
    if (!state || typeof state !== 'object') return
    historyRestoring = true
    profile = { ...clone(demoProfile), ...(state.profile || {}) }
    settings = { ...clone(defaultSettings), ...(state.settings || {}) }
    if (!Array.isArray(settings.sectionOrder) || !settings.sectionOrder.length) settings.sectionOrder = clone(defaultSettings.sectionOrder)
    if (!Array.isArray(profile.experience)) profile.experience = clone(demoProfile.experience)
    if (!Array.isArray(profile.projects)) profile.projects = clone(demoProfile.projects)
    if (!Array.isArray(profile.skills)) profile.skills = clone(demoProfile.skills)
    if (!Array.isArray(profile.languages)) profile.languages = clone(demoProfile.languages)
    renderEditors()
    renderAll()
    lastHistoryState = captureHistoryState()
    historyRestoring = false
    syncHistoryControls()
  }

  const undo = () => {
    if (!undoStack.length) return
    const previous = undoStack.pop()
    redoStack.push(captureHistoryState())
    if (redoStack.length > 30) redoStack.shift()
    restoreHistoryState(previous)
  }

  const redo = () => {
    if (!redoStack.length) return
    const next = redoStack.pop()
    undoStack.push(captureHistoryState())
    if (undoStack.length > 30) undoStack.shift()
    restoreHistoryState(next)
  }

  const setEditorOpen = (open) => {
    $('#editor').classList.toggle('collapsed', !open)
  }

  const activatePane = (name, focusSelector = '') => {
    $$('.tab').forEach((button) => {
      button.classList.toggle('active', button.dataset.tab === name)
    })
    $$('.editor-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.dataset.pane === name)
    })
    setEditorOpen(true)
    if (focusSelector) {
      window.requestAnimationFrame(() => {
        const target = $(focusSelector)
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        target?.focus({ preventScroll: true })
      })
    }
  }

  const templateContract = (template) => {
    const contract=templateLayoutContracts[template.id]||{mode:'flexible',page:'1–2 pages',structure:'Profile → Experience → Projects → Skills',traits:[],fields:{avatar:true,headline:false,quote:false}}
    return {
      ...contract,
      traits:Array.isArray(contract.traits)?contract.traits:[],
      fields:{avatar:true,headline:false,quote:false,...(contract.fields||{})},
    }
  }

  const staticTemplateFilterMatch = (template,contract) => {
    if(templateQuickFilter==='all')return true
    if(templateQuickFilter==='ats')return contract.traits.includes('ats')||contract.traits.includes('ats-readable')
    if(templateQuickFilter==='portfolio')return contract.traits.includes('portfolio')
    if(templateQuickFilter==='avatar')return contract.fields.avatar!==false
    if(templateQuickFilter==='one-page')return String(contract.page||'').toLowerCase().includes('1 page preferred')
    if(templateQuickFilter==='flexible')return contract.mode==='flexible'
    return true
  }

  const renderStaticTemplateContract = () => {
    const host=$('#staticTemplateContract')
    if(!host)return
    const template=activeTemplate()
    const contract=templateContract(template)
    const hierarchy=contract.mode==='flexible'?'Flexible hierarchy':contract.mode==='guided'?'Guided hierarchy':'Fixed hierarchy'
    const pills=[
      contract.page||'1–2 pages',
      contract.fields.avatar!==false?'Avatar':'No avatar',
      contract.traits.includes('ats')||contract.traits.includes('ats-readable')?'ATS-readable':'',
      contract.traits.includes('portfolio')?'Portfolio':'',
    ].filter(Boolean)
    host.innerHTML=
      '<div><span>'+escapeHtml(hierarchy)+'</span><strong>'+escapeHtml(template.name)+'</strong><p>'+escapeHtml(contract.structure||template.role||'Template structure')+'</p></div>'+
      '<div>'+pills.map((item)=>'<small>'+escapeHtml(item)+'</small>').join('')+'</div>'
  }

  const renderTemplates = () => {
    const list = $('#templateList')
    const query = String($('#templateSearch')?.value || '').trim().toLowerCase()
    const visibleTemplates = templates.filter((template) => {
      const contract=templateContract(template)
      const source=[template.name,template.category,template.role,contract.structure,...contract.traits].join(' ').toLowerCase()
      return (!query||source.includes(query))&&staticTemplateFilterMatch(template,contract)
    })
    const countLabel = $('#templateCountLabel')
    if (countLabel) countLabel.textContent = visibleTemplates.length+' of '+templates.length+' templates · 4 role presets'
    list.innerHTML = ''
    renderStaticTemplateContract()

    if (!visibleTemplates.length) {
      list.innerHTML = '<div class="template-list-empty"><strong>No template matches these filters.</strong><span>Clear search or change capability filter.</span><button type="button" id="clearStaticTemplateFilters">Clear filters</button></div>'
      $('#clearStaticTemplateFilters')?.addEventListener('click',()=>{
        const search=$('#templateSearch'); if(search)search.value=''
        templateQuickFilter='all'
        $$('[data-static-template-filter]').forEach((button)=>button.classList.toggle('active',button.dataset.staticTemplateFilter==='all'))
        renderTemplates()
      })
      return
    }

    visibleTemplates.forEach((template) => {
      const contract=templateContract(template)
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'template-card'+(template.id === settings.templateId ? ' active' : '')
      button.setAttribute('aria-pressed', template.id === settings.templateId ? 'true' : 'false')
      button.innerHTML =
        '<span class="template-thumb thumb-'+template.id+'" style="--thumb-accent:'+template.accent+'"><i></i><i></i><i></i></span>'+
        '<span class="static-template-copy"><strong>'+escapeHtml(template.name)+'</strong><small>'+escapeHtml(template.role || template.category)+'</small>'+
        '<span class="static-template-chips"><i>'+escapeHtml(contract.page||'1–2 pages')+'</i><i>'+escapeHtml(contract.mode||'flexible')+'</i>'+(contract.fields.avatar!==false?'<i>avatar</i>':'')+'</span></span>'
      button.addEventListener('click', () => {
        settings.templateId = template.id
        settings.accent = template.accent
        renderAll()
      })
      list.appendChild(button)
    })
  }

  const sectionOrderIndex = (id) => {
    const index = (settings.sectionOrder || []).indexOf(id)
    return index === -1 ? 99 : index
  }

  const renderExperience = () =>
    profile.experience
      .map(
        (job) => `
          <article class="job">
            <div class="job-head">
              <strong>${escapeHtml(job.role)} · ${escapeHtml(job.company)}</strong>
              <span>${escapeHtml(job.period)}</span>
            </div>
            <small>${escapeHtml(job.location || '')}</small>
            <ul>${(job.bullets || []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>
          </article>
        `,
      )
      .join('')

  const templateEnhancement = (template) => {
    const roleCount = Array.isArray(profile.experience) ? profile.experience.length : 0
    const projectCount = Array.isArray(profile.projects) ? profile.projects.length : 0
    const skillCount = Array.isArray(profile.skills) ? profile.skills.length : 0
    const languageCount = Array.isArray(profile.languages) ? profile.languages.length : 0

    if (template.id === 'soft-portfolio-pro') {
      return `
        <div class="template-decor decor-soft" aria-hidden="true">
          <div><strong>${roleCount}</strong><span>Roles</span></div>
          <div><strong>${projectCount}</strong><span>Projects</span></div>
          <div><strong>${skillCount}</strong><span>Core skills</span></div>
          <div><strong>${languageCount}</strong><span>Languages</span></div>
        </div>
      `
    }

    if (template.id === 'product-operator') {
      return `
        <div class="template-decor decor-product" aria-hidden="true">
          <span>Strategy</span><i></i><span>Execution</span><i></i><span>Impact</span>
        </div>
      `
    }

    if (template.id === 'insight-grid') {
      return `
        <div class="template-decor decor-insight" aria-hidden="true">
          <div class="mini-bars"><i></i><i></i><i></i><i></i><i></i></div>
          <div><strong>${projectCount}</strong><span>Projects</span></div>
          <div><strong>${skillCount}</strong><span>Skills</span></div>
          <div><strong>${roleCount}</strong><span>Roles</span></div>
        </div>
      `
    }

    if (template.id === 'brand-motion') {
      return `
        <div class="template-decor decor-brand" aria-hidden="true">
          <span>Ideas</span><span>People</span><span>Stories</span><span>Impact</span>
        </div>
      `
    }

    if (template.id === 'next-start') {
      return `
        <div class="template-decor decor-start" aria-hidden="true">
          <span>Learn</span><i>→</i><span>Build</span><i>→</i><span>Grow</span>
          <b>${projectCount} projects · ${skillCount} skills</b>
        </div>
      `
    }

    return ''
  }

  const renderProjects = () =>
    profile.projects
      .map(
        (project) => `
          <article class="project">
            <strong>${escapeHtml(project.name)}</strong>
            <b>${escapeHtml(project.type)} · ${escapeHtml(project.impact)}</b>
            <p>${escapeHtml(project.description)}</p>
          </article>
        `,
      )
      .join('')


  const avatarMarkup = (className = 'ref-avatar') => {
    const avatar = safeAvatar(profile.avatar)
    const initials = profileInitials()
    const shape = ['circle', 'rounded', 'square'].includes(settings.avatarShape) ? settings.avatarShape : 'circle'
    const x = Number.isFinite(Number(settings.avatarX)) ? Math.min(100, Math.max(0, Number(settings.avatarX))) : 50
    const y = Number.isFinite(Number(settings.avatarY)) ? Math.min(100, Math.max(0, Number(settings.avatarY))) : 50
    const zoom = Number.isFinite(Number(settings.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(settings.avatarZoom))) : 1
    const rotate = Number.isFinite(Number(settings.avatarRotate)) ? Math.min(180, Math.max(-180, Number(settings.avatarRotate))) : 0
    if (avatar) {
      return '<div class="' + className + ' avatar-shape-' + shape + '"><img src="' + escapeHtml(avatar) + '" alt="" style="object-position:' + x + '% ' + y + '%;transform:scale(' + zoom + ') rotate(' + rotate + 'deg)" /></div>'
    }
    return '<div class="' + className + ' avatar-shape-' + shape + '"><span>' + escapeHtml(initials) + '</span></div>'
  }

  const refContact = () => `
    <div class="ref-contact">
      <span>${escapeHtml(profile.email)}</span>
      <span>${escapeHtml(profile.phone)}</span>
      <span>${escapeHtml(profile.location)}</span>
      <span>${escapeHtml(profile.website)}</span>
    </div>
  `

  const refHighlights = (className = '') => {
    const items = [
      { value: (profile.experience || []).length + '+', label: 'Roles' },
      { value: (profile.projects || []).length + '+', label: 'Projects' },
      { value: (profile.skills || []).length + '+', label: 'Skills' },
      { value: (profile.languages || []).length + '+', label: 'Languages' },
    ]
    return '<div class="' + ['ref-metrics', className].filter(Boolean).join(' ') + '">' + items.map((item) => '<div><strong>' + escapeHtml(item.value) + '</strong><span>' + escapeHtml(item.label) + '</span></div>').join('') + '</div>'
  }

  const refExperience = (className = '') =>
    '<div class="' + ['ref-experience', className].filter(Boolean).join(' ') + '">' + (profile.experience || []).map((job) => `
      <article>
        <div class="ref-job-head"><div><strong>${escapeHtml(job.role)}</strong><span>${escapeHtml(job.company)}${job.location ? ' · ' + escapeHtml(job.location) : ''}</span></div><time>${escapeHtml(job.period)}</time></div>
        <ul>${(job.bullets || []).map((bullet) => '<li>' + escapeHtml(bullet) + '</li>').join('')}</ul>
      </article>
    `).join('') + '</div>'

  const refProjects = (className = '', limit = null) => {
    const items = Array.isArray(profile.projects) ? profile.projects : []
    const visible = Number.isFinite(Number(limit)) ? items.slice(0, Number(limit)) : items
    return '<div class="' + ['ref-projects', className].filter(Boolean).join(' ') + '">' + visible.map((project, index) => `
      <article>
        <div class="ref-project-index">0${index + 1}</div>
        <div><span>${escapeHtml(project.type || 'Project')}</span><strong>${escapeHtml(project.name)}</strong></div>
        <p>${escapeHtml(project.description)}</p>
        <small>${escapeHtml(project.impact || '')}</small>
      </article>
    `).join('') + '</div>'
  }

  const refSkills = (className = '') =>
    '<div class="' + ['ref-skills', className].filter(Boolean).join(' ') + '">' + (profile.skills || []).map((skill) => '<span>' + escapeHtml(skill) + '</span>').join('') + '</div>'

  const refEducation = () => {
    const education = Array.isArray(profile.education) ? profile.education : []
    if (!education.length) return ''
    return '<div class="ref-education">' + education.map((item) => '<article><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.place || '') + '</span><small>' + escapeHtml(item.period || '') + '</small></article>').join('') + '</div>'
  }

  const refCertificates = () => {
    const items = Array.isArray(profile.certificates) ? profile.certificates : []
    if (!items.length) return ''
    return '<div class="ref-certificates">' + items.map((item) => '<article><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.issuer || '') + '</span><small>' + escapeHtml(item.period || '') + '</small></article>').join('') + '</div>'
  }

  const renderExecutiveEdge = () => `
    <div class="ref-cv ref-executive-edge">
      <header class="ref-exec-head" data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2></div>
        <div class="ref-exec-motto">PEOPLE<br>STRATEGY<br>GROWTH<br>LASTING IMPACT</div>
      </header>
      ${refContact()}
      ${sectionVisible('summary') ? '<section class="ref-section ref-summary" data-edit-pane="content" data-edit-focus="#summary"><h3>Executive Summary</h3><p>' + escapeHtml(profile.summary) + '</p></section>' : ''}
      <section class="ref-section" data-edit-pane="content"><h3>Leadership Impact</h3>${refHighlights('ref-exec-impact')}</section>
      ${sectionVisible('experience') ? '<section class="ref-section" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>' + refExperience('ref-exec-experience') + '</section>' : ''}
      ${sectionVisible('projects') ? '<section class="ref-section" data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Selected Achievements</h3>' + refProjects('ref-achievement-row', 4) + '</section>' : ''}
      ${refEducation() ? '<section class="ref-section"><h3>Education & Professional Development</h3>' + refEducation() + '</section>' : ''}
    </div>
  `

  const renderSoftPortfolio = () => `
    <div class="ref-cv ref-soft-portfolio">
      <header class="ref-soft-hero" data-edit-pane="content" data-edit-focus="#name">
        <div class="ref-soft-copy">
          <span class="ref-eyebrow">Senior UI/UX Designer</span>
          <h1>${escapeHtml(profile.name)}</h1>
          <h2>${escapeHtml(profile.role)}</h2>
          ${sectionVisible('summary') ? '<p>' + escapeHtml(profile.summary) + '</p>' : ''}
          ${refContact()}
        </div>
        <div class="ref-soft-portrait">${avatarMarkup('ref-soft-avatar')}<span class="ref-hand-note">Good design<br>builds better<br>tomorrows.</span></div>
      </header>
      ${refHighlights('ref-soft-metrics')}
      <div class="ref-soft-body">
        ${sectionVisible('projects') ? '<main data-edit-pane="content" data-edit-focus="#projectEditor"><div class="ref-section-title">Selected Case Studies</div>' + refProjects('ref-soft-projects', 3) + '</main>' : '<main></main>'}
        ${sectionVisible('skills') ? '<aside data-edit-pane="content" data-edit-focus="#skills"><div class="ref-section-title">Core Skills</div>' + refSkills('ref-soft-skills') + '<div class="ref-section-title">Tools</div>' + refSkills('ref-tool-grid') + '</aside>' : '<aside></aside>'}
      </div>
      ${sectionVisible('experience') ? '<section class="ref-soft-highlights" data-edit-pane="content" data-edit-focus="#experienceEditor"><div class="ref-section-title">Experience Highlights</div>' + refExperience('ref-soft-experience') + '</section>' : ''}
    </div>
  `

  const renderProductOperator = () => `
    <div class="ref-cv ref-product-operator">
      <aside class="ref-product-rail" data-edit-pane="content" data-edit-focus="#name">
        ${avatarMarkup('ref-product-avatar')}
        <h1>${escapeHtml(profile.name)}</h1>
        <h2>${escapeHtml(profile.role)}</h2>
        ${sectionVisible('summary') ? '<p>' + escapeHtml(profile.summary) + '</p>' : ''}
        ${refContact()}
        ${sectionVisible('skills') ? '<div data-edit-pane="content" data-edit-focus="#skills"><div class="ref-rail-label">Core Skills</div>' + refSkills('ref-rail-skills') + '</div>' : ''}
      </aside>
      <main class="ref-product-main">
        <header><h1>From Insight to Impact</h1><span>PEOPLE · PRODUCTS · PROGRESS</span></header>
        ${refHighlights('ref-product-metrics')}
        ${sectionVisible('experience') ? '<section class="ref-section" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Experience</h3>' + refExperience('ref-product-experience') + '</section>' : ''}
        <div class="ref-product-lower">
          ${sectionVisible('projects') ? '<section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Product Highlights</h3>' + refProjects('ref-product-highlights') + '</section>' : '<section></section>'}
          <section><h3>Roadmap Mindset</h3><div class="ref-roadmap"><div><b>Discover</b><span>Understand</span></div><div><b>Define</b><span>Set strategy</span></div><div><b>Deliver</b><span>Build & test</span></div><div><b>Scale</b><span>Measure impact</span></div></div></section>
        </div>
      </main>
    </div>
  `

  const renderCodeAware = () => `
    <div class="ref-cv ref-code-aware">
      <header class="ref-code-head" data-edit-pane="content" data-edit-focus="#name">
        <div><span>&lt; CV /&gt;</span><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2></div>
        <div><span>// Build interfaces</span><span>// for a more human web.</span>${refContact()}</div>
      </header>
      <div class="ref-code-grid">
        ${sectionVisible('summary') ? '<section class="ref-code-about" data-edit-pane="content" data-edit-focus="#summary"><h3>01 / ABOUT</h3><p>' + escapeHtml(profile.summary) + '</p></section>' : '<section class="ref-code-about"></section>'}
        <div class="ref-code-poster">DESIGN<br>×<br>CODE<br>×<br>PEOPLE<br>=<br><b>BETTER PRODUCTS</b></div>
      </div>
      ${sectionVisible('experience') ? '<section class="ref-section" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>02 / EXPERIENCE</h3>' + refExperience('ref-code-experience') + '</section>' : ''}
      ${sectionVisible('skills') ? '<section class="ref-section" data-edit-pane="content" data-edit-focus="#skills"><h3>03 / SKILLS</h3><div class="ref-code-skills">' + (profile.skills || []).map((skill, index) => '<div><span>' + escapeHtml(skill) + '</span><i style="--level:' + Math.max(3, 7 - (index % 5)) + '"></i></div>').join('') + '</div></section>' : ''}
      ${sectionVisible('projects') ? '<section class="ref-section" data-edit-pane="content" data-edit-focus="#projectEditor"><h3>04 / SELECTED WORK</h3>' + refProjects('ref-code-work') + '</section>' : ''}
    </div>
  `

  const renderAtsPrecision = () => `
    <div class="ref-cv ref-ats-precision">
      <header class="ref-ats-head" data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2>${sectionVisible('summary') ? '<p>' + escapeHtml(profile.summary) + '</p>' : ''}</div>
        ${refContact()}
      </header>
      <div class="ref-ats-body">
        <main>${sectionVisible('experience') ? '<section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Experience</h3>' + refExperience('ref-ats-experience') + '</section>' : ''}${refEducation() ? '<section><h3>Education</h3>' + refEducation() + '</section>' : ''}</main>
        <aside>${sectionVisible('skills') ? '<section data-edit-pane="content" data-edit-focus="#skills"><h3>Skills</h3>' + refSkills('ref-ats-skills') + '</section>' : ''}${sectionVisible('projects') ? '<section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Selected Projects</h3>' + refProjects('ref-ats-projects', 2) + '</section>' : ''}${refCertificates() ? '<section><h3>Certifications</h3>' + refCertificates() + '</section>' : ''}</aside>
      </div>
    </div>
  `

  const renderInsightGrid = () => `
    <div class="ref-cv ref-insight-grid">
      <header class="ref-insight-head" data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2>${refContact()}</div>
        <div class="ref-chart-bars"><i></i><i></i><i></i><i></i><i></i><strong>Turning Data<br>Into Decisions</strong></div>
      </header>
      ${sectionVisible('summary') ? '<section class="ref-insight-summary" data-edit-pane="content" data-edit-focus="#summary"><div><h3>Professional Summary</h3><p>' + escapeHtml(profile.summary) + '</p></div>' + refHighlights('ref-insight-metrics') + '</section>' : '<section class="ref-insight-summary">' + refHighlights('ref-insight-metrics') + '</section>'}
      <div class="ref-insight-grid-body">
        ${sectionVisible('skills') ? '<section data-edit-pane="content" data-edit-focus="#skills"><h3>Core Skills</h3><div class="ref-skill-bars">' + (profile.skills || []).map((skill, index) => '<div><span>' + escapeHtml(skill) + '</span><i><b style="width:' + Math.max(62, 92 - index * 4) + '%"></b></i></div>').join('') + '</div></section>' : '<section></section>'}
        ${sectionVisible('projects') ? '<section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Key Achievements</h3>' + refProjects('ref-insight-achievements') + '</section>' : '<section></section>'}
        ${sectionVisible('skills') ? '<section><h3>Tools & Technologies</h3>' + refSkills('ref-insight-tools') + '</section>' : '<section></section>'}
      </div>
      <div class="ref-insight-bottom">${sectionVisible('experience') ? '<section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>' + refExperience('ref-insight-experience') + '</section>' : '<section></section>'}<aside>${refEducation() ? '<h3>Education</h3>' + refEducation() : ''}${refCertificates() ? '<h3>Certifications</h3>' + refCertificates() : ''}</aside></div>
    </div>
  `

  const renderBrandMotion = () => `
    <div class="ref-cv ref-brand-motion">
      <aside class="ref-brand-rail">
        ${avatarMarkup('ref-brand-avatar')}
        ${refContact()}
        <blockquote>Brands grow when<br>people feel something.</blockquote>
        ${sectionVisible('skills') ? '<div data-edit-pane="content" data-edit-focus="#skills"><h3>Skills</h3>' + refSkills('ref-brand-skills') + '</div>' : ''}
        ${sectionVisible('languages') ? '<div data-edit-pane="content" data-edit-focus="#languages"><h3>Languages</h3><div class="ref-brand-languages">' + (profile.languages || []).map((language) => '<span>' + escapeHtml(language) + '</span>').join('') + '</div></div>' : ''}
      </aside>
      <main class="ref-brand-main">
        <header data-edit-pane="content" data-edit-focus="#name"><span>Ideas · People · Impact</span><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2>${sectionVisible('summary') ? '<p>' + escapeHtml(profile.summary) + '</p>' : ''}<em>BRANDS<br>PEOPLE<br>STORIES<br>GROWTH</em></header>
        ${refHighlights('ref-brand-metrics')}
        ${sectionVisible('experience') ? '<section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Work Experience</h3>' + refExperience('ref-brand-experience') + '</section>' : ''}
        ${sectionVisible('projects') ? '<section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Selected Campaigns</h3>' + refProjects('ref-brand-projects', 3) + '</section>' : ''}
      </main>
    </div>
  `

  const renderRevenueDriver = () => `
    <div class="ref-cv ref-revenue-driver">
      <header>
        <div>
          <div data-edit-pane="content" data-edit-focus="#name"><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2></div>
          <p data-edit-pane="content" data-edit-focus="#headline">${escapeHtml(profile.headline || demoProfile.headline)}</p>
        </div>
        <div data-edit-pane="content" data-edit-focus="#name">${avatarMarkup('ref-sales-avatar')}</div>
      </header>
      ${refContact()}
      <div class="ref-sales-body">
        <main>
          ${sectionVisible('summary') ? '<section data-edit-pane="content" data-edit-focus="#summary"><h3>Professional Summary</h3><p>' + escapeHtml(profile.summary) + '</p></section>' : ''}
          <section data-edit-pane="content" data-edit-focus="#summary"><h3>Key Performance Highlights</h3>${refHighlights('ref-sales-metrics')}</section>
          ${sectionVisible('experience') ? '<section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>' + refExperience('ref-sales-experience') + '</section>' : ''}
        </main>
        <aside>${sectionVisible('skills') ? '<div data-edit-pane="content" data-edit-focus="#skills"><h3>Core Skills</h3>' + refSkills('ref-sales-skills') + '<h3>Selected Clients</h3><div class="ref-client-grid"><span>Microsoft</span><span>Vodafone</span><span>Sage</span><span>DELL</span><span>HSBC</span><span>Atlassian</span></div></div>' : ''}<blockquote data-edit-pane="content" data-edit-focus="#quote">“${escapeHtml(profile.quote || demoProfile.quote)}”</blockquote></aside>
      </div>
    </div>
  `

  const renderPeopleFirst = () => `
    <div class="ref-cv ref-people-first">
      <header data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2>${sectionVisible('summary') ? '<p>' + escapeHtml(profile.summary) + '</p>' : ''}</div>
        <div class="ref-people-portrait">${avatarMarkup('ref-people-avatar')}<span>People<br>Build<br>Brighter<br>Workplaces ♡</span></div>
      </header>
      ${refContact()}
      <div class="ref-people-body">
        <aside>${sectionVisible('skills') ? '<div data-edit-pane="content" data-edit-focus="#skills"><h3>Key Competencies</h3>' + refSkills('ref-people-skills') + '</div>' : ''}${refEducation() ? '<h3>Education</h3>' + refEducation() : ''}</aside>
        <main>${sectionVisible('experience') ? '<div data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>' + refExperience('ref-people-experience') + '</div>' : ''}${sectionVisible('languages') ? '<div data-edit-pane="content" data-edit-focus="#languages"><h3>Additional Information</h3><div class="ref-people-extra">' + (profile.languages || []).map((language) => '<span>' + escapeHtml(language) + '</span>').join('') + '</div></div>' : ''}</main>
      </div>
    </div>
  `

  const renderNextStart = () => `
    <div class="ref-cv ref-next-start">
      <header data-edit-pane="content" data-edit-focus="#name"><div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2><p>Curious learner · Problem solver · Ready to make an impact</p></div><span class="ref-next-note">A Brighter<br>You Ahead</span></header>
      <div class="ref-next-body">
        <aside><div data-edit-pane="content" data-edit-focus="#name">${avatarMarkup('ref-next-avatar')}<blockquote>Eager to learn,<br>excited to build,<br>ready for what's next.</blockquote>${refContact()}</div>${sectionVisible('skills') ? '<div data-edit-pane="content" data-edit-focus="#skills"><h3>Skills</h3>' + refSkills('ref-next-skills') + '</div>' : ''}</aside>
        <main>
          ${refEducation() ? '<section><h3>Education</h3>' + refEducation() + '</section>' : ''}
          ${sectionVisible('projects') ? '<section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Projects</h3>' + refProjects('ref-next-projects', 2) + '</section>' : ''}
          ${sectionVisible('experience') ? '<section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Internships</h3>' + refExperience('ref-next-experience') + '</section>' : ''}
          <section><h3>Activities</h3><div class="ref-next-activities"><span>Community involvement</span><span>Team projects</span><span>Continuous learning</span></div></section>
        </main>
      </div>
      <div class="ref-next-wave"><span>Small Steps<br>Big Impact ↗</span><b>Next Start · Brighter Tomorrow</b></div>
    </div>
  `

  const referenceRenderers = {
    'executive-edge': renderExecutiveEdge,
    'soft-portfolio-pro': renderSoftPortfolio,
    'product-operator': renderProductOperator,
    'code-aware': renderCodeAware,
    'ats-precision': renderAtsPrecision,
    'insight-grid': renderInsightGrid,
    'brand-motion': renderBrandMotion,
    'revenue-driver': renderRevenueDriver,
    'people-first': renderPeopleFirst,
    'next-start': renderNextStart,
  }

  let renderPaper = () => {
    const paper = $('#paper')
    const template = activeTemplate()
    const layoutVariant =
      template.variant === 'system'
        ? 'product'
        : template.variant === 'tech'
          ? 'ats'
          : template.variant

    const avatarShape = ['circle', 'rounded', 'square'].includes(settings.avatarShape) ? settings.avatarShape : 'circle'
    const avatarSize = ['small', 'medium', 'large'].includes(settings.avatarSize) ? settings.avatarSize : 'medium'
    const avatarX = Number.isFinite(Number(settings.avatarX)) ? Math.min(100, Math.max(0, Number(settings.avatarX))) : 50
    const avatarY = Number.isFinite(Number(settings.avatarY)) ? Math.min(100, Math.max(0, Number(settings.avatarY))) : 50
    const avatarZoom = Number.isFinite(Number(settings.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(settings.avatarZoom))) : 1
    const avatarRotate = Number.isFinite(Number(settings.avatarRotate)) ? Math.min(180, Math.max(-180, Number(settings.avatarRotate))) : 0
    const textScale = Number.isFinite(Number(settings.textScale)) ? Math.min(1.15, Math.max(.9, Number(settings.textScale))) : 1
    const headingScale = Number.isFinite(Number(settings.headingScale)) ? Math.min(1.2, Math.max(.9, Number(settings.headingScale))) : 1
    const sectionSpacing = ['compact', 'balanced', 'airy'].includes(settings.sectionSpacing) ? settings.sectionSpacing : 'balanced'
    paper.className = `paper template-${layoutVariant} theme-${template.id} ${templatePrintPolicyClass(template.id)} font-${settings.font} density-${settings.density} radius-${settings.radius} projects-${settings.projectLayout || 'cards'} spacing-${sectionSpacing} avatar-${avatarShape} avatar-size-${avatarSize}`
    paper.style.setProperty('--accent', settings.accent)
    paper.style.setProperty('--zoom', String(settings.zoom))
    paper.style.setProperty('--text-scale', String(textScale))
    paper.style.setProperty('--heading-scale', String(headingScale))

    const dedicatedRenderer = referenceRenderers[template.id]
    if (dedicatedRenderer) {
      paper.innerHTML = dedicatedRenderer()
      $('#activeTemplateLabel').textContent = `${template.name} · A4`
      return
    }

    const enhancement = templateEnhancement(template)

    const summary = settings.showSummary
      ? `<section class="summary draggable-section" draggable="true" data-section-key="summary" data-section-group="main" style="order:${sectionOrderIndex('summary')}" data-edit-pane="content" data-edit-focus="#summary"><p>${escapeHtml(profile.summary)}</p></section>`
      : ''

    const experience = settings.showExperience
      ? `<section class="draggable-section" draggable="true" data-section-key="experience" data-section-group="main" style="order:${sectionOrderIndex('experience')}" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3 class="section-title">Experience</h3>${renderExperience()}</section>`
      : ''

    const projects = settings.showProjects
      ? `<section class="project-section draggable-section" draggable="true" data-section-key="projects" data-section-group="main" style="order:${sectionOrderIndex('projects')}" data-edit-pane="content" data-edit-focus="#projectEditor"><h3 class="section-title">Selected work</h3><div class="project-items">${renderProjects()}</div></section>`
      : ''

    const skills = settings.showSkills
      ? `<section class="draggable-section" draggable="true" data-section-key="skills" data-section-group="side" style="order:${sectionOrderIndex('skills')}" data-edit-pane="content" data-edit-focus="#skills"><h3 class="section-title">Core skills</h3><div class="skills">${profile.skills.map((skill) => `<span>${escapeHtml(skill)}</span>`).join('')}</div></section>`
      : ''

    const avatar = safeAvatar(profile.avatar)
      ? '<div class="paper-avatar avatar-shape-' + avatarShape + '"><img src="' + escapeHtml(safeAvatar(profile.avatar)) + '" alt="" style="object-position:' + avatarX + '% ' + avatarY + '%;transform:scale(' + avatarZoom + ') rotate(' + avatarRotate + 'deg)" /></div>'
      : ''

    const languages = sectionVisible('languages') ? `
      <section class="draggable-section" draggable="true" data-section-key="languages" data-section-group="side" style="order:${sectionOrderIndex('languages')}" data-edit-pane="content" data-edit-focus="#languages">
        <h3 class="section-title">Languages</h3>
        <div class="languages">${profile.languages.map((language) => `<span>${escapeHtml(language)}</span>`).join('')}</div>
      </section>
    ` : ''

    paper.innerHTML = `
      <header class="cv-head" data-edit-pane="content" data-edit-focus="#name">
        <div class="cv-head-main">
          <div>
        <div class="cv-kicker">${escapeHtml(profile.role)}</div>
        <h1>${escapeHtml(profile.name)}</h1>
        <h2>${escapeHtml(profile.role)}</h2>
          </div>
          ${avatar}
        </div>
        <div class="contact">
          <span>${escapeHtml(profile.location)}</span>
          <span>${escapeHtml(profile.email)}</span>
          <span>${escapeHtml(profile.phone)}</span>
          <span>${escapeHtml(profile.website)}</span>
        </div>
      </header>
      ${enhancement}
      <div class="cv-body">
        <main class="cv-main">
          ${summary}
          ${experience}
          ${projects}
        </main>
        <aside class="cv-side">
          ${skills}
          ${languages}
        </aside>
      </div>
    `

    $('#activeTemplateLabel').textContent = `${template.name} · A4`
  }

  const renderExperienceEditor = () => {
    const host = $('#experienceEditor')
    host.innerHTML = ''

    profile.experience.forEach((job, index) => {
      const card = document.createElement('article')
      card.className = 'editor-card'
      card.innerHTML = `
        <div class="editor-card-head">
          <strong>Experience ${index + 1}</strong>
          <button type="button" data-remove>Remove</button>
        </div>
        <label>Role<input data-key="role" value="${escapeHtml(job.role)}" /></label>
        <label>Company<input data-key="company" value="${escapeHtml(job.company)}" /></label>
        <div class="field-grid">
          <label>Period<input data-key="period" value="${escapeHtml(job.period)}" /></label>
          <label>Location<input data-key="location" value="${escapeHtml(job.location || '')}" /></label>
        </div>
        <label>Achievements · one per line<textarea data-key="bullets" rows="5">${escapeHtml((job.bullets || []).join('\n'))}</textarea></label>
      `

      $('[data-remove]', card).addEventListener('click', () => {
        profile.experience.splice(index, 1)
        renderAll()
        renderEditors()
      })

      $$('[data-key]', card).forEach((input) => {
        input.addEventListener('input', () => {
          const key = input.dataset.key
          job[key] =
            key === 'bullets'
              ? input.value.split(/\n+/).map((item) => item.trim()).filter(Boolean)
              : input.value
          persist()
          renderPaper()
        })
      })

      host.appendChild(card)
    })
  }

  const renderProjectsEditor = () => {
    const host = $('#projectEditor')
    host.innerHTML = ''

    profile.projects.forEach((project, index) => {
      const card = document.createElement('article')
      card.className = 'editor-card'
      card.innerHTML = `
        <div class="editor-card-head">
          <strong>Project ${index + 1}</strong>
          <button type="button" data-remove>Remove</button>
        </div>
        <label>Name<input data-key="name" value="${escapeHtml(project.name)}" /></label>
        <div class="field-grid">
          <label>Type<input data-key="type" value="${escapeHtml(project.type)}" /></label>
          <label>Impact<input data-key="impact" value="${escapeHtml(project.impact)}" /></label>
        </div>
        <label>Description<textarea data-key="description" rows="5">${escapeHtml(project.description)}</textarea></label>
      `

      $('[data-remove]', card).addEventListener('click', () => {
        profile.projects.splice(index, 1)
        renderAll()
        renderEditors()
      })

      $$('[data-key]', card).forEach((input) => {
        input.addEventListener('input', () => {
          project[input.dataset.key] = input.value
          persist()
          renderPaper()
        })
      })

      host.appendChild(card)
    })
  }

  const syncEditorFields = () => {
    ;['name', 'role', 'headline', 'quote', 'email', 'phone', 'location', 'website', 'summary'].forEach((key) => {
      const input = $('#' + key)
      if (input) input.value = profile[key] || ''
    })
    $('#skills').value = profile.skills.join('\n')
    $('#languages').value = profile.languages.join('\n')

    $('#font').value = settings.font
    $('#density').value = settings.density
    $('#radius').value = settings.radius
    $('#sectionSpacing').value = ['compact', 'balanced', 'airy'].includes(settings.sectionSpacing) ? settings.sectionSpacing : 'balanced'
    const textScale = Number.isFinite(Number(settings.textScale)) ? Math.min(1.15, Math.max(.9, Number(settings.textScale))) : 1
    const headingScale = Number.isFinite(Number(settings.headingScale)) ? Math.min(1.2, Math.max(.9, Number(settings.headingScale))) : 1
    $('#textScale').value = String(Math.round(textScale * 100))
    $('#headingScale').value = String(Math.round(headingScale * 100))
    $('#textScaleValue').textContent = Math.round(textScale * 100) + '%'
    $('#headingScaleValue').textContent = Math.round(headingScale * 100) + '%'
    $('#zoom').value = String(settings.zoom)
    $('#accent').value = settings.accent

    const template = activeTemplate()
    const designMeta = templateDesignMeta[template.id] || { label: template.category || 'Template', structure: 'Structure adapts to the selected CV.', projects: true }
    $('#designTemplateCategory').textContent = designMeta.label
    $('#designTemplateName').textContent = template.name
    $('#designTemplateStructure').textContent = designMeta.structure
    $('#projectDisplayHint').textContent = designMeta.projects ? 'Switch project sections between visual cards and a compact list.' : 'This template does not use a project section in its primary composition.'
    $('#projectCards').disabled = !designMeta.projects
    $('#projectList').disabled = !designMeta.projects
    $('.design-project-layout').classList.toggle('is-disabled', !designMeta.projects)

    renderLayoutMaster()
    $('#projectCards').setAttribute('aria-pressed', settings.projectLayout !== 'list' ? 'true' : 'false')
    $('#projectList').setAttribute('aria-pressed', settings.projectLayout === 'list' ? 'true' : 'false')
    $('#projectCards').classList.toggle('active', settings.projectLayout !== 'list')
    $('#projectList').classList.toggle('active', settings.projectLayout === 'list')

    const avatarShape = ['circle', 'rounded', 'square'].includes(settings.avatarShape) ? settings.avatarShape : 'circle'
    const avatarSize = ['small', 'medium', 'large'].includes(settings.avatarSize) ? settings.avatarSize : 'medium'
    const avatarX = Number.isFinite(Number(settings.avatarX)) ? Math.min(100, Math.max(0, Number(settings.avatarX))) : 50
    const avatarY = Number.isFinite(Number(settings.avatarY)) ? Math.min(100, Math.max(0, Number(settings.avatarY))) : 50
    const avatarZoom = Number.isFinite(Number(settings.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(settings.avatarZoom))) : 1
    const avatarRotate = Number.isFinite(Number(settings.avatarRotate)) ? Math.min(180, Math.max(-180, Number(settings.avatarRotate))) : 0
    $('#avatarX').value = String(avatarX)
    $('#avatarY').value = String(avatarY)
    $('#avatarZoom').value = String(Math.round(avatarZoom * 100))
    $('#avatarRotate').value = String(avatarRotate)
    $$('[data-avatar-shape]').forEach((button) => {
      const active = button.dataset.avatarShape === avatarShape
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', active ? 'true' : 'false')
    })
    $$('[data-avatar-size]').forEach((button) => {
      const active = button.dataset.avatarSize === avatarSize
      button.classList.toggle('active', active)
      button.setAttribute('aria-pressed', active ? 'true' : 'false')
    })
  }

  const renderQuickAvatar = () => {
    const avatar = safeAvatar(profile.avatar)
    const initials = profileInitials()
    const nodes = [$('#staticAvatarPreview'), ...$$('[data-preset-avatar]')].filter(Boolean)
    const shape = ['circle', 'rounded', 'square'].includes(settings.avatarShape) ? settings.avatarShape : 'circle'
    const x = Number.isFinite(Number(settings.avatarX)) ? Math.min(100, Math.max(0, Number(settings.avatarX))) : 50
    const y = Number.isFinite(Number(settings.avatarY)) ? Math.min(100, Math.max(0, Number(settings.avatarY))) : 50
    const zoom = Number.isFinite(Number(settings.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(settings.avatarZoom))) : 1
    const rotate = Number.isFinite(Number(settings.avatarRotate)) ? Math.min(180, Math.max(-180, Number(settings.avatarRotate))) : 0
    nodes.forEach((node) => {
      node.innerHTML = ''
      node.classList.remove('avatar-shape-circle', 'avatar-shape-rounded', 'avatar-shape-square')
      node.classList.add(`avatar-shape-${shape}`)
      if (avatar) {
        const image = document.createElement('img')
        image.src = avatar
        image.alt = ''
        image.style.objectPosition = `${x}% ${y}%`
        image.style.transform = `scale(${zoom}) rotate(${rotate}deg)`
        node.appendChild(image)
      } else {
        node.textContent = initials
      }
    })
    const removeButton = $('#staticAvatarRemove')
    const framing = $('#staticAvatarFraming')
    if (removeButton) removeButton.hidden = !avatar
    if (framing) framing.hidden = !avatar
  }


  /* CONTENT_HEALTH_V1 */
  const normalizeHealthText = (value) => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#%$./@×-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const healthWords = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length

  const valueAppearsInPaper = (value, minLength = 5) => {
    const source = normalizeHealthText(value)
    if (source.length < minLength) return false
    const paper = normalizeHealthText($('#paper')?.innerText || '')
    if (!paper) return false
    const probe = source.length > 90 ? source.slice(0, 90).trim() : source
    return probe.length >= minLength && paper.includes(probe)
  }

  const visibleItemCount = (items, getter) => {
    const values = (items || []).map(getter).filter((value) => String(value || '').trim())
    return values.filter((value) => valueAppearsInPaper(value)).length
  }

  const contentHealthChecks = () => {
    const checks = []
    const add = (id, group, level, title, detail, action, actionLabel) => {
      checks.push({ id, group, level, title, detail, action, actionLabel })
    }

    const summaryWords = healthWords(profile.summary)
    if (summaryWords > 110) {
      add('summary-long','Readability','warning','Summary is too long',summaryWords + ' words. Aim for a tighter recruiter-first summary.','focus:#summary','Open summary')
    } else if (summaryWords > 85) {
      add('summary-tight','Readability','review','Summary is getting dense',summaryWords + ' words may create unnecessary A4 pressure.','focus:#summary','Review summary')
    } else if (summaryWords > 0 && summaryWords < 28) {
      add('summary-thin','Evidence','review','Summary is very short',summaryWords + ' words may not explain scope, domain and strengths clearly.','focus:#summary','Open summary')
    }

    const longBullets = []
    ;(profile.experience || []).forEach((job, jobIndex) => {
      ;(job.bullets || []).forEach((bullet, bulletIndex) => {
        const words = healthWords(bullet)
        const chars = String(bullet || '').length
        if (chars > 210 || words > 34) longBullets.push({ jobIndex, bulletIndex, words, chars, role: job.role || ('Experience ' + (jobIndex + 1)) })
      })
    })
    longBullets.slice(0,3).forEach((item) => {
      add(
        'bullet-long-' + item.jobIndex + '-' + item.bulletIndex,
        'Readability',
        item.chars > 260 ? 'warning' : 'review',
        'Long experience bullet',
        item.role + ' · bullet ' + (item.bulletIndex + 1) + ' is ' + item.words + ' words.',
        'focus:#experienceEditor .editor-card:nth-child(' + (item.jobIndex + 1) + ') textarea[data-key="bullets"]',
        'Open bullet'
      )
    })

    ;(profile.experience || []).forEach((job, jobIndex) => {
      const bullets = (job.bullets || []).filter(Boolean)
      const evidenceText = bullets.join(' ')
      if (bullets.length >= 2 && !/(\d|%|\$|€|£|×|\bx\b)/i.test(evidenceText)) {
        add(
          'experience-evidence-' + jobIndex,
          'Evidence',
          'review',
          'Experience has no measurable evidence',
          (job.role || ('Experience ' + (jobIndex + 1))) + ' has achievements but no numeric result, scale or measurable scope.',
          'focus:#experienceEditor .editor-card:nth-child(' + (jobIndex + 1) + ') textarea[data-key="bullets"]',
          'Review achievements'
        )
      }
    })

    const normalizedSkills = (profile.skills || []).map((skill) => normalizeHealthText(skill)).filter(Boolean)
    const duplicateKeys = [...new Set(normalizedSkills.filter((skill, index) => normalizedSkills.indexOf(skill) !== index))]
    if (duplicateKeys.length) {
      const labels = duplicateKeys.map((key) => (profile.skills || []).find((skill) => normalizeHealthText(skill) === key)).filter(Boolean)
      add('skills-duplicate','Readability','warning','Duplicate skills found',labels.join(', ') + '. Removing exact duplicates keeps the section cleaner.','dedupe-skills','Remove duplicates')
    }

    ;(profile.projects || []).forEach((project, projectIndex) => {
      if (!String(project.impact || '').trim()) {
        add(
          'project-impact-' + projectIndex,
          'Evidence',
          'warning',
          'Project is missing impact',
          (project.name || ('Project ' + (projectIndex + 1))) + ' has no outcome / impact statement.',
          'focus:#projectEditor .editor-card:nth-child(' + (projectIndex + 1) + ') [data-key="impact"]',
          'Add impact'
        )
      }
      if (healthWords(project.description) > 55) {
        add(
          'project-description-' + projectIndex,
          'Readability',
          'review',
          'Project description is long',
          (project.name || ('Project ' + (projectIndex + 1))) + ' is ' + healthWords(project.description) + ' words.',
          'focus:#projectEditor .editor-card:nth-child(' + (projectIndex + 1) + ') textarea[data-key="description"]',
          'Review project'
        )
      }
    })

    const template = activeTemplate()
    const designMeta = templateDesignMeta[template.id] || { projects: true }

    const coverageChecks = [
      { key:'summary', label:'Summary', values:[profile.summary], setting:'showSummary', target:'#summary' },
      { key:'skills', label:'Skills', values:profile.skills || [], setting:'showSkills', target:'#skills' },
      { key:'experience', label:'Experience', values:(profile.experience || []).map((job) => job.role), setting:'showExperience', target:'#experienceEditor' },
      { key:'projects', label:'Projects', values:(profile.projects || []).map((project) => project.name), setting:'showProjects', target:'#projectEditor' },
      { key:'languages', label:'Languages', values:profile.languages || [], setting:null, target:'#languages' },
    ]

    coverageChecks.forEach((section) => {
      const values = section.values.filter((value) => String(value || '').trim())
      if (!values.length) return
      const visible = visibleItemCount(values, (value) => value)
      const expected = values.length
      if (visible >= expected) return

      if (section.setting && settings[section.setting] === false) {
        add(
          'hidden-' + section.key,
          'Template coverage',
          'warning',
          section.label + ' is hidden',
          expected + ' source item' + (expected === 1 ? '' : 's') + ' exist but the section is disabled in Layout.',
          'show-section:' + section.setting,
          'Show section'
        )
        return
      }

      if (section.key === 'projects' && designMeta.projects === false) {
        add(
          'template-projects',
          'Template coverage',
          'info',
          'Projects are not used by this template',
          template.name + ' intentionally prioritizes another content structure. Project data remains saved.',
          'browse-templates',
          'Browse templates'
        )
        return
      }

      add(
        'coverage-' + section.key,
        'Template coverage',
        'info',
        section.label + ' is only partly shown',
        visible + ' of ' + expected + ' source item' + (expected === 1 ? '' : 's') + ' appear in ' + template.name + '.',
        'focus:' + section.target,
        'Review source'
      )
    })

    if (String(profile.headline || '').trim() && !valueAppearsInPaper(profile.headline)) {
      add('headline-hidden','Template coverage','info','Headline is not shown',template.name + ' does not currently render the saved headline.','focus:#headline','Open headline')
    }
    if (String(profile.quote || '').trim() && !valueAppearsInPaper(profile.quote)) {
      add('quote-hidden','Template coverage','info','Quote is not shown',template.name + ' does not currently render the saved quote.','focus:#quote','Open quote')
    }

    const projectDescriptions = (profile.projects || []).map((project) => project.description).filter((value) => String(value || '').trim())
    if (projectDescriptions.length) {
      const renderedDescriptions = visibleItemCount(projectDescriptions, (value) => value)
      const renderedProjectNames = visibleItemCount(profile.projects || [], (project) => project.name)
      if (renderedProjectNames > 0 && renderedDescriptions < projectDescriptions.length) {
        add(
          'project-description-coverage',
          'Template coverage',
          'info',
          'Some project descriptions are compacted',
          renderedDescriptions + ' of ' + projectDescriptions.length + ' descriptions are visible; this template may show project name / impact only.',
          'focus:#projectEditor',
          'Review projects'
        )
      }
    }

    return checks
  }

  const ensureContentHealthUi = () => {
    if ($('#contentHealth')) return
    const pane = $('[data-pane="content"]')
    if (!pane) return
    const section = document.createElement('section')
    section.id = 'contentHealth'
    section.className = 'content-health'
    section.innerHTML =
      '<div class="content-health-head"><div><span>Content intelligence</span><strong>Content Health</strong><small id="contentHealthSummary">Checking…</small></div><button id="contentHealthToggle" type="button" aria-expanded="true">Hide</button></div>' +
      '<div id="contentHealthGroups" class="content-health-groups"></div>' +
      '<div id="contentHealthList" class="content-health-list"></div>'
    pane.insertBefore(section, pane.firstElementChild)
    $('#contentHealthToggle').addEventListener('click', () => {
      const collapsed = section.classList.toggle('collapsed')
      $('#contentHealthToggle').textContent = collapsed ? 'Show' : 'Hide'
      $('#contentHealthToggle').setAttribute('aria-expanded', collapsed ? 'false' : 'true')
    })
    section.addEventListener('click', (event) => {
      const button = event.target.closest('[data-health-action]')
      if (!button) return
      const action = button.dataset.healthAction || ''
      if (action === 'dedupe-skills') {
        const seen = new Set()
        profile.skills = (profile.skills || []).filter((skill) => {
          const key = normalizeHealthText(skill)
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        persist()
        renderPaper()
        syncEditorFields()
        return
      }
      if (action.startsWith('show-section:')) {
        const key = action.split(':')[1]
        if (key && Object.prototype.hasOwnProperty.call(settings, key)) {
          settings[key] = true
          renderAll()
        }
        return
      }
      if (action === 'browse-templates') {
        setEditorOpen(false)
        $('.templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (action.startsWith('focus:')) {
        activatePane('content', action.slice(6))
      }
    })
  }

  const renderContentHealth = () => {
    ensureContentHealthUi()
    const host = $('#contentHealthList')
    const summary = $('#contentHealthSummary')
    const groups = $('#contentHealthGroups')
    if (!host || !summary || !groups) return

    const checks = contentHealthChecks()
    const blockers = checks.filter((item) => item.level === 'warning').length
    const reviews = checks.filter((item) => item.level === 'review').length
    const infos = checks.filter((item) => item.level === 'info').length
    const totalChecks = 10
    const clear = Math.max(0, totalChecks - Math.min(totalChecks, blockers + reviews))
    summary.textContent = clear + '/' + totalChecks + ' checks clear · ' + blockers + ' action' + (blockers === 1 ? '' : 's') + ' needed'

    const groupNames = ['Readability','Evidence','Template coverage']
    groups.innerHTML = groupNames.map((group) => {
      const count = checks.filter((item) => item.group === group).length
      return '<span><strong>' + escapeHtml(group) + '</strong><small>' + (count ? count + ' finding' + (count === 1 ? '' : 's') : 'Clear') + '</small></span>'
    }).join('')

    if (!checks.length) {
      host.innerHTML = '<div class="content-health-clear"><strong>No content issues detected</strong><p>Current content length, evidence fields and template coverage look clean.</p></div>'
      return
    }

    const order = { warning:0, review:1, info:2 }
    host.innerHTML = checks.sort((a,b) => order[a.level]-order[b.level]).map((item) => (
      '<article class="content-health-item ' + item.level + '">' +
        '<i></i><div><span>' + escapeHtml(item.group) + '</span><strong>' + escapeHtml(item.title) + '</strong><p>' + escapeHtml(item.detail) + '</p></div>' +
        '<button type="button" data-health-action="' + escapeHtml(item.action) + '">' + escapeHtml(item.actionLabel) + '</button>' +
      '</article>'
    )).join('')
  }

  const renderEditors = () => {
    syncEditorFields()
    renderExperienceEditor()
    renderProjectsEditor()
    renderQuickAvatar()
    renderContentHealth()
  }

  const renderAll = () => {
    persist()
    renderTemplates()
    renderPaper()
    syncEditorFields()
    renderQuickAvatar()
  }

  ;['name', 'role', 'headline', 'quote', 'email', 'phone', 'location', 'website', 'summary'].forEach((key) => {
    $('#' + key).addEventListener('input', (event) => {
      profile[key] = event.currentTarget.value
      persist()
      renderPaper()
      if (key === 'name') renderQuickAvatar()
    })
  })

  $('#skills').addEventListener('input', (event) => {
    profile.skills = event.currentTarget.value
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
    persist()
    renderPaper()
  })

  $('#languages').addEventListener('input', (event) => {
    profile.languages = event.currentTarget.value
      .split(/\n+/)
      .map((item) => item.trim())
      .filter(Boolean)
    persist()
    renderPaper()
  })

  const compressAvatar = (file) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'))
    if (file.size > 10 * 1024 * 1024) return reject(new Error('Image is too large. Please use a file under 10 MB.'))

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read this image.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Unable to decode this image.'))
      image.onload = () => {
        const maxDimension = 720
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Image processing is unavailable.'))
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/webp', 0.82))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })

  $('#staticAvatarInput').addEventListener('change', async (event) => {
    const imageFile = event.currentTarget.files?.[0]
    if (!imageFile) return
    try {
      profile.avatar = await compressAvatar(imageFile)
      renderAll()
    } catch (error) {
      window.alert(error.message || 'Unable to process this image.')
    } finally {
      event.currentTarget.value = ''
    }
  })

  $('#staticAvatarRemove').addEventListener('click', () => {
    profile.avatar = ''
    renderAll()
  })

  $$('[data-avatar-shape]').forEach((button) => {
    button.addEventListener('click', () => {
      settings.avatarShape = button.dataset.avatarShape
      renderAll()
    })
  })

  $$('[data-avatar-size]').forEach((button) => {
    button.addEventListener('click', () => {
      settings.avatarSize = button.dataset.avatarSize
      renderAll()
    })
  })

  $('#avatarX').addEventListener('input', (event) => {
    settings.avatarX = Number(event.currentTarget.value)
    renderAll()
  })

  $('#avatarY').addEventListener('input', (event) => {
    settings.avatarY = Number(event.currentTarget.value)
    renderAll()
  })

  $('#avatarZoom').addEventListener('input', (event) => {
    settings.avatarZoom = Number(event.currentTarget.value) / 100
    renderAll()
  })

  $('#avatarRotate').addEventListener('input', (event) => {
    settings.avatarRotate = Number(event.currentTarget.value)
    renderAll()
  })

  $('#avatarResetFrame').addEventListener('click', () => {
    settings.avatarShape = 'circle'
    settings.avatarSize = 'medium'
    settings.avatarX = 50
    settings.avatarY = 50
    settings.avatarZoom = 1
    settings.avatarRotate = 0
    renderAll()
  })

  $('#staticAvatarPreview').addEventListener('pointerdown', (event) => {
    if (!safeAvatar(profile.avatar) || event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    avatarDrag = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      x: Number(settings.avatarX) || 50,
      y: Number(settings.avatarY) || 50,
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    }
    event.currentTarget.classList.add('dragging')
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
  })

  $('#staticAvatarPreview').addEventListener('pointermove', (event) => {
    if (!avatarDrag || event.pointerId !== avatarDrag.pointerId) return
    const zoom = Math.min(2.5, Math.max(1, Number(settings.avatarZoom) || 1))
    const dx = event.clientX - avatarDrag.clientX
    const dy = event.clientY - avatarDrag.clientY
    settings.avatarX = Math.round(Math.min(100, Math.max(0, avatarDrag.x - (dx / avatarDrag.width) * 100 / zoom)))
    settings.avatarY = Math.round(Math.min(100, Math.max(0, avatarDrag.y - (dy / avatarDrag.height) * 100 / zoom)))
    renderAll()
  })

  const endAvatarDrag = (event) => {
    if (!avatarDrag) return
    event.currentTarget?.releasePointerCapture?.(event.pointerId)
    event.currentTarget?.classList.remove('dragging')
    avatarDrag = null
  }

  $('#staticAvatarPreview').addEventListener('pointerup', endAvatarDrag)
  $('#staticAvatarPreview').addEventListener('pointercancel', endAvatarDrag)

  $('#addExperience').addEventListener('click', () => {
    profile.experience.push({
      role: 'New role',
      company: 'Company',
      period: '2026 — Present',
      location: '',
      bullets: ['Describe measurable impact.'],
    })
    renderAll()
    renderEditors()
  })

  $('#addProject').addEventListener('click', () => {
    profile.projects.push({
      name: 'New project',
      type: 'Product · Design',
      impact: 'Key measurable impact',
      description: 'Describe the problem, your role, the solution and what changed.',
    })
    renderAll()
    renderEditors()
  })

  $('#undoStatic').addEventListener('click', undo)
  $('#redoStatic').addEventListener('click', redo)

  $('#toggleEditor').addEventListener('click', () => {
    setEditorOpen($('#editor').classList.contains('collapsed'))
  })

  const resetPrintFit = () => {
    const paper = $('#paper')
    if (!paper) return
    paper.style.removeProperty('--print-fit')
    paper.style.removeProperty('--print-width')
    paper.style.removeProperty('--print-min-height')
    delete paper.dataset.printMode
  }

  const measurePrintHealth = () => {
    const paper = $('#paper')
    const a4HeightPx = 1123
    if (!paper) return { a4HeightPx, measuredHeight: a4HeightPx, requiredFit: 1, appliedFit: 1, onePagePossible: true, naturalPages: 1, pressure: [] }
    const measuredHeight = Math.max(a4HeightPx, paper.scrollHeight, paper.offsetHeight)
    const requiredFit = Math.min(1, a4HeightPx / measuredHeight)
    const appliedFit = Math.max(0.68, requiredFit)
    const onePagePossible = requiredFit >= 0.68
    const naturalPages = Math.max(1, Math.ceil(measuredHeight / a4HeightPx))
    const rawSections = [...paper.querySelectorAll('[data-section-key]'), ...paper.querySelectorAll('.ref-cv section')]
    const seen = new Set()
    const pressure = rawSections.filter((node) => {
      if (!node || seen.has(node)) return false
      seen.add(node)
      return node.offsetHeight > 0
    }).map((node) => {
      const heading = node.querySelector('h2,h3,.section-title,.ref-section-title')
      const fallback = node.dataset.sectionKey || 'Section'
      return { label: String(heading?.textContent || fallback).trim().replace(/\s+/g, ' ').slice(0, 64), height: Math.max(node.scrollHeight, node.offsetHeight) }
    }).sort((a, b) => b.height - a.height).slice(0, 3)
    return { a4HeightPx, measuredHeight, requiredFit, appliedFit, onePagePossible, naturalPages, pressure }
  }

  const preparePrintFit = (mode = 'one') => {
    const paper = $('#paper')
    if (!paper) return 1
    resetPrintFit()
    if (mode === 'multi') {
      paper.style.setProperty('--print-fit', '1')
      paper.style.setProperty('--print-width', '210mm')
      paper.style.setProperty('--print-min-height', '297mm')
      paper.dataset.printFit = '1.0000'
      paper.dataset.printMode = 'multi'
      return 1
    }
    const health = measurePrintHealth()
    const fit = health.appliedFit
    paper.style.setProperty('--print-fit', fit.toFixed(4))
    paper.style.setProperty('--print-width', (210 / fit).toFixed(2) + 'mm')
    paper.style.setProperty('--print-min-height', (297 / fit).toFixed(2) + 'mm')
    paper.dataset.printFit = fit.toFixed(4)
    paper.dataset.printMode = 'one'
    return fit
  }

  const printCv = (mode = 'one') => {
    preparePrintFit(mode)
    setExportPreflightOpen(false)
    window.print()
  }

  const ensureExportPreflightUi = () => {
    if ($('#exportPreflightShell')) return
    const shell = document.createElement('div')
    shell.id = 'exportPreflightShell'
    shell.className = 'export-preflight-shell no-print'
    shell.hidden = true
    shell.innerHTML =
      '<div class="export-preflight-backdrop" data-export-close></div>' +
      '<section class="export-preflight-dialog" role="dialog" aria-modal="true" aria-labelledby="exportPreflightTitle">' +
        '<header><div><span>Export check</span><h2 id="exportPreflightTitle">PDF Preflight</h2><p>Check A4 fit before opening the browser print dialog.</p></div><button type="button" data-export-close aria-label="Close export check">×</button></header>' +
        '<div id="exportPreflightStatus" class="export-preflight-status"></div>' +
        '<div class="export-preflight-pressure"><div><span>Content pressure</span><strong>Largest sections</strong></div><div id="exportPressureList"></div></div>' +
        '<fieldset class="export-preflight-modes"><legend>Export mode</legend>' +
          '<label><input id="exportModeOne" type="radio" name="exportMode" value="one" checked /><span><strong>Fit to one A4 page</strong><small>Uses the existing safe fit engine, never below 68%.</small></span></label>' +
          '<label><input id="exportModeMulti" type="radio" name="exportMode" value="multi" /><span><strong>Allow multiple pages</strong><small>Keeps text at 100% and lets the browser paginate naturally.</small></span></label>' +
        '</fieldset>' +
        '<div id="exportPreflightAdvice" class="export-preflight-advice"></div>' +
        '<footer><button type="button" class="button ghost" data-export-close>Cancel</button><button id="exportPreflightPrint" type="button" class="button primary">Open print dialog</button></footer>' +
      '</section>'
    document.body.appendChild(shell)
    shell.addEventListener('click', (event) => {
      if (event.target.closest('[data-export-close]')) setExportPreflightOpen(false)
    })
    $('#exportPreflightPrint').addEventListener('click', () => {
      const mode = $('#exportModeMulti').checked ? 'multi' : 'one'
      printCv(mode)
    })
  }

  const renderExportPreflight = () => {
    ensureExportPreflightUi()
    const health = measurePrintHealth()
    const status = $('#exportPreflightStatus')
    const one = $('#exportModeOne')
    const multi = $('#exportModeMulti')
    const percent = Math.round(health.appliedFit * 100)
    let tone = 'ready'
    let title = 'A4 ready'
    let detail = 'Current content fits without meaningful scaling.'
    if (!health.onePagePossible) {
      tone = 'overflow'
      title = 'Multi-page recommended'
      detail = 'A one-page export would need to shrink below the 68% readability floor.'
    } else if (health.appliedFit < 0.8) {
      tone = 'tight'
      title = 'Very tight one-page fit'
      detail = 'The CV can fit one page, but text will scale to about ' + percent + '%.'
    } else if (health.appliedFit < 0.94) {
      tone = 'scaled'
      title = 'One-page fit with scaling'
      detail = 'The CV will scale to about ' + percent + '% to stay on one A4 page.'
    }
    status.className = 'export-preflight-status ' + tone
    status.innerHTML =
      '<div><span>Status</span><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(detail) + '</p></div>' +
      '<div class="export-preflight-metrics"><span><small>One-page scale</small><strong>' + percent + '%</strong></span><span><small>Natural length</small><strong>' + health.naturalPages + ' page' + (health.naturalPages === 1 ? '' : 's') + '</strong></span></div>'
    const pressure = $('#exportPressureList')
    pressure.innerHTML = health.pressure.length
      ? health.pressure.map((item) => '<span><strong>' + escapeHtml(item.label) + '</strong><small>' + Math.round(item.height / health.measuredHeight * 100) + '% of content height</small></span>').join('')
      : '<small>No large section detected.</small>'
    one.disabled = !health.onePagePossible
    if (!health.onePagePossible) {
      multi.checked = true
      one.checked = false
      $('#exportPreflightAdvice').innerHTML = '<strong>Why one-page is disabled</strong><p>CV Studio will not shrink below 68%. Shorten content, use Compact spacing, or export multiple pages.</p>'
    } else if (health.appliedFit < 0.8) {
      one.checked = true
      multi.checked = false
      $('#exportPreflightAdvice').innerHTML = '<strong>Readable, but compressed</strong><p>Consider Compact spacing or shortening the largest section before sending the CV.</p>'
    } else {
      one.checked = true
      multi.checked = false
      $('#exportPreflightAdvice').innerHTML = '<strong>Preflight passed</strong><p>Web content is within the supported one-page fit range. Verify the exported PDF text layer in ATS after saving.</p>'
    }
  }

  const setExportPreflightOpen = (open) => {
    ensureExportPreflightUi()
    const shell = $('#exportPreflightShell')
    shell.hidden = !open
    document.body.classList.toggle('export-preflight-open', open)
    if (open) {
      renderExportPreflight()
      setTimeout(() => $('#exportPreflightPrint')?.focus(), 0)
    }
  }

  window.addEventListener('afterprint', resetPrintFit)
  $('#print').addEventListener('click', () => setExportPreflightOpen(true))

  $('#reset').addEventListener('click', () => {
    profile = clone(demoProfile)
    settings = clone(defaultSettings)
    renderEditors()
    renderAll()
  })

  $('#zoom').addEventListener('change', (event) => {
    settings.zoom = Number(event.currentTarget.value)
    renderAll()
  })

  $('#templateSearch')?.addEventListener('input', () => {
    renderTemplates()
  })

  $('[data-static-template-filter]').forEach((button)=>{
    button.addEventListener('click',()=>{
      templateQuickFilter=button.dataset.staticTemplateFilter||'all'
      $('[data-static-template-filter]').forEach((item)=>item.classList.toggle('active',item===button))
      renderTemplates()
    })
  })

  $('#accent').addEventListener('input', (event) => {
    settings.accent = event.currentTarget.value
    renderAll()
  })

  $('#font').addEventListener('change', (event) => {
    settings.font = event.currentTarget.value
    renderAll()
  })

  $('#density').addEventListener('change', (event) => {
    settings.density = event.currentTarget.value
    renderAll()
  })

  $('#radius').addEventListener('change', (event) => {
    settings.radius = event.currentTarget.value
    renderAll()
  })

  $('#sectionSpacing').addEventListener('change', (event) => {
    settings.sectionSpacing = event.currentTarget.value
    renderAll()
  })

  $('#textScale').addEventListener('input', (event) => {
    settings.textScale = Number(event.currentTarget.value) / 100
    $('#textScaleValue').textContent = event.currentTarget.value + '%'
    renderAll()
  })

  $('#headingScale').addEventListener('input', (event) => {
    settings.headingScale = Number(event.currentTarget.value) / 100
    $('#headingScaleValue').textContent = event.currentTarget.value + '%'
    renderAll()
  })

  $('#projectCards').addEventListener('click', () => {
    settings.projectLayout = 'cards'
    renderAll()
  })

  $('#projectList').addEventListener('click', () => {
    settings.projectLayout = 'list'
    renderAll()
  })


  let layoutMasterDrag = null
  const layoutSectionGroup = (section) => ['skills','languages'].includes(section) ? 'side' : 'main'

  const orderedLayoutSections = (sections) => {
    const order=Array.isArray(settings.sectionOrder)?settings.sectionOrder:[]
    return [...sections].sort((a,b)=>{
      const ai=order.indexOf(a)
      const bi=order.indexOf(b)
      return (ai<0?99:ai)-(bi<0?99:bi)
    })
  }

  const renderLayoutSectionRow = (section,contract) => {
    const cfg=contract.sections[section]||{supported:true,limit:null,placement:''}
    const count=sectionSourceCount(section)
    const setting=sectionSettingKey[section]
    const isVisible=sectionVisible(section)
    const supportedNow=cfg.supported!==false
    const draggable=contract.mode==='flexible'&&supportedNow
    const group=layoutSectionGroup(section)
    let meta=supportedNow?(cfg.placement||'Template section'):'Not used by this template'
    if(supportedNow&&cfg.limit&&count>cfg.limit)meta+=' · '+cfg.limit+' of '+count+' shown'
    else if(supportedNow&&count)meta+=' · '+count+' item'+(count===1?'':'s')
    return '<article class="layout-section-row '+(!supportedNow?'unsupported ':'')+(!isVisible?'hidden-section ':'')+(draggable?'draggable':'')+'" data-layout-section="'+section+'" data-layout-group="'+group+'"'+(draggable?' draggable="true"':'')+'>'+
      '<div class="layout-section-handle" aria-hidden="true">'+(draggable?'⋮⋮':'•')+'</div>'+
      '<div class="layout-section-copy"><strong>'+escapeHtml(sectionLabels[section])+'</strong><small>'+escapeHtml(meta)+'</small></div>'+
      (supportedNow&&setting?'<button type="button" class="layout-switch '+(isVisible?'on':'')+'" role="switch" aria-checked="'+(isVisible?'true':'false')+'" data-layout-toggle="'+setting+'"><i></i><span>'+(isVisible?'Visible':'Hidden')+'</span></button>':'<span class="layout-section-lock">'+(supportedNow?'Fixed':'Unavailable')+'</span>')+
    '</article>'
  }

  const renderLayoutMaster = () => {
    const host=$('#layoutMaster')
    if(!host)return
    const template=activeTemplate()
    const contract=activeLayoutContract()
    const sections=['summary','experience','projects','skills','languages']
    const supported=sections.filter((section)=>contract.sections[section]?.supported!==false)
    const visible=supported.filter((section)=>sectionVisible(section))
    const modeNote=contract.mode==='flexible'
      ? 'Drag sections within Main or Side. Cross-column moves stay locked to protect the template grid.'
      : contract.mode==='guided'
        ? 'Hierarchy is recruiter-first; visibility is editable but structure stays guided.'
        : 'Hierarchy is intentionally fixed to protect the template composition.'

    const main=orderedLayoutSections(sections.filter((section)=>layoutSectionGroup(section)==='main'))
    const side=orderedLayoutSections(sections.filter((section)=>layoutSectionGroup(section)==='side'))
    const sectionBody=contract.mode==='flexible'
      ? '<div class="layout-section-group"><div class="layout-group-title"><strong>Main content</strong><small>Summary · Experience · Projects</small></div>'+main.map((section)=>renderLayoutSectionRow(section,contract)).join('')+'</div>'+
        '<div class="layout-section-group"><div class="layout-group-title"><strong>Side content</strong><small>Skills · Languages</small></div>'+side.map((section)=>renderLayoutSectionRow(section,contract)).join('')+'</div>'
      : sections.map((section)=>renderLayoutSectionRow(section,contract)).join('')

    host.innerHTML=
      '<section class="layout-master-context">'+
        '<div><span>'+escapeHtml(layoutModeLabel(contract.mode))+'</span><strong>'+escapeHtml(template.name)+'</strong><p>'+escapeHtml(templateDesignMeta[template.id]?.structure||contract.label)+'</p></div>'+
        '<div class="layout-master-stats"><span><small>Visible</small><strong>'+visible.length+'/'+supported.length+'</strong></span><span><small>Page intent</small><strong>'+escapeHtml(contract.page||'Auto')+'</strong></span></div>'+
      '</section>'+
      '<section class="layout-master-sections">'+
        '<div class="layout-master-title"><div><span>Section manager</span><strong>Structure & visibility</strong></div><small>'+escapeHtml(modeNote)+'</small></div>'+
        '<div id="layoutSectionList">'+sectionBody+'</div>'+
      '</section>'+
      '<section class="layout-master-note"><strong>'+escapeHtml(contract.label)+'</strong><p>'+escapeHtml(modeNote)+'</p></section>'
  }

  const reorderLayoutSection = (from,to) => {
    if(!from||!to||from===to)return false
    if(layoutSectionGroup(from)!==layoutSectionGroup(to))return false
    const order=[...(settings.sectionOrder||[])]
    const fromIndex=order.indexOf(from)
    const toIndex=order.indexOf(to)
    if(fromIndex<0||toIndex<0)return false
    const moved=order.splice(fromIndex,1)[0]
    order.splice(toIndex,0,moved)
    settings.sectionOrder=order
    renderAll()
    return true
  }

  $('#layoutMaster')?.addEventListener('click',(event)=>{
    const toggle=event.target.closest('[data-layout-toggle]')
    if(toggle){
      const key=toggle.dataset.layoutToggle
      settings[key]=settings[key]===false
      renderAll()
      return
    }
    const row=event.target.closest('[data-layout-section]')
    if(row&&!row.classList.contains('unsupported')){
      const focusMap={summary:'#summary',experience:'#experienceEditor',projects:'#projectEditor',skills:'#skills',languages:'#languages'}
      const target=focusMap[row.dataset.layoutSection]
      if(target)activatePane('content',target)
    }
  })

  $('#layoutMaster')?.addEventListener('dragstart',(event)=>{
    const row=event.target.closest('[data-layout-section].draggable')
    if(!row)return
    layoutMasterDrag={section:row.dataset.layoutSection,group:row.dataset.layoutGroup}
    row.classList.add('layout-row-dragging')
    if(event.dataTransfer){
      event.dataTransfer.effectAllowed='move'
      event.dataTransfer.setData('text/plain',layoutMasterDrag.section)
    }
  })

  $('#layoutMaster')?.addEventListener('dragover',(event)=>{
    if(!layoutMasterDrag)return
    const row=event.target.closest('[data-layout-section].draggable')
    if(!row||row.dataset.layoutGroup!==layoutMasterDrag.group||row.dataset.layoutSection===layoutMasterDrag.section)return
    event.preventDefault()
    $('.layout-row-drop',$('#layoutMaster')).forEach((node)=>node.classList.remove('layout-row-drop'))
    row.classList.add('layout-row-drop')
    if(event.dataTransfer)event.dataTransfer.dropEffect='move'
  })

  $('#layoutMaster')?.addEventListener('drop',(event)=>{
    if(!layoutMasterDrag)return
    const row=event.target.closest('[data-layout-section].draggable')
    if(!row||row.dataset.layoutGroup!==layoutMasterDrag.group||row.dataset.layoutSection===layoutMasterDrag.section)return
    event.preventDefault()
    reorderLayoutSection(layoutMasterDrag.section,row.dataset.layoutSection)
  })

  $('#layoutMaster')?.addEventListener('dragend',()=>{
    $('.layout-row-dragging,.layout-row-drop',$('#layoutMaster')).forEach((node)=>node.classList.remove('layout-row-dragging','layout-row-drop'))
    layoutMasterDrag=null
  })


  $$('.tab').forEach((button) => {
    button.addEventListener('click', () => activatePane(button.dataset.tab))
  })

  $$('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = appearancePresets[button.dataset.preset]
      if (!preset) return
      settings = { ...settings, ...preset }
      renderAll()
    })
  })

  $$('[data-target-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = rolePresets[button.dataset.targetPreset]
      if (!preset) return
      settings = { ...settings, ...preset }
      renderAll()
    })
  })

  $('#paper').addEventListener('dragstart', (event) => {
    const target = event.target.closest('[data-section-key]')
    if (!target) return
    sectionDrag = {
      id: target.dataset.sectionKey,
      group: target.dataset.sectionGroup,
    }
    target.classList.add('section-dragging')
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', sectionDrag.id)
    }
  })

  $('#paper').addEventListener('dragover', (event) => {
    if (!sectionDrag) return
    const target = event.target.closest('[data-section-key]')
    if (!target || target.dataset.sectionGroup !== sectionDrag.group || target.dataset.sectionKey === sectionDrag.id) return
    event.preventDefault()
    $$('.section-drop-target', $('#paper')).forEach((node) => node.classList.remove('section-drop-target'))
    target.classList.add('section-drop-target')
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  })

  $('#paper').addEventListener('drop', (event) => {
    if (!sectionDrag) return
    const target = event.target.closest('[data-section-key]')
    if (!target || target.dataset.sectionGroup !== sectionDrag.group || target.dataset.sectionKey === sectionDrag.id) return
    event.preventDefault()
    const order = [...settings.sectionOrder]
    const fromIndex = order.indexOf(sectionDrag.id)
    const targetIndex = order.indexOf(target.dataset.sectionKey)
    if (fromIndex >= 0 && targetIndex >= 0) {
      const [moved] = order.splice(fromIndex, 1)
      order.splice(targetIndex, 0, moved)
      settings.sectionOrder = order
      renderAll()
    }
    $$('.section-drop-target', $('#paper')).forEach((node) => node.classList.remove('section-drop-target'))
  })

  $('#paper').addEventListener('dragend', () => {
    $$('.section-dragging, .section-drop-target', $('#paper')).forEach((node) => node.classList.remove('section-dragging', 'section-drop-target'))
    sectionDrag = null
    sectionDragJustEnded = true
    window.setTimeout(() => { sectionDragJustEnded = false }, 0)
  })

  $('#paper').addEventListener('click', (event) => {
    if (sectionDragJustEnded) return
    const target = event.target.closest('[data-edit-pane]')
    if (!target) return
    activatePane(target.dataset.editPane || 'content', target.dataset.editFocus || '')
  })

  $('#paper').addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key)) return
    const target = event.target.closest('[data-edit-pane]')
    if (!target) return
    event.preventDefault()
    activatePane(target.dataset.editPane || 'content', target.dataset.editFocus || '')
  })

  const enhancePreviewAccessibility = () => {
    $$('[data-edit-pane]', $('#paper')).forEach((node) => {
      node.tabIndex = 0
      node.setAttribute('role', 'button')
      node.setAttribute('aria-label', 'Edit this CV section')
    })
  }

  const originalRenderPaper = renderPaper
  renderPaper = () => {
    originalRenderPaper()
    enhancePreviewAccessibility()
    renderContentHealth()
  }

  window.addEventListener('keydown', (event) => {
    const tag = document.activeElement?.tagName || ''
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)
    const key = event.key.toLowerCase()

    if ((event.metaKey || event.ctrlKey) && !event.altKey && key === 'z' && !typing) {
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
      return
    }
    if ((event.metaKey || event.ctrlKey) && !event.altKey && key === 'y' && !typing) {
      event.preventDefault()
      redo()
      return
    }
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return

    if (key === 'e') setEditorOpen(true)
    if (key === 'p') {
      event.preventDefault()
      setExportPreflightOpen(true)
    }
    if (event.key === 'Escape') setEditorOpen(false)
  })

  lastHistoryState = captureHistoryState()
  renderEditors()
  renderAll()
  lastHistoryState = captureHistoryState()
  syncHistoryControls()


  /* WORKSPACE_BACKUP_V1 */
  const BACKUP_FORMAT = 'cv-studio-backup'
  const BACKUP_SCHEMA = 1
  const BACKUP_KEYS = [
    { key: 'cv-studio-workspace-v3', type: 'object' },
    { key: 'cv-studio-profile-v1', type: 'object' },
    { key: 'cv-studio-settings-v1', type: 'object' },
    { key: PROFILE_KEY, type: 'object' },
    { key: SETTINGS_KEY, type: 'object' },
    { key: 'cv-studio-ats-target-v2', type: 'object' },
    { key: 'cv-studio-ats-versions-v1', type: 'array' },
    { key: 'cv-studio-ats-applications-v1', type: 'array' },
  ]
  const BACKUP_DB_NAME = 'cv-studio-ats-workspace'
  const BACKUP_DB_VERSION = 1
  const BACKUP_PDF_STORE = 'pdfs'
  let pendingWorkspaceBackup = null

  const safeJsonValue = (key, fallback) => {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    try { return JSON.parse(raw) } catch { return fallback }
  }

  const workspaceSnapshot = () => {
    const data = {}
    BACKUP_KEYS.forEach(({ key, type }) => {
      data[key] = safeJsonValue(key, type === 'array' ? [] : {})
    })
    return data
  }

  const openBackupDb = () => new Promise((resolve, reject) => {
    if (!window.indexedDB) return resolve(null)
    const request = indexedDB.open(BACKUP_DB_NAME, BACKUP_DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(BACKUP_PDF_STORE)) db.createObjectStore(BACKUP_PDF_STORE, { keyPath: 'applicationId' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

  const readPdfRecords = async () => {
    const db = await openBackupDb()
    if (!db || !db.objectStoreNames.contains(BACKUP_PDF_STORE)) return []
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BACKUP_PDF_STORE, 'readonly')
      const request = tx.objectStore(BACKUP_PDF_STORE).getAll()
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  const putPdfRecord = async (record) => {
    const db = await openBackupDb()
    if (!db) return
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BACKUP_PDF_STORE, 'readwrite')
      tx.objectStore(BACKUP_PDF_STORE).put(record)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

  const dataUrlToBlob = (value, fallbackType = 'application/pdf') => {
    const parts = String(value || '').split(',', 2)
    if (parts.length !== 2 || !/;base64/i.test(parts[0])) return null
    const typeMatch = parts[0].match(/^data:([^;]+)/i)
    const binary = atob(parts[1])
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return new Blob([bytes], { type: typeMatch?.[1] || fallbackType })
  }

  const backupSummary = (data) => {
    const profileData = data?.[PROFILE_KEY] || {}
    const versionsData = data?.['cv-studio-ats-versions-v1'] || []
    const appsData = data?.['cv-studio-ats-applications-v1'] || []
    return {
      name: String(profileData.name || '').trim() || 'Unnamed CV',
      experience: Array.isArray(profileData.experience) ? profileData.experience.length : 0,
      projects: Array.isArray(profileData.projects) ? profileData.projects.length : 0,
      versions: Array.isArray(versionsData) ? versionsData.length : 0,
      applications: Array.isArray(appsData) ? appsData.length : 0,
    }
  }

  const createBackupPayload = async (includePdfs) => {
    const data = workspaceSnapshot()
    const records = includePdfs ? await readPdfRecords() : []
    const pdfs = []
    for (const record of records) {
      if (!record?.applicationId || !record?.file) continue
      pdfs.push({
        applicationId: record.applicationId,
        name: record.name || record.file.name || 'cv.pdf',
        type: record.type || record.file.type || 'application/pdf',
        size: Number(record.size || record.file.size || 0),
        savedAt: record.savedAt || new Date().toISOString(),
        dataUrl: await blobToDataUrl(record.file),
      })
    }
    return {
      format: BACKUP_FORMAT,
      schemaVersion: BACKUP_SCHEMA,
      createdAt: new Date().toISOString(),
      includesPdfs: Boolean(includePdfs),
      summary: backupSummary(data),
      data,
      pdfs,
    }
  }

  const validateBackupPayload = (payload) => {
    if (!payload || payload.format !== BACKUP_FORMAT) return { ok: false, message: 'This is not a CV Studio backup file.' }
    if (Number(payload.schemaVersion) !== BACKUP_SCHEMA) return { ok: false, message: 'Unsupported backup schema version.' }
    if (!payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) return { ok: false, message: 'Backup data is incomplete.' }
    for (const { key, type } of BACKUP_KEYS) {
      const value = payload.data[key]
      if (value == null) continue
      if (type === 'array' && !Array.isArray(value)) return { ok: false, message: 'Backup has an invalid ' + key + ' section.' }
      if (type === 'object' && (typeof value !== 'object' || Array.isArray(value))) return { ok: false, message: 'Backup has an invalid ' + key + ' section.' }
    }
    if (payload.pdfs != null && !Array.isArray(payload.pdfs)) return { ok: false, message: 'Backup PDF section is invalid.' }
    return { ok: true, message: '' }
  }

  const downloadBackupJson = (payload) => {
    const date = new Date().toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'cv-studio-backup-' + date + '.cvstudio.json'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const renderBackupImportPreview = (payload) => {
    const host = $('#backupImportPreview')
    if (!host) return
    if (!payload) {
      host.classList.remove('error')
      host.innerHTML = '<small>No backup selected.</small>'
      return
    }
    if (payload.error) {
      host.classList.add('error')
      host.innerHTML = '<strong>Cannot restore</strong><small>' + escapeHtml(payload.error) + '</small>'
      return
    }
    host.classList.remove('error')
    const summary = payload.summary || backupSummary(payload.data || {})
    host.innerHTML =
      '<div><span>Profile</span><strong>' + escapeHtml(summary.name || 'Unnamed CV') + '</strong></div>' +
      '<div><span>Experience</span><strong>' + Number(summary.experience || 0) + '</strong></div>' +
      '<div><span>Versions</span><strong>' + Number(summary.versions || 0) + '</strong></div>' +
      '<div><span>Applications</span><strong>' + Number(summary.applications || 0) + '</strong></div>' +
      '<div><span>PDFs</span><strong>' + Number((payload.pdfs || []).length) + '</strong></div>' +
      '<small>Created ' + escapeHtml(String(payload.createdAt || 'Unknown date')) + '</small>'
  }

  const renderBackupSummary = () => {
    const host = $('#workspaceBackupSummary')
    if (!host) return
    const summary = backupSummary(workspaceSnapshot())
    host.innerHTML =
      '<article><span>Profile</span><strong>' + escapeHtml(summary.name) + '</strong></article>' +
      '<article><span>Experience</span><strong>' + summary.experience + '</strong></article>' +
      '<article><span>Projects</span><strong>' + summary.projects + '</strong></article>' +
      '<article><span>Versions</span><strong>' + summary.versions + '</strong></article>' +
      '<article><span>Applications</span><strong>' + summary.applications + '</strong></article>'
  }

  const ensureBackupUi = () => {
    if ($('#workspaceBackupShell')) return
    const shell = document.createElement('div')
    shell.id = 'workspaceBackupShell'
    shell.className = 'workspace-backup-shell no-print'
    shell.hidden = true
    shell.innerHTML =
      '<div class="workspace-backup-backdrop" data-backup-close></div>' +
      '<section class="workspace-backup-dialog" role="dialog" aria-modal="true" aria-labelledby="workspaceBackupTitle">' +
        '<header><div><span>Data safety</span><h2 id="workspaceBackupTitle">Backup & Recovery</h2><p>Export the current CV Studio workspace before major edits or restore a previous backup.</p></div><button type="button" data-backup-close aria-label="Close backup dialog">×</button></header>' +
        '<div id="workspaceBackupSummary" class="workspace-backup-summary"></div>' +
        '<section class="workspace-backup-card"><div><span>01 · Export</span><strong>Save a local backup</strong><p>Profile, design settings, ATS target, versions and applications are always included.</p></div>' +
          '<label class="workspace-backup-check"><input id="backupIncludePdfs" type="checkbox" /><span><strong>Include attached PDFs</strong><small>Makes the backup larger, but restores final application PDFs too.</small></span></label>' +
          '<button id="backupExportNow" type="button" class="button primary">Download backup</button></section>' +
        '<section class="workspace-backup-card"><div><span>02 · Restore</span><strong>Preview before replacing data</strong><p>Choosing a file never changes the current workspace until you confirm Restore.</p></div>' +
          '<label class="workspace-backup-file"><input id="backupImportFile" type="file" accept=".json,.cvstudio,application/json" /><span>Choose backup file</span></label>' +
          '<div id="backupImportPreview" class="workspace-backup-preview"><small>No backup selected.</small></div>' +
          '<button id="backupRestoreNow" type="button" class="button primary" disabled>Restore selected backup</button></section>' +
        '<footer><span id="backupWorkspaceStatus">Everything stays on this device unless you download the backup file.</span></footer>' +
      '</section>'
    document.body.appendChild(shell)

    shell.addEventListener('click', (event) => {
      if (event.target.closest('[data-backup-close]')) setBackupOpen(false)
    })

    $('#backupExportNow').addEventListener('click', async () => {
      const button = $('#backupExportNow')
      const status = $('#backupWorkspaceStatus')
      button.disabled = true
      status.textContent = 'Preparing backup…'
      try {
        const payload = await createBackupPayload($('#backupIncludePdfs').checked)
        downloadBackupJson(payload)
        status.textContent = 'Backup downloaded · ' + payload.summary.applications + ' applications · ' + payload.pdfs.length + ' PDFs.'
      } catch (error) {
        console.error(error)
        status.textContent = 'Backup could not be created. No workspace data was changed.'
      } finally {
        button.disabled = false
      }
    })

    $('#backupImportFile').addEventListener('change', async (event) => {
      pendingWorkspaceBackup = null
      $('#backupRestoreNow').disabled = true
      const file = event.currentTarget.files?.[0]
      if (!file) return renderBackupImportPreview(null)
      try {
        const payload = JSON.parse(await file.text())
        const validation = validateBackupPayload(payload)
        if (!validation.ok) return renderBackupImportPreview({ error: validation.message })
        pendingWorkspaceBackup = payload
        renderBackupImportPreview(payload)
        $('#backupRestoreNow').disabled = false
      } catch {
        renderBackupImportPreview({ error: 'The selected file is not valid JSON.' })
      }
    })

    $('#backupRestoreNow').addEventListener('click', async () => {
      if (!pendingWorkspaceBackup) return
      if (!window.confirm('Restore this CV Studio backup? Current structured workspace data will be replaced.')) return
      const button = $('#backupRestoreNow')
      button.disabled = true
      $('#backupWorkspaceStatus').textContent = 'Restoring backup…'
      try {
        const imported = clone(pendingWorkspaceBackup.data)
        const currentProfile = safeJsonValue(PROFILE_KEY, {})
        if (currentProfile.avatar && imported[PROFILE_KEY] && !imported[PROFILE_KEY].avatar) imported[PROFILE_KEY].avatar = currentProfile.avatar
        if (!pendingWorkspaceBackup.includesPdfs && Array.isArray(imported['cv-studio-ats-applications-v1'])) {
          imported['cv-studio-ats-applications-v1'] = imported['cv-studio-ats-applications-v1'].map((item) => ({ ...item, pdf: null }))
        }
        BACKUP_KEYS.forEach(({ key, type }) => {
          const value = imported[key]
          localStorage.setItem(key, JSON.stringify(value == null ? (type === 'array' ? [] : {}) : value))
        })
        if (pendingWorkspaceBackup.includesPdfs) {
          for (const pdf of pendingWorkspaceBackup.pdfs || []) {
            const blob = dataUrlToBlob(pdf.dataUrl, pdf.type)
            if (!blob || !pdf.applicationId) continue
            const file = new File([blob], pdf.name || 'cv.pdf', { type: pdf.type || blob.type || 'application/pdf' })
            await putPdfRecord({
              applicationId: pdf.applicationId,
              file,
              name: file.name,
              type: file.type,
              size: file.size,
              savedAt: pdf.savedAt || new Date().toISOString(),
            })
          }
        }
        sessionStorage.setItem('cv-studio-backup-restored', pendingWorkspaceBackup.createdAt || new Date().toISOString())
        location.reload()
      } catch (error) {
        console.error(error)
        $('#backupWorkspaceStatus').textContent = 'Restore failed. The page was not reloaded; review current data before trying again.'
        button.disabled = false
      }
    })
  }

  const setBackupOpen = (open) => {
    ensureBackupUi()
    const shell = $('#workspaceBackupShell')
    shell.hidden = !open
    document.body.classList.toggle('workspace-backup-open', open)
    if (open) {
      renderBackupSummary()
      const restored = sessionStorage.getItem('cv-studio-backup-restored')
      if (restored) {
        $('#backupWorkspaceStatus').textContent = 'Backup restored successfully · source created ' + restored
        sessionStorage.removeItem('cv-studio-backup-restored')
      }
      setTimeout(() => $('#workspaceBackupShell [data-backup-close]')?.focus(), 0)
    }
  }

  ensureBackupUi()
  $('#backupWorkspace')?.addEventListener('click', () => setBackupOpen(true))

})()
