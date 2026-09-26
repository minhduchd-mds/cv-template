const STOP_WORDS = new Set([
  'và','của','cho','trong','với','được','các','một','những','là','tôi','mình','đã','theo','từ','khi','để','về',
  'the','and','for','with','from','that','this','into','across','using','used','role','work','project','team',
])

export const normalizeInterviewText = (value = '') =>
  String(value)
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9+#.%]+/g, ' ')
    .trim()

export const interviewTokens = (value = '') =>
  normalizeInterviewText(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token))

const unique = (items) => Array.from(new Set(items.filter(Boolean)))

const stringValues = (value) => {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(stringValues)
  if (!value || typeof value !== 'object') return []
  return Object.values(value).flatMap(stringValues)
}

const meaningful = (value) => {
  const text = String(value || '').trim()
  return text.length >= 18 && text.length <= 420
}

const claim = (id, source, label, text) => {
  const numberSignals = text.match(/\b\d+(?:[.,]\d+)?%?\+?\b/g) || []
  const leadershipSignal = /\b(lead|led|managed|owner|owned|chu tri|lanh dao|quan ly|dẫn dắt|dẫn dat)\b/i.test(text)
  const outcomeSignal = /\b(reduced|increased|improved|grew|saved|faster|adoption|coverage|impact|result|giảm|tăng|cải thiện|tiet kiem|nhanh hơn|nhanh hon|kết quả|ket qua)\b/i.test(text)
  const specificity = Math.min(100, 30 + numberSignals.length * 18 + (leadershipSignal ? 18 : 0) + (outcomeSignal ? 18 : 0))
  return {
    id,
    source,
    label,
    text: text.trim(),
    numbers: numberSignals,
    leadershipSignal,
    outcomeSignal,
    specificity,
  }
}

export const extractCvClaims = (profile = {}) => {
  const claims = []
  const push = (source, label, text) => {
    if (!meaningful(text)) return
    const normalized = normalizeInterviewText(text)
    if (!normalized || claims.some((item) => normalizeInterviewText(item.text) === normalized)) return
    claims.push(claim(`claim-${claims.length + 1}`, source, label, text))
  }

  const role = profile.role || profile.identity?.role || profile.personal?.role
  const headline = profile.headline || profile.identity?.headline || profile.positioning?.headline
  const summary = profile.summary || profile.positioning?.shortBio || profile.positioning?.longBio
  push('profile', 'Định vị', role)
  push('profile', 'Headline', headline)
  push('profile', 'Tóm tắt', summary)

  const highlights = Array.isArray(profile.highlights) ? profile.highlights : []
  highlights.forEach((item, index) => {
    const text = typeof item === 'string' ? item : [item?.value, item?.label].filter(Boolean).join(' · ')
    push('proof', `Thành tích ${index + 1}`, text)
  })

  const proof = profile.proof && typeof profile.proof === 'object' ? profile.proof : {}
  Object.entries(proof).forEach(([key, value]) => push('proof', key, `${key}: ${value}`))

  const experience = Array.isArray(profile.experience) ? profile.experience : []
  experience.forEach((job, jobIndex) => {
    const context = [job?.role, job?.company].filter(Boolean).join(' · ') || `Kinh nghiệm ${jobIndex + 1}`
    push('experience', context, job?.summary)
    ;(Array.isArray(job?.bullets) ? job.bullets : []).forEach((bullet) => push('experience', context, bullet))
  })

  const projects = Array.isArray(profile.projects) ? profile.projects : []
  projects.forEach((project, projectIndex) => {
    const context = project?.name || `Dự án ${projectIndex + 1}`
    push('project', context, project?.impact)
    push('project', context, project?.result)
    push('project', context, project?.description)
    push('project', context, project?.solution)
  })

  if (!claims.length) {
    stringValues(profile)
      .filter(meaningful)
      .slice(0, 18)
      .forEach((text, index) => push('profile', `CV signal ${index + 1}`, text))
  }

  return claims
    .sort((a, b) => b.specificity - a.specificity)
    .slice(0, 28)
}

