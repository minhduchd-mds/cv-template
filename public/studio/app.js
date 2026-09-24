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

  let profile = restoreObject(PROFILE_KEY, demoProfile)
  if (!String(profile.headline || '').trim()) profile.headline = demoProfile.headline
  if (!String(profile.quote || '').trim()) profile.quote = demoProfile.quote
  let settings = restoreObject(SETTINGS_KEY, defaultSettings)
  let avatarDrag = null
  let sectionDrag = null
  let sectionDragJustEnded = false
  let undoStack = []
  let redoStack = []
  let historyRestoring = false
  let lastHistoryState = null

  if (!Array.isArray(profile.experience)) profile.experience = clone(demoProfile.experience)
  if (!Array.isArray(profile.projects)) profile.projects = clone(demoProfile.projects)
  if (!Array.isArray(profile.skills)) profile.skills = clone(demoProfile.skills)
  if (!Array.isArray(profile.languages)) profile.languages = clone(demoProfile.languages)
  if (!templates.some((item) => item.id === settings.templateId)) settings.templateId = defaultSettings.templateId
  if (!Array.isArray(settings.sectionOrder) || !settings.sectionOrder.length) settings.sectionOrder = clone(defaultSettings.sectionOrder)

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
      })
    }
  }

  const renderTemplates = () => {
    const list = $('#templateList')
    const query = String($('#templateSearch')?.value || '').trim().toLowerCase()
    const visibleTemplates = templates.filter((template) => {
      if (!query) return true
      return [template.name, template.category, template.role].some((value) => String(value || '').toLowerCase().includes(query))
    })
    const countLabel = $('#templateCountLabel')
    if (countLabel) {
      countLabel.textContent = query
        ? `${visibleTemplates.length} of ${templates.length} templates · 4 role presets`
        : `${templates.length} curated templates · 4 role presets`
    }
    list.innerHTML = ''

    if (!visibleTemplates.length) {
      list.innerHTML = '<div class="template-list-empty">No template matches this search.<br>Try a role, industry or style name.</div>'
      return
    }

    visibleTemplates.forEach((template) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `template-card${template.id === settings.templateId ? ' active' : ''}`
      button.setAttribute('aria-pressed', template.id === settings.templateId ? 'true' : 'false')
      button.innerHTML = `
        <span class="template-thumb thumb-${template.id}" style="--thumb-accent:${template.accent}"><i></i><i></i><i></i></span>
        <span><strong>${escapeHtml(template.name)}</strong><small>${escapeHtml(template.role || template.category)}</small></span>
      `
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
      <section class="ref-section ref-summary" data-edit-pane="content" data-edit-focus="#summary"><h3>Executive Summary</h3><p>${escapeHtml(profile.summary)}</p></section>
      <section class="ref-section" data-edit-pane="content"><h3>Leadership Impact</h3>${refHighlights('ref-exec-impact')}</section>
      <section class="ref-section" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>${refExperience('ref-exec-experience')}</section>
      <section class="ref-section" data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Selected Achievements</h3>${refProjects('ref-achievement-row', 4)}</section>
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
          <p>${escapeHtml(profile.summary)}</p>
          ${refContact()}
        </div>
        <div class="ref-soft-portrait">${avatarMarkup('ref-soft-avatar')}<span class="ref-hand-note">Good design<br>builds better<br>tomorrows.</span></div>
      </header>
      ${refHighlights('ref-soft-metrics')}
      <div class="ref-soft-body">
        <main data-edit-pane="content" data-edit-focus="#projectEditor"><div class="ref-section-title">Selected Case Studies</div>${refProjects('ref-soft-projects', 3)}</main>
        <aside data-edit-pane="content" data-edit-focus="#skills"><div class="ref-section-title">Core Skills</div>${refSkills('ref-soft-skills')}<div class="ref-section-title">Tools</div>${refSkills('ref-tool-grid')}</aside>
      </div>
      <section class="ref-soft-highlights" data-edit-pane="content" data-edit-focus="#experienceEditor"><div class="ref-section-title">Experience Highlights</div>${refExperience('ref-soft-experience')}</section>
    </div>
  `

  const renderProductOperator = () => `
    <div class="ref-cv ref-product-operator">
      <aside class="ref-product-rail" data-edit-pane="content" data-edit-focus="#name">
        ${avatarMarkup('ref-product-avatar')}
        <h1>${escapeHtml(profile.name)}</h1>
        <h2>${escapeHtml(profile.role)}</h2>
        <p>${escapeHtml(profile.summary)}</p>
        ${refContact()}
        <div data-edit-pane="content" data-edit-focus="#skills"><div class="ref-rail-label">Core Skills</div>
        ${refSkills('ref-rail-skills')}</div>
      </aside>
      <main class="ref-product-main">
        <header><h1>From Insight to Impact</h1><span>PEOPLE · PRODUCTS · PROGRESS</span></header>
        ${refHighlights('ref-product-metrics')}
        <section class="ref-section" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Experience</h3>${refExperience('ref-product-experience')}</section>
        <div class="ref-product-lower">
          <section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Product Highlights</h3>${refProjects('ref-product-highlights')}</section>
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
        <section class="ref-code-about" data-edit-pane="content" data-edit-focus="#summary"><h3>01 / ABOUT</h3><p>${escapeHtml(profile.summary)}</p></section>
        <div class="ref-code-poster">DESIGN<br>×<br>CODE<br>×<br>PEOPLE<br>=<br><b>BETTER PRODUCTS</b></div>
      </div>
      <section class="ref-section" data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>02 / EXPERIENCE</h3>${refExperience('ref-code-experience')}</section>
      <section class="ref-section" data-edit-pane="content" data-edit-focus="#skills"><h3>03 / SKILLS</h3><div class="ref-code-skills">${(profile.skills || []).map((skill, index) => '<div><span>' + escapeHtml(skill) + '</span><i style="--level:' + Math.max(3, 7 - (index % 5)) + '"></i></div>').join('')}</div></section>
      <section class="ref-section" data-edit-pane="content" data-edit-focus="#projectEditor"><h3>04 / SELECTED WORK</h3>${refProjects('ref-code-work')}</section>
    </div>
  `

  const renderAtsPrecision = () => `
    <div class="ref-cv ref-ats-precision">
      <header class="ref-ats-head" data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2><p>${escapeHtml(profile.summary)}</p></div>
        ${refContact()}
      </header>
      <div class="ref-ats-body">
        <main><section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Experience</h3>${refExperience('ref-ats-experience')}</section>${refEducation() ? '<section><h3>Education</h3>' + refEducation() + '</section>' : ''}</main>
        <aside><section data-edit-pane="content" data-edit-focus="#skills"><h3>Skills</h3>${refSkills('ref-ats-skills')}</section><section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Selected Projects</h3>${refProjects('ref-ats-projects', 2)}</section>${refCertificates() ? '<section><h3>Certifications</h3>' + refCertificates() + '</section>' : ''}</aside>
      </div>
    </div>
  `

  const renderInsightGrid = () => `
    <div class="ref-cv ref-insight-grid">
      <header class="ref-insight-head" data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2>${refContact()}</div>
        <div class="ref-chart-bars"><i></i><i></i><i></i><i></i><i></i><strong>Turning Data<br>Into Decisions</strong></div>
      </header>
      <section class="ref-insight-summary" data-edit-pane="content" data-edit-focus="#summary"><div><h3>Professional Summary</h3><p>${escapeHtml(profile.summary)}</p></div>${refHighlights('ref-insight-metrics')}</section>
      <div class="ref-insight-grid-body">
        <section data-edit-pane="content" data-edit-focus="#skills"><h3>Core Skills</h3><div class="ref-skill-bars">${(profile.skills || []).map((skill, index) => '<div><span>' + escapeHtml(skill) + '</span><i><b style="width:' + Math.max(62, 92 - index * 4) + '%"></b></i></div>').join('')}</div></section>
        <section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Key Achievements</h3>${refProjects('ref-insight-achievements')}</section>
        <section><h3>Tools & Technologies</h3>${refSkills('ref-insight-tools')}</section>
      </div>
      <div class="ref-insight-bottom"><section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>${refExperience('ref-insight-experience')}</section><aside>${refEducation() ? '<h3>Education</h3>' + refEducation() : ''}${refCertificates() ? '<h3>Certifications</h3>' + refCertificates() : ''}</aside></div>
    </div>
  `

  const renderBrandMotion = () => `
    <div class="ref-cv ref-brand-motion">
      <aside class="ref-brand-rail">
        ${avatarMarkup('ref-brand-avatar')}
        ${refContact()}
        <blockquote>Brands grow when<br>people feel something.</blockquote>
        <div data-edit-pane="content" data-edit-focus="#skills"><h3>Skills</h3>${refSkills('ref-brand-skills')}</div>
        <div data-edit-pane="content" data-edit-focus="#languages"><h3>Languages</h3><div class="ref-brand-languages">${(profile.languages || []).map((language) => '<span>' + escapeHtml(language) + '</span>').join('')}</div></div>
      </aside>
      <main class="ref-brand-main">
        <header data-edit-pane="content" data-edit-focus="#name"><span>Ideas · People · Impact</span><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2><p>${escapeHtml(profile.summary)}</p><em>BRANDS<br>PEOPLE<br>STORIES<br>GROWTH</em></header>
        ${refHighlights('ref-brand-metrics')}
        <section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Work Experience</h3>${refExperience('ref-brand-experience')}</section>
        <section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Selected Campaigns</h3>${refProjects('ref-brand-projects', 3)}</section>
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
          <section data-edit-pane="content" data-edit-focus="#summary"><h3>Professional Summary</h3><p>${escapeHtml(profile.summary)}</p></section>
          <section data-edit-pane="content" data-edit-focus="#summary"><h3>Key Performance Highlights</h3>${refHighlights('ref-sales-metrics')}</section>
          <section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>${refExperience('ref-sales-experience')}</section>
        </main>
        <aside><div data-edit-pane="content" data-edit-focus="#skills"><h3>Core Skills</h3>${refSkills('ref-sales-skills')}<h3>Selected Clients</h3><div class="ref-client-grid"><span>Microsoft</span><span>Vodafone</span><span>Sage</span><span>DELL</span><span>HSBC</span><span>Atlassian</span></div></div><blockquote data-edit-pane="content" data-edit-focus="#quote">“${escapeHtml(profile.quote || demoProfile.quote)}”</blockquote></aside>
      </div>
    </div>
  `

  const renderPeopleFirst = () => `
    <div class="ref-cv ref-people-first">
      <header data-edit-pane="content" data-edit-focus="#name">
        <div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2><p>${escapeHtml(profile.summary)}</p></div>
        <div class="ref-people-portrait">${avatarMarkup('ref-people-avatar')}<span>People<br>Build<br>Brighter<br>Workplaces ♡</span></div>
      </header>
      ${refContact()}
      <div class="ref-people-body">
        <aside data-edit-pane="content" data-edit-focus="#skills"><h3>Key Competencies</h3>${refSkills('ref-people-skills')}${refEducation() ? '<h3>Education</h3>' + refEducation() : ''}</aside>
        <main><div data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Professional Experience</h3>${refExperience('ref-people-experience')}</div><div data-edit-pane="content" data-edit-focus="#languages"><h3>Additional Information</h3><div class="ref-people-extra">${(profile.languages || []).map((language) => '<span>' + escapeHtml(language) + '</span>').join('')}</div></div></main>
      </div>
    </div>
  `

  const renderNextStart = () => `
    <div class="ref-cv ref-next-start">
      <header data-edit-pane="content" data-edit-focus="#name"><div><h1>${escapeHtml(profile.name)}</h1><h2>${escapeHtml(profile.role)}</h2><p>Curious learner · Problem solver · Ready to make an impact</p></div><span class="ref-next-note">A Brighter<br>You Ahead</span></header>
      <div class="ref-next-body">
        <aside><div data-edit-pane="content" data-edit-focus="#name">${avatarMarkup('ref-next-avatar')}<blockquote>Eager to learn,<br>excited to build,<br>ready for what's next.</blockquote>${refContact()}</div><div data-edit-pane="content" data-edit-focus="#skills"><h3>Skills</h3>${refSkills('ref-next-skills')}</div></aside>
        <main>
          ${refEducation() ? '<section><h3>Education</h3>' + refEducation() + '</section>' : ''}
          <section data-edit-pane="content" data-edit-focus="#projectEditor"><h3>Projects</h3>${refProjects('ref-next-projects', 2)}</section>
          <section data-edit-pane="content" data-edit-focus="#experienceEditor"><h3>Internships</h3>${refExperience('ref-next-experience')}</section>
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
    paper.className = `paper template-${layoutVariant} theme-${template.id} font-${settings.font} density-${settings.density} radius-${settings.radius} projects-${settings.projectLayout || 'cards'} spacing-${sectionSpacing} avatar-${avatarShape} avatar-size-${avatarSize}`
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

    const languages = `
      <section class="draggable-section" draggable="true" data-section-key="languages" data-section-group="side" style="order:${sectionOrderIndex('languages')}" data-edit-pane="content" data-edit-focus="#languages">
        <h3 class="section-title">Languages</h3>
        <div class="languages">${profile.languages.map((language) => `<span>${escapeHtml(language)}</span>`).join('')}</div>
      </section>
    `

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

    $('#showSummary').checked = settings.showSummary
    $('#showSkills').checked = settings.showSkills
    $('#showExperience').checked = settings.showExperience
    $('#showProjects').checked = settings.showProjects
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

  const renderEditors = () => {
    syncEditorFields()
    renderExperienceEditor()
    renderProjectsEditor()
    renderQuickAvatar()
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
  }

  const preparePrintFit = () => {
    const paper = $('#paper')
    if (!paper) return 1
    resetPrintFit()
    const a4HeightPx = 1123
    const measuredHeight = Math.max(a4HeightPx, paper.scrollHeight, paper.offsetHeight)
    const fit = Math.max(0.68, Math.min(1, a4HeightPx / measuredHeight))
    paper.style.setProperty('--print-fit', fit.toFixed(4))
    paper.style.setProperty('--print-width', `${(210 / fit).toFixed(2)}mm`)
    paper.style.setProperty('--print-min-height', `${(297 / fit).toFixed(2)}mm`)
    paper.dataset.printFit = fit.toFixed(4)
    return fit
  }

  const printCv = () => {
    preparePrintFit()
    window.print()
    window.setTimeout(resetPrintFit, 0)
  }

  window.addEventListener('afterprint', resetPrintFit)
  $('#print').addEventListener('click', printCv)

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

  ;[
    ['showSummary', 'showSummary'],
    ['showSkills', 'showSkills'],
    ['showExperience', 'showExperience'],
    ['showProjects', 'showProjects'],
  ].forEach(([id, key]) => {
    $('#' + id).addEventListener('change', (event) => {
      settings[key] = event.currentTarget.checked
      renderAll()
    })
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
      printCv()
    }
    if (event.key === 'Escape') setEditorOpen(false)
  })

  lastHistoryState = captureHistoryState()
  renderEditors()
  renderAll()
  lastHistoryState = captureHistoryState()
  syncHistoryControls()
})()
