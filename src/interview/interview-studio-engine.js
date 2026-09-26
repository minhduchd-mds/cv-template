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

export const interviewerModes = [
  {
    id: 'recruiter',
    label: 'Recruiter',
    shortLabel: 'HR',
    description: 'Ưu tiên fit, clarity, motivation và khả năng giao tiếp ngắn gọn.',
    bias: ['relevance', 'structure', 'delivery'],
    opening: 'Tôi sẽ bắt đầu rộng, sau đó kiểm tra mức phù hợp và tính nhất quán trong câu trả lời.',
  },
  {
    id: 'hiring-manager',
    label: 'Hiring Manager',
    shortLabel: 'HM',
    description: 'Đào sâu ownership, impact, stakeholder và judgment trong công việc thật.',
    bias: ['ownership', 'evidence', 'depth'],
    opening: 'Tôi quan tâm anh/chị thực sự sở hữu phần nào, quyết định gì và tạo ra thay đổi gì.',
  },
  {
    id: 'craft',
    label: 'Craft / Technical',
    shortLabel: 'TECH',
    description: 'Tập trung reasoning, system thinking, implementation, quality bar và trade-off.',
    bias: ['depth', 'evidence', 'credibility'],
    opening: 'Tôi sẽ hỏi sâu vào cách anh/chị ra quyết định và kiểm chứng chất lượng.',
  },
  {
    id: 'executive',
    label: 'Executive / Final',
    shortLabel: 'FINAL',
    description: 'Tập trung judgment, leadership, conflict, risk và khả năng nhìn ở cấp hệ thống.',
    bias: ['depth', 'ownership', 'relevance'],
    opening: 'Tôi sẽ kiểm tra cách anh/chị ưu tiên, chịu trách nhiệm và ra quyết định khi thông tin chưa đủ.',
  },
  {
    id: 'skeptical',
    label: 'Skeptical Panel',
    shortLabel: 'PANEL',
    description: 'Chủ động challenge claim, metric và contribution để kiểm tra độ chắc của evidence.',
    bias: ['credibility', 'evidence', 'ownership'],
    opening: 'Tôi sẽ giả định mọi claim cần được chứng minh bằng evidence cụ thể trước khi chấp nhận.',
  },
]

export const pressureLevels = [
  {
    id: 'supportive',
    label: 'Supportive',
    threshold: 70,
    followUpBonus: 0,
    description: 'Chỉ đào sâu khi có gap tương đối rõ.',
  },
  {
    id: 'realistic',
    label: 'Realistic',
    threshold: 78,
    followUpBonus: 0,
    description: 'Mô phỏng nhịp phỏng vấn thực tế: đủ tốt vẫn có thể bị hỏi tiếp.',
  },
  {
    id: 'pressure',
    label: 'Pressure',
    threshold: 86,
    followUpBonus: 1,
    description: 'Challenge mạnh hơn vào claim, số liệu và ownership.',
  },
]

const interviewerConfig = (mode = 'hiring-manager', pressure = 'realistic') => ({
  mode: interviewerModes.find((item) => item.id === mode) || interviewerModes[1],
  pressure: pressureLevels.find((item) => item.id === pressure) || pressureLevels[1],
})

const interviewerQuestion = (question, mode, pressure, dimension) => {
  if (!question) return question
  if (mode === 'skeptical') {
    if (dimension === 'credibility' || dimension === 'evidence') {
      return `Tôi chưa bị thuyết phục. ${question}`
    }
    return `Hãy chứng minh rõ hơn: ${question}`
  }
  if (mode === 'executive') return `Ở góc nhìn người chịu trách nhiệm cuối cùng: ${question}`
  if (mode === 'craft') return `Đi sâu vào reasoning và constraint: ${question}`
  if (pressure === 'pressure') return `Tôi sẽ challenge điểm này: ${question}`
  if (mode === 'recruiter') return `Trả lời ngắn gọn và cụ thể: ${question}`
  return question
}

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
  interviewerMode = 'hiring-manager',
  pressureLevel = 'realistic',
} = {}) => {
  if (question?.adaptive?.isFollowUp) return null

  const dimensions = evaluation?.dimensions || {}
  const config = interviewerConfig(interviewerMode, pressureLevel)
  const bias = new Set(config.mode.bias || [])
  const ranked = Object.entries(dimensions)
    .map(([key, value]) => [key, Number(value || 0), Number(value || 0) - (bias.has(key) ? 10 : 0)])
    .sort((a, b) => a[2] - b[2])
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
  const threshold = Number(config.pressure.threshold || 78)
  const shouldFollow = unsupportedNumbers.length > 0
    || Number(evaluation?.overall || 0) < threshold
    || score < Math.max(62, threshold - 12)

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
    id: `adaptive-${question.id || 'question'}-${interviewerMode}-${dimension}-${sequence}`,
    question: interviewerQuestion(selected.question, interviewerMode, pressureLevel, dimension),
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
      interviewerMode: config.mode.id,
      interviewerLabel: config.mode.label,
      pressureLevel: config.pressure.id,
      pressureLabel: config.pressure.label,
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
    interviewerModes: unique(adaptiveResponses.map((item) => item.adaptive?.interviewerLabel)).filter(Boolean),
    pressureLevels: unique(adaptiveResponses.map((item) => item.adaptive?.pressureLabel)).filter(Boolean),
    adaptiveTrace: adaptiveResponses.map((item, index) => ({
      index: index + 1,
      questionId: item.questionId,
      question: item.question,
      parentQuestionId: item.adaptive?.parentQuestionId || '',
      triggerDimension: item.adaptive?.triggerDimension || '',
      triggerScore: Number(item.adaptive?.triggerScore || 0),
      interviewerLabel: item.adaptive?.interviewerLabel || '',
      pressureLabel: item.adaptive?.pressureLabel || '',
      reason: item.adaptive?.reason || '',
    })),
  }
}

