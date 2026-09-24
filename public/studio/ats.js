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


/* ATS_PRO_V2_FIXED */
(() => {
  'use strict'

  const PROFILE_KEY = 'cv-studio-static-v2'
  const TARGET_KEY = 'cv-studio-ats-target-v2'
  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)))
  const normalize = (value) => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./@%-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const readJson = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || '') || fallback }
    catch { return fallback }
  }

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
    general: ['General professional', ['leadership','communication','project management','stakeholder management','problem solving','collaboration','delivery']]
  }

  const INDUSTRIES = {
    general: ['Any industry', []],
    technology: ['Technology · SaaS', ['saas','platform','software','digital product','cloud','enterprise','b2b']],
    telecom: ['Telecom', ['telecom','telecommunications','network','5g','subscriber','mobile']],
    finance: ['Banking · Fintech', ['banking','fintech','finance','risk','compliance','payments','investment']],
    ecommerce: ['E-commerce', ['ecommerce','marketplace','conversion','checkout','retention','growth']],
    healthcare: ['Healthcare', ['healthcare','clinical','patient','medical','compliance','healthtech']],
    public: ['Public sector', ['public sector','government','citizen','policy','administration']],
    manufacturing: ['Manufacturing', ['manufacturing','supply chain','operations','quality','production']]
  }

  const SENIORITY = {
    entry: ['Entry / Graduate', ['intern','internship','graduate','coursework','project']],
    mid: ['Mid-level', ['owned','delivered','shipped','collaborated','implemented','improved']],
    senior: ['Senior', ['led','strategy','mentored','system','stakeholder','ownership','cross functional']],
    lead: ['Lead / Manager', ['managed','team','roadmap','strategy','governance','scale','leadership']],
    executive: ['Director / Executive', ['revenue','portfolio','transformation','p&l','organization','board','strategy']]
  }

  const TEMPLATE_ROLE = {
    'Soft Portfolio':'uiux',
    'Bento Resume':'uiux',
    'Creator Cards':'uiux',
    'Code Aware':'designEngineer',
    'Mono Grid':'engineering',
    'ATS Precision':'engineering',
    'Product Operator':'product',
    'Revenue Driver':'sales',
    'Insight Grid':'data',
    'Brand Motion':'marketing',
    'People First':'hr',
    'Finance Ledger':'finance',
    'Research Scholar':'research',
    'Studio Director':'marketing'
  }

  const FIELD_MAP = {
    'Name':'#name',
    'Role / title':'#role',
    'Headline':'#headline',
    'Email':'#email',
    'Phone':'#phone',
    'Location':'#location',
    'Website':'#website',
    'Summary':'#summary',
    'Skills':'#skills',
    'Experience':'#experienceEditor',
    'Projects':'#projectEditor',
    'Languages':'#languages'
  }

  const ACTIONS = ['led','built','designed','delivered','launched','improved','increased','reduced','created','managed','developed','implemented','shipped','owned','drove','scaled','automated','mentored','achieved']

  let target = Object.assign({ role:'auto', industry:'general', seniority:'senior', jd:'' }, readJson(TARGET_KEY, {}))

  const saveTarget = () => {
    try { localStorage.setItem(TARGET_KEY, JSON.stringify(target)) }
    catch {}
  }

  const optionsHtml = (library, value) => Object.entries(library).map(([key, item]) => {
    return '<option value="' + key + '"' + (key === value ? ' selected' : '') + '>' + item[0] + '</option>'
  }).join('')

  const activeTemplate = () => String($('#activeTemplateLabel')?.textContent || '').trim()
  const resolvedRoleKey = () => target.role === 'auto' ? (TEMPLATE_ROLE[activeTemplate()] || 'general') : target.role
  const paperText = () => String($('#paper')?.innerText || '').trim()
  const profile = () => readJson(PROFILE_KEY, {})
  const containsTerm = (source, term) => source.includes(normalize(term))

  const termScore = (source, terms) => {
    if (!terms.length) return null
    return clamp(terms.filter((term) => containsTerm(source, term)).length / terms.length * 100)
  }

  const flatten = (value) => {
    if (value == null) return []
    if (Array.isArray(value)) return value.flatMap(flatten)
    if (typeof value === 'object') return Object.entries(value)
      .filter(([key]) => !/image|avatar|id|enabled/i.test(key))
      .flatMap(([, item]) => flatten(item))
    const text = String(value).trim()
    return text && !text.startsWith('data:image/') ? [text] : []
  }

  const readiness = () => {
    const p = profile()
    const text = paperText()
    const source = normalize(text)
    const values = [p.name,p.role,p.headline,p.email,p.phone,p.location,p.website,p.summary,p.skills,p.experience,p.projects,p.languages]
      .filter((value) => Array.isArray(value) ? value.length : String(value || '').trim())
      .flatMap(flatten)
      .filter((value) => value.length < 350)

    const extractionHits = values.map((value) => {
      const needle = normalize(value)
      if (source.includes(needle)) return 1
      const words = needle.split(' ').filter(Boolean)
      return words.length >= 5 && source.includes(words.slice(0,5).join(' ')) ? 1 : 0
    })
    const extraction = extractionHits.length ? clamp(extractionHits.reduce((a,b) => a+b,0) / extractionHits.length * 100) : 0

    const criticalValues = [p.name,p.role,p.email,p.experience,p.skills]
    const criticalHits = criticalValues.map((value) => flatten(value).some((item) => {
      const needle = normalize(item)
      if (source.includes(needle)) return true
      const words = needle.split(' ').filter(Boolean)
      return words.length >= 5 && source.includes(words.slice(0,5).join(' '))
    }) ? 100 : 0)
    const critical = clamp(criticalHits.reduce((a,b) => a+b,0) / criticalHits.length)

    const paper = $('#paper')
    const rect = paper?.getBoundingClientRect()
    const columns = rect ? $$('*', paper).filter((node) => {
      const nodeRect = node.getBoundingClientRect()
      const style = getComputedStyle(node)
      const gridCols = style.gridTemplateColumns.split(' ').filter((item) => item && item !== 'none')
      return nodeRect.width > rect.width * .62 && nodeRect.height > 100 && style.display === 'grid' && gridCols.length > 1
    }).length : 0
    const tables = $$('table', paper).length
    const graphics = $$('img,svg,canvas', paper).length
    const headingWords = ['summary','experience','skills','education','projects','certificates','languages']
    const headingCount = headingWords.filter((heading) => source.includes(heading)).length
    const structure = clamp(100 - (columns ? 30 + Math.min(15,(columns-1)*5) : 0) - Math.min(30,tables*18) - (headingCount < 3 ? 20 : 0))

    const periods = [].concat(p.experience || [], p.education || [], p.certificates || []).map((item) => item?.period).filter(Boolean)
    const badDates = periods.filter((value) => !/(19|20)\d{2}/.test(String(value))).length
    const format = clamp(100 - Math.min(18,graphics*4) - badDates*15 - (!p.email ? 8 : 0) - (!p.phone ? 5 : 0))

    const expText = normalize((p.experience || []).flatMap(flatten).join(' '))
    const metrics = (expText.match(/\d+(?:[.,]\d+)?%|\d+\+|\$\s?\d+/g) || []).length
    const verbs = ACTIONS.filter((verb) => expText.includes(verb)).length
    const evidence = clamp(100 - (!p.summary ? 20 : 0) - (!(p.skills || []).length ? 20 : 0) - (!(p.experience || []).length ? 35 : 0) - ((p.experience || []).length && !metrics ? 15 : 0) - ((p.experience || []).length && verbs < 2 ? 10 : 0))

    const score = clamp(extraction*.30 + critical*.25 + structure*.15 + format*.10 + evidence*.20)
    return {
      score,
      metrics:[
        ['Text extraction', extraction, 30],
        ['Critical fields', critical, 25],
        ['Structure', structure, 15],
        ['Format hygiene', format, 10],
        ['Evidence quality', evidence, 20]
      ]
    }
  }

  const fit = () => {
    const source = normalize(paperText())
    const roleKey = resolvedRoleKey()
    const role = termScore(source, ROLES[roleKey][1])
    const industry = termScore(source, INDUSTRIES[target.industry][1])
    const seniority = termScore(source, SENIORITY[target.seniority][1])
    const jd = String($('#atsJobDescription')?.value || target.jd || '')
    const terms = [...new Set(normalize(jd).split(' ').filter((word) => word.length > 3))].slice(0,28)
    const jdScore = termScore(source, terms)
    const parts = jdScore == null
      ? [[role, target.industry === 'general' ? 70 : 55], [industry,20], [seniority,target.industry === 'general' ? 30 : 25]]
      : [[role,35],[industry,15],[seniority,15],[jdScore,35]]
    const active = parts.filter(([score]) => score != null)
    const totalWeight = active.reduce((sum, item) => sum + item[1], 0) || 1
    const score = clamp(active.reduce((sum, item) => sum + item[0] * item[1], 0) / totalWeight)
    return { score, role, industry, seniority, jd:jdScore, roleKey }
  }

  const labelScore = (score) => score >= 85 ? 'Strong' : score >= 70 ? 'Good' : score >= 55 ? 'Needs review' : 'High risk'

  const openEditor = (selector) => {
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

  const chooseAtsTemplate = () => {
    $('#atsShell').hidden = true
    document.body.classList.remove('ats-open')
    setTimeout(() => {
      const card = $$('.template-card').find((item) => /ATS Precision/i.test(item.textContent || ''))
        || $$('.template-card').find((item) => /ATS Clean/i.test(item.textContent || ''))
      card?.click()
      card?.scrollIntoView({ behavior:'smooth', block:'center' })
    }, 80)
  }

  const decorateActions = () => {
    $$('#atsFieldList .ats-field-row').forEach((row) => {
      if (row.querySelector('.ats-pro-action')) return
      const label = row.querySelector('strong')?.textContent?.trim()
      const selector = FIELD_MAP[label]
      if (selector) row.insertAdjacentHTML('beforeend','<button class="ats-pro-action" type="button" data-ats-pro-edit="' + selector + '">Edit</button>')
    })
    $$('#atsCheckList .ats-check').forEach((row) => {
      if (row.querySelector('.ats-pro-action')) return
      const label = row.querySelector('strong')?.textContent || ''
      if (/Reading order|Tables/.test(label)) row.insertAdjacentHTML('beforeend','<button class="ats-pro-action" type="button" data-ats-pro-template>Use ATS template</button>')
      else if (/Dates/.test(label)) row.insertAdjacentHTML('beforeend','<button class="ats-pro-action" type="button" data-ats-pro-edit="#experienceEditor">Edit</button>')
    })
    $$('#atsContentNotes article').forEach((row) => {
      if (row.querySelector('.ats-pro-action')) return
      const text = row.textContent.toLowerCase()
      const selector = text.includes('skill') ? '#skills'
        : text.includes('experience') || text.includes('action') || text.includes('measurable') ? '#experienceEditor'
        : text.includes('summary') ? '#summary' : ''
      if (selector) row.insertAdjacentHTML('beforeend','<button class="ats-pro-action" type="button" data-ats-pro-edit="' + selector + '">Fix</button>')
    })
  }

  const inject = () => {
    const panel = $('.ats-panel')
    if (!panel || $('#atsProTarget')) return

    $('.ats-score-hero')?.classList.add('ats-pro-legacy-score')
    const scanTab = $('.ats-tabs [data-ats-tab="scan"]')
    const jobTab = $('.ats-tabs [data-ats-tab="job"]')
    if (scanTab) scanTab.textContent = 'Overview'
    if (jobTab) jobTab.textContent = 'Target fit'

    panel.querySelector('.ats-head').insertAdjacentHTML('afterend',
      '<section class="ats-pro-scoreboard">' +
        '<article><span>ATS Readiness</span><strong id="atsProReadiness">—</strong><b id="atsProReadinessLabel">Scan ready</b><small>Machine readability · fixed criteria</small></article>' +
        '<article><span>Target Fit</span><strong id="atsProFit">—</strong><b id="atsProFitLabel">Target profile</b><small>Role + industry + seniority + JD</small></article>' +
      '</section>'
    )

    panel.querySelector('.ats-tabs').insertAdjacentHTML('beforebegin',
      '<section id="atsProTarget" class="ats-pro-target">' +
        '<div><span>Target profile</span><strong>What are you applying for?</strong></div>' +
        '<div class="ats-pro-target-grid">' +
          '<label>Role<select id="atsProRole">' + optionsHtml(ROLES,target.role) + '</select></label>' +
          '<label>Industry<select id="atsProIndustry">' + optionsHtml(INDUSTRIES,target.industry) + '</select></label>' +
          '<label>Seniority<select id="atsProSeniority">' + optionsHtml(SENIORITY,target.seniority) + '</select></label>' +
        '</div>' +
        '<p id="atsProTargetHint"></p>' +
      '</section>'
    )

    $('[data-ats-pane="scan"]')?.insertAdjacentHTML('afterbegin',
      '<section class="ats-pro-method">' +
        '<div class="ats-section-title"><div><span>Scoring model</span><strong>Transparent ATS Readiness</strong></div><small>100 points</small></div>' +
        '<div id="atsProMetrics"></div>' +
        '<details><summary>How the score is calculated</summary><p>Text extraction 30% · Critical fields 25% · Structure 15% · Format hygiene 10% · Evidence quality 20%. Role and industry never change ATS Readiness.</p></details>' +
      '</section>'
    )

    $('[data-ats-pane="job"]')?.insertAdjacentHTML('afterbegin',
      '<section class="ats-pro-fit-section">' +
        '<div class="ats-section-title"><div><span>Profile fit</span><strong>Role, industry & seniority</strong></div><small>Editable target</small></div>' +
        '<div id="atsProFitBreakdown"></div>' +
      '</section>'
    )

    $('#atsProRole').addEventListener('change', syncTarget)
    $('#atsProIndustry').addEventListener('change', syncTarget)
    $('#atsProSeniority').addEventListener('change', syncTarget)
    $('#atsJobDescription')?.addEventListener('input', () => {
      target.jd = $('#atsJobDescription').value
      saveTarget()
      render()
    })

    panel.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-ats-pro-edit]')
      if (edit) {
        openEditor(edit.dataset.atsProEdit)
        return
      }
      if (event.target.closest('[data-ats-pro-template]')) chooseAtsTemplate()
    })

    ;['#atsFieldList','#atsCheckList','#atsContentNotes'].map($).filter(Boolean).forEach((node) => {
      new MutationObserver(decorateActions).observe(node,{ childList:true, subtree:true })
    })
    decorateActions()
  }

  function syncTarget() {
    target.role = $('#atsProRole').value
    target.industry = $('#atsProIndustry').value
    target.seniority = $('#atsProSeniority').value
    saveTarget()
    render()
  }

  function render() {
    if (!$('#atsProTarget')) return
    const r = readiness()
    const f = fit()
    $('#atsProReadiness').textContent = r.score
    $('#atsProReadinessLabel').textContent = labelScore(r.score)
    $('#atsProFit').textContent = f.score
    $('#atsProFitLabel').textContent = labelScore(f.score)
    if ($('#atsScoreBadge')) $('#atsScoreBadge').textContent = r.score
    $('#atsProTargetHint').textContent = ROLES[f.roleKey][0] + ' · ' + INDUSTRIES[target.industry][0] + ' · ' + SENIORITY[target.seniority][0]

    $('#atsProMetrics').innerHTML = r.metrics.map((item) => {
      return '<article>' +
        '<div><strong>' + item[0] + '</strong><span>' + item[2] + '%</span></div>' +
        '<div class="ats-pro-meter"><i style="width:' + item[1] + '%"></i></div>' +
        '<b>' + clamp(item[1]) + '</b>' +
      '</article>'
    }).join('')

    const rows = [
      ['Role match',f.role,ROLES[f.roleKey][0]],
      ['Industry signals',f.industry,INDUSTRIES[target.industry][0]],
      ['Seniority signals',f.seniority,SENIORITY[target.seniority][0]]
    ]
    $('#atsProFitBreakdown').innerHTML = rows.map((item) => {
      const score = item[1]
      return '<article>' +
        '<div><strong>' + item[0] + '</strong><small>' + item[2] + '</small></div>' +
        '<div class="ats-pro-meter"><i style="width:' + (score == null ? 0 : score) + '%"></i></div>' +
        '<b>' + (score == null ? '—' : score) + '</b>' +
      '</article>'
    }).join('')
    decorateActions()
  }

  const boot = () => {
    inject()
    render()
    $('#atsScanButton')?.addEventListener('click', () => setTimeout(() => { inject(); render() }, 0))
    $('#atsRescan')?.addEventListener('click', () => setTimeout(render, 0))
    const paper = $('#paper')
    if (paper) new MutationObserver(() => setTimeout(render,0)).observe(paper,{ childList:true, subtree:true, characterData:true, attributes:true })
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot)
  else boot()
})()