export const claimProbes = (item) => {
  const probes = []
  const text = normalizeInterviewText(item?.text || '')

  if (item?.leadershipSignal || /design system|quan ly|chu tri|lead/.test(text)) {
    probes.push('Phần nào anh/chị trực tiếp sở hữu và quyết định cuối cùng thuộc về ai?')
    probes.push('Quy mô team, phạm vi và các bên tham gia cụ thể là gì?')
  }
  if (item?.numbers?.length) {
    probes.push('Con số này lấy baseline nào, trong khoảng thời gian nào và đo bằng nguồn nào?')
    probes.push('Bao nhiêu phần của kết quả có thể quy cho đóng góp trực tiếp của anh/chị?')
  }
  if (item?.outcomeSignal) {
    probes.push('Điều gì thay đổi trước và sau quyết định của anh/chị? Có guardrail nào xấu đi không?')
  }
  if (/research|nghien cuu|user|ux|usability/.test(text)) {
    probes.push('Evidence người dùng nào khiến anh/chị thay đổi quyết định thiết kế?')
  }
  if (/system|component|token|design qa/.test(text)) {
    probes.push('Governance, adoption và exception của hệ thống này được vận hành thế nào?')
  }
  if (/ai|artificial|model|llm/.test(text)) {
    probes.push('Anh/chị xử lý trust, fallback và failure mode của AI như thế nào?')
  }

  probes.push('Nếu bỏ anh/chị khỏi dự án này, điều gì sẽ khác đi?')
  probes.push('Nếu làm lại, quyết định nào anh/chị sẽ thay đổi và vì sao?')
  return unique(probes).slice(0, 5)
}

export const matchQuestionsToClaim = (claimItem, questions = []) => {
  const claimSet = new Set(interviewTokens(claimItem?.text))
  return questions
    .map((question) => {
      const source = [
        question.question,
        question.why,
        question.example,
        ...(question.framework || []),
        ...(question.followUps || []),
      ].join(' ')
      const tokens = interviewTokens(source)
      const overlap = tokens.reduce((score, token) => score + (claimSet.has(token) ? 1 : 0), 0)
      const categoryBonus = claimItem?.source === 'project' && question.category === 'case' ? 2 : 0
      return { question, score: overlap + categoryBonus }
    })
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 3)
    .map((item) => item.question)
}

const countWords = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length
const hasAny = (text, expressions) => expressions.some((expression) => expression.test(text))
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(value)))

