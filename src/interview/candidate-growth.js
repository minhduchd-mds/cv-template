import { getInterviewScenario, scenarioPracticeQuestions } from './interview-scenarios.js'

// A simple coaching layer on top of local practice history.
// Scores are practice heuristics, not hiring probability or validated ability ratings.
export const candidateGoals = Object.freeze([
  { id: 'design', label: 'UI/UX & Product Design', scenarioId: 'ux-portfolio', pack: 'design' },
  { id: 'engineering', label: 'Lập trình & công nghệ', scenarioId: 'frontend-review', pack: 'frontend' },
  { id: 'product', label: 'Product / BA', scenarioId: 'product-case', pack: 'product' },
  { id: 'ai', label: 'AI / Dữ liệu', scenarioId: 'ai-project-defense', pack: 'technical' },
  { id: 'leadership', label: 'Senior / Leadership', scenarioId: 'leadership-conflict', pack: 'general' },
  { id: 'general', label: 'Phỏng vấn tổng quát', scenarioId: 'hr-screening', pack: 'general' },
])

export const inferCandidateGoal = ({ rolePackId = '', profileRole = '', templateId = '' } = {}) => {
  const text = [rolePackId, profileRole, templateId].join(' ').toLocaleLowerCase('vi')
  if (/ux|ui|design|research|portfolio|creative/.test(text)) return 'design'
  if (/lead|director|executive|manager|head of/.test(text)) return 'leadership'
  if (/ai|machine learning|data|analyst|business intelligence|ml engineer/.test(text)) return 'ai'
  if (/front.?end|back.?end|full.?stack|developer|engineering|software|devops|code|mobile/.test(text)) return 'engineering'
  if (/product|business analyst|business-analysis|product-owner|scrum|strategy/.test(text)) return 'product'
  return 'general'
}

const focusGuide = {
  relevance: { label: 'Đúng trọng tâm', action: 'Trả lời kết luận chính trong câu đầu tiên.', check: 'Có trả lời thẳng vào câu hỏi?' },
  structure: { label: 'Cấu trúc câu trả lời', action: 'Sắp xếp: Bối cảnh → Hành động → Kết quả.', check: 'Người nghe có theo được 3 ý?' },
  evidence: { label: 'Bằng chứng & số liệu', action: 'Nêu một kết quả có nguồn và cách đo rõ ràng.', check: 'Có baseline hoặc artefact kiểm tra được?' },
  ownership: { label: 'Vai trò cá nhân', action: 'Phân biệt điều mình làm với phần cả nhóm làm.', check: 'Có nêu quyết định do mình trực tiếp chịu trách nhiệm?' },
  depth: { label: 'Tư duy & đánh đổi', action: 'Nêu lựa chọn khác và lý do không chọn nó.', check: 'Có constraint và trade-off thực tế?' },
  credibility: { label: 'Tính xác thực', action: 'Kiểm tra mọi con số trước khi nhắc lại.', check: 'Số liệu có khớp CV và bằng chứng đang có?' },
  delivery: { label: 'Diễn đạt', action: 'Tập trả lời rõ trong khoảng 60–90 giây.', check: 'Một thông điệp, một ví dụ, một kết quả?' },
}

const validNumber = value => Number.isFinite(Number(value)) ? Number(value) : null
const safeScores = session => {
  const values = Object.entries(session?.report?.dimensions || {})
    .filter(([key, value]) => focusGuide[key] && validNumber(value) !== null)
    .map(([key, value]) => ({ key, value: Number(value) }))
  return values.sort((a, b) => a.value - b.value)
}