/* ATS_PDF_VERIFY_V1_FIXED */
(() => {
  'use strict'

  const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.min.mjs'
  const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.worker.min.mjs'
  const PROFILE_KEY = 'cv-studio-static-v2'
  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)))
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[char]))
  const normalize = (value) => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./@%-]+/gu,' ')
    .replace(/\s+/g,' ')
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
    if (Array.isArray(value)) return value.flatMap((item) => flatten(item,depth+1))
    if (typeof value === 'object') return Object.entries(value)
      .filter(([key]) => !/image|avatar|id|enabled/i.test(key))
      .flatMap(([,item]) => flatten(item,depth+1))
    return []
  }

  const matchText = (haystack, value) => {
    const needle = normalize(value)
    if (!needle) return true
    if (haystack.includes(needle)) return true
    const words = needle.split(' ').filter(Boolean)
    if (words.length >= 9) return haystack.includes(words.slice(0,8).join(' '))
    if (words.length >= 5) return haystack.includes(words.slice(0,5).join(' '))
    return false
  }

  const usefulParts = (value) => [...new Set(flatten(value).map((item) => item.trim()).filter((item) => item.length >= 2 && item.length <= 420))].slice(0,90)

  const groupCoverage = (pdfNormalized,value) => {
    const parts = usefulParts(value)
    if (!parts.length) return { present:false, matched:0, total:0, score:null }
    const matched = parts.filter((part) => matchText(pdfNormalized,part)).length
    return { present:true, matched, total:parts.length, score:matched/parts.length }
  }

  const sourceLines = () => {
    const text = String($('#paper')?.innerText || $('#paper')?.textContent || '')
      .replace(/\u00a0/g,' ')
      .replace(/[ \t]+\n/g,'\n')
      .replace(/\n{3,}/g,'\n\n')
      .trim()
    const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length >= 3)
    return { text, lines:[...new Set(lines)].slice(0,180) }
  }

  const orderConsistency = (lines,pdfNormalized) => {
    const positions = []
    lines.forEach((line) => {
      const needle = normalize(line)
      if (!needle) return
      let pos = pdfNormalized.indexOf(needle)
      if (pos < 0) {
        const words = needle.split(' ').filter(Boolean)
        if (words.length >= 5) pos = pdfNormalized.indexOf(words.slice(0,5).join(' '))
      }
      if (pos >= 0) positions.push(pos)
    })
    if (positions.length < 3) return { score:60, matched:positions.length, inversions:0 }
    let good=0
    let inversions=0
    for(let i=1;i<positions.length;i+=1){
      if(positions[i]>=positions[i-1]) good+=1
      else inversions+=1
    }
    return { score:clamp(good/(positions.length-1)*100), matched:positions.length, inversions }
  }

  let modulePromise = null
  const loadPdfModule = async () => {
    if (window.__atsPdfTextExtractor) return null
    if (!modulePromise) {
      modulePromise = import(PDFJS_URL).then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL
        return pdfjsLib
      })
    }
    return modulePromise
  }

  const extractPdfText = async (file) => {
    if (window.__atsPdfTextExtractor) return window.__atsPdfTextExtractor(file)
    const pdfjsLib = await loadPdfModule()
    const bytes = new Uint8Array(await file.arrayBuffer())
    const task = pdfjsLib.getDocument({ data:bytes })
    const documentPdf = await task.promise
    const pages = []
    for(let pageNumber=1;pageNumber<=documentPdf.numPages;pageNumber+=1){
      const page = await documentPdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const rows=[]
      let current=[]
      content.items.forEach((item) => {
        const value=String(item.str || '').trim()
        if(value) current.push(value)
        if(item.hasEOL && current.length){
          rows.push(current.join(' '))
          current=[]
        }
      })
      if(current.length) rows.push(current.join(' '))
      pages.push(rows.join('\n'))
    }
    return { text:pages.join('\n\n'), pages:documentPdf.numPages }
  }

  const fieldGroups = (p) => [
    ['Name',p.name,'#name'],
    ['Role / title',p.role,'#role'],
    ['Headline',p.headline,'#headline'],
    ['Email',p.email,'#email'],
    ['Phone',p.phone,'#phone'],
    ['Location',p.location,'#location'],
    ['Website',p.website,'#website'],
    ['Summary',p.summary,'#summary'],
    ['Skills',p.skills,'#skills'],
    ['Experience',p.experience,'#experienceEditor'],
    ['Projects',p.projects,'#projectEditor'],
    ['Languages',p.languages,'#languages']
  ]

  const analyzePdf = (pdfText,pages) => {
    const p=readProfile()
    const source=sourceLines()
    const pdfNormalized=normalize(pdfText)
    const groups=fieldGroups(p).map((item) => ({ label:item[0], selector:item[2], coverage:groupCoverage(pdfNormalized,item[1]) }))
    const matches=source.lines.map((line) => matchText(pdfNormalized,line) ? 1 : 0)
    const retained=matches.length ? clamp(matches.reduce((a,b)=>a+b,0)/matches.length*100) : 0
    const criticalNames=new Set(['Name','Role / title','Email','Skills','Experience'])
    const critical=groups.filter((group)=>criticalNames.has(group.label) && group.coverage.present)
    const criticalScore=critical.length ? clamp(critical.reduce((sum,group)=>sum+group.coverage.score,0)/critical.length*100) : 0
    const order=orderConsistency(source.lines,pdfNormalized)
    const textLayer=pdfNormalized.length>=240 ? 100 : pdfNormalized.length>=80 ? 60 : pdfNormalized.length ? 30 : 0
    const score=clamp(retained*.45 + criticalScore*.30 + order.score*.15 + textLayer*.10)
    return {
      score,
      retained,
      criticalScore,
      order,
      textLayer,
      groups,
      pdfText,
      pages,
      pdfWordCount:String(pdfText).split(/\s+/).filter(Boolean).length
    }
  }

  const stateLabel = (coverage) => {
    if(!coverage.present) return { key:'empty', label:'No source data' }
    if(coverage.score>=.85) return { key:'retained', label:'Retained' }
    if(coverage.score>0) return { key:'partial', label:'Partial' }
    return { key:'missing', label:'Missing' }
  }

  const verdict = (score) => score>=90 ? 'Export preserved well'
    : score>=75 ? 'Review a few differences'
    : score>=55 ? 'PDF needs attention'
    : 'High parsing risk'

  const openSourceField = (selector) => {
    if(!selector) return
    $('#atsShell').hidden=true
    document.body.classList.remove('ats-open')
    setTimeout(() => {
      if($('#editor')?.classList.contains('collapsed')) $('#toggleEditor')?.click()
      $('.tab[data-tab="content"]')?.click()
      const node=$(selector)
      node?.scrollIntoView({ behavior:'smooth', block:'center' })
      const focus=node?.matches('input,textarea,select') ? node : node?.querySelector('input,textarea,select,button')
      focus?.focus({ preventScroll:true })
    },80)
  }

  const chooseAtsTemplate = () => {
    $('#atsShell').hidden=true
    document.body.classList.remove('ats-open')
    setTimeout(() => {
      const card=$$('.template-card').find((item)=>/ATS Precision/i.test(item.textContent||''))
        || $$('.template-card').find((item)=>/ATS Clean/i.test(item.textContent||''))
      card?.click()
      card?.scrollIntoView({ behavior:'smooth', block:'center' })
    },80)
  }

  const renderResult = (report,filename) => {
    $('#atsPdfResult').hidden=false
    $('#atsPdfScore').textContent=report.score
    $('#atsPdfVerdict').textContent=verdict(report.score)
    $('#atsPdfRetained').textContent=report.retained+'%'
    $('#atsPdfCritical').textContent=report.criticalScore+'%'
    $('#atsPdfOrder').textContent=report.order.score+'%'
    $('#atsPdfMeta').textContent=report.pages+' page'+(report.pages===1?'':'s')+' · '+report.pdfWordCount+' PDF words'
    $('#atsPdfRawText').textContent=report.pdfText || 'No selectable PDF text found.'
    $('#atsPdfOrderTitle').textContent=report.order.inversions ? 'Possible sequence changes' : 'Sequence looks consistent'
    $('#atsPdfOrderMeta').textContent=report.order.matched+' comparable text blocks'
    $('#atsPdfOrderAdvice').innerHTML=report.order.inversions
      ? '<strong>Review reading order</strong><p>'+report.order.inversions+' sequence break(s) detected. Multi-column layouts are the first thing to review.</p><button type="button" data-pdf-use-ats>Use ATS template</button>'
      : '<strong>Order preserved</strong><p>Matched blocks generally appear in the same sequence as the live CV.</p>'

    $('#atsPdfFieldList').innerHTML=report.groups.map((group) => {
      const state=stateLabel(group.coverage)
      const detail=group.coverage.present
        ? group.coverage.matched+'/'+group.coverage.total+' source value(s) found in PDF'
        : 'No source data to compare'
      const action=group.selector && state.key!=='retained' && state.key!=='empty'
        ? '<button type="button" data-pdf-edit="'+esc(group.selector)+'">Fix source</button>'
        : ''
      return '<article data-pdf-state="'+state.key+'">' +
        '<span class="ats-pdf-state-dot"></span>' +
        '<div><strong>'+esc(group.label)+'</strong><small>'+esc(detail)+'</small></div>' +
        '<b>'+esc(state.label)+'</b>' +
        action +
      '</article>'
    }).join('')

    $('#atsPdfFieldList').onclick=(event) => {
      const edit=event.target.closest('[data-pdf-edit]')
      if(edit) openSourceField(edit.dataset.pdfEdit)
    }
    $('[data-pdf-use-ats]')?.addEventListener('click',chooseAtsTemplate)

    const drop=$('#atsPdfDrop')
    drop.querySelector('strong').textContent=filename
    drop.querySelector('small').textContent='Verified · drop another PDF to compare again'
    drop.classList.add('verified')
  }

  const verify = async (file) => {
    const error=$('#atsPdfError')
    const loading=$('#atsPdfLoading')
    error.hidden=true
    if(!file || (!/pdf/i.test(file.type||'') && !/\.pdf$/i.test(file.name||''))){
      error.textContent='Please choose a PDF file.'
      error.hidden=false
      return
    }
    loading.hidden=false
    $('#atsPdfResult').hidden=true
    try{
      const extracted=await extractPdfText(file)
      renderResult(analyzePdf(extracted.text||'',Number(extracted.pages||1)),file.name||'Exported CV.pdf')
    }catch(cause){
      console.error('ATS PDF verification failed.',cause)
      error.innerHTML='<strong>Unable to read this PDF.</strong><span>Try the exported file again. Image-only/scanned PDFs may not contain a readable text layer.</span>'
      error.hidden=false
    }finally{
      loading.hidden=true
    }
  }

  const inject = () => {
    const panel=$('.ats-panel')
    const tabs=$('.ats-tabs')
    if(!panel || !tabs || $('#atsPdfVerifyTab')) return

    const tab=document.createElement('button')
    tab.type='button'
    tab.id='atsPdfVerifyTab'
    tab.dataset.atsTab='pdf'
    tab.textContent='PDF verify'
    tabs.appendChild(tab)

    const pane=document.createElement('section')
    pane.className='ats-pane'
    pane.dataset.atsPane='pdf'
    pane.innerHTML=[
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
        '<details class="ats-pdf-raw"><summary>View extracted PDF text</summary><pre id="atsPdfRawText"></pre></details>',
      '</div>',
      '<div class="ats-pdf-actions">',
        '<button type="button" id="atsPdfExportAgain" class="button ghost">Export PDF again</button>',
        '<button type="button" id="atsPdfChooseAgain" class="button primary">Choose PDF</button>',
      '</div>',
      '<p class="ats-help">PDF verification checks the real selectable text layer. Scanned/image-only PDFs can score poorly even if they look visually correct.</p>',
    ].join('')
    panel.insertBefore(pane,panel.querySelector('.ats-footer'))

    tab.addEventListener('click',() => {
      $$('[data-ats-tab]').forEach((item)=>item.classList.toggle('active',item===tab))
      $$('[data-ats-pane]').forEach((item)=>item.classList.toggle('active',item.dataset.atsPane==='pdf'))
    })

    const input=$('#atsPdfInput')
    const drop=$('#atsPdfDrop')
    drop.addEventListener('dragover',(event)=>{event.preventDefault();drop.classList.add('dragging')})
    drop.addEventListener('dragleave',()=>drop.classList.remove('dragging'))
    drop.addEventListener('drop',(event)=>{
      event.preventDefault()
      drop.classList.remove('dragging')
      const file=event.dataTransfer?.files?.[0]
      if(file) verify(file)
    })
    input.addEventListener('change',()=>{
      const file=input.files?.[0]
      if(file) verify(file)
    })
    $('#atsPdfChooseAgain').addEventListener('click',()=>input.click())
    $('#atsPdfExportAgain').addEventListener('click',()=>$('#print')?.click())

    window.addEventListener('afterprint',()=>{
      const button=$('#atsScanButton')
      if(!button) return
      button.dataset.pdfReady='true'
      button.classList.add('ats-pdf-ready')
      button.title='ATS Scan · verify the PDF you just exported'
    })

    $('#atsScanButton')?.addEventListener('click',()=>{
      const button=$('#atsScanButton')
      if(button?.dataset.pdfReady==='true'){
        delete button.dataset.pdfReady
        button.classList.remove('ats-pdf-ready')
        setTimeout(()=>$('#atsPdfVerifyTab')?.click(),0)
      }
    })
  }

  const boot=()=>inject()
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot)
  else boot()
})()