export const evaluateInterviewResponse = ({
  answer = '',
  evidence = '',
  confidence = 0,
  question = {},
  claims = [],
  elapsedSeconds = 0,
} = {}) => {
  const normalized = normalizeInterviewText(answer)
  const words = countWords(answer)
  const evidenceWords = countWords(evidence)
  const answerNumbers = answer.match(/\b\d+(?:[.,]\d+)?%?\+?\b/g) || []
  const cvNumbers = unique(claims.flatMap((item) => item.numbers || []))
  const unsupportedNumbers = answerNumbers.filter((number) => !cvNumbers.includes(number))

  const ownership = clamp(
    28 +
    (hasAny(normalized, [/\btoi\b/, /\bminh\b/, /\bmy\b/, /\bi\b/]) ? 26 : 0) +
    (hasAny(normalized, [/quyet dinh/, /so huu/, /truc tiep/, /implemented/, /designed/, /led/, /decided/]) ? 28 : 0) +
    (words >= 35 ? 12 : 0)
  )

  const structure = clamp(
    20 +
    (words >= 45 ? 24 : words >= 25 ? 14 : 0) +
    (hasAny(normalized, [/boi canh/, /situation/, /problem/, /van de/, /muc tieu/]) ? 18 : 0) +
    (hasAny(normalized, [/hanh dong/, /action/, /toi da/, /toi chon/, /quyet dinh/]) ? 18 : 0) +
    (hasAny(normalized, [/ket qua/, /result/, /impact/, /sau do/, /cuoi cung/]) ? 20 : 0)
  )

  const evidenceScore = clamp(
    18 +
    Math.min(34, evidenceWords * 2) +
    Math.min(24, answerNumbers.length * 12) +
    (hasAny(normalized, [/baseline/, /metric/, /do bang/, /du lieu/, /research/, /test/, /evidence/]) ? 18 : 0)
  )

  const depth = clamp(
    22 +
    (words >= 70 ? 30 : words >= 45 ? 20 : 0) +
    (hasAny(normalized, [/trade off/, /danh doi/, /constraint/, /rui ro/, /risk/]) ? 24 : 0) +
    (hasAny(normalized, [/hoc duoc/, /learning/, /lam lai/, /if i did it again/]) ? 18 : 0)
  )

  const questionTokens = new Set(interviewTokens(question.question))
  const answerTokenSet = new Set(interviewTokens(answer))
  const questionOverlap = Array.from(questionTokens).filter((token) => answerTokenSet.has(token)).length
  const relevance = clamp(45 + Math.min(35, questionOverlap * 9) + (words >= 20 ? 15 : 0))

  const targetSeconds = elapsedSeconds || 90
  const paceFit = elapsedSeconds
    ? elapsedSeconds >= 35 && elapsedSeconds <= 120 ? 88 : elapsedSeconds < 20 ? 48 : 62
    : clamp(Number(confidence || 0) * 18 + 10)

  let credibility = clamp(70 + Math.min(20, cvNumbers.filter((number) => answer.includes(number)).length * 8))
  if (unsupportedNumbers.length) credibility = clamp(credibility - unsupportedNumbers.length * 18)

  const dimensions = {
    relevance,
    structure,
    evidence: evidenceScore,
    ownership,
    depth,
    credibility,
    delivery: paceFit,
  }

  const overall = clamp(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.keys(dimensions).length)
  const warnings = []
  if (words < 25) warnings.push('Câu trả lời còn quá ngắn để chứng minh reasoning và impact.')
  if (words > 190) warnings.push('Câu trả lời có nguy cơ dài dòng; nên đưa kết luận và evidence lên sớm hơn.')
  if (evidenceWords < 6) warnings.push('Evidence/STAR anchor còn mỏng; thêm project, phạm vi sở hữu, trade-off và result.')
  if (unsupportedNumbers.length) warnings.push(`Có số liệu chưa thấy trong CV hiện tại: ${unsupportedNumbers.join(', ')}. Hãy xác minh trước khi dùng.`)
  if (ownership < 60) warnings.push('Ownership chưa rõ; phân biệt phần “tôi làm” với phần “team làm”.')
  if (depth < 60) warnings.push('Thiếu trade-off, constraint hoặc learning để chịu được câu hỏi đào sâu.')

  const strengths = Object.entries(dimensions)
    .filter(([, value]) => value >= 78)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key)

  return {
    overall,
    dimensions,
    warnings,
    strengths,
    words,
    elapsedSeconds: elapsedSeconds || targetSeconds,
    unsupportedNumbers,
  }
}