export const relatedClaimsForAnswer = (answer = '', claims = [], limit = 3) => {
  const answerTokens = new Set(interviewTokens(answer))
  return claims
    .map((item) => {
      const tokens = interviewTokens(item.text)
      const overlap = tokens.reduce((score, token) => score + (answerTokens.has(token) ? 1 : 0), 0)
      const evidenceBonus = item.numbers?.some((number) => String(answer).includes(number)) ? 3 : 0
      return { item, score: overlap + evidenceBonus }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item)
}

export const buildNextPracticePlan = ({
  report = {},
  responses = [],
  questions = [],
  claims = [],
  application = {},
} = {}) => {
  const dimensions = report?.dimensions || {}
  const rankedWeak = Object.entries(dimensions)
    .sort((a, b) => Number(a[1] || 0) - Number(b[1] || 0))
    .slice(0, 3)

  const playbook = {
    evidence: {
      label: 'Evidence defense',
      objective: 'Mỗi câu trả lời phải có baseline, nguồn đo, contribution và result có thể bảo vệ.',
      search: ['metric', 'result', 'impact', 'evidence', 'kết quả', 'đo'],
    },
    ownership: {
      label: 'Ownership clarity',
      objective: 'Phân biệt rõ phần anh/chị trực tiếp sở hữu với phần thuộc team, stakeholder hoặc hệ thống.',
      search: ['role', 'ownership', 'stakeholder', 'team', 'directly', 'vai trò'],
    },
    depth: {
      label: 'Trade-off & judgment',
      objective: 'Thêm constraint, option, trade-off và learning để chịu được câu hỏi đào sâu.',
      search: ['trade-off', 'decision', 'constraint', 'failure', 'challenge', 'quyết định'],
    },
    relevance: {
      label: 'Answer focus',
      objective: 'Đưa kết luận lên sớm, chọn một evidence mạnh và dừng đúng lúc.',
      search: ['why', 'tell me', 'fit', 'summary', 'giới thiệu', 'phù hợp'],
    },
    structure: {
      label: 'Answer structure',
      objective: 'Luyện Bối cảnh → Vai trò → Decision/Action → Result → Learning.',
      search: ['behavioral', 'project', 'failure', 'case', 'dự án'],
    },
    credibility: {
      label: 'Credibility check',
      objective: 'Loại bỏ số liệu không xác minh được và nối claim với CV/artifact thật.',
      search: ['metric', 'result', 'impact', 'achievement', 'thành tích'],
    },
    delivery: {
      label: '60–90 second delivery',
      objective: 'Giữ một thông điệp chính, một ví dụ, một result và kết thúc trong 60–90 giây.',
      search: ['introduce', 'project', 'summary', 'experience', 'kinh nghiệm'],
    },
  }

  const weakKeys = rankedWeak.map(([key]) => key)
  const applicationTokenSet = new Set(applicationKeywords(application))
  const usedIds = new Set(responses.map((item) => item.questionId).filter(Boolean))
  const candidates = questions
    .filter((question) => !question?.adaptive?.isFollowUp)
    .map((question) => {
      const text = normalizeInterviewText([
        question.question,
        question.why,
        ...(question.framework || []),
        ...(question.followUps || []),
      ].join(' '))
      let score = questionRelevanceScore(question, application, claims)
      weakKeys.forEach((key, index) => {
        const terms = playbook[key]?.search || []
        if (terms.some((term) => text.includes(normalizeInterviewText(term)))) score += 8 - index * 2
      })
      interviewTokens(text).forEach((token) => {
        if (applicationTokenSet.has(token)) score += 1
      })
      if (usedIds.has(question.id)) score -= 8
      return { question, score }
    })
    .sort((a, b) => b.score - a.score)

  const recommendedQuestions = []
  for (const entry of candidates) {
    if (recommendedQuestions.length >= 5) break
    if (!recommendedQuestions.some((item) => item.id === entry.question.id)) recommendedQuestions.push(entry.question)
  }

  const claimPriority = claims
    .map((item) => ({
      item,
      score:
        (item.numbers?.length ? 3 : 0)
        + (item.leadershipSignal ? 2 : 0)
        + (item.outcomeSignal ? 2 : 0)
        + (relatedClaimsForAnswer(responses.map((response) => response.answer).join(' '), [item], 1).length ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.item)

  const focusAreas = rankedWeak.map(([key, score]) => ({
    key,
    score: Number(score || 0),
    label: playbook[key]?.label || key,
    objective: playbook[key]?.objective || 'Luyện lại dimension này với evidence cụ thể hơn.',
  }))

  return {
    focusAreas,
    recommendedQuestionIds: recommendedQuestions.map((item) => item.id),
    recommendedQuestions: recommendedQuestions.map((item) => ({
      id: item.id,
      question: item.question,
      category: item.category,
    })),
    claimIds: claimPriority.map((item) => item.id),
    claims: claimPriority.map((item) => ({
      id: item.id,
      text: item.text,
      label: item.label,
    })),
    summary: focusAreas.length
      ? `Ưu tiên ${focusAreas.map((item) => item.label).join(' → ')} trong vòng luyện tiếp theo.`
      : 'Chưa có đủ dữ liệu để tạo practice plan.',
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


export const analyzeApplicationEvidence = ({
  application = {},
  claims = [],
  stories = [],
  questions = [],
} = {}) => {
  const jdTokens = applicationKeywords(application)
  const evidenceItems = [
    ...claims.map((item) => ({
      id: item.id,
      type: 'claim',
      label: item.label,
      text: item.text,
      score: 0,
    })),
    ...stories.map((item) => ({
      id: item.id,
      type: 'story',
      label: item.title || item.categoryLabel || 'Story',
      text: [item.question, item.answer, item.evidence].filter(Boolean).join(' '),
      score: 0,
    })),
  ]

  const evidenceTokenSet = new Set(evidenceItems.flatMap((item) => interviewTokens(item.text)))
  const matchedSignals = jdTokens.filter((token) => evidenceTokenSet.has(token))
  const gapSignals = jdTokens.filter((token) => !evidenceTokenSet.has(token))

  const rankedEvidence = evidenceItems
    .map((item) => {
      const tokenSet = new Set(interviewTokens(item.text))
      const overlap = jdTokens.reduce((score, token) => score + (tokenSet.has(token) ? 1 : 0), 0)
      const numberBonus = /\b\d+(?:[.,]\d+)?%?\+?\b/.test(item.text) ? 1 : 0
      return { ...item, score: overlap + numberBonus }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)

  const recommendedQuestions = [...questions]
    .map((question) => ({
      id: question.id,
      question: question.question,
      category: question.category,
      score: questionRelevanceScore(question, application, claims),
    }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 8)

  const denominator = Math.max(1, jdTokens.length)
  const coverage = clamp((matchedSignals.length / denominator) * 100)

  const status = normalizeInterviewText(application.status || '')
  let recommendedStage = 'hiring-manager'
  if (/screen|hr|phone|recruit/.test(status)) recommendedStage = 'hr'
  else if (/technical|tech/.test(status)) recommendedStage = 'technical'
  else if (/portfolio|case/.test(status)) recommendedStage = 'portfolio'
  else if (/final|offer/.test(status)) recommendedStage = 'final'

  const focusSignals = gapSignals.slice(0, 10)
  const strengths = matchedSignals.slice(0, 10)
  const topClaims = rankedEvidence.filter((item) => item.type === 'claim').slice(0, 5)
  const topStories = rankedEvidence.filter((item) => item.type === 'story').slice(0, 4)

  return {
    coverage,
    jdSignalCount: jdTokens.length,
    matchedSignalCount: matchedSignals.length,
    matchedSignals: strengths,
    gapSignals: focusSignals,
    topClaims,
    topStories,
    recommendedQuestions,
    recommendedStage,
    summary: jdTokens.length
      ? `${matchedSignals.length}/${jdTokens.length} tín hiệu JD đã có evidence trong CV hoặc Story Bank.`
      : 'Chưa có JD đủ chi tiết để tạo Evidence Coverage.',
  }
}

export const buildApplicationPracticeSet = ({
  application = {},
  claims = [],
  stories = [],
  questions = [],
  limit = 5,
} = {}) => {
  const analysis = analyzeApplicationEvidence({ application, claims, stories, questions })
  const recommendedIds = new Set(analysis.recommendedQuestions.map((item) => item.id))
  const ranked = [...questions]
    .map((question) => {
      let score = questionRelevanceScore(question, application, claims)
      if (recommendedIds.has(question.id)) score += 5
      const gapText = analysis.gapSignals.join(' ')
      const gapTokens = new Set(interviewTokens(gapText))
      const questionTokens = interviewTokens([
        question.question,
        question.why,
        ...(question.framework || []),
      ].join(' '))
      score += questionTokens.reduce((sum, token) => sum + (gapTokens.has(token) ? 2 : 0), 0)
      return { question, score }
    })
    .sort((a, b) => b.score - a.score)

  const selected = []
  const categories = new Set()
  ranked.forEach(({ question }) => {
    if (selected.length >= limit) return
    if (!categories.has(question.category) || selected.length >= Math.ceil(limit / 2)) {
      selected.push(question)
      categories.add(question.category)
    }
  })
  ranked.forEach(({ question }) => {
    if (selected.length >= limit) return
    if (!selected.some((item) => item.id === question.id)) selected.push(question)
  })
  return selected.slice(0, limit)
}


export const buildInterviewStageMatrix = ({
  application = {},
  claims = [],
  stories = [],
  questions = [],
} = {}) => {
  const analysis = analyzeApplicationEvidence({ application, claims, stories, questions })
  const stages = [
    {
      id: 'hr',
      label: 'HR / Recruiter',
      focus: ['motivation', 'fit', 'salary', 'timeline', 'communication'],
      evidence: 'Positioning rõ, lý do chuyển việc tích cực, kỳ vọng và timeline nhất quán.',
    },
    {
      id: 'hiring-manager',
      label: 'Hiring Manager',
      focus: ['ownership', 'impact', 'stakeholder', 'priority', 'decision'],
      evidence: 'Project có ownership rõ, trade-off, outcome và cách phối hợp với stakeholder.',
    },
    {
      id: 'technical',
      label: 'Technical / Craft',
      focus: ['system', 'implementation', 'debug', 'quality', 'architecture', 'tool'],
      evidence: 'Decision kỹ thuật/craft, constraint, quality bar, cách kiểm chứng và regression control.',
    },
    {
      id: 'portfolio',
      label: 'Portfolio / Case',
      focus: ['problem', 'user', 'research', 'design', 'metric', 'trade-off'],
      evidence: 'Problem → evidence → decision → trade-off → result; phân biệt rõ contribution cá nhân.',
    },
    {
      id: 'final',
      label: 'Final / Leadership',
      focus: ['leadership', 'failure', 'conflict', 'learning', 'strategy', 'culture'],
      evidence: 'Judgment, reflection, cách dẫn dắt và cách ra quyết định khi thông tin chưa đủ.',
    },
  ]

  const jdSet = new Set(applicationKeywords(application))
  const claimText = claims.map((item) => normalizeInterviewText(item.text)).join(' ')
  const storyText = stories.map((item) => normalizeInterviewText([item.answer, item.evidence].join(' '))).join(' ')

  return stages.map((stage) => {
    const relevantQuestions = questions
      .filter((question) => {
        const q = normalizeInterviewText([
          question.question,
          question.why,
          ...(question.framework || []),
        ].join(' '))
        const stageFit = stage.focus.some((term) => q.includes(normalizeInterviewText(term)))
        const jdFit = interviewTokens(q).some((token) => jdSet.has(token))
        return stageFit || jdFit
      })
      .map((question) => ({
        ...question,
        score: questionRelevanceScore(question, application, claims)
          + stage.focus.reduce((score, term) =>
            score + (normalizeInterviewText(question.question).includes(normalizeInterviewText(term)) ? 2 : 0), 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    const evidenceHits = stage.focus.filter((term) => {
      const normalized = normalizeInterviewText(term)
      return claimText.includes(normalized) || storyText.includes(normalized)
    }).length

    const jdHits = stage.focus.filter((term) => jdSet.has(normalizeInterviewText(term))).length
    const preparedness = clamp(35 + evidenceHits * 10 + jdHits * 7 + Math.min(18, relevantQuestions.length * 4))

    return {
      id: stage.id,
      label: stage.label,
      focus: stage.focus,
      evidence: stage.evidence,
      preparedness,
      questions: relevantQuestions,
      recommended: analysis.recommendedStage === stage.id,
    }
  })
}
