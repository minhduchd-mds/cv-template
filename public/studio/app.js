(() => {
  'use strict'

  const PROFILE_KEY = 'cv-studio-static-v2'
  const SETTINGS_KEY = 'cv-studio-static-settings-v2'

  const templates = [
    { id: 'product-slate', name: 'Senior Product Designer', category: 'Product', variant: 'product', accent: '#6d5dfc' },
    { id: 'ats-clean', name: 'ATS Clean', category: 'ATS', variant: 'ats', accent: '#0f766e' },
    { id: 'creative-grid', name: 'Creative Portfolio', category: 'Creative', variant: 'creative', accent: '#e44d7a' },
    { id: 'executive-ink', name: 'Executive Minimal', category: 'Leadership', variant: 'executive', accent: '#b7791f' },
    { id: 'design-system-lead', name: 'Design System Lead', category: 'Product', variant: 'system', accent: '#2563eb' },
    { id: 'design-engineer', name: 'Design Engineer', category: 'Tech', variant: 'tech', accent: '#111827' },
    { id: 'product-ivory', name: 'Product Ivory', category: 'Product', variant: 'product', accent: '#315c55' },
    { id: 'product-midnight', name: 'Product Midnight', category: 'Product', variant: 'product', accent: '#7c6dff' },
    { id: 'ats-compact', name: 'ATS Compact', category: 'ATS', variant: 'ats', accent: '#334155' },
    { id: 'ats-serif', name: 'ATS Serif', category: 'ATS', variant: 'ats', accent: '#7c2d12' },
    { id: 'creative-swiss', name: 'Swiss Grid', category: 'Creative', variant: 'creative', accent: '#e10600' },
    { id: 'executive-navy', name: 'Executive Navy', category: 'Leadership', variant: 'executive', accent: '#244a73' },
    { id: 'modern-split', name: 'Modern Split', category: 'Modern', variant: 'product', accent: '#2563eb' },
    { id: 'modern-clarity', name: 'Clarity Pro', category: 'Modern', variant: 'ats', accent: '#0891b2' },
    { id: 'modern-bento', name: 'Bento Resume', category: 'Modern', variant: 'creative', accent: '#7c3aed' },
    { id: 'modern-gradient', name: 'Gradient Editorial', category: 'Modern', variant: 'creative', accent: '#8b5cf6' },
    { id: 'modern-timeline', name: 'Timeline Pro', category: 'Modern', variant: 'executive', accent: '#0f766e' },
    { id: 'modern-mono', name: 'Mono Grid', category: 'Modern', variant: 'ats', accent: '#111827' },
    { id: 'young-neo-pop', name: 'Neo Pop', category: 'Young', variant: 'creative', accent: '#ff4d8d' },
    { id: 'young-soft-portfolio', name: 'Soft Portfolio', category: 'Young', variant: 'product', accent: '#7c6dff' },
    { id: 'young-creator-cards', name: 'Creator Cards', category: 'Young', variant: 'creative', accent: '#0ea5a4' },
  ]

  const rolePresets = {
    recruiter: {
      templateId: 'modern-clarity',
      accent: '#0891b2',
      font: 'sans',
      density: 'compact',
      radius: 'sharp',
      projectLayout: 'list',
    },
    uiux: {
      templateId: 'young-soft-portfolio',
      accent: '#7c6dff',
      font: 'sans',
      density: 'balanced',
      radius: 'soft',
      projectLayout: 'cards',
      avatarSize: 'large',
    },
    engineer: {
      templateId: 'modern-mono',
      accent: '#111827',
      font: 'mono',
      density: 'compact',
      radius: 'sharp',
      projectLayout: 'list',
    },
    lead: {
      templateId: 'modern-timeline',
      accent: '#0f766e',
      font: 'serif',
      density: 'spacious',
      radius: 'soft',
      projectLayout: 'list',
    },
  }

  const appearancePresets = {
    recruiter: { font: 'sans', density: 'compact', radius: 'sharp' },
    product: { font: 'sans', density: 'balanced', radius: 'soft' },
    editorial: { font: 'serif', density: 'spacious', radius: 'soft' },
    technical: { font: 'mono', density: 'compact', radius: 'sharp' },
  }

  const demoProfile = {
    avatar: '',
    name: 'Alex Chen',
    role: 'Senior Product Designer',
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
    templateId: 'product-slate',
    accent: '#6d5dfc',
    zoom: 0.85,
    font: 'sans',
    density: 'balanced',
    radius: 'soft',
    projectLayout: 'cards',
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
    list.innerHTML = ''

    templates.forEach((template) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `template-card${template.id === settings.templateId ? ' active' : ''}`
      button.setAttribute('aria-pressed', template.id === settings.templateId ? 'true' : 'false')
      button.innerHTML = `
        <span class="template-thumb thumb-${template.id}" style="--thumb-accent:${template.accent}"><i></i><i></i><i></i></span>
        <span><strong>${escapeHtml(template.name)}</strong><small>${escapeHtml(template.category)}</small></span>
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
    paper.className = `paper template-${layoutVariant} theme-${template.id} font-${settings.font} density-${settings.density} radius-${settings.radius} projects-${settings.projectLayout || 'cards'} avatar-${avatarShape} avatar-size-${avatarSize}`
    paper.style.setProperty('--accent', settings.accent)
    paper.style.setProperty('--zoom', String(settings.zoom))

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
    ;['name', 'role', 'email', 'phone', 'location', 'website', 'summary'].forEach((key) => {
      const input = $('#' + key)
      if (input) input.value = profile[key] || ''
    })
    $('#skills').value = profile.skills.join('\n')
    $('#languages').value = profile.languages.join('\n')

    $('#font').value = settings.font
    $('#density').value = settings.density
    $('#radius').value = settings.radius
    $('#zoom').value = String(settings.zoom)
    $('#accent').value = settings.accent

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

  ;['name', 'role', 'email', 'phone', 'location', 'website', 'summary'].forEach((key) => {
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

  $('#print').addEventListener('click', () => window.print())

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
    $('.section-drop-target', $('#paper')).forEach((node) => node.classList.remove('section-drop-target'))
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
    $('.section-drop-target', $('#paper')).forEach((node) => node.classList.remove('section-drop-target'))
  })

  $('#paper').addEventListener('dragend', () => {
    $('.section-dragging, .section-drop-target', $('#paper')).forEach((node) => node.classList.remove('section-dragging', 'section-drop-target'))
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
      window.print()
    }
    if (event.key === 'Escape') setEditorOpen(false)
  })

  lastHistoryState = captureHistoryState()
  renderEditors()
  renderAll()
  lastHistoryState = captureHistoryState()
  syncHistoryControls()
})()