/* ATS_VISUAL_HEATMAP_V1 */
(() => {
  'use strict'

  const PROFILE_KEY = 'cv-studio-static-v2'
  const $ = (selector, root = document) => root.querySelector(selector)
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
  const normalize = (value) => String(value == null ? '' : value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/\s+/g,' ')
    .trim()

  let enabled = false
  let mode = 'web'

  const readProfile = () => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {} }
    catch { return {} }
  }

  const clearHeatmap = () => {
    $$('#paper .ats-heat').forEach((node) => {
      node.classList.remove('ats-heat','ats-heat-good','ats-heat-partial','ats-heat-bad')
      node.removeAttribute('data-ats-heat-label')
      node.removeAttribute('data-ats-heat-field')
    })
    $('#paper')?.classList.remove('ats-heatmap-active')
  }

  const statusMapFromWeb = () => {
    const map = new Map()
    $$('#atsFieldList .ats-field-row').forEach((row) => {
      const label = row.querySelector('strong')?.textContent?.trim()
      const state = row.dataset.atsStatus || 'empty'
      if (label) map.set(label, state === 'readable' ? 'good' : state === 'partial' ? 'partial' : state === 'missing' ? 'bad' : 'empty')
    })
    return map
  }

  const statusMapFromPdf = () => {
    const map = new Map()
    $$('#atsPdfFieldList article').forEach((row) => {
      const label = row.querySelector('strong')?.textContent?.trim()
      const state = row.dataset.pdfState || 'empty'
      if (label) map.set(label, state === 'retained' ? 'good' : state === 'partial' ? 'partial' : state === 'missing' ? 'bad' : 'empty')
    })
    return map
  }

  const editableTargets = () => ({
    'Summary': $$('[data-edit-focus="#summary"]','#paper' in window ? document : document),
    'Skills': $$('[data-edit-focus="#skills"]', $('#paper') || document),
    'Experience': $$('[data-edit-focus="#experienceEditor"]', $('#paper') || document),
    'Projects': $$('[data-edit-focus="#projectEditor"]', $('#paper') || document),
    'Languages': $$('[data-edit-focus="#languages"]', $('#paper') || document)
  })

  const findTextNode = (value) => {
    const paper = $('#paper')
    const needle = normalize(value)
    if (!paper || !needle) return null
    const candidates = $$('h1,h2,h3,p,span,strong,a,time,div',paper)
      .filter((node) => normalize(node.textContent).includes(needle))
      .filter((node) => node.children.length <= 6)
      .sort((a,b) => {
        const aLen = normalize(a.textContent).length
        const bLen = normalize(b.textContent).length
        return aLen - bLen
      })
    return candidates[0] || null
  }

  const addNode = (node, field, state) => {
    if (!node || state === 'empty') return
    const target = node.closest('[data-edit-pane]') || node
    target.classList.add('ats-heat','ats-heat-' + state)
    target.dataset.atsHeatField = field
    target.dataset.atsHeatLabel = field + ' · ' + (state === 'good' ? (mode === 'pdf' ? 'Retained' : 'Readable') : state === 'partial' ? 'Partial' : 'Missing')
  }

  const applyHeatmap = () => {
    clearHeatmap()
    if (!enabled) return
    const paper = $('#paper')
    if (!paper) return
    paper.classList.add('ats-heatmap-active')
    const statuses = mode === 'pdf' ? statusMapFromPdf() : statusMapFromWeb()
    const profile = readProfile()

    const selectorMap = {
      'Summary':'#summary',
      'Skills':'#skills',
      'Experience':'#experienceEditor',
      'Projects':'#projectEditor',
      'Languages':'#languages'
    }

    Object.entries(selectorMap).forEach(([field,selector]) => {
      const state = statuses.get(field)
      if (!state || state === 'empty') return
      const nodes = $$('[data-edit-focus="' + selector + '"]',paper)
      nodes.forEach((node) => addNode(node,field,state))
    })

    const directFields = [
      ['Name',profile.name],
      ['Role / title',profile.role],
      ['Headline',profile.headline],
      ['Email',profile.email],
      ['Phone',profile.phone],
      ['Location',profile.location],
      ['Website',profile.website]
    ]
    directFields.forEach(([field,value]) => {
      const state=statuses.get(field)
      if(!state || state==='empty' || !String(value||'').trim()) return
      addNode(findTextNode(value),field,state)
    })

    const legend=$('#atsHeatmapLegend')
    if(legend){
      legend.hidden=false
      legend.dataset.mode=mode
      $('#atsHeatModeLabel').textContent=mode==='pdf'?'PDF verification':'Web scan'
    }
  }

  const setEnabled = (next) => {
    enabled=next
    const button=$('#atsHeatmapToggle')
    if(button){
      button.setAttribute('aria-pressed',String(enabled))
      button.classList.toggle('active',enabled)
      button.textContent=enabled?'Hide heatmap':'Show heatmap'
    }
    if(!enabled) $('#atsHeatmapLegend').hidden=true
    applyHeatmap()
  }

  const setMode = (next) => {
    if(next==='pdf' && !$('#atsPdfResult')?.hidden===false){
      // no-op; handled below with explicit availability check
    }
    mode=next
    $$('#atsHeatmapLegend [data-heat-mode]').forEach((button)=>button.classList.toggle('active',button.dataset.heatMode===mode))
    applyHeatmap()
  }

  const inject = () => {
    const panel=$('.ats-panel')
    const paperStage=$('.paper-stage')
    if(!panel || !paperStage || $('#atsHeatmapToggle')) return

    const scoreboards=$('.ats-pro-scoreboard') || $('.ats-score-hero')
    scoreboards?.insertAdjacentHTML('afterend',
      '<section class="ats-heat-control">' +
        '<div><span>Visual audit</span><strong>ATS Heatmap</strong><small>Highlight what the parser can and cannot read.</small></div>' +
        '<button type="button" id="atsHeatmapToggle" aria-pressed="false">Show heatmap</button>' +
      '</section>'
    )

    const legend=document.createElement('div')
    legend.id='atsHeatmapLegend'
    legend.className='ats-heat-legend'
    legend.hidden=true
    legend.innerHTML=
      '<div class="ats-heat-legend-head"><div><span>ATS Heatmap</span><strong id="atsHeatModeLabel">Web scan</strong></div><button id="atsHeatmapClose" type="button" aria-label="Hide ATS heatmap">×</button></div>' +
      '<div class="ats-heat-mode-switch"><button type="button" class="active" data-heat-mode="web">Web</button><button type="button" data-heat-mode="pdf">PDF</button></div>' +
      '<div class="ats-heat-key"><span><i class="good"></i>Readable</span><span><i class="partial"></i>Partial</span><span><i class="bad"></i>Missing</span></div>'
    paperStage.insertBefore(legend,paperStage.firstChild)

    $('#atsHeatmapToggle').addEventListener('click',()=>setEnabled(!enabled))
    $('#atsHeatmapClose').addEventListener('click',()=>setEnabled(false))
    $$('#atsHeatmapLegend [data-heat-mode]').forEach((button)=>button.addEventListener('click',()=>{
      if(button.dataset.heatMode==='pdf' && $('#atsPdfResult')?.hidden!==false){
        $('#atsHeatmapLegend').classList.add('needs-pdf')
        setTimeout(()=>$('#atsHeatmapLegend')?.classList.remove('needs-pdf'),900)
        return
      }
      setMode(button.dataset.heatMode)
    }))

    const webList=$('#atsFieldList')
    const pdfList=$('#atsPdfFieldList')
    if(webList) new MutationObserver(()=>{ if(enabled && mode==='web') setTimeout(applyHeatmap,0) }).observe(webList,{childList:true,subtree:true,attributes:true})
    if(pdfList) new MutationObserver(()=>{ if(enabled && mode==='pdf') setTimeout(applyHeatmap,0) }).observe(pdfList,{childList:true,subtree:true,attributes:true})

    const paper=$('#paper')
    if(paper) new MutationObserver(()=>{ if(enabled) setTimeout(applyHeatmap,40) }).observe(paper,{childList:true,subtree:true,characterData:true})

    $('#atsPdfVerifyTab')?.addEventListener('click',()=>{ if(enabled && $('#atsPdfResult')?.hidden===false) setMode('pdf') })
    $('.ats-tabs [data-ats-tab="scan"]')?.addEventListener('click',()=>{ if(enabled) setMode('web') })

    paperStage.addEventListener('click',(event)=>{
      if(!enabled) return
      const heat=event.target.closest('.ats-heat')
      if(!heat) return
      const focus=heat.getAttribute('data-edit-focus')
      if(focus){
        $('#atsShell').hidden=true
        document.body.classList.remove('ats-open')
        setTimeout(()=>{
          if($('#editor')?.classList.contains('collapsed')) $('#toggleEditor')?.click()
          $('.tab[data-tab="content"]')?.click()
          const node=$(focus)
          node?.scrollIntoView({behavior:'smooth',block:'center'})
          const target=node?.matches('input,textarea,select')?node:node?.querySelector('input,textarea,select,button')
          target?.focus({preventScroll:true})
        },80)
      }
    })
  }

  const boot=()=>inject()
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot)
  else boot()
})()


