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
