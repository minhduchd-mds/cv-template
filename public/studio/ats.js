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
    const stop=new Set(['with','from','that','this','your','have','will','role','team','work','years','experience','skills','required','preferred','responsibilities','candidate','using','about','into','and','the','for','you','are','our','job'])
    const words=normalize(jd).split(' ').filter((word)=>word.length>=4&&!stop.has(word)&&!/^\d+$/.test(word))
    const counts=new Map()
    words.forEach((word)=>counts.set(word,(counts.get(word)||0)+1))
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]).map((item)=>item[0]).slice(0,18)
  }

  const buildReviewKeywords=(p)=>{
    const text=normalize(paperText())
    const roleTerms=(ROLE_TERMS[roleKey()]||ROLE_TERMS.general).map((term)=>normalize(term))
    const jdTerms=extractJdTerms()
    const missing=unique(roleTerms.concat(jdTerms)).filter((term)=>!text.includes(term)).slice(0,10)
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