/* ATS_AUTO_FIX_V1 */
(() => {
  'use strict'

  const PROFILE_KEY='cv-studio-static-v2'
  const TARGET_KEY='cv-studio-ats-target-v2'
  const $=(selector,root=document)=>root.querySelector(selector)
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)]
  const esc=(value)=>String(value==null?'':value).replace(/[&<>"']/g,(char)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]))
  const normalize=(value)=>String(value==null?'':value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./@%-]+/gu,' ')
    .replace(/\s+/g,' ')
    .trim()

  const ROLE_TERMS={
    uiux:['Product Design','User Research','Prototyping','Design Systems','Interaction Design','Usability Testing','Figma','Accessibility','Information Architecture','User Flows'],
    designEngineer:['Frontend','TypeScript','JavaScript','React','Vue','Design Systems','Component Library','Accessibility','CSS','HTML','Performance'],
    product:['Product Strategy','Roadmap','Prioritization','Product Discovery','Metrics','Experimentation','Stakeholder Management','Requirements','User Research'],
    sales:['Business Development','Revenue','Pipeline','Sales','Account Management','Negotiation','Partnership','Go-to-Market','CRM','Quota'],
    engineering:['JavaScript','TypeScript','React','Node','API','Testing','Git','CI/CD','Architecture','Performance','Cloud'],
    data:['SQL','Dashboard','Analytics','Business Intelligence','Python','Data Visualization','Metrics','Reporting'],
    marketing:['Campaign','Brand','SEO','Content','Acquisition','Conversion','Analytics','CRM','Growth'],
    hr:['Recruitment','Talent Acquisition','Employee Engagement','HR Operations','Performance Management','Onboarding','Learning and Development'],
    finance:['Financial Analysis','Budgeting','Forecasting','Reporting','Investment','Risk','Excel','Financial Modeling','Compliance'],
    research:['Research','Publication','Methodology','Analysis','Teaching','Grant','Peer Review','Study'],
    general:['Leadership','Communication','Project Management','Stakeholder Management','Problem Solving','Collaboration','Delivery']
  }

  const TEMPLATE_ROLE={
    'Soft Portfolio':'uiux','Bento Resume':'uiux','Creator Cards':'uiux','Code Aware':'designEngineer',
    'Mono Grid':'engineering','ATS Precision':'engineering','Product Operator':'product','Revenue Driver':'sales',
    'Insight Grid':'data','Brand Motion':'marketing','People First':'hr','Finance Ledger':'finance',
    'Research Scholar':'research','Studio Director':'marketing'
  }

  const WEAK_STARTS=[
    [/^responsible for\s+/i,'Supported '],
    [/^worked on\s+/i,'Contributed to '],
    [/^helped (?:to )?/i,'Supported '],
    [/^assisted (?:with|in)\s+/i,'Supported '],
    [/^involved in\s+/i,'Contributed to ']
  ]

  let undoStack=[]
  let suggestions=[]

  const readJson=(key,fallback)=>{
    try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}
  }
  const profile=()=>readJson(PROFILE_KEY,{})
  const target=()=>Object.assign({role:'auto',industry:'general',seniority:'senior',jd:''},readJson(TARGET_KEY,{}))
  const activeTemplate=()=>String($('#activeTemplateLabel')?.textContent||'').replace(/\s*·\s*A4.*$/,'').trim()
  const roleKey=()=>{
    const t=target()
    return t.role==='auto'?(TEMPLATE_ROLE[activeTemplate()]||'general'):t.role
  }
  const paperText=()=>String($('#paper')?.innerText||'').trim()
  const unique=(values)=>[...new Set(values.filter(Boolean))]
  const sentence=(value)=>{
    const text=String(value||'').trim().replace(/\s+/g,' ')
    if(!text)return ''
    return text.charAt(0).toUpperCase()+text.slice(1).replace(/[.;,\s]+$/,'')+'.'
  }

  const buildSummaryFix=(p)=>{
    const current=String(p.summary||'').trim()
    const role=String(p.role||'').trim()
    const skills=(p.skills||[]).filter(Boolean).slice(0,4)
    if(!role && !skills.length)return null

    let proposed=current
    if(!current){
      const skillText=skills.length?' with experience across '+skills.join(', '):''
      proposed=sentence((role||'Professional')+skillText)
    }else{
      const currentNorm=normalize(current)
      const missingSkills=skills.filter((skill)=>!currentNorm.includes(normalize(skill))).slice(0,2)
      if(missingSkills.length){
        proposed=sentence(current)+' '+sentence('Core strengths include '+missingSkills.join(' and '))
      }
    }
    if(!proposed||normalize(proposed)===normalize(current))return null
    return {
      id:'summary',
      type:'safe',
      title:'Strengthen professional summary',
      reason:current?'Reuse skills already present in this CV.':'Build a factual summary from the current role and entered skills.',
      current:current||'No summary',
      proposed,
      apply:()=>applyInput('#summary',proposed)
    }
  }

  const buildSkillsFix=(p)=>{
    const current=(p.skills||[]).filter(Boolean)
    const currentNorm=current.map(normalize)
    const text=normalize(paperText())
    const candidates=ROLE_TERMS[roleKey()]||ROLE_TERMS.general
    const proven=candidates.filter((term)=>{
      const key=normalize(term)
      return !currentNorm.includes(key) && text.includes(key)
    }).slice(0,5)
    if(!proven.length)return null
    const proposed=unique(current.concat(proven))
    return {
      id:'skills',
      type:'safe',
      title:'Sync proven keywords into Skills',
      reason:'These terms already appear elsewhere in the CV, so this does not add a new claim.',
      current:current.join(' · ')||'No skills',
      proposed:proposed.join(' · '),
      apply:()=>applyInput('#skills',proposed.join('\n'))
    }
  }

  const buildExperienceFixes=(p)=>{
    const fixes=[]
    ;(p.experience||[]).forEach((job,jobIndex)=>{
      ;(job.bullets||[]).forEach((bullet,bulletIndex)=>{
        const original=String(bullet||'').trim()
        if(!original)return
        const match=WEAK_STARTS.find(([pattern])=>pattern.test(original))
        if(!match)return
        const proposed=sentence(original.replace(match[0],match[1]))
        if(normalize(proposed)===normalize(original))return
        fixes.push({
          id:'experience-'+jobIndex+'-'+bulletIndex,
          type:'safe',
          title:'Use a clearer action-led bullet',
          reason:'Rephrases a weak opening while keeping the existing fact and scope.',
          context:(job.role||'Experience')+(job.company?' · '+job.company:''),
          current:original,
          proposed,
          apply:()=>applyExperienceBullet(jobIndex,bulletIndex,proposed)
        })
      })
    })
    return fixes.slice(0,3)
  }

  const extractJdTerms=()=>{
    const jd=String($('#atsJobDescription')?.value||target().jd||'')
    if(!jd.trim())return []
    const normalizedJd=normalize(jd)
    const stop=new Set(['with','from','that','this','your','have','will','role','team','work','years','experience','skills','required','preferred','responsibilities','candidate','using','about','into','and','the','for','you','are','our','job'])
    const knownPhrases=unique(
      Object.values(ROLE_TERMS)
        .flat()
        .map((term)=>normalize(term))
        .filter((term)=>term.includes(' ')&&normalizedJd.includes(term))
    )
    const phraseWords=new Set(knownPhrases.flatMap((phrase)=>phrase.split(' ')))
    const words=normalizedJd.split(' ').filter((word)=>word.length>=4&&!stop.has(word)&&!/^\d+$/.test(word)&&!phraseWords.has(word))
    const counts=new Map()
    words.forEach((word)=>counts.set(word,(counts.get(word)||0)+1))
    const singles=[...counts.entries()].sort((a,b)=>b[1]-a[1]).map((item)=>item[0])
    return unique(knownPhrases.concat(singles)).slice(0,18)
  }

  const buildReviewKeywords=(p)=>{
    const text=normalize(paperText())
    const roleTerms=(ROLE_TERMS[roleKey()]||ROLE_TERMS.general).map((term)=>normalize(term))
    const jdTerms=extractJdTerms()
    const missingRaw=unique(roleTerms.concat(jdTerms)).filter((term)=>!text.includes(term))
    const missingPhrases=missingRaw.filter((term)=>term.includes(' '))
    const missing=missingRaw
      .filter((term)=>term.includes(' ') || !missingPhrases.some((phrase)=>phrase.split(' ').includes(term)))
      .slice(0,10)
    if(!missing.length)return null
    return {
      id:'review-keywords',
      type:'review',
      title:'Missing target keywords',
      reason:'Only add these when they accurately describe your real experience or skills.',
      current:'Not found in current CV',
      proposed:missing.join(' · '),
      keywords:missing
    }
  }

  const buildSuggestions=()=>{
    const p=profile()
    const next=[]
    const summary=buildSummaryFix(p)
    const skills=buildSkillsFix(p)
    if(summary)next.push(summary)
    if(skills)next.push(skills)
    next.push(...buildExperienceFixes(p))
    const review=buildReviewKeywords(p)
    if(review)next.push(review)
    suggestions=next
    renderSuggestions()
  }

  const snapshotForSelector=(selector)=>{
    const node=$(selector)
    if(!node)return null
    return {kind:'input',selector,value:node.value}
  }

  const applyInput=(selector,value)=>{
    const node=$(selector)
    if(!node)return false
    const before=snapshotForSelector(selector)
    if(before)undoStack.push(before)
    node.value=value
    node.dispatchEvent(new Event('input',{bubbles:true}))
    return true
  }

  const applyExperienceBullet=(jobIndex,bulletIndex,value)=>{
    const textarea=$$('#experienceEditor .editor-card textarea[data-key="bullets"]')[jobIndex]
    if(!textarea)return false
    const lines=textarea.value.split(/\n+/).map((item)=>item.trim()).filter(Boolean)
    const before={kind:'input',selector:'#experienceEditor .editor-card:nth-of-type('+(jobIndex+1)+') textarea[data-key="bullets"]',value:textarea.value}
    undoStack.push(before)
    lines[bulletIndex]=value
    textarea.value=lines.join('\n')
    textarea.dispatchEvent(new Event('input',{bubbles:true}))
    return true
  }

  const undoLast=()=>{
    const item=undoStack.pop()
    if(!item)return
    const node=$(item.selector)
    if(!node)return
    node.value=item.value
    node.dispatchEvent(new Event('input',{bubbles:true}))
    buildSuggestions()
    renderUndo()
  }

  const renderUndo=()=>{
    const button=$('#atsAutoUndo')
    if(button)button.disabled=!undoStack.length
  }

  const renderSuggestions=()=>{
    const host=$('#atsAutoFixList')
    if(!host)return
    const safe=suggestions.filter((item)=>item.type==='safe')
    const review=suggestions.filter((item)=>item.type==='review')
    $('#atsAutoFixCount').textContent=safe.length+' safe fix'+(safe.length===1?'':'es')
    $('#atsAutoApplyAll').disabled=!safe.length

    if(!suggestions.length){
      host.innerHTML='<div class="ats-auto-empty"><strong>No automatic fixes needed</strong><p>The current CV has no safe deterministic rewrite to apply. You can still review Target Fit and PDF verification.</p></div>'
      renderUndo()
      return
    }

    host.innerHTML=suggestions.map((item)=>{
      const reviewOnly=item.type==='review'
      return '<article class="ats-auto-card '+(reviewOnly?'review':'safe')+'" data-auto-id="'+esc(item.id)+'">' +
        '<div class="ats-auto-card-head"><div><span>'+(reviewOnly?'Review':'Safe fix')+'</span><strong>'+esc(item.title)+'</strong>'+(item.context?'<small>'+esc(item.context)+'</small>':'')+'</div>' +
        (reviewOnly?'<b>Verify first</b>':'<b>Low risk</b>')+'</div>' +
        '<p class="ats-auto-reason">'+esc(item.reason)+'</p>' +
        '<div class="ats-auto-diff"><div><span>Current</span><p>'+esc(item.current)+'</p></div><i>→</i><div><span>'+(reviewOnly?'Consider':'Proposed')+'</span><p>'+esc(item.proposed)+'</p></div></div>' +
        '<div class="ats-auto-actions">' +
          (reviewOnly
            ? '<button type="button" data-auto-copy="'+esc(item.id)+'">Copy keywords</button><button type="button" data-auto-edit-skills>Review Skills</button>'
            : '<button type="button" class="primary" data-auto-apply="'+esc(item.id)+'">Apply</button>') +
        '</div>' +
      '</article>'
    }).join('')
    renderUndo()
  }

  const applySuggestion=(id)=>{
    const item=suggestions.find((entry)=>entry.id===id)
    if(!item||item.type!=='safe'||typeof item.apply!=='function')return
    if(item.apply()){
      buildSuggestions()
      renderUndo()
      $('#atsAutoStatus').textContent='Applied · CV preview and ATS scan updated'
      setTimeout(()=>{if($('#atsAutoStatus'))$('#atsAutoStatus').textContent='Changes stay local until you export.'},1800)
    }
  }

  const applyAll=()=>{
    const safe=[...suggestions].filter((item)=>item.type==='safe')
    safe.forEach((item)=>item.apply?.())
    buildSuggestions()
    renderUndo()
    $('#atsAutoStatus').textContent=safe.length?'Applied '+safe.length+' safe fixes · review the CV before export.':'No safe fixes to apply.'
  }

  const copyKeywords=async(id)=>{
    const item=suggestions.find((entry)=>entry.id===id)
    if(!item?.keywords?.length)return
    try{
      await navigator.clipboard.writeText(item.keywords.join(', '))
      $('#atsAutoStatus').textContent='Keywords copied · add only the ones that are true.'
    }catch{
      $('#atsAutoStatus').textContent='Copy unavailable · review the keywords manually.'
    }
  }

  const openSkills=()=>{
    $('#atsShell').hidden=true
    document.body.classList.remove('ats-open')
    setTimeout(()=>{
      if($('#editor')?.classList.contains('collapsed'))$('#toggleEditor')?.click()
      $('.tab[data-tab="content"]')?.click()
      $('#skills')?.scrollIntoView({behavior:'smooth',block:'center'})
      $('#skills')?.focus({preventScroll:true})
    },80)
  }

  const inject=()=>{
    const scanPane=$('[data-ats-pane="scan"]')
    if(!scanPane||$('#atsAutoFix'))return
    const section=document.createElement('section')
    section.id='atsAutoFix'
    section.className='ats-auto-fix'
    section.innerHTML=
      '<div class="ats-section-title ats-auto-title"><div><span>Optimization</span><strong>ATS Auto Fix</strong></div><small id="atsAutoFixCount">0 safe fixes</small></div>' +
      '<div class="ats-auto-toolbar"><div><strong>Evidence-first fixes</strong><span id="atsAutoStatus">Changes stay local until you export.</span></div><div><button id="atsAutoUndo" type="button" disabled>Undo</button><button id="atsAutoApplyAll" type="button" class="primary">Apply safe fixes</button></div></div>' +
      '<div id="atsAutoFixList" class="ats-auto-list"></div>'
    scanPane.insertBefore(section,scanPane.querySelector('.ats-section-title')||scanPane.firstChild)

    section.addEventListener('click',(event)=>{
      const apply=event.target.closest('[data-auto-apply]')
      if(apply)return applySuggestion(apply.dataset.autoApply)
      const copy=event.target.closest('[data-auto-copy]')
      if(copy)return copyKeywords(copy.dataset.autoCopy)
      if(event.target.closest('[data-auto-edit-skills]'))return openSkills()
    })
    $('#atsAutoApplyAll').addEventListener('click',applyAll)
    $('#atsAutoUndo').addEventListener('click',undoLast)

    $('#atsScanButton')?.addEventListener('click',()=>setTimeout(buildSuggestions,0))
    $('#atsRescan')?.addEventListener('click',()=>setTimeout(buildSuggestions,0))
    $('#atsJobDescription')?.addEventListener('input',()=>setTimeout(buildSuggestions,80))
    $('#atsProRole')?.addEventListener('change',()=>setTimeout(buildSuggestions,0))
    $('#atsProIndustry')?.addEventListener('change',()=>setTimeout(buildSuggestions,0))
    $('#atsProSeniority')?.addEventListener('change',()=>setTimeout(buildSuggestions,0))
    const paper=$('#paper')
    if(paper)new MutationObserver(()=>setTimeout(buildSuggestions,100)).observe(paper,{childList:true,subtree:true,characterData:true})
    buildSuggestions()
  }

  const boot=()=>inject()
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot)
  else boot()
})()