export const buildCandidateGrowthPlan = ({
  sessions = [],
  claims = [],
  claimEvidence = {},
  storyBank = [],
  goalId = 'general',
} = {}) => {
  const goal = candidateGoals.find(item => item.id === goalId) || candidateGoals[5]
  const history = (Array.isArray(sessions) ? sessions : [])
    .filter(session => session?.report && safeScores(session).length &&
      (!session.growthGoalId || session.growthGoalId === goal.id))
    .slice()
    .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0))
  const latest = history[0] || null
  const recent = history.slice(0, 3)
  const dimensions = Object.fromEntries(
    Object.keys(focusGuide).map(key => {
      const values = recent.map(session => validNumber(session.report?.dimensions?.[key]))
        .filter(value => value !== null)
      return [key, values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null]
    })
  )
  const weakest = Object.entries(dimensions)
    .filter(([, value]) => value !== null)
    .sort((a, b) => a[1] - b[1])[0]
  const unverified = (Array.isArray(claims) ? claims : []).filter(item => !claimEvidence[item.id]?.ready)
  const focusKey = weakest?.[0] || (unverified.length ? 'evidence' : 'structure')
  const focus = focusGuide[focusKey]
  // Only compare practice signals for sessions with matching scenario and job
  // context. Otherwise report "not comparable" instead of an invented trend.
  const baseline = latest && history.slice(1).find(session =>
    (session.scenarioId || '') === (latest.scenarioId || '') &&
    (session.applicationId || '') === (latest.applicationId || '') &&
    session.stageId === latest.stageId &&
    Number(session.baseQuestions || 0) === Number(latest.baseQuestions || 0)
  )
  const delta = baseline
    ? Number(latest.report.overall) - Number(baseline.report.overall)
    : null
  const suggestions = [
    focus.action,
    unverified.length
      ? 'Chọn 1 thành tích CV chưa xác minh và ghi bằng chứng thật.'
      : 'Chọn 1 câu trả lời tốt để lưu vào Story Bank.',
    'Luyện lại cùng một dạng câu hỏi và so phần đã cải thiện.',
  ]
  return {
    goalId: goal.id,
    goalLabel: goal.label,
    scenarioId: latest?.scenarioId && getInterviewScenario(latest.scenarioId)
      ? latest.scenarioId
      : goal.scenarioId,
    hasBaseline: Boolean(latest),
    focusKey,
    focusLabel: focus.label,
    focusScore: weakest?.[1] ?? null,
    checklist: suggestions,
    selfCheck: focus.check,
    sessionsCount: history.length,
    verifiedClaims: (Array.isArray(claims) ? claims : []).length - unverified.length,
    pendingClaims: unverified.length,
    storyCount: Array.isArray(storyBank) ? storyBank.length : 0,
    delta: Number.isFinite(delta) ? Math.round(delta) : null,
    isComparable: baseline !== null && Boolean(baseline),
    title: latest ? 'Luyện lại điểm cần cải thiện' : 'Tạo mốc luyện tập đầu tiên',
    message: latest
      ? 'Tập trung một kỹ năng mỗi lượt, rồi so sánh lần luyện tiếp theo.'
      : 'Không cần chuẩn bị nhiều: bắt đầu bằng 3 câu ngắn.',
  }
}

export const buildMicroPracticeSet = ({
  goalId = 'general',
  sessions = [],
  questions = [],
  count = 3,
} = {}) => {
  const goal = candidateGoals.find(item => item.id === goalId) || candidateGoals[5]
  const history = (Array.isArray(sessions) ? sessions : []).filter(
    session => !session?.growthGoalId || session.growthGoalId === goal.id)
  const latest = history.find(session => session?.report)
  const selected = []
  const seen = new Set()
  const add = question => {
    if (question?.id && !seen.has(question.id) && selected.length < count) {
      seen.add(question.id)
      selected.push(question)
    }
  }
  // Rehearse the single weakest answered question only when it exists in the
  // canonical catalog or a declared authored scenario, not by trusting
  // arbitrary strings from localStorage.
  const scenario = getInterviewScenario(goal.scenarioId)
  const catalog = [...(scenario?.questions || []), ...(Array.isArray(questions) ? questions : [])]
  const weakestResponse = (latest?.responses || [])
    .filter(r => r?.evaluation?.dimensions && r?.questionId && !r?.adaptive?.isFollowUp)
    .map(r => ({
      id: r.questionId,
      score: Math.min(...Object.values(r.evaluation.dimensions)
        .filter(value => Number.isFinite(Number(value))).map(Number)),
    }))
    .filter(entry => Number.isFinite(entry.score))
    .sort((a, b) => a.score - b.score)[0]
  if (weakestResponse) add(catalog.find(q => q.id === weakestResponse.id))
  scenarioPracticeQuestions(goal.scenarioId, count, questions).forEach(add)
  ;(Array.isArray(questions) ? questions : []).forEach(add)
  return selected.slice(0, count)
}