export const buildAdaptiveFollowUp = ({
  question = {},
  evaluation = {},
  answer = '',
  claims = [],
  sequence = 1,
} = {}) => {
  if (question?.adaptive?.isFollowUp) return null

  const dimensions = evaluation?.dimensions || {}
  const ranked = Object.entries(dimensions).sort((a, b) => Number(a[1] || 0) - Number(b[1] || 0))
  const unsupportedNumbers = evaluation?.unsupportedNumbers || []
  const relatedClaims = claims
    .map((item) => {
      const claimTokens = new Set(interviewTokens(item.text))
      const overlap = interviewTokens(answer).reduce((score, token) => score + (claimTokens.has(token) ? 1 : 0), 0)
      return { item, overlap }
    })
    .sort((a, b) => b.overlap - a.overlap)
  const relatedClaim = relatedClaims[0]?.overlap > 0 ? relatedClaims[0].item : null

  let dimension = ranked[0]?.[0] || 'evidence'
  if (unsupportedNumbers.length) dimension = 'credibility'

  const score = Number(dimensions[dimension] || 0)
  const shouldFollow = unsupportedNumbers.length > 0
    || Number(evaluation?.overall || 0) < 78
    || score < 65

  if (!shouldFollow) return null

  const payloads = {
    credibility: {
      question: unsupportedNumbers.length
        ? `Anh/chị vừa nêu ${unsupportedNumbers.join(', ')}. Con số này lấy từ đâu, baseline nào và anh/chị có thể bảo vệ nó thế nào?`
        : 'Chi tiết nào trong câu trả lời vừa rồi có thể kiểm chứng trực tiếp từ CV, dữ liệu hoặc artifact của anh/chị?',
      reason: 'Câu trả lời có credibility gap hoặc xuất hiện số liệu chưa thấy trong CV hiện tại.',
      framework: ['Nêu nguồn evidence', 'Xác định baseline/khoảng thời gian', 'Phân biệt correlation với contribution', 'Nói rõ giới hạn dữ liệu'],
      example: 'Con số này đến từ [nguồn], baseline là [X] trong [thời gian]. Phần tôi trực tiếp đóng góp là [scope], còn [phần khác] thuộc team/hệ thống.',
      avoid: ['Bịa nguồn đo sau khi đã nêu số', 'Nhận toàn bộ kết quả của team thành contribution cá nhân'],
    },
    evidence: {
      question: relatedClaim
        ? `Anh/chị có thể chứng minh claim “${relatedClaim.text}” bằng một evidence cụ thể nào?`
        : 'Cho tôi một evidence cụ thể cho kết quả anh/chị vừa nêu: baseline, cách đo và kết quả sau thay đổi là gì?',
      reason: 'Evidence signal thấp; câu trả lời đang thiên về mô tả hơn là chứng minh.',
      framework: ['Baseline', 'Hành động/decision', 'Cách đo', 'Kết quả', 'Giới hạn hoặc caveat'],
      example: 'Trước thay đổi, [baseline]. Tôi thực hiện [decision]. Nhóm đo bằng [method/source] và sau [time] tín hiệu thay đổi thành [result].',
      avoid: ['Dùng tính từ thay cho số liệu/evidence', 'Chỉ kể hoạt động mà không có outcome'],
    },
    ownership: {
      question: 'Trong phần anh/chị vừa kể, quyết định nào do anh/chị trực tiếp sở hữu, và phần nào là đóng góp của team/stakeholder khác?',
      reason: 'Ownership chưa rõ; interviewer có thể chưa phân biệt được contribution cá nhân với kết quả của team.',
      framework: ['Scope cá nhân', 'Decision cá nhân', 'Ai phối hợp', 'Ai phê duyệt', 'Outcome thuộc cấp nào'],
      example: 'Tôi trực tiếp sở hữu [scope] và quyết định [X]. [Team/role] chịu trách nhiệm [Y]. Tôi phối hợp ở [Z] nhưng không nhận đó là contribution riêng của mình.',
      avoid: ['Dùng “chúng tôi” cho toàn bộ câu trả lời', 'Nhận credit của cả squad/team'],
    },
    depth: {
      question: 'Trade-off khó nhất trong quyết định vừa rồi là gì, và nếu làm lại anh/chị sẽ thay đổi điều gì?',
      reason: 'Câu trả lời thiếu trade-off/constraint/learning nên chưa cho thấy độ sâu judgment.',
      framework: ['Constraint', 'Các option', 'Trade-off', 'Decision', 'Learning nếu làm lại'],
      example: 'Chúng tôi phải đánh đổi [A] với [B]. Tôi chọn [option] vì [reason]. Hệ quả là [cost]. Nếu làm lại, tôi sẽ [learning].',
      avoid: ['Mô tả mọi quyết định như đều đúng', 'Không thừa nhận chi phí hoặc hạn chế'],
    },
    relevance: {
      question: 'Nếu chỉ có 30 giây, anh/chị sẽ trả lời lại câu này bằng một kết luận và một evidence quan trọng nhất như thế nào?',
      reason: 'Question-fit thấp; câu trả lời có dấu hiệu lệch trọng tâm hoặc chưa đưa kết luận lên sớm.',
      framework: ['Kết luận 1 câu', 'Evidence mạnh nhất', 'Một trade-off hoặc result', 'Dừng đúng lúc'],
      example: 'Điểm chính là [answer]. Evidence mạnh nhất là [proof]. Vì vậy tôi chọn [decision] và đạt [result].',
      avoid: ['Mở đầu quá dài', 'Thêm context không phục vụ câu hỏi'],
    },
    structure: {
      question: 'Hãy cấu trúc lại câu trả lời vừa rồi theo Bối cảnh → Quyết định/Hành động → Kết quả → Learning.',
      reason: 'Cấu trúc câu trả lời chưa đủ rõ để interviewer theo dõi reasoning.',
      framework: ['Bối cảnh', 'Vai trò', 'Decision/action', 'Result', 'Learning'],
      example: 'Bối cảnh là [X]. Vai trò của tôi là [Y]. Tôi quyết định [Z] vì [reason]. Kết quả [result]. Tôi học được [learning].',
      avoid: ['Nhảy qua lại giữa nhiều thời điểm', 'Kết thúc mà không có result/learning'],
    },
    delivery: {
      question: 'Hãy trả lời lại ngắn hơn, giữ một thông điệp chính và kết thúc trong khoảng 60–90 giây.',
      reason: 'Delivery signal cho thấy thời lượng/nhịp trả lời chưa tối ưu.',
      framework: ['Headline', '1 ví dụ', '1 result', 'Kết thúc'],
      example: 'Tôi sẽ trả lời bằng một headline, một ví dụ có evidence và kết luận ngay khi đủ thông tin.',
      avoid: ['Kể toàn bộ lịch sử dự án', 'Thêm chi tiết không giúp quyết định tuyển dụng'],
    },
  }

  const selected = payloads[dimension] || payloads.evidence
  return {
    id: `adaptive-${question.id || 'question'}-${dimension}-${sequence}`,
    question: selected.question,
    why: selected.reason,
    framework: selected.framework,
    example: selected.example,
    followUps: [],
    avoid: selected.avoid,
    category: question.category || 'challenge',
    market: 'adaptive',
    sourceIds: [],
    adaptive: {
      isFollowUp: true,
      parentQuestionId: question.id || '',
      rootQuestionId: question?.adaptive?.rootQuestionId || question.id || '',
      triggerDimension: dimension,
      triggerScore: score,
      reason: selected.reason,
      relatedClaimId: relatedClaim?.id || '',
    },
  }
}