/* ATS_VERSION_COMPARE_V1 */
(() => {
  'use strict'

  const PROFILE_KEY='cv-studio-static-v2'
  const SETTINGS_KEY='cv-studio-static-settings-v2'
  const TARGET_KEY='cv-studio-ats-target-v2'
  const VERSIONS_KEY='cv-studio-ats-versions-v1'
  const $=(selector,root=document)=>root.querySelector(selector)
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)]
  const esc=(value)=>String(value==null?'':value).replace(/[&<>"']/g,(char)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]))
  const readJson=(key,fallback)=>{
    try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}
  }
  const writeJson=(key,value)=>{
    localStorage.setItem(key,JSON.stringify(value))
  }
  const deepClone=(value)=>JSON.parse(JSON.stringify(value))
  const normalize=(value)=>String(value==null?'':value).trim().replace(/\s+/g,' ')
  const numberValue=(selector)=>{
    const raw=String($(selector)?.textContent||'').trim()
    if(!raw||raw==='—')return null
    const match=raw.match(/-?\d+(?:\.\d+)?/)
    return match?Number(match[0]):null
  }
  const versions=()=>readJson(VERSIONS_KEY,[]).filter((item)=>item&&item.id)
  const saveVersions=(items)=>writeJson(VERSIONS_KEY,items)

  const sanitizedProfile=()=>{
    const profile=deepClone(readJson(PROFILE_KEY,{}))
    if(profile&&typeof profile==='object')profile.avatar=''
    return profile
  }

  const targetSnapshot=()=>deepClone(readJson(TARGET_KEY,{role:'auto',industry:'general',seniority:'senior',jd:''}))
  const scoreSnapshot=()=>({
    readiness:numberValue('#atsProReadiness') ?? numberValue('#atsScore'),
    targetFit:numberValue('#atsProFit'),
    pdfFidelity:numberValue('#atsPdfScore'),
    jdMatch:numberValue('#atsJobMatchLarge')
  })

  const defaultVersionName=()=>{
    const role=$('#atsProRole option:checked')?.textContent?.trim()
    const industry=$('#atsProIndustry option:checked')?.textContent?.trim()
    const fallback=readJson(PROFILE_KEY,{}).role||'CV'
    return [role&&role!=='Auto from template'?role:fallback,industry&&industry!=='Any industry'?industry:''].filter(Boolean).join(' · ')
  }

  const createSnapshot=(name)=>{
    const profile=sanitizedProfile()
    const target=targetSnapshot()
    return {
      id:'v-'+Date.now(),
      name:normalize(name)||defaultVersionName(),
      createdAt:new Date().toISOString(),
      profile,
      settings:deepClone(readJson(SETTINGS_KEY,{})),
      target,
      scores:scoreSnapshot(),
      meta:{
        template:String($('#activeTemplateLabel')?.textContent||'').trim(),
        skillCount:Array.isArray(profile.skills)?profile.skills.length:0,
        experienceCount:Array.isArray(profile.experience)?profile.experience.length:0,
        projectCount:Array.isArray(profile.projects)?profile.projects.length:0
      }
    }
  }

  const formatDate=(iso)=>{
    try{
      return new Intl.DateTimeFormat(undefined,{month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(iso))
    }catch{return iso}
  }

  const scoreBadge=(label,value)=>{
    const shown=value==null?'—':String(Math.round(value))
    return '<span><small>'+esc(label)+'</small><strong>'+shown+'</strong></span>'
  }

  const renderList=()=>{
    const host=$('#atsVersionList')
    if(!host)return
    const items=versions().slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))
    $('#atsVersionCount').textContent=items.length+' saved'
    if(!items.length){
      host.innerHTML='<div class="ats-version-empty"><strong>No saved versions yet</strong><p>Save the current CV before making a role-specific or JD-specific change.</p></div>'
      renderSelectors(items)
      return
    }

    host.innerHTML=items.map((item)=>(
      '<article class="ats-version-card" data-version-id="'+esc(item.id)+'">'+
        '<div class="ats-version-card-head"><div><strong>'+esc(item.name)+'</strong><small>'+esc(formatDate(item.createdAt))+(item.meta?.template?' · '+esc(item.meta.template):'')+'</small></div><button type="button" data-version-more aria-label="Version actions">•••</button></div>'+
        '<div class="ats-version-score-row">'+
          scoreBadge('Readiness',item.scores?.readiness)+
          scoreBadge('Target fit',item.scores?.targetFit)+
          scoreBadge('PDF',item.scores?.pdfFidelity)+
        '</div>'+
        '<div class="ats-version-meta"><span>'+(item.meta?.skillCount||0)+' skills</span><span>'+(item.meta?.experienceCount||0)+' roles</span><span>'+(item.meta?.projectCount||0)+' projects</span></div>'+
        '<div class="ats-version-actions"><button type="button" data-version-restore="'+esc(item.id)+'">Restore</button><button type="button" data-version-delete="'+esc(item.id)+'">Delete</button></div>'+
      '</article>'
    )).join('')
    renderSelectors(items)
  }

  const renderSelectors=(items)=>{
    const a=$('#atsCompareA'), b=$('#atsCompareB')
    if(!a||!b)return
    const options=items.map((item)=>'<option value="'+esc(item.id)+'">'+esc(item.name)+' · '+esc(formatDate(item.createdAt))+'</option>').join('')
    a.innerHTML='<option value="">Version A</option>'+options
    b.innerHTML='<option value="">Version B</option>'+options
    if(items.length>=2){
      a.value=items[1].id
      b.value=items[0].id
    }else if(items.length===1){
      a.value=items[0].id
    }
    $('#atsCompareRun').disabled=items.length<2
  }

  const diffScore=(a,b,key)=>{
    const av=a.scores?.[key], bv=b.scores?.[key]
    if(av==null||bv==null)return {a:av,b:bv,delta:null}
    return {a:av,b:bv,delta:Math.round((bv-av)*10)/10}
  }

  const setDiff=(aValues,bValues)=>{
    const aSet=new Map((aValues||[]).map((value)=>[normalize(value).toLowerCase(),value]))
    const bSet=new Map((bValues||[]).map((value)=>[normalize(value).toLowerCase(),value]))
    const added=[...bSet.entries()].filter(([key])=>!aSet.has(key)).map(([,value])=>value)
    const removed=[...aSet.entries()].filter(([key])=>!bSet.has(key)).map(([,value])=>value)
    return {added,removed}
  }

  const flattenExperience=(profile)=>{
    return (profile?.experience||[]).flatMap((job)=>[
      job.role,job.company,job.period,...(job.bullets||[])
    ]).filter(Boolean)
  }

  const changeRow=(label,aText,bText)=>{
    const same=normalize(aText)===normalize(bText)
    return '<article class="'+(same?'same':'changed')+'"><strong>'+esc(label)+'</strong><span>'+esc(same?'No change':'Changed')+'</span><div><p>'+esc(aText||'—')+'</p><i>→</i><p>'+esc(bText||'—')+'</p></div></article>'
  }

  const metricCompare=(label,diff)=>{
    const delta=diff.delta
    const deltaText=delta==null?'—':(delta>0?'+':'')+delta
    const cls=delta==null?'neutral':delta>0?'up':delta<0?'down':'neutral'
    return '<article><span>'+esc(label)+'</span><div><strong>'+(diff.a==null?'—':Math.round(diff.a))+'</strong><i>→</i><strong>'+(diff.b==null?'—':Math.round(diff.b))+'</strong></div><b class="'+cls+'">'+deltaText+'</b></article>'
  }

  const compareVersions=()=>{
    const items=versions()
    const a=items.find((item)=>item.id===$('#atsCompareA').value)
    const b=items.find((item)=>item.id===$('#atsCompareB').value)
    const host=$('#atsCompareResult')
    if(!a||!b){
      host.hidden=true
      return
    }
    host.hidden=false

    const skills=setDiff(a.profile?.skills,b.profile?.skills)
    const expA=flattenExperience(a.profile).join(' · ')
    const expB=flattenExperience(b.profile).join(' · ')
    const targetA=[a.target?.role,a.target?.industry,a.target?.seniority].filter(Boolean).join(' · ')
    const targetB=[b.target?.role,b.target?.industry,b.target?.seniority].filter(Boolean).join(' · ')

    $('#atsCompareNames').innerHTML='<div><strong>'+esc(a.name)+'</strong><small>'+esc(formatDate(a.createdAt))+'</small></div><span>vs</span><div><strong>'+esc(b.name)+'</strong><small>'+esc(formatDate(b.createdAt))+'</small></div>'
    $('#atsCompareMetrics').innerHTML=[
      metricCompare('ATS Readiness',diffScore(a,b,'readiness')),
      metricCompare('Target Fit',diffScore(a,b,'targetFit')),
      metricCompare('PDF Fidelity',diffScore(a,b,'pdfFidelity')),
      metricCompare('JD Match',diffScore(a,b,'jdMatch'))
    ].join('')

    $('#atsCompareContent').innerHTML=
      changeRow('Target profile',targetA,targetB)+
      changeRow('Summary',a.profile?.summary,b.profile?.summary)+
      changeRow('Experience',expA,expB)+
      '<article class="'+(!skills.added.length&&!skills.removed.length?'same':'changed')+'"><strong>Skills</strong><span>'+(!skills.added.length&&!skills.removed.length?'No change':'Changed')+'</span>'+
        '<div class="ats-skill-diff"><section><small>Removed</small>'+(skills.removed.length?skills.removed.map((x)=>'<em>- '+esc(x)+'</em>').join(''):'<em>None</em>')+'</section>'+
        '<section><small>Added</small>'+(skills.added.length?skills.added.map((x)=>'<em>+ '+esc(x)+'</em>').join(''):'<em>None</em>')+'</section></div></article>'
  }

  const saveCurrent=()=>{
    const name=$('#atsVersionName').value
    const items=versions()
    items.push(createSnapshot(name))
    saveVersions(items)
    $('#atsVersionName').value=''
    renderList()
    $('#atsVersionStatus').textContent='Version saved locally.'
  }

  const restoreVersion=(id)=>{
    const item=versions().find((entry)=>entry.id===id)
    if(!item)return
    const current=readJson(PROFILE_KEY,{})
    const nextProfile=deepClone(item.profile||{})
    if(current.avatar)nextProfile.avatar=current.avatar
    writeJson(PROFILE_KEY,nextProfile)
    writeJson(SETTINGS_KEY,item.settings||{})
    writeJson(TARGET_KEY,item.target||{})
    sessionStorage.setItem('ats-version-restored',item.name||'Saved version')
    location.reload()
  }

  const deleteVersion=(id)=>{
    const next=versions().filter((item)=>item.id!==id)
    saveVersions(next)
    renderList()
    $('#atsCompareResult').hidden=true
    $('#atsVersionStatus').textContent='Version deleted.'
  }

  const inject=()=>{
    const tabs=$('.ats-tabs')
    const panel=$('.ats-panel')
    if(!tabs||!panel||$('#atsVersionTab'))return

    const tab=document.createElement('button')
    tab.type='button'
    tab.id='atsVersionTab'
    tab.dataset.atsTab='versions'
    tab.textContent='Versions'
    tabs.appendChild(tab)

    const pane=document.createElement('section')
    pane.className='ats-pane'
    pane.dataset.atsPane='versions'
    pane.innerHTML=
      '<section class="ats-version-save">'+
        '<div class="ats-section-title"><div><span>Snapshots</span><strong>CV Version Compare</strong></div><small id="atsVersionCount">0 saved</small></div>'+
        '<p>Save a snapshot before tailoring this CV to another role or job description.</p>'+
        '<div class="ats-version-save-row"><input id="atsVersionName" type="text" maxlength="80" placeholder="Version name · optional" /><button id="atsVersionSave" type="button">Save current version</button></div>'+
        '<small id="atsVersionStatus">Stored only in this browser.</small>'+
      '</section>'+
      '<section class="ats-version-compare">'+
        '<div class="ats-section-title"><div><span>Compare</span><strong>Version A vs Version B</strong></div><small>Scores + content</small></div>'+
        '<div class="ats-compare-controls"><select id="atsCompareA"></select><span>→</span><select id="atsCompareB"></select><button id="atsCompareRun" type="button">Compare</button></div>'+
        '<div id="atsCompareResult" hidden>'+
          '<div id="atsCompareNames" class="ats-compare-names"></div>'+
          '<div id="atsCompareMetrics" class="ats-compare-metrics"></div>'+
          '<div class="ats-section-title"><div><span>Content diff</span><strong>What changed</strong></div><small>Descriptive only</small></div>'+
          '<div id="atsCompareContent" class="ats-compare-content"></div>'+
        '</div>'+
      '</section>'+
      '<div class="ats-section-title"><div><span>Saved versions</span><strong>Local history</strong></div><small>Restore or delete</small></div>'+
      '<div id="atsVersionList" class="ats-version-list"></div>'+
      '<p class="ats-help">Scores are snapshots from the moment each version was saved. Restoring a version keeps your current profile photo.</p>'

    panel.insertBefore(pane,panel.querySelector('.ats-footer'))

    tab.addEventListener('click',()=>{
      $$('[data-ats-tab]').forEach((item)=>item.classList.toggle('active',item===tab))
      $$('[data-ats-pane]').forEach((item)=>item.classList.toggle('active',item.dataset.atsPane==='versions'))
      renderList()
    })

    $('#atsVersionSave').addEventListener('click',saveCurrent)
    $('#atsVersionName').addEventListener('keydown',(event)=>{
      if(event.key==='Enter')saveCurrent()
    })
    $('#atsCompareRun').addEventListener('click',compareVersions)
    $('#atsVersionList').addEventListener('click',(event)=>{
      const restore=event.target.closest('[data-version-restore]')
      if(restore)return restoreVersion(restore.dataset.versionRestore)
      const remove=event.target.closest('[data-version-delete]')
      if(remove)return deleteVersion(remove.dataset.versionDelete)
    })

    const restored=sessionStorage.getItem('ats-version-restored')
    if(restored){
      sessionStorage.removeItem('ats-version-restored')
      $('#atsVersionStatus').textContent='Restored: '+restored
    }

    renderList()
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject)
  else inject()
})()


