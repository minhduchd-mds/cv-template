(() => {
  'use strict'

  const PROFILE_KEY = 'cv-studio-static-v2'
  const STOP_WORDS = new Set([
    'and','the','with','for','from','that','this','you','your','our','are','was','were','will','have','has','had','into','about','who','what','when','where','how',
    'job','role','team','work','working','candidate','required','requirements','preferred','responsibilities','responsibility','skills','skill','experience','years','year',
    'a','an','to','of','in','on','at','by','or','as','is','be','we','it','they','their','them','can','may','using','use','used','including','plus',
    'va','voi','cho','cua','trong','tren','cac','nhung','mot','duoc','co','la','tu','den','theo','yeu','cau','kinh','nghiem','cong','viec','ung','vien'
  ])

  const STANDARD_HEADINGS = [
    ['summary','professional summary','profile','about','objective'],
    ['experience','work experience','professional experience','employment','career history'],
    ['skills','core skills','technical skills','competencies','expertise'],
    ['education','academic background'],
    ['projects','selected projects','project experience','selected work'],
    ['certifications','certificates','licenses'],
    ['languages','language'],
  ]

  const ACTION_VERBS = [
    'led','built','designed','delivered','launched','improved','increased','reduced','created','managed','developed','optimized','implemented','shipped','owned',
    'drove','grew','scaled','automated','streamlined','defined','established','mentored','directed','achieved','generated','converted'
  ]

  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value))
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]))

  const normalize = (value) => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./@%-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const readProfile = () => {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}
    } catch {
      return {}
    }
  }

  const flattenStrings = (value, depth = 0) => {
    if (depth > 4 || value == null) return []
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim()
      if (!text || text.startsWith('data:image/')) return []
      return [text]
    }
    if (Array.isArray(value)) return value.flatMap((item) => flattenStrings(item, depth + 1))
    if (typeof value === 'object') {
      return Object.entries(value)
        .filter(([key]) => !/image|avatar|id|enabled/i.test(key))
        .flatMap(([, item]) => flattenStrings(item, depth + 1))
    }
    return []
  }

  const usefulParts = (value) => {
    const parts = flattenStrings(value)
      .map((item) => item.trim())
      .filter((item) => item.length >= 2 && item.length <= 420)
    return [...new Set(parts)].slice(0, 80)
  }

  const matchPart = (haystack, part) => {
    const needle = normalize(part)
    if (!needle) return true
    if (haystack.includes(needle)) return true
    const words = needle.split(' ').filter(Boolean)
    if (words.length >= 8) return haystack.includes(words.slice(0, 8).join(' '))
    if (words.length >= 4) return haystack.includes(words.slice(0, 4).join(' '))
    return false
  }

  const fieldCoverage = (paperText, value) => {
    const parts = usefulParts(value)
    if (!parts.length) return { present: false, matched: 0, total: 0, score: null }
    const matched = parts.filter((part) => matchPart(paperText, part)).length
    return { present: true, matched, total: parts.length, score: matched / parts.length }
  }

  const getVisibleText = (paper) => {
    if (!paper) return ''
    return String(paper.innerText || paper.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const majorColumns = (paper) => {
    if (!paper) return []
    const paperRect = paper.getBoundingClientRect()
    if (!paperRect.width) return []
    return $$('*', paper).filter((node) => {
      const rect = node.getBoundingClientRect()
      if (rect.width < paperRect.width * 0.62 || rect.height < 100) return false
      const style = getComputedStyle(node)
      if (style.display !== 'grid') return false
      const cols = style.gridTemplateColumns.split(' ').filter((part) => part && part !== 'none')
      return cols.length > 1
    }).slice(0, 8)
  }

  const parseHeadings = (plain) => {
    const normalized = normalize(plain)
    return STANDARD_HEADINGS.map((variants) => ({
      label: variants[0],
      found: variants.some((heading) => {
        const token = normalize(heading)
        return normalized.includes(token)
      })
    }))
  }

  const dateRisk = (profile) => {
    const periods = [
      ...(profile.experience || []).map((item) => item && item.period),
      ...(profile.education || []).map((item) => item && item.period),
      ...(profile.certificates || []).map((item) => item && item.period),
    ].filter(Boolean)
    if (!periods.length) return { status: 'warn', label: 'Dates', detail: 'No dated experience or education detected.' }
    const unclear = periods.filter((value) => {
      const text = String(value)
      return !(/\b(19|20)\d{2}\b/.test(text) || /\b\d{1,2}[/-](?:19|20)?\d{2}\b/.test(text))
    })
    if (unclear.length) return { status: 'warn', label: 'Dates', detail: unclear.length + ' date range(s) may be ambiguous. Prefer Month YYYY or YYYY.' }
    return { status: 'pass', label: 'Dates', detail: 'Date ranges use recognizable year-based formats.' }
  }

  const scoreContent = (profile, plain) => {
    let score = 100
    const notes = []
    if (!String(profile.summary || '').trim()) { score -= 15; notes.push('Add a professional summary.') }
    if (!(profile.skills || []).length) { score -= 20; notes.push('Add a Skills section.') }
    if (!(profile.experience || []).length) { score -= 30; notes.push('Add work experience.') }
    const expText = normalize((profile.experience || []).map((item) => flattenStrings(item).join(' ')).join(' '))
    const quantified = (expText.match(/\b\d+(?:[.,]\d+)?%|\b\d+\+|\$\s?\d+|\b\d{2,}\b/g) || []).length
    if (!quantified) { score -= 15; notes.push('Add measurable outcomes to experience bullets.') }
    const actionHits = ACTION_VERBS.filter((verb) => expText.includes(verb)).length
    if (actionHits < 2 && (profile.experience || []).length) { score -= 10; notes.push('Use stronger action verbs in experience bullets.') }
    const wordCount = plain.split(/\s+/).filter(Boolean).length
    if (wordCount < 180) { score -= 10; notes.push('The visible CV is quite short for ATS indexing.') }
    return { score: clamp(score), notes, quantified, actionHits, wordCount }
  }

  const extractKeywords = (jobDescription) => {
    const source = normalize(jobDescription)
    const words = source.split(' ').filter((word) => word.length >= 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word))
    const counts = new Map()
    words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1))
    const bigrams = []
    for (let i = 0; i < words.length - 1; i += 1) {
      const phrase = words[i] + ' ' + words[i + 1]
      if (phrase.length <= 42 && words[i] !== words[i + 1]) bigrams.push(phrase)
    }
    const bigramCounts = new Map()
    bigrams.forEach((phrase) => bigramCounts.set(phrase, (bigramCounts.get(phrase) || 0) + 1))
    const rankedBigrams = [...bigramCounts.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
      .slice(0, 8)
      .map(([term]) => term)
    const rankedWords = [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
      .map(([term]) => term)
      .filter((term) => !rankedBigrams.some((phrase) => phrase.includes(term)))
      .slice(0, 22)
    return [...rankedBigrams, ...rankedWords].slice(0, 24)
  }

  const computeJobMatch = (plain, jd) => {
    const terms = extractKeywords(jd)
    if (!terms.length) return { score: null, terms: [], matched: [], missing: [] }
    const resume = normalize(plain)
    const matched = terms.filter((term) => resume.includes(term))
    const missing = terms.filter((term) => !resume.includes(term))
    return {
      score: Math.round((matched.length / terms.length) * 100),
      terms,
      matched,
      missing,
    }
  }

  const buildReport = () => {
    const paper = $('#paper')
    const profile = readProfile()
    const plain = getVisibleText(paper)
    const normalizedPlain = normalize(plain)
    const groups = [
      ['Name', profile.name],
      ['Role / title', profile.role],
      ['Headline', profile.headline],
      ['Email', profile.email],
      ['Phone', profile.phone],
      ['Location', profile.location],
      ['Website', profile.website],
      ['Summary', profile.summary],
      ['Skills', profile.skills],
      ['Experience', profile.experience],
      ['Projects', profile.projects],
      ['Education', profile.education],
      ['Certificates', profile.certificates],
      ['Languages', profile.languages],
    ].map(([label, value]) => ({ label, value, coverage: fieldCoverage(normalizedPlain, value) }))

    const active = groups.filter((item) => item.coverage.present)
    const coverageScore = active.length
      ? Math.round(active.reduce((sum, item) => sum + item.coverage.score, 0) / active.length * 100)
      : 0

    const columns = majorColumns(paper)
    const tables = $$('table', paper).length
    const graphics = $$('img,svg,canvas', paper).length
    const headings = parseHeadings(plain)
    const headingCount = headings.filter((item) => item.found).length
    const criticalHidden = groups.filter((item) => ['Name','Role / title','Email','Experience','Skills'].includes(item.label) && item.coverage.present && item.coverage.score < 0.5)
    const textLength = plain.split(/\s+/).filter(Boolean).length

    let structureScore = 100
    if (columns.length) structureScore -= 24
    if (tables) structureScore -= 18
    if (graphics) structureScore -= Math.min(12, graphics * 3)
    if (headingCount < 2) structureScore -= 20
    if (criticalHidden.length) structureScore -= Math.min(35, criticalHidden.length * 12)
    if (textLength < 120) structureScore -= 15
    structureScore = clamp(structureScore)

    const parseScore = Math.round(coverageScore * 0.72 + structureScore * 0.28)
    const content = scoreContent(profile, plain)
    const overall = Math.round(parseScore * 0.65 + content.score * 0.35)
    const dateCheck = dateRisk(profile)

    const checks = [
      columns.length
        ? { status: 'warn', label: 'Reading order', detail: columns.length + ' major multi-column/grid region(s) detected. Some ATS parsers can scramble reading order.' }
        : { status: 'pass', label: 'Reading order', detail: 'No major multi-column grid detected in the current rendered CV.' },
      tables
        ? { status: 'fail', label: 'Tables', detail: tables + ' table(s) detected. Table cell order may parse unpredictably.' }
        : { status: 'pass', label: 'Tables', detail: 'No HTML tables detected.' },
      graphics
        ? { status: 'warn', label: 'Graphics', detail: graphics + ' image/SVG/canvas element(s) detected. ATS generally ignores visual content; keep critical information as text.' }
        : { status: 'pass', label: 'Graphics', detail: 'No image/SVG/canvas dependency detected.' },
      headingCount >= 3
        ? { status: 'pass', label: 'Section headings', detail: headingCount + ' standard resume heading group(s) recognized.' }
        : { status: 'warn', label: 'Section headings', detail: 'Only ' + headingCount + ' standard heading group(s) recognized. Prefer labels such as Experience, Skills, Education.' },
      criticalHidden.length
        ? { status: 'fail', label: 'Critical fields', detail: criticalHidden.map((item) => item.label).join(', ') + ' exist in profile data but are not reliably visible in the rendered CV.' }
        : { status: 'pass', label: 'Critical fields', detail: 'Core profile fields present in source data are visible in the rendered text.' },
      dateCheck,
    ]

    return {
      profile,
      plain,
      groups,
      checks,
      headings,
      coverageScore,
      structureScore,
      parseScore,
      content,
      overall,
      columns: columns.length,
      graphics,
      tables,
    }
  }

  const statusForCoverage = (coverage) => {
    if (!coverage.present) return { key: 'empty', label: 'No source data' }
    if (coverage.score >= 0.85) return { key: 'readable', label: 'Readable' }
    if (coverage.score > 0) return { key: 'partial', label: 'Partial' }
    return { key: 'missing', label: 'Not detected' }
  }

  const scoreLabel = (score) => {
    if (score >= 90) return 'Strong'
    if (score >= 75) return 'Good'
    if (score >= 60) return 'Needs review'
    return 'High risk'
  }

  const injectUi = () => {
    const actions = $('.topbar-actions')
    if (!actions || $('#atsScanButton')) return

    const button = document.createElement('button')
    button.id = 'atsScanButton'
    button.type = 'button'
    button.className = 'button ats-trigger'
    button.innerHTML = '<span>ATS Scan</span><b id="atsScoreBadge">—</b>'
    actions.insertBefore(button, $('#reset'))

    const shell = document.createElement('div')
    shell.id = 'atsShell'
    shell.className = 'ats-shell'
    shell.hidden = true
    shell.innerHTML = [
      '<div class="ats-backdrop" data-ats-close></div>',
      '<aside class="ats-panel" role="dialog" aria-modal="true" aria-labelledby="atsTitle">',
        '<header class="ats-head">',
          '<div><span class="ats-eyebrow">Applicant Tracking System</span><h2 id="atsTitle">ATS Scanner</h2><p>See what the parser can actually read before you export.</p></div>',
          '<button type="button" class="ats-close" data-ats-close aria-label="Close ATS Scanner">×</button>',
        '</header>',
        '<div class="ats-score-hero">',
          '<div class="ats-score-ring"><strong id="atsOverallScore">—</strong><span>/100</span></div>',
          '<div><span id="atsOverallLabel">Scan ready</span><p id="atsTemplateNote">Current template</p></div>',
          '<button type="button" id="atsRescan" class="button primary">Re-scan</button>',
        '</div>',
        '<div class="ats-metrics">',
          '<article><span>Parseability</span><strong id="atsParseScore">—</strong><small>Text + reading order</small></article>',
          '<article><span>Content</span><strong id="atsContentScore">—</strong><small>ATS-ready substance</small></article>',
          '<article><span>JD match</span><strong id="atsJobScore">—</strong><small>Target keywords</small></article>',
        '</div>',
        '<nav class="ats-tabs" aria-label="ATS scanner sections">',
          '<button type="button" class="active" data-ats-tab="scan">Scan</button>',
          '<button type="button" data-ats-tab="parser">ATS sees this</button>',
          '<button type="button" data-ats-tab="job">JD Match</button>',
        '</nav>',
        '<section class="ats-pane active" data-ats-pane="scan">',
          '<div class="ats-section-title"><div><span>Field visibility</span><strong>What the parser finds</strong></div><small>Compared with CV source data</small></div>',
          '<div id="atsFieldList" class="ats-field-list"></div>',
          '<div class="ats-section-title"><div><span>Formatting</span><strong>Parser risks</strong></div><small>Template-level checks</small></div>',
          '<div id="atsCheckList" class="ats-check-list"></div>',
          '<div class="ats-section-title"><div><span>Content</span><strong>Improvements</strong></div><small>Not a hiring verdict</small></div>',
          '<div id="atsContentNotes" class="ats-note-list"></div>',
        '</section>',
        '<section class="ats-pane" data-ats-pane="parser">',
          '<div class="ats-section-title"><div><span>Plain text</span><strong>ATS sees this</strong></div><button type="button" id="atsCopyText" class="ats-small-button">Copy text</button></div>',
          '<p class="ats-help">This is the visible text stream extracted from the CV preview. If important content is missing or out of order here, treat it as an ATS risk.</p>',
          '<pre id="atsPlainText" class="ats-plain-text"></pre>',
        '</section>',
        '<section class="ats-pane" data-ats-pane="job">',
          '<div class="ats-section-title"><div><span>Target role</span><strong>Compare with job description</strong></div><small>Runs locally in your browser</small></div>',
          '<label class="ats-jd-label">Paste job description<textarea id="atsJobDescription" rows="10" placeholder="Paste the target job description here…"></textarea></label>',
          '<div class="ats-job-summary"><span>Keyword match</span><strong id="atsJobMatchLarge">—</strong><small id="atsJobMeta">Add a JD to calculate match.</small></div>',
          '<div class="ats-keyword-block"><strong>Matched</strong><div id="atsMatchedKeywords" class="ats-chips"></div></div>',
          '<div class="ats-keyword-block"><strong>Missing / review</strong><div id="atsMissingKeywords" class="ats-chips missing"></div></div>',
          '<p class="ats-help">Keyword matching is a heuristic. Different employers configure Workday, Greenhouse, Lever and other ATS products differently.</p>',
        '</section>',
        '<footer class="ats-footer">ATS Scanner estimates readability and keyword coverage. It does not guarantee selection or rejection.</footer>',
      '</aside>'
    ].join('')
    document.body.appendChild(shell)
  }

  let currentReport = null
  let observerTimer = 0

  const renderJobMatch = () => {
    if (!currentReport) return
    const jd = String($('#atsJobDescription')?.value || '')
    const match = computeJobMatch(currentReport.plain, jd)
    const jobScore = $('#atsJobScore')
    const large = $('#atsJobMatchLarge')
    const meta = $('#atsJobMeta')
    const matched = $('#atsMatchedKeywords')
    const missing = $('#atsMissingKeywords')
    if (!match.terms.length) {
      jobScore.textContent = '—'
      large.textContent = '—'
      meta.textContent = 'Add a JD to calculate match.'
      matched.innerHTML = '<span class="ats-empty-chip">No JD yet</span>'
      missing.innerHTML = '<span class="ats-empty-chip">No JD yet</span>'
      return
    }
    jobScore.textContent = match.score
    large.textContent = match.score + '%'
    meta.textContent = match.matched.length + ' of ' + match.terms.length + ' priority terms found'
    matched.innerHTML = match.matched.length
      ? match.matched.map((term) => '<span>' + esc(term) + '</span>').join('')
      : '<span class="ats-empty-chip">No priority terms matched yet</span>'
    missing.innerHTML = match.missing.length
      ? match.missing.map((term) => '<span>' + esc(term) + '</span>').join('')
      : '<span class="ats-empty-chip">No missing priority terms detected</span>'
  }

  const renderReport = () => {
    currentReport = buildReport()
    const report = currentReport
    const badge = $('#atsScoreBadge')
    if (badge) badge.textContent = report.overall

    $('#atsOverallScore').textContent = report.overall
    $('#atsOverallLabel').textContent = scoreLabel(report.overall)
    $('#atsParseScore').textContent = report.parseScore
    $('#atsContentScore').textContent = report.content.score
    $('#atsTemplateNote').textContent = ($('#activeTemplateLabel')?.textContent || 'Current template') + ' · ' + report.content.wordCount + ' words'

    $('#atsFieldList').innerHTML = report.groups.map((item) => {
      const status = statusForCoverage(item.coverage)
      const meta = item.coverage.present
        ? item.coverage.matched + '/' + item.coverage.total + ' source value(s) found'
        : 'Nothing entered in source data'
      return '<article class="ats-field-row" data-ats-status="' + status.key + '">' +
        '<span class="ats-status-dot"></span>' +
        '<div><strong>' + esc(item.label) + '</strong><small>' + esc(meta) + '</small></div>' +
        '<b>' + esc(status.label) + '</b>' +
      '</article>'
    }).join('')

    $('#atsCheckList').innerHTML = report.checks.map((check) =>
      '<article class="ats-check ' + check.status + '">' +
        '<span aria-hidden="true">' + (check.status === 'pass' ? '✓' : check.status === 'fail' ? '!' : '△') + '</span>' +
        '<div><strong>' + esc(check.label) + '</strong><p>' + esc(check.detail) + '</p></div>' +
      '</article>'
    ).join('')

    const contentNotes = report.content.notes.length
      ? report.content.notes
      : ['Content has the core ATS signals: summary, skills, experience and measurable evidence.']
    $('#atsContentNotes').innerHTML = contentNotes.map((note, index) =>
      '<article><span>' + (index + 1) + '</span><p>' + esc(note) + '</p></article>'
    ).join('')

    $('#atsPlainText').textContent = report.plain || 'No readable text detected.'
    renderJobMatch()
  }

  const setOpen = (open) => {
    const shell = $('#atsShell')
    if (!shell) return
    shell.hidden = !open
    document.body.classList.toggle('ats-open', open)
    if (open) {
      renderReport()
      setTimeout(() => $('.ats-close')?.focus(), 0)
    }
  }

  const bind = () => {
    $('#atsScanButton')?.addEventListener('click', () => setOpen(true))
    $$('[data-ats-close]').forEach((node) => node.addEventListener('click', () => setOpen(false)))
    $('#atsRescan')?.addEventListener('click', renderReport)
    $('#atsJobDescription')?.addEventListener('input', renderJobMatch)
    $('#atsCopyText')?.addEventListener('click', async () => {
      const text = $('#atsPlainText')?.textContent || ''
      try {
        await navigator.clipboard.writeText(text)
        $('#atsCopyText').textContent = 'Copied'
        setTimeout(() => { if ($('#atsCopyText')) $('#atsCopyText').textContent = 'Copy text' }, 1200)
      } catch {
        $('#atsCopyText').textContent = 'Select & copy'
      }
    })

    $$('[data-ats-tab]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.atsTab
      $$('[data-ats-tab]').forEach((item) => item.classList.toggle('active', item === button))
      $$('[data-ats-pane]').forEach((pane) => pane.classList.toggle('active', pane.dataset.atsPane === id))
    }))

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !$('#atsShell')?.hidden) setOpen(false)
    })

    const paper = $('#paper')
    if (paper && 'MutationObserver' in window) {
      const observer = new MutationObserver(() => {
        clearTimeout(observerTimer)
        observerTimer = setTimeout(() => {
          if (!$('#atsShell')?.hidden) renderReport()
          else {
            const report = buildReport()
            const badge = $('#atsScoreBadge')
            if (badge) badge.textContent = report.overall
          }
        }, 120)
      })
      observer.observe(paper, { childList: true, subtree: true, characterData: true, attributes: true })
    }
  }

  const boot = () => {
    injectUi()
    bind()
    setTimeout(() => {
      const report = buildReport()
      const badge = $('#atsScoreBadge')
      if (badge) badge.textContent = report.overall
    }, 80)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()


/* ATS_PRO_V2: transparent readiness + role/industry target fit */
(() => {
  'use strict'
  const PROFILE_KEY = 'cv-studio-static-v2'
  const TARGET_KEY = 'cv-studio-ats-target-v2'
  const $ = (s, r = document) => r.querySelector(s)
  const $$ = (s, r = document) => [...r.querySelectorAll(s)]
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))
  const norm = (v) => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}+#./%-]+/gu, ' ').replace(/\s+/g, ' ').trim()
  const read = (key, fallback = {}) => { try { return JSON.parse(localStorage.getItem(key) || '') || fallback } catch { return fallback } }

  const ROLES = {
    auto: ['Auto from template', []],
    uiux: ['UI/UX · Product Design', ['product design','user research','prototyping','design systems','interaction design','usability testing','figma','accessibility','information architecture','user flows']],
    designEngineer: ['Design Engineer', ['frontend','typescript','javascript','react','vue','design systems','component library','accessibility','css','html','performance']],
    product: ['Product Management', ['product strategy','roadmap','prioritization','product discovery','metrics','experimentation','stakeholder management','requirements','user research']],
    sales: ['Sales · Business Development', ['business development','revenue','pipeline','sales','account management','negotiation','partnership','go to market','crm','quota']],
    engineering: ['Software Engineering', ['javascript','typescript','react','node','api','testing','git','ci cd','architecture','performance','cloud']],
    data: ['Data · BI', ['sql','dashboard','analytics','business intelligence','python','data visualization','metrics','reporting']],
    marketing: ['Marketing · Growth', ['campaign','brand','seo','content','acquisition','conversion','analytics','crm','growth']],
    hr: ['HR · Talent', ['recruitment','talent acquisition','employee engagement','hr operations','performance management','onboarding','learning and development']],
    finance: ['Finance · Banking', ['financial analysis','budgeting','forecasting','reporting','investment','risk','excel','financial modeling','compliance']],
    research: ['Research · Academic', ['research','publication','methodology','analysis','teaching','grant','peer review','study']],
    general: ['General professional', ['leadership','communication','project management','stakeholder management','problem solving','collaboration','delivery']],
  }
  const INDUSTRIES = {
    general: ['Any industry', []], technology: ['Technology · SaaS', ['saas','platform','software','digital product','cloud','enterprise','b2b']], telecom: ['Telecom', ['telecom','telecommunications','network','5g','subscriber','mobile']], finance: ['Banking · Fintech', ['banking','fintech','finance','risk','compliance','payments','investment']], ecommerce: ['E-commerce', ['ecommerce','marketplace','conversion','checkout','retention','growth']], healthcare: ['Healthcare', ['healthcare','clinical','patient','medical','compliance','healthtech']], public: ['Public sector', ['public sector','government','citizen','policy','administration']], manufacturing: ['Manufacturing', ['manufacturing','supply chain','operations','quality','production']]
  }
  const SENIORITY = {
    entry: ['Entry / Graduate', ['intern','internship','graduate','coursework','project']], mid: ['Mid-level', ['owned','delivered','shipped','collaborated','implemented','improved']], senior: ['Senior', ['led','strategy','mentored','system','stakeholder','ownership','cross functional']], lead: ['Lead / Manager', ['managed','team','roadmap','strategy','governance','scale','leadership']], executive: ['Director / Executive', ['revenue','portfolio','transformation','p&l','organization','board','strategy']]
  }
  const TEMPLATE_ROLE = { 'Soft Portfolio':'uiux','Bento Resume':'uiux','Creator Cards':'uiux','Code Aware':'designEngineer','Mono Grid':'engineering','ATS Precision':'engineering','Product Operator':'product','Revenue Driver':'sales','Insight Grid':'data','Brand Motion':'marketing','People First':'hr','Finance Ledger':'finance','Research Scholar':'research','Studio Director':'marketing' }
  const FIELD_MAP = { Name:'#name','Role / title':'#role',Headline:'#headline',Email:'#email',Phone:'#phone',Location:'#location',Website:'#website',Summary:'#summary',Skills:'#skills',Experience:'#experienceEditor',Projects:'#projectEditor',Languages:'#languages' }
  const ACTIONS = ['led','built','designed','delivered','launched','improved','increased','reduced','created','managed','developed','implemented','shipped','owned','drove','scaled','automated','mentored','achieved']

  let target = { role:'auto', industry:'general', seniority:'senior', ...(read(TARGET_KEY, {})) }
  const saveTarget = () => { try { localStorage.setItem(TARGET_KEY, JSON.stringify(target)) } catch {} }
  const options = (lib, value) => Object.entries(lib).map(([k,[label]]) => \`<option value="\${k}"\${k === value ? ' selected' : ''}>\${label}</option>\`).join('')
  const activeTemplate = () => String($('#activeTemplateLabel')?.textContent || '').trim()
  const roleKey = () => target.role === 'auto' ? (TEMPLATE_ROLE[activeTemplate()] || 'general') : target.role
  const plain = () => String($('#paper')?.innerText || '').replace(/\n{3,}/g, '\n\n').trim()
  const profile = () => read(PROFILE_KEY, {})
  const hit = (source, term) => source.includes(norm(term))
  const termScore = (source, terms) => !terms.length ? null : clamp(terms.filter((t) => hit(source, t)).length / terms.length * 100)

  const readiness = () => {
    const p = profile(), text = plain(), source = norm(text)
    const fields = [p.name,p.role,p.headline,p.email,p.phone,p.location,p.website,p.summary,p.skills,p.experience,p.projects,p.languages].filter((v) => Array.isArray(v) ? v.length : String(v || '').trim())
    const flatten = (v) => Array.isArray(v) ? v.flatMap(flatten) : v && typeof v === 'object' ? Object.values(v).flatMap(flatten) : String(v || '').trim() ? [String(v).trim()] : []
    const coverage = fields.flatMap(flatten).filter((v) => v.length < 350).map((v) => hit(source, v) || hit(source, norm(v).split(' ').slice(0,5).join(' ')) ? 1 : 0)
    const extraction = coverage.length ? clamp(coverage.reduce((a,b) => a+b, 0) / coverage.length * 100) : 0
    const critical = [p.name,p.role,p.email,p.experience,p.skills].map((v) => flatten(v).some((x) => hit(source, x) || hit(source, norm(x).split(' ').slice(0,5).join(' '))) ? 100 : 0).reduce((a,b)=>a+b,0) / 5
    const paper = $('#paper'), rect = paper?.getBoundingClientRect(), columns = rect ? $$('*', paper).filter((n) => { const r=n.getBoundingClientRect(), s=getComputedStyle(n); return r.width > rect.width*.62 && r.height>100 && s.display==='grid' && s.gridTemplateColumns.split(' ').filter((x)=>x&&x!=='none').length>1 }).length : 0
    const tables = $$('table', paper).length, graphics = $$('img,svg,canvas', paper).length
    const headingWords = ['summary','experience','skills','education','projects','certificates','languages'], headingCount = headingWords.filter((h)=>source.includes(h)).length
    const structure = clamp(100 - (columns ? 30 + Math.min(15,(columns-1)*5) : 0) - Math.min(30,tables*18) - (headingCount < 3 ? 20 : 0))
    const periods = [...(p.experience||[]),...(p.education||[]),...(p.certificates||[])].map((x)=>x?.period).filter(Boolean), badDates = periods.filter((x)=>!/(19|20)\d{2}/.test(String(x))).length
    const format = clamp(100 - Math.min(18,graphics*4) - badDates*15 - (!p.email ? 8 : 0) - (!p.phone ? 5 : 0))
    const exp = norm((p.experience||[]).flatMap(flatten).join(' ')), metrics = (exp.match(/\d+(?:[.,]\d+)?%|\d+\+|\$\s?\d+/g)||[]).length, verbs = ACTIONS.filter((v)=>exp.includes(v)).length
    const evidence = clamp(100 - (!p.summary ? 20 : 0) - (!(p.skills||[]).length ? 20 : 0) - (!(p.experience||[]).length ? 35 : 0) - ((p.experience||[]).length && !metrics ? 15 : 0) - ((p.experience||[]).length && verbs<2 ? 10 : 0))
    const score = clamp(extraction*.30 + critical*.25 + structure*.15 + format*.10 + evidence*.20)
    return { score, metrics:[['Text extraction',extraction,30],['Critical fields',critical,25],['Structure',structure,15],['Format hygiene',format,10],['Evidence quality',evidence,20]] }
  }

  const fit = () => {
    const source = norm(plain()), rKey = roleKey(), r = termScore(source, ROLES[rKey][1]), i = termScore(source, INDUSTRIES[target.industry][1]), s = termScore(source, SENIORITY[target.seniority][1])
    const jd = $('#atsJobDescription')?.value || target.jd || '', terms = [...new Set(norm(jd).split(' ').filter((w)=>w.length>3))].slice(0,28), j = termScore(source, terms)
    const parts = j == null ? [[r,target.industry==='general'?70:55],[i,20],[s,target.industry==='general'?30:25]] : [[r,35],[i,15],[s,15],[j,35]]
    const active = parts.filter(([score])=>score!=null), total = active.reduce((a,[,w])=>a+w,0) || 1, score = clamp(active.reduce((a,[v,w])=>a+v*w,0)/total)
    return { score, role:r, industry:i, seniority:s, jd:j, terms, matched:terms.filter((t)=>hit(source,t)), missing:terms.filter((t)=>!hit(source,t)), rKey }
  }

  const scoreLabel = (n) => n>=85?'Strong':n>=70?'Good':n>=55?'Needs review':'High risk'
  const inject = () => {
    const panel = $('.ats-panel'); if (!panel || $('#atsProTarget')) return
    $('.ats-score-hero')?.classList.add('ats-pro-legacy-score')
    $('.ats-tabs [data-ats-tab="scan"]') && ($('.ats-tabs [data-ats-tab="scan"]').textContent = 'Overview')
    $('.ats-tabs [data-ats-tab="job"]') && ($('.ats-tabs [data-ats-tab="job"]').textContent = 'Target fit')
    panel.querySelector('.ats-head').insertAdjacentHTML('afterend', \`<section class="ats-pro-scoreboard"><article><span>ATS Readiness</span><strong id="atsProReadiness">—</strong><b id="atsProReadinessLabel">Scan ready</b><small>Machine readability · fixed criteria</small></article><article><span>Target Fit</span><strong id="atsProFit">—</strong><b id="atsProFitLabel">Target profile</b><small>Role + industry + seniority + JD</small></article></section>\`)
    panel.querySelector('.ats-tabs').insertAdjacentHTML('beforebegin', \`<section id="atsProTarget" class="ats-pro-target"><div><span>Target profile</span><strong>What are you applying for?</strong></div><div class="ats-pro-target-grid"><label>Role<select id="atsProRole">\${options(ROLES,target.role)}</select></label><label>Industry<select id="atsProIndustry">\${options(INDUSTRIES,target.industry)}</select></label><label>Seniority<select id="atsProSeniority">\${options(SENIORITY,target.seniority)}</select></label></div><p id="atsProTargetHint"></p></section>\`)
    const scanPane = $('[data-ats-pane="scan"]'); scanPane?.insertAdjacentHTML('afterbegin', \`<section class="ats-pro-method"><div class="ats-section-title"><div><span>Scoring model</span><strong>Transparent ATS Readiness</strong></div><small>100 points</small></div><div id="atsProMetrics"></div><details><summary>How the score is calculated</summary><p>Text extraction 30% · Critical fields 25% · Structure 15% · Format hygiene 10% · Evidence quality 20%. Role and industry never change ATS Readiness.</p></details></section>\`)
    const jobPane = $('[data-ats-pane="job"]'); jobPane?.insertAdjacentHTML('afterbegin', \`<section class="ats-pro-fit-section"><div class="ats-section-title"><div><span>Profile fit</span><strong>Role, industry & seniority</strong></div><small>Editable target</small></div><div id="atsProFitBreakdown"></div></section>\`)

    $('#atsProRole').addEventListener('change', syncTarget); $('#atsProIndustry').addEventListener('change', syncTarget); $('#atsProSeniority').addEventListener('change', syncTarget)
    $('#atsJobDescription')?.addEventListener('input', () => { target.jd = $('#atsJobDescription').value; saveTarget(); render() })
    panel.addEventListener('click', (e) => {
      const edit = e.target.closest('[data-ats-pro-edit]'); if (edit) return openEditor(edit.dataset.atsProEdit)
      if (e.target.closest('[data-ats-pro-template]')) return useAtsTemplate()
    })
    const lists = ['#atsFieldList','#atsCheckList','#atsContentNotes'].map($).filter(Boolean)
    lists.forEach((node)=>new MutationObserver(decorateActions).observe(node,{childList:true,subtree:true}))
    decorateActions()
  }

  const syncTarget = () => { target.role=$('#atsProRole').value; target.industry=$('#atsProIndustry').value; target.seniority=$('#atsProSeniority').value; saveTarget(); render() }
  const openEditor = (selector) => { $('#atsShell').hidden=true; document.body.classList.remove('ats-open'); setTimeout(()=>{ if ($('#editor')?.classList.contains('collapsed')) $('#toggleEditor')?.click(); $('.tab[data-tab="content"]')?.click(); const n=$(selector); n?.scrollIntoView({behavior:'smooth',block:'center'}); (n?.matches('input,textarea,select')?n:n?.querySelector('input,textarea,select,button'))?.focus({preventScroll:true}) },80) }
  const useAtsTemplate = () => { $('#atsShell').hidden=true; document.body.classList.remove('ats-open'); setTimeout(()=>{ const n=$$('.template-card').find((x)=>/ATS Precision/i.test(x.textContent||'')) || $$('.template-card').find((x)=>/ATS Clean/i.test(x.textContent||'')); n?.click(); n?.scrollIntoView({behavior:'smooth',block:'center'}) },80) }
  const decorateActions = () => {
    $$('#atsFieldList .ats-field-row').forEach((row)=>{ if (row.querySelector('.ats-pro-action')) return; const label=row.querySelector('strong')?.textContent?.trim(), selector=FIELD_MAP[label]; if (selector) row.insertAdjacentHTML('beforeend', \`<button class="ats-pro-action" type="button" data-ats-pro-edit="\${selector}">Edit</button>\`) })
    $$('#atsCheckList .ats-check').forEach((row)=>{ if (row.querySelector('.ats-pro-action')) return; const label=row.querySelector('strong')?.textContent||''; if (/Reading order|Tables/.test(label)) row.insertAdjacentHTML('beforeend','<button class="ats-pro-action" type="button" data-ats-pro-template>Use ATS template</button>'); else if (/Dates/.test(label)) row.insertAdjacentHTML('beforeend','<button class="ats-pro-action" type="button" data-ats-pro-edit="#experienceEditor">Edit</button>') })
    $$('#atsContentNotes article').forEach((row)=>{ if (row.querySelector('.ats-pro-action')) return; const t=row.textContent.toLowerCase(), selector=t.includes('skill')?'#skills':t.includes('experience')||t.includes('action')||t.includes('measurable')?'#experienceEditor':t.includes('summary')?'#summary':''; if (selector) row.insertAdjacentHTML('beforeend',\`<button class="ats-pro-action" type="button" data-ats-pro-edit="\${selector}">Fix</button>\`) })
  }

  const render = () => {
    if (!$('#atsProTarget')) return
    const r=readiness(), f=fit(); $('#atsProReadiness').textContent=r.score; $('#atsProReadinessLabel').textContent=scoreLabel(r.score); $('#atsProFit').textContent=f.score; $('#atsProFitLabel').textContent=scoreLabel(f.score); if ($('#atsScoreBadge')) $('#atsScoreBadge').textContent=r.score
    $('#atsProTargetHint').textContent = \`\${ROLES[f.rKey][0]} · \${INDUSTRIES[target.industry][0]} · \${SENIORITY[target.seniority][0]}\`
    $('#atsProMetrics').innerHTML = r.metrics.map(([label,score,weight])=>\`<article><div><strong>\${label}</strong><span>\${weight}%</span></div><div class="ats-pro-meter"><i style="width:\${score}%"></i></div><b>\${clamp(score)}</b></article>\`).join('')
    const rows=[['Role match',f.role,ROLES[f.rKey][0]],['Industry signals',f.industry,INDUSTRIES[target.industry][0]],['Seniority signals',f.seniority,SENIORITY[target.seniority][0]]]
    $('#atsProFitBreakdown').innerHTML=rows.map(([label,score,detail])=>\`<article><div><strong>\${label}</strong><small>\${detail}</small></div><div class="ats-pro-meter"><i style="width:\${score==null?0:score}%"></i></div><b>\${score==null?'—':score}</b></article>\`).join('')
    decorateActions()
  }

  const boot = () => {
    inject(); render()
    $('#atsScanButton')?.addEventListener('click',()=>setTimeout(()=>{ inject(); render() },0))
    $('#atsRescan')?.addEventListener('click',()=>setTimeout(render,0))
    const paper=$('#paper'); if (paper) new MutationObserver(()=>setTimeout(render,0)).observe(paper,{childList:true,subtree:true,characterData:true,attributes:true})
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot()
})()


/* ATS_PDF_VERIFY_V1: parse the exported PDF text layer and compare it with the live CV. */
(() => {
  'use strict'

  const PDFJS_VERSION = '6.3.289'
  const PDFJS_URL = \`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/\${PDFJS_VERSION}/pdf.min.mjs\`
  const PDFJS_WORKER_URL = \`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/\${PDFJS_VERSION}/pdf.worker.min.mjs\`
  const PROFILE_KEY = 'cv-studio-static-v2'
  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)))
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]))
  const normalize = (value) => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./@%-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const readProfile = () => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {} }
    catch { return {} }
  }
  const flatten = (value, depth = 0) => {
    if (depth > 4 || value == null) return []
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim()
      if (!text || text.startsWith('data:image/')) return []
      return [text]
    }
    if (Array.isArray(value)) return value.flatMap((item) => flatten(item, depth + 1))
    if (typeof value === 'object') return Object.entries(value)
      .filter(([key]) => !/image|avatar|id|enabled/i.test(key))
      .flatMap(([, item]) => flatten(item, depth + 1))
    return []
  }
  const matchText = (haystack, value) => {
    const needle = normalize(value)
    if (!needle) return true
    if (haystack.includes(needle)) return true
    const words = needle.split(' ').filter(Boolean)
    if (words.length >= 9) return haystack.includes(words.slice(0, 8).join(' '))
    if (words.length >= 5) return haystack.includes(words.slice(0, 5).join(' '))
    return false
  }
  const usefulParts = (value) => [...new Set(flatten(value)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2 && item.length <= 420))].slice(0, 90)
  const groupCoverage = (pdfNormalized, value) => {
    const parts = usefulParts(value)
    if (!parts.length) return { present:false, matched:0, total:0, score:null }
    const matched = parts.filter((part) => matchText(pdfNormalized, part)).length
    return { present:true, matched, total:parts.length, score:matched / parts.length }
  }
  const sourceLines = () => {
    const text = String($('#paper')?.innerText || $('#paper')?.textContent || '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    const lines = text.split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length >= 3)
    return { text, lines:[...new Set(lines)].slice(0, 180) }
  }
  const orderConsistency = (lines, pdfNormalized) => {
    const positions = []
    lines.forEach((line) => {
      const needle = normalize(line)
      if (!needle) return
      let pos = pdfNormalized.indexOf(needle)
      if (pos < 0) {
        const words = needle.split(' ').filter(Boolean)
        if (words.length >= 5) pos = pdfNormalized.indexOf(words.slice(0, 5).join(' '))
      }
      if (pos >= 0) positions.push(pos)
    })
    if (positions.length < 3) return { score:60, matched:positions.length, inversions:0 }
    let good = 0
    let inversions = 0
    for (let i = 1; i < positions.length; i += 1) {
      if (positions[i] >= positions[i - 1]) good += 1
      else inversions += 1
    }
    return { score:clamp(good / (positions.length - 1) * 100), matched:positions.length, inversions }
  }

  let pdfModulePromise = null
  const loadPdfModule = async () => {
    if (window.__atsPdfTextExtractor) return null
    if (!pdfModulePromise) {
      pdfModulePromise = import(PDFJS_URL).then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL
        return pdfjsLib
      })
    }
    return pdfModulePromise
  }

  const extractPdfText = async (file) => {
    if (window.__atsPdfTextExtractor) return window.__atsPdfTextExtractor(file)
    const pdfjsLib = await loadPdfModule()
    const bytes = new Uint8Array(await file.arrayBuffer())
    const documentTask = pdfjsLib.getDocument({ data: bytes })
    const pdf = await documentTask.promise
    const pages = []
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const rows = []
      let current = []
      content.items.forEach((item) => {
        const value = String(item.str || '').trim()
        if (value) current.push(value)
        if (item.hasEOL && current.length) {
          rows.push(current.join(' '))
          current = []
        }
      })
      if (current.length) rows.push(current.join(' '))
      pages.push(rows.join('\n'))
    }
    return { text:pages.join('\n\n'), pages:pdf.numPages }
  }

  const fieldGroups = (profile) => [
    ['Name', profile.name, '#name'],
    ['Role / title', profile.role, '#role'],
    ['Headline', profile.headline, '#headline'],
    ['Email', profile.email, '#email'],
    ['Phone', profile.phone, '#phone'],
    ['Location', profile.location, '#location'],
    ['Website', profile.website, '#website'],
    ['Summary', profile.summary, '#summary'],
    ['Skills', profile.skills, '#skills'],
    ['Experience', profile.experience, '#experienceEditor'],
    ['Projects', profile.projects, '#projectEditor'],
    ['Languages', profile.languages, '#languages'],
  ]

  const analyzePdf = (pdfText, pages) => {
    const profile = readProfile()
    const source = sourceLines()
    const pdfNormalized = normalize(pdfText)
    const groups = fieldGroups(profile).map(([label, value, selector]) => ({
      label, selector, coverage:groupCoverage(pdfNormalized, value)
    }))
    const sourceMatches = source.lines.map((line) => matchText(pdfNormalized, line) ? 1 : 0)
    const retained = sourceMatches.length
      ? clamp(sourceMatches.reduce((sum, value) => sum + value, 0) / sourceMatches.length * 100)
      : 0
    const criticalLabels = new Set(['Name','Role / title','Email','Skills','Experience'])
    const critical = groups.filter((group) => criticalLabels.has(group.label) && group.coverage.present)
    const criticalScore = critical.length
      ? clamp(critical.reduce((sum, group) => sum + group.coverage.score, 0) / critical.length * 100)
      : 0
    const order = orderConsistency(source.lines, pdfNormalized)
    const textLayer = pdfNormalized.length >= 240 ? 100 : pdfNormalized.length >= 80 ? 60 : pdfNormalized.length ? 30 : 0
    const score = clamp(retained * .45 + criticalScore * .30 + order.score * .15 + textLayer * .10)
    return {
      score, retained, criticalScore, order, textLayer, groups, pdfText, pages,
      sourceWordCount:source.text.split(/\s+/).filter(Boolean).length,
      pdfWordCount:String(pdfText).split(/\s+/).filter(Boolean).length,
    }
  }

  const stateLabel = (coverage) => {
    if (!coverage.present) return { key:'empty', label:'No source data' }
    if (coverage.score >= .85) return { key:'retained', label:'Retained' }
    if (coverage.score > 0) return { key:'partial', label:'Partial' }
    return { key:'missing', label:'Missing' }
  }
  const verdict = (score) => score >= 90 ? 'Export preserved well' : score >= 75 ? 'Review a few differences' : score >= 55 ? 'PDF needs attention' : 'High parsing risk'

  const inject = () => {
    const panel = $('.ats-panel')
    const tabs = $('.ats-tabs')
    if (!panel || !tabs || $('#atsPdfVerifyTab')) return

    const tab = document.createElement('button')
    tab.type = 'button'
    tab.id = 'atsPdfVerifyTab'
    tab.dataset.atsTab = 'pdf'
    tab.textContent = 'PDF verify'
    tabs.appendChild(tab)

    const pane = document.createElement('section')
    pane.className = 'ats-pane'
    pane.dataset.atsPane = 'pdf'
    pane.innerHTML = [
      '<section class="ats-pdf-intro">',
        '<div><span>Export verification</span><strong>Check the PDF ATS will receive</strong></div>',
        '<p>Export your CV, then drop the saved PDF here. The file stays in this browser; only its text layer is read.</p>',
      '</section>',
      '<label id="atsPdfDrop" class="ats-pdf-drop">',
        '<input id="atsPdfInput" type="file" accept="application/pdf,.pdf" />',
        '<span class="ats-pdf-icon">PDF</span>',
        '<strong>Drop exported PDF here</strong>',
        '<small>or click to choose the file</small>',
      '</label>',
      '<div id="atsPdfLoading" class="ats-pdf-loading" hidden><span></span><div><strong>Reading PDF text layer…</strong><small>Comparing it with your current CV.</small></div></div>',
      '<div id="atsPdfError" class="ats-pdf-error" hidden></div>',
      '<div id="atsPdfResult" hidden>',
        '<section class="ats-pdf-score">',
          '<div><span>PDF fidelity</span><strong id="atsPdfScore">—</strong><small id="atsPdfVerdict">Waiting for file</small></div>',
          '<div class="ats-pdf-metrics">',
            '<article><span>Text retained</span><strong id="atsPdfRetained">—</strong></article>',
            '<article><span>Critical fields</span><strong id="atsPdfCritical">—</strong></article>',
            '<article><span>Reading order</span><strong id="atsPdfOrder">—</strong></article>',
          '</div>',
        '</section>',
        '<div class="ats-section-title"><div><span>Source vs PDF</span><strong>What survived export</strong></div><small id="atsPdfMeta"></small></div>',
        '<div id="atsPdfFieldList" class="ats-pdf-field-list"></div>',
        '<div class="ats-section-title"><div><span>Reading order</span><strong id="atsPdfOrderTitle">Sequence check</strong></div><small id="atsPdfOrderMeta"></small></div>',
        '<div id="atsPdfOrderAdvice" class="ats-pdf-advice"></div>',
        '<details class="ats-pdf-raw">',
          '<summary>View extracted PDF text</summary>',
          '<pre id="atsPdfRawText"></pre>',
        '</details>',
      '</div>',
      '<div class="ats-pdf-actions">',
        '<button type="button" id="atsPdfExportAgain" class="button ghost">Export PDF again</button>',
        '<button type="button" id="atsPdfChooseAgain" class="button primary">Choose PDF</button>',
      '</div>',
      '<p class="ats-help">PDF verification checks the real selectable text layer. Scanned/image-only PDFs can score poorly even if they look visually correct.</p>',
    ].join('')
    panel.insertBefore(pane, panel.querySelector('.ats-footer'))

    // The original ATS script bound existing tabs before this new tab existed, so bind it here.
    tab.addEventListener('click', () => {
      $$('[data-ats-tab]').forEach((item) => item.classList.toggle('active', item === tab))
      $$('[data-ats-pane]').forEach((item) => item.classList.toggle('active', item.dataset.atsPane === 'pdf'))
    })

    const input = $('#atsPdfInput')
    const drop = $('#atsPdfDrop')
    drop.addEventListener('dragover', (event) => {
      event.preventDefault()
      drop.classList.add('dragging')
    })
    drop.addEventListener('dragleave', () => drop.classList.remove('dragging'))
    drop.addEventListener('drop', (event) => {
      event.preventDefault()
      drop.classList.remove('dragging')
      const file = event.dataTransfer?.files?.[0]
      if (file) verify(file)
    })
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (file) verify(file)
    })
    $('#atsPdfChooseAgain').addEventListener('click', () => input.click())
    $('#atsPdfExportAgain').addEventListener('click', () => $('#print')?.click())

    // After the browser print flow closes, signal the next useful action without forcing a modal.
    window.addEventListener('afterprint', () => {
      const button = $('#atsScanButton')
      if (!button) return
      button.classList.add('ats-pdf-ready')
      button.title = 'ATS Scan · verify the PDF you just exported'
      const badge = $('#atsScoreBadge')
      if (badge && !badge.dataset.readiness) {
        badge.dataset.readiness = badge.textContent || ''
      }
      if (badge) badge.textContent = 'PDF?'
    })
    $('#atsScanButton')?.addEventListener('click', () => {
      const badge = $('#atsScoreBadge')
      if (badge?.dataset.readiness) {
        badge.textContent = badge.dataset.readiness
        delete badge.dataset.readiness
      }
      $('#atsScanButton')?.classList.remove('ats-pdf-ready')
    })
  }

  const openSourceField = (selector) => {
    if (!selector) return
    $('#atsShell').hidden = true
    document.body.classList.remove('ats-open')
    setTimeout(() => {
      if ($('#editor')?.classList.contains('collapsed')) $('#toggleEditor')?.click()
      $('.tab[data-tab="content"]')?.click()
      const node = $(selector)
      node?.scrollIntoView({ behavior:'smooth', block:'center' })
      const focus = node?.matches('input,textarea,select') ? node : node?.querySelector('input,textarea,select,button')
      focus?.focus({ preventScroll:true })
    }, 80)
  }

  const renderResult = (report, filename) => {
    $('#atsPdfResult').hidden = false
    $('#atsPdfScore').textContent = report.score
    $('#atsPdfVerdict').textContent = verdict(report.score)
    $('#atsPdfRetained').textContent = report.retained + '%'
    $('#atsPdfCritical').textContent = report.criticalScore + '%'
    $('#atsPdfOrder').textContent = report.order.score + '%'
    $('#atsPdfMeta').textContent = report.pages + ' page' + (report.pages === 1 ? '' : 's') + ' · ' + report.pdfWordCount + ' PDF words'
    $('#atsPdfRawText').textContent = report.pdfText || 'No selectable PDF text found.'
    $('#atsPdfOrderTitle').textContent = report.order.inversions ? 'Possible sequence changes' : 'Sequence looks consistent'
    $('#atsPdfOrderMeta').textContent = report.order.matched + ' comparable text blocks'
    $('#atsPdfOrderAdvice').innerHTML = report.order.inversions
      ? '<strong>Review reading order</strong><p>' + report.order.inversions + ' sequence break(s) detected. Multi-column layouts are the first thing to review.</p><button type="button" data-pdf-use-ats>Use ATS template</button>'
      : '<strong>Order preserved</strong><p>Matched blocks generally appear in the same sequence as the live CV.</p>'

    $('#atsPdfFieldList').innerHTML = report.groups.map((group) => {
      const state = stateLabel(group.coverage)
      const detail = group.coverage.present
        ? group.coverage.matched + '/' + group.coverage.total + ' source value(s) found in PDF'
        : 'No source data to compare'
      return '<article data-pdf-state="' + state.key + '">' +
        '<span class="ats-pdf-state-dot"></span>' +
        '<div><strong>' + esc(group.label) + '</strong><small>' + esc(detail) + '</small></div>' +
        '<b>' + esc(state.label) + '</b>' +
        (group.selector && state.key !== 'retained' && state.key !== 'empty'
          ? '<button type="button" data-pdf-edit="' + esc(group.selector) + '">Fix source</button>'
          : '') +
      '</article>'
    }).join('')

    $('#atsPdfFieldList').onclick = (event) => {
      const edit = event.target.closest('[data-pdf-edit]')
      if (edit) openSourceField(edit.dataset.pdfEdit)
    }
    $('[data-pdf-use-ats]')?.addEventListener('click', () => {
      $('#atsShell').hidden = true
      document.body.classList.remove('ats-open')
      setTimeout(() => {
        const card = $$('.template-card').find((item) => /ATS Precision/i.test(item.textContent || ''))
          || $$('.template-card').find((item) => /ATS Clean/i.test(item.textContent || ''))
        card?.click()
        card?.scrollIntoView({ behavior:'smooth', block:'center' })
      }, 80)
    })

    const drop = $('#atsPdfDrop')
    drop.querySelector('strong').textContent = filename
    drop.querySelector('small').textContent = 'Verified · drop another PDF to compare again'
    drop.classList.add('verified')
  }

  const verify = async (file) => {
    const error = $('#atsPdfError')
    const loading = $('#atsPdfLoading')
    error.hidden = true
    if (!file || !/pdf/i.test(file.type || '') && !/\.pdf$/i.test(file.name || '')) {
      error.textContent = 'Please choose a PDF file.'
      error.hidden = false
      return
    }
    loading.hidden = false
    $('#atsPdfResult').hidden = true
    try {
      const extracted = await extractPdfText(file)
      const report = analyzePdf(extracted.text || '', Number(extracted.pages || 1))
      renderResult(report, file.name || 'Exported CV.pdf')
    } catch (cause) {
      console.error('ATS PDF verification failed.', cause)
      error.innerHTML = '<strong>Unable to read this PDF.</strong><span>Try the exported file again. Image-only/scanned PDFs may not contain a readable text layer.</span>'
      error.hidden = false
    } finally {
      loading.hidden = true
    }
  }

  const boot = () => inject()
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
  else boot()
})()