export const aggregateInterviewReport = (responses = []) => {
  const scored = responses.filter((item) => item?.evaluation)
  if (!scored.length) {
    return {
      overall: 0,
      answered: 0,
      dimensions: {},
      warnings: [],
      strongest: [],
      weakest: [],
      evidenceReady: 0,
    }
  }

  const keys = ['relevance','structure','evidence','ownership','depth','credibility','delivery']
  const dimensions = Object.fromEntries(keys.map((key) => [
    key,
    clamp(scored.reduce((sum, item) => sum + Number(item.evaluation.dimensions?.[key] || 0), 0) / scored.length),
  ]))

  const ranked = Object.entries(dimensions).sort((a, b) => b[1] - a[1])
  const warnings = unique(scored.flatMap((item) => item.evaluation.warnings || [])).slice(0, 8)

  const adaptiveResponses = responses.filter((item) => item?.adaptive?.isFollowUp)
  const adaptiveDimensions = unique(adaptiveResponses.map((item) => item.adaptive?.triggerDimension))

  return {
    overall: clamp(scored.reduce((sum, item) => sum + Number(item.evaluation.overall || 0), 0) / scored.length),
    answered: scored.length,
    dimensions,
    warnings,
    strongest: ranked.slice(0, 2).map(([key, score]) => ({ key, score })),
    weakest: ranked.slice(-2).reverse().map(([key, score]) => ({ key, score })),
    evidenceReady: responses.filter((item) => String(item?.evidence || '').trim().length >= 12).length,
    adaptiveCount: adaptiveResponses.length,
    adaptiveDimensions,
    adaptiveReasons: unique(adaptiveResponses.map((item) => item.adaptive?.reason)).filter(Boolean).slice(0, 6),
  }
}

export const applicationKeywords = (application = {}) =>
  unique(interviewTokens([
    application.role,
    application.company,
    application.jd,
    application.notes,
    application.status,
  ].filter(Boolean).join(' '))).slice(0, 60)

export const questionRelevanceScore = (question, application = {}, claims = []) => {
  const appTokens = new Set(applicationKeywords(application))
  const claimTokens = new Set(claims.slice(0, 12).flatMap((item) => interviewTokens(item.text)))
  const questionText = [
    question.question,
    question.why,
    question.example,
    ...(question.framework || []),
    ...(question.followUps || []),
  ].join(' ')
  const tokens = interviewTokens(questionText)
  const appScore = tokens.reduce((sum, token) => sum + (appTokens.has(token) ? 3 : 0), 0)
  const claimScore = tokens.reduce((sum, token) => sum + (claimTokens.has(token) ? 1 : 0), 0)
  const vietnamBonus = question.market === 'vietnam' ? 2 : 0
  return appScore + claimScore + vietnamBonus
}