/* ATS_APPLICATION_WORKSPACE_V1 */
(() => {
  'use strict'

  const PROFILE_KEY='cv-studio-static-v2'
  const SETTINGS_KEY='cv-studio-static-settings-v2'
  const TARGET_KEY='cv-studio-ats-target-v2'
  const VERSIONS_KEY='cv-studio-ats-versions-v1'
  const APPLICATIONS_KEY='cv-studio-ats-applications-v1'
  const DB_NAME='cv-studio-ats-workspace'
  const DB_VERSION=1
  const PDF_STORE='pdfs'

  const $=(selector,root=document)=>root.querySelector(selector)
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)]
  const esc=(value)=>String(value==null?'':value).replace(/[&<>"']/g,(char)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]))
  const readJson=(key,fallback)=>{
    try{return JSON.parse(localStorage.getItem(key)||'')||fallback}catch{return fallback}
  }
  const writeJson=(key,value)=>localStorage.setItem(key,JSON.stringify(value))
  const clone=(value)=>JSON.parse(JSON.stringify(value))
  const clean=(value)=>String(value==null?'':value).trim().replace(/\s+/g,' ')
  const clampScore=(selector)=>{
    const raw=String($(selector)?.textContent||'').trim()
    const match=raw.match(/-?\d+(?:\.\d+)?/)
    return match?Math.max(0,Math.min(100,Number(match[0]))):null
  }
  const currentScores=()=>({
    readiness:clampScore('#atsProReadiness') ?? clampScore('#atsScore'),
    targetFit:clampScore('#atsProFit'),
    pdfFidelity:clampScore('#atsPdfScore'),
    jdMatch:clampScore('#atsJobMatchLarge')
  })
  const currentProfile=()=>{
    const profile=clone(readJson(PROFILE_KEY,{}))
    if(profile&&typeof profile==='object')profile.avatar=''
    return profile
  }
  const applications=()=>readJson(APPLICATIONS_KEY,[]).filter((item)=>item&&item.id)
  const saveApplications=(items)=>writeJson(APPLICATIONS_KEY,items)
  const versions=()=>readJson(VERSIONS_KEY,[]).filter((item)=>item&&item.id)
  const now=()=>new Date().toISOString()
  const statusOrder=['Draft','Ready','Applied','Interview','Offer','Closed']
  const statusClass=(status)=>String(status||'Draft').toLowerCase().replace(/\s+/g,'-')
  const formatDate=(iso)=>{
    try{return new Intl.DateTimeFormat(undefined,{month:'short',day:'2-digit',year:'numeric'}).format(new Date(iso))}
    catch{return iso||''}
  }
  const formatBytes=(bytes)=>{
    const value=Number(bytes||0)
    if(value<1024)return value+' B'
    if(value<1024*1024)return Math.round(value/1024)+' KB'
    return (value/(1024*1024)).toFixed(1)+' MB'
  }
  const selectedVersion=()=>{
    const id=$('#atsAppVersion')?.value
    if(!id)return null
    return versions().find((item)=>item.id===id)||null
  }

  let dbPromise=null
  const openDb=()=>{
    if(dbPromise)return dbPromise
    dbPromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open(DB_NAME,DB_VERSION)
      request.onupgradeneeded=()=>{
        const db=request.result
        if(!db.objectStoreNames.contains(PDF_STORE))db.createObjectStore(PDF_STORE,{keyPath:'applicationId'})
      }
      request.onsuccess=()=>resolve(request.result)
      request.onerror=()=>reject(request.error)
    })
    return dbPromise
  }

  const putPdf=async(applicationId,file)=>{
    const db=await openDb()
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(PDF_STORE,'readwrite')
      tx.objectStore(PDF_STORE).put({
        applicationId,
        file,
        name:file.name,
        type:file.type||'application/pdf',
        size:file.size,
        savedAt:now()
      })
      tx.oncomplete=()=>resolve()
      tx.onerror=()=>reject(tx.error)
    })
  }

  const getPdf=async(applicationId)=>{
    const db=await openDb()
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(PDF_STORE,'readonly')
      const req=tx.objectStore(PDF_STORE).get(applicationId)
      req.onsuccess=()=>resolve(req.result||null)
      req.onerror=()=>reject(req.error)
    })
  }

  const removePdf=async(applicationId)=>{
    const db=await openDb()
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(PDF_STORE,'readwrite')
      tx.objectStore(PDF_STORE).delete(applicationId)
      tx.oncomplete=()=>resolve()
      tx.onerror=()=>reject(tx.error)
    })
  }

  const sourceSnapshot=()=>{
    const version=selectedVersion()
    if(version){
      return {
        versionId:version.id,
        versionName:version.name,
        profile:clone(version.profile||{}),
        settings:clone(version.settings||{}),
        target:clone(version.target||{}),
        scores:clone(version.scores||{})
      }
    }
    return {
      versionId:'',
      versionName:'Current CV',
      profile:currentProfile(),
      settings:clone(readJson(SETTINGS_KEY,{})),
      target:clone(readJson(TARGET_KEY,{role:'auto',industry:'general',seniority:'senior',jd:''})),
      scores:currentScores()
    }
  }

  const createApplication=()=>{
    const company=clean($('#atsAppCompany')?.value)
    const role=clean($('#atsAppRole')?.value)
    if(!company||!role){
      $('#atsAppStatusText').textContent='Company and role are required.'
      return
    }
    const source=sourceSnapshot()
    const jd=String($('#atsAppJd')?.value||source.target?.jd||'').trim()
    source.target.jd=jd
    const item={
      id:'app-'+Date.now(),
      company,
      role,
      status:$('#atsAppStatus')?.value||'Draft',
      createdAt:now(),
      updatedAt:now(),
      source:{
        versionId:source.versionId,
        versionName:source.versionName
      },
      profile:source.profile,
      settings:source.settings,
      target:source.target,
      scores:source.scores,
      jd,
      notes:String($('#atsAppNotes')?.value||'').trim(),
      followUpDate:String($('#atsAppFollowUp')?.value||'').trim(),
      stageHistory:[{status:$('#atsAppStatus')?.value||'Draft',at:now()}],
      pdf:null
    }
    const items=applications()
    items.push(item)
    saveApplications(items)
    resetForm()
    renderWorkspace()
    $('#atsAppStatusText').textContent='Application workspace created.'
  }

  const resetForm=()=>{
    $('#atsAppCompany').value=''
    $('#atsAppRole').value=readJson(PROFILE_KEY,{}).role||''
    $('#atsAppStatus').value='Draft'
    $('#atsAppJd').value=String($('#atsJobDescription')?.value||readJson(TARGET_KEY,{}).jd||'')
    $('#atsAppNotes').value=''
    $('#atsAppFollowUp').value=''
    $('#atsAppVersion').value=''
  }

  const updateApplication=(id,patch)=>{
    const items=applications()
    const index=items.findIndex((item)=>item.id===id)
    if(index<0)return
    const current=items[index]
    const next=Object.assign({},current,patch,{updatedAt:now()})
    if(patch.status&&patch.status!==current.status){
      next.stageHistory=[...(Array.isArray(current.stageHistory)?current.stageHistory:[]),{status:patch.status,at:now()}]
    }
    items[index]=next
    saveApplications(items)
    renderWorkspace()
    window.dispatchEvent(new CustomEvent('ats-applications-changed'))
  }

  const deleteApplication=async(id)=>{
    saveApplications(applications().filter((item)=>item.id!==id))
    try{await removePdf(id)}catch{}
    renderWorkspace()
    $('#atsAppStatusText').textContent='Application removed.'
  }

  const restoreApplication=(id)=>{
    const item=applications().find((entry)=>entry.id===id)
    if(!item)return
    const current=readJson(PROFILE_KEY,{})
    const profile=clone(item.profile||{})
    if(current.avatar)profile.avatar=current.avatar
    writeJson(PROFILE_KEY,profile)
    writeJson(SETTINGS_KEY,item.settings||{})
    writeJson(TARGET_KEY,item.target||{})
    sessionStorage.setItem('ats-application-restored',item.company+' · '+item.role)
    location.reload()
  }

  const syncScores=(id)=>{
    const scores=currentScores()
    updateApplication(id,{scores})
    $('#atsAppStatusText').textContent='Scores synced from the current ATS scan.'
  }

  const attachPdf=async(id,file)=>{
    if(!file||(!/pdf/i.test(file.type||'')&&!/\.pdf$/i.test(file.name||''))){
      $('#atsAppStatusText').textContent='Choose a PDF file.'
      return
    }
    await putPdf(id,file)
    updateApplication(id,{pdf:{name:file.name,size:file.size,attachedAt:now()}})
    $('#atsAppStatusText').textContent='Final PDF attached locally.'
  }

  const downloadPdf=async(id)=>{
    const record=await getPdf(id)
    if(!record?.file){
      $('#atsAppStatusText').textContent='No PDF attached to this workspace.'
      return
    }
    const url=URL.createObjectURL(record.file)
    const anchor=document.createElement('a')
    anchor.href=url
    anchor.download=record.name||'cv.pdf'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    setTimeout(()=>URL.revokeObjectURL(url),1000)
  }

  const verifyPdf=async(id)=>{
    const record=await getPdf(id)
    if(!record?.file){
      $('#atsAppStatusText').textContent='Attach a PDF first.'
      return
    }
    const tab=$('#atsPdfVerifyTab')
    const input=$('#atsPdfInput')
    if(!tab||!input){
      $('#atsAppStatusText').textContent='PDF verifier is unavailable.'
      return
    }
    tab.click()
    try{
      const transfer=new DataTransfer()
      transfer.items.add(record.file)
      input.files=transfer.files
      input.dispatchEvent(new Event('change',{bubbles:true}))
    }catch{
      $('#atsAppStatusText').textContent='Open PDF Verify and choose the attached file again.'
    }
  }

  const scorePill=(label,value)=>{
    return '<span><small>'+esc(label)+'</small><strong>'+(value==null?'—':Math.round(value))+'</strong></span>'
  }

  const renderVersionOptions=()=>{
    const select=$('#atsAppVersion')
    if(!select)return
    const items=versions().slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))
    select.innerHTML='<option value="">Current CV</option>'+items.map((item)=>(
      '<option value="'+esc(item.id)+'">'+esc(item.name)+' · '+esc(formatDate(item.createdAt))+'</option>'
    )).join('')
  }

  const filteredApplications=()=>{
    const query=clean($('#atsAppSearch')?.value).toLowerCase()
    const status=$('#atsAppFilterStatus')?.value||'All'
    return applications()
      .filter((item)=>status==='All'||item.status===status)
      .filter((item)=>!query||[item.company,item.role,item.notes,item.jd].join(' ').toLowerCase().includes(query))
      .sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))
  }

  const renderSummary=()=>{
    const items=applications()
    const counts=Object.fromEntries(statusOrder.map((status)=>[status,items.filter((item)=>item.status===status).length]))
    $('#atsAppSummary').innerHTML=statusOrder.map((status)=>(
      '<article><span>'+esc(status)+'</span><strong>'+counts[status]+'</strong></article>'
    )).join('')
    $('#atsAppCount').textContent=items.length+' application'+(items.length===1?'':'s')
  }

  const renderCards=()=>{
    const host=$('#atsAppList')
    if(!host)return
    const items=filteredApplications()
    if(!items.length){
      host.innerHTML='<div class="ats-app-empty"><strong>No matching applications</strong><p>Create a workspace or change the filters.</p></div>'
      return
    }
    host.innerHTML=items.map((item)=>(
      '<article class="ats-app-card" data-app-id="'+esc(item.id)+'">'+
        '<div class="ats-app-card-head">'+
          '<div><span>'+esc(item.company)+'</span><strong>'+esc(item.role)+'</strong><small>'+esc(item.source?.versionName||'Current CV')+' · updated '+esc(formatDate(item.updatedAt))+'</small></div>'+
          '<select data-app-status="'+esc(item.id)+'">'+statusOrder.map((status)=>'<option value="'+status+'"'+(status===item.status?' selected':'')+'>'+status+'</option>').join('')+'</select>'+
        '</div>'+
        '<div class="ats-app-scores">'+
          scorePill('Readiness',item.scores?.readiness)+
          scorePill('Target fit',item.scores?.targetFit)+
          scorePill('PDF',item.scores?.pdfFidelity)+
          scorePill('JD',item.scores?.jdMatch)+
        '</div>'+
        '<div class="ats-app-target"><span>'+esc(item.target?.role||'auto')+'</span><span>'+esc(item.target?.industry||'general')+'</span><span>'+esc(item.target?.seniority||'senior')+'</span></div>'+
        (item.jd?'<details class="ats-app-jd"><summary>Job description</summary><p>'+esc(item.jd)+'</p></details>':'')+
        (item.notes?'<p class="ats-app-notes">'+esc(item.notes)+'</p>':'')+
        '<div class="ats-app-followup"><label>Next follow-up<input type="date" value="'+esc(item.followUpDate||'')+'" data-app-followup="'+esc(item.id)+'" /></label>'+(item.followUpDate?'<span>'+esc(item.followUpDate)+'</span>':'<span>Not scheduled</span>')+'</div>'+
        '<div class="ats-app-pdf '+(item.pdf?'attached':'')+'"><div><strong>'+(item.pdf?'Final PDF attached':'No final PDF')+'</strong><small>'+(item.pdf?esc(item.pdf.name)+' · '+formatBytes(item.pdf.size):'Stored locally with IndexedDB')+'</small></div><label><input type="file" accept="application/pdf,.pdf" data-app-pdf="'+esc(item.id)+'" />'+(item.pdf?'Replace PDF':'Attach PDF')+'</label></div>'+
        '<div class="ats-app-actions">'+
          '<button type="button" data-app-restore="'+esc(item.id)+'">Restore CV</button>'+
          '<button type="button" data-app-sync="'+esc(item.id)+'">Sync scores</button>'+
          (item.pdf?'<button type="button" data-app-verify="'+esc(item.id)+'">Verify PDF</button><button type="button" data-app-download="'+esc(item.id)+'">Download PDF</button>':'')+
          '<button type="button" class="danger" data-app-delete="'+esc(item.id)+'">Delete</button>'+
        '</div>'+
      '</article>'
    )).join('')
  }

  const renderWorkspace=()=>{
    renderVersionOptions()
    renderSummary()
    renderCards()
  }

  const inject=()=>{
    const tabs=$('.ats-tabs')
    const panel=$('.ats-panel')
    if(!tabs||!panel||$('#atsApplicationsTab'))return

    const tab=document.createElement('button')
    tab.type='button'
    tab.id='atsApplicationsTab'
    tab.dataset.atsTab='applications'
    tab.textContent='Applications'
    tabs.appendChild(tab)

    const pane=document.createElement('section')
    pane.className='ats-pane'
    pane.dataset.atsPane='applications'
    pane.innerHTML=
      '<section class="ats-app-create">'+
        '<div class="ats-section-title"><div><span>Application workspace</span><strong>Track one job from JD to final PDF</strong></div><small id="atsAppCount">0 applications</small></div>'+
        '<div class="ats-app-form">'+
          '<label>Company<input id="atsAppCompany" type="text" maxlength="100" placeholder="Company name" /></label>'+
          '<label>Role<input id="atsAppRole" type="text" maxlength="120" placeholder="Target role" /></label>'+
          '<label>Status<select id="atsAppStatus">'+statusOrder.map((status)=>'<option>'+status+'</option>').join('')+'</select></label>'+
          '<label>CV version<select id="atsAppVersion"><option value="">Current CV</option></select></label>'+
          '<label>Follow-up date<input id="atsAppFollowUp" type="date" /></label>'+
          '<label class="wide">Job description<textarea id="atsAppJd" rows="5" placeholder="Paste the JD for this application"></textarea></label>'+
          '<label class="wide">Notes<textarea id="atsAppNotes" rows="2" placeholder="Recruiter, deadline, referral, interview notes…"></textarea></label>'+
        '</div>'+
        '<div class="ats-app-create-actions"><small id="atsAppStatusText">Workspace data stays in this browser.</small><button id="atsAppCreate" type="button">Create workspace</button></div>'+
      '</section>'+
      '<section class="ats-app-overview">'+
        '<div class="ats-section-title"><div><span>Pipeline</span><strong>Application status</strong></div><small>Local overview</small></div>'+
        '<div id="atsAppSummary" class="ats-app-summary"></div>'+
      '</section>'+
      '<div class="ats-app-filter"><input id="atsAppSearch" type="search" placeholder="Search company, role or notes…" /><select id="atsAppFilterStatus"><option>All</option>'+statusOrder.map((status)=>'<option>'+status+'</option>').join('')+'</select></div>'+
      '<div id="atsAppList" class="ats-app-list"></div>'+
      '<p class="ats-help">Each workspace keeps a CV snapshot and ATS scores from the moment it is created. Attached PDFs are saved in IndexedDB and never uploaded by this feature.</p>'

    panel.insertBefore(pane,panel.querySelector('.ats-footer'))

    tab.addEventListener('click',()=>{
      $$('[data-ats-tab]').forEach((item)=>item.classList.toggle('active',item===tab))
      $$('[data-ats-pane]').forEach((item)=>item.classList.toggle('active',item.dataset.atsPane==='applications'))
      renderWorkspace()
    })

    $('#atsAppCreate').addEventListener('click',createApplication)
    $('#atsAppSearch').addEventListener('input',renderCards)
    $('#atsAppFilterStatus').addEventListener('change',renderCards)
    $('#atsAppList').addEventListener('change',(event)=>{
      const status=event.target.closest('[data-app-status]')
      if(status)return updateApplication(status.dataset.appStatus,{status:status.value})
      const followup=event.target.closest('[data-app-followup]')
      if(followup)return updateApplication(followup.dataset.appFollowup,{followUpDate:followup.value})
      const pdf=event.target.closest('[data-app-pdf]')
      if(pdf&&pdf.files?.[0])attachPdf(pdf.dataset.appPdf,pdf.files[0])
    })
    $('#atsAppList').addEventListener('click',(event)=>{
      const restore=event.target.closest('[data-app-restore]')
      if(restore)return restoreApplication(restore.dataset.appRestore)
      const sync=event.target.closest('[data-app-sync]')
      if(sync)return syncScores(sync.dataset.appSync)
      const verify=event.target.closest('[data-app-verify]')
      if(verify)return verifyPdf(verify.dataset.appVerify)
      const download=event.target.closest('[data-app-download]')
      if(download)return downloadPdf(download.dataset.appDownload)
      const remove=event.target.closest('[data-app-delete]')
      if(remove)return deleteApplication(remove.dataset.appDelete)
    })

    const restored=sessionStorage.getItem('ats-application-restored')
    if(restored){
      sessionStorage.removeItem('ats-application-restored')
      $('#atsAppStatusText').textContent='Restored workspace CV: '+restored
    }

    resetForm()
    renderWorkspace()
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject)
  else inject()
})()


/* ATS_APPLICATION_ANALYTICS_V1 */
(() => {
  'use strict'

  const APPLICATIONS_KEY='cv-studio-ats-applications-v1'
  const $=(selector,root=document)=>root.querySelector(selector)
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)]
  const esc=(value)=>String(value==null?'':value).replace(/[&<>"']/g,(char)=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]))
  const readApps=()=>{
    try{return (JSON.parse(localStorage.getItem(APPLICATIONS_KEY)||'[]')||[]).filter((item)=>item&&item.id)}
    catch{return []}
  }
  const statusOrder=['Draft','Ready','Applied','Interview','Offer','Closed']
  const stopWords=new Set([
    'with','from','that','this','your','have','will','role','team','work','years','year','experience','skills','skill','required','preferred','responsibilities',
    'candidate','using','about','into','and','the','for','you','are','our','job','who','what','when','where','how','ability','strong','including','plus','within'
  ])
  const normalize=(value)=>String(value==null?'':value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./@%-]+/gu,' ')
    .replace(/\s+/g,' ')
    .trim()
  const average=(values)=>{
    const nums=values.filter((value)=>Number.isFinite(Number(value))).map(Number)
    return nums.length?Math.round(nums.reduce((a,b)=>a+b,0)/nums.length):null
  }
  const pct=(num,den)=>den?Math.round(num/den*100):null
  const displayPct=(value)=>value==null?'—':value+'%'
  const todayLocal=()=>{
    const d=new Date()
    const y=d.getFullYear()
    const m=String(d.getMonth()+1).padStart(2,'0')
    const day=String(d.getDate()).padStart(2,'0')
    return y+'-'+m+'-'+day
  }
  const addDays=(dateString,days)=>{
    const parts=dateString.split('-').map(Number)
    const d=new Date(parts[0],parts[1]-1,parts[2])
    d.setDate(d.getDate()+days)
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
  }
  const prettyDate=(value)=>{
    if(!value)return ''
    try{return new Intl.DateTimeFormat(undefined,{month:'short',day:'2-digit'}).format(new Date(value+'T12:00:00'))}
    catch{return value}
  }

  const statusCounts=(apps)=>Object.fromEntries(statusOrder.map((status)=>[status,apps.filter((item)=>item.status===status).length]))

  const recordedStage=(item,status)=>{
    return Array.isArray(item.stageHistory)&&item.stageHistory.some((entry)=>entry?.status===status)
  }

  const funnel=(apps)=>{
    const applied=apps.filter((item)=>recordedStage(item,'Applied')).length
    const interview=apps.filter((item)=>recordedStage(item,'Interview')).length
    const offer=apps.filter((item)=>recordedStage(item,'Offer')).length
    return {
      applied,interview,offer,
      interviewRate:pct(interview,applied),
      offerRate:pct(offer,interview)
    }
  }

  const groupCounts=(apps,getter)=>{
    const map=new Map()
    apps.forEach((item)=>{
      const key=String(getter(item)||'Unknown').trim()||'Unknown'
      map.set(key,(map.get(key)||0)+1)
    })
    return [...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
  }

  const snapshotText=(item)=>{
    const p=item.profile||{}
    const values=[
      p.role,p.summary,...(p.skills||[]),
      ...(p.experience||[]).flatMap((job)=>[job.role,job.company,...(job.bullets||[])]),
      ...(p.projects||[]).flatMap((project)=>[project.name,project.type,project.description,project.impact])
    ]
    return normalize(values.filter(Boolean).join(' '))
  }

  const jdTerms=(jd)=>{
    const words=normalize(jd).split(' ').filter((word)=>word.length>=4&&!stopWords.has(word)&&!/^\d+$/.test(word))
    const counts=new Map()
    words.forEach((word)=>counts.set(word,(counts.get(word)||0)+1))
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]).map(([word])=>word).slice(0,24)
  }

  const missingTerms=(apps)=>{
    const counts=new Map()
    apps.forEach((item)=>{
      if(!item.jd)return
      const source=snapshotText(item)
      jdTerms(item.jd).forEach((term)=>{
        if(!source.includes(term))counts.set(term,(counts.get(term)||0)+1)
      })
    })
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,12)
  }

  const followUps=(apps)=>{
    const today=todayLocal()
    const horizon=addDays(today,7)
    return apps
      .filter((item)=>item.status!=='Closed'&&item.followUpDate&&item.followUpDate<=horizon)
      .sort((a,b)=>String(a.followUpDate).localeCompare(String(b.followUpDate)))
      .map((item)=>({
        ...item,
        followUpState:item.followUpDate<today?'overdue':item.followUpDate===today?'today':'upcoming'
      }))
  }

  const metricCard=(label,value,meta)=>{
    return '<article><span>'+esc(label)+'</span><strong>'+esc(value)+'</strong><small>'+esc(meta||'')+'</small></article>'
  }

  const renderBarList=(host,items,total)=>{
    host.innerHTML=items.length?items.map(([label,count])=>{
      const width=total?Math.max(4,Math.round(count/total*100)):0
      return '<article><div><strong>'+esc(label)+'</strong><span>'+count+'</span></div><i><b style="width:'+width+'%"></b></i></article>'
    }).join(''):'<div class="ats-analytics-empty">No data yet.</div>'
  }

  const render=()=>{
    if(!$('#atsAnalyticsPane'))return
    const apps=readApps()
    const counts=statusCounts(apps)
    const flow=funnel(apps)
    const active=apps.filter((item)=>item.status!=='Closed').length
    const scoreReadiness=average(apps.map((item)=>item.scores?.readiness))
    const scoreFit=average(apps.map((item)=>item.scores?.targetFit))
    const scorePdf=average(apps.map((item)=>item.scores?.pdfFidelity))
    const scoreJd=average(apps.map((item)=>item.scores?.jdMatch))
    const due=followUps(apps)
    const missing=missingTerms(apps)

    $('#atsAnalyticsHeadline').innerHTML=[
      metricCard('Applications',apps.length,String(active)+' active'),
      metricCard('Recorded interviews',flow.interview,displayPct(flow.interviewRate)+' of recorded Applied'),
      metricCard('Recorded offers',flow.offer,displayPct(flow.offerRate)+' of recorded Interview'),
      metricCard('Follow-ups',due.length,due.filter((item)=>item.followUpState==='overdue').length+' overdue')
    ].join('')

    $('#atsAnalyticsScores').innerHTML=[
      metricCard('Avg readiness',scoreReadiness==null?'—':scoreReadiness,'Saved snapshots'),
      metricCard('Avg target fit',scoreFit==null?'—':scoreFit,'Saved snapshots'),
      metricCard('Avg PDF fidelity',scorePdf==null?'—':scorePdf,'Verified snapshots'),
      metricCard('Avg JD match',scoreJd==null?'—':scoreJd,'Saved snapshots')
    ].join('')

    renderBarList($('#atsAnalyticsStatus'),statusOrder.map((status)=>[status,counts[status]]),Math.max(1,apps.length))
    renderBarList($('#atsAnalyticsRoles'),groupCounts(apps,(item)=>item.role).slice(0,7),Math.max(1,apps.length))
    renderBarList($('#atsAnalyticsVersions'),groupCounts(apps,(item)=>item.source?.versionName||'Current CV').slice(0,7),Math.max(1,apps.length))

    $('#atsAnalyticsKeywords').innerHTML=missing.length?missing.map(([term,count])=>(
      '<span><strong>'+esc(term)+'</strong><small>'+count+' JD'+(count===1?'':'s')+'</small></span>'
    )).join(''):'<div class="ats-analytics-empty">No repeated missing JD terms yet.</div>'

    $('#atsAnalyticsFollowups').innerHTML=due.length?due.map((item)=>(
      '<article class="'+item.followUpState+'">'+
        '<div><span>'+esc(item.company)+'</span><strong>'+esc(item.role)+'</strong><small>'+esc(item.status)+'</small></div>'+
        '<time>'+esc(prettyDate(item.followUpDate))+'</time>'+
      '</article>'
    )).join(''):'<div class="ats-analytics-empty">No follow-ups due in the next 7 days.</div>'

    $('#atsAnalyticsFunnel').innerHTML=[
      ['Applied',flow.applied,100],
      ['Interview',flow.interview,flow.applied?Math.round(flow.interview/flow.applied*100):0],
      ['Offer',flow.offer,flow.interview?Math.round(flow.offer/flow.interview*100):0]
    ].map(([label,count,width])=>(
      '<article><div><strong>'+label+'</strong><span>'+count+'</span></div><i><b style="width:'+Math.max(count?8:0,Math.min(100,width))+'%"></b></i></article>'
    )).join('')

    $('#atsAnalyticsCaveat').textContent=apps.some((item)=>!Array.isArray(item.stageHistory)||item.stageHistory.length<2)
      ? 'Conversion uses recorded stage history only. Older workspaces may not contain earlier stages.'
      : 'Conversion uses recorded stage history for these workspaces.'
  }

  const inject=()=>{
    const tabs=$('.ats-tabs')
    const panel=$('.ats-panel')
    if(!tabs||!panel||$('#atsAnalyticsTab'))return

    const tab=document.createElement('button')
    tab.type='button'
    tab.id='atsAnalyticsTab'
    tab.dataset.atsTab='analytics'
    tab.textContent='Analytics'
    tabs.appendChild(tab)

    const pane=document.createElement('section')
    pane.id='atsAnalyticsPane'
    pane.className='ats-pane'
    pane.dataset.atsPane='analytics'
    pane.innerHTML=
      '<div class="ats-section-title"><div><span>Application analytics</span><strong>Pipeline & CV evidence</strong></div><small>Local-only</small></div>'+
      '<div id="atsAnalyticsHeadline" class="ats-analytics-headline"></div>'+
      '<section class="ats-analytics-grid">'+
        '<article class="wide"><div class="ats-section-title"><div><span>Recorded progression</span><strong>Applied → Interview → Offer</strong></div><small id="atsAnalyticsCaveat"></small></div><div id="atsAnalyticsFunnel" class="ats-analytics-bars funnel"></div></article>'+
        '<article><div class="ats-section-title"><div><span>Current pipeline</span><strong>Status distribution</strong></div></div><div id="atsAnalyticsStatus" class="ats-analytics-bars"></div></article>'+
        '<article><div class="ats-section-title"><div><span>Target roles</span><strong>Where you are applying</strong></div></div><div id="atsAnalyticsRoles" class="ats-analytics-bars"></div></article>'+
        '<article><div class="ats-section-title"><div><span>CV usage</span><strong>Versions in applications</strong></div></div><div id="atsAnalyticsVersions" class="ats-analytics-bars"></div></article>'+
        '<article><div class="ats-section-title"><div><span>JD coverage</span><strong>Frequent terms absent from snapshot</strong></div><small>Descriptive</small></div><div id="atsAnalyticsKeywords" class="ats-analytics-keywords"></div></article>'+
        '<article class="wide"><div class="ats-section-title"><div><span>Follow-up</span><strong>Due in the next 7 days</strong></div><small>Scheduled dates</small></div><div id="atsAnalyticsFollowups" class="ats-analytics-followups"></div></article>'+
      '</section>'+
      '<div class="ats-section-title"><div><span>Score snapshots</span><strong>Average saved scores</strong></div><small>Not a hiring prediction</small></div>'+
      '<div id="atsAnalyticsScores" class="ats-analytics-scores"></div>'+
      '<p class="ats-help">Analytics describes your saved application data. It does not predict hiring outcomes or imply that a higher ATS score guarantees an interview.</p>'

    panel.insertBefore(pane,panel.querySelector('.ats-footer'))

    tab.addEventListener('click',()=>{
      $$('[data-ats-tab]').forEach((item)=>item.classList.toggle('active',item===tab))
      $$('[data-ats-pane]').forEach((item)=>item.classList.toggle('active',item.dataset.atsPane==='analytics'))
      render()
    })
    window.addEventListener('ats-applications-changed',render)
    window.addEventListener('storage',(event)=>{if(event.key===APPLICATIONS_KEY)render()})
    render()
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',inject)
  else inject()
})()
