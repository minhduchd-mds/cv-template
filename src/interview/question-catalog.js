import {
  buildIndustryPracticeQuestions,
  buildTemplatePracticeQuestions,
  coreQuestions,
  globalQuestionBank,
  industryPracticeProfiles,
  interviewPacks,
  templateDefaultIndustry,
  templateInterviewPack,
  vietnamQuestionBank,
} from '../data/interview-prep.js'

// One canonical catalogue for Vue and the compiled static recovery app.
// Keep authored questions and their provenance unchanged.
export const resolvePracticeIndustry = (templateId, industryId = 'auto') => (
  industryId && industryId !== 'auto' && industryPracticeProfiles[industryId]
    ? industryId
    : templateDefaultIndustry[templateId] || 'technology-software'
)

export const interviewStageWeight = (category, stageId = 'hiring-manager') => {
  const rank = {
    hr: { core: 1, behavioral: 2, challenge: 3, role: 4, case: 5, askback: 6 },
    'hiring-manager': { role: 1, core: 2, case: 3, behavioral: 4, challenge: 5, askback: 6 },
    technical: { role: 1, case: 2, challenge: 3, core: 4, behavioral: 5, askback: 6 },
    portfolio: { case: 1, role: 2, core: 3, behavioral: 4, challenge: 5, askback: 6 },
    final: { behavioral: 1, challenge: 2, role: 3, core: 4, case: 5, askback: 6 },
  }
  return rank[stageId]?.[category] || 9
}

const seniorityCategoryBonus = (category, level = 'Senior') => {
  const maps = {
    Entry: { core: 14, behavioral: 12, role: 8, case: 3, challenge: 0, askback: 4 },
    Mid: { role: 12, behavioral: 9, case: 9, core: 7, challenge: 4, askback: 3 },
    Senior: { case: 14, challenge: 13, role: 11, behavioral: 7, core: 4, askback: 3 },
    Lead: { challenge: 16, case: 14, behavioral: 11, role: 9, core: 2, askback: 4 },
    Director: { challenge: 18, behavioral: 14, case: 13, role: 8, core: 1, askback: 5 },
  }
  return maps[level]?.[category] || 0
}

export const practiceContextBonus = (question = {}, context = {}) => {
  const {
    templateId = 'ats-clean',
    industryId = 'auto',
    rolePackId = templateInterviewPack[templateId] || 'general',
    seniority = 'Senior',
    stageId = 'hiring-manager',
    market = 'vietnam',
  } = context
  const category = question.category || 'role'
  let score = seniorityCategoryBonus(category, seniority)
  if (question.templateId === templateId) score += 22
  if (question.industryId === resolvePracticeIndustry(templateId, industryId)) score += 20
  if (question.pack === rolePackId) score += 12
  if (question.market === market) score += 4
  if (category === 'challenge' && stageId === 'hiring-manager') score += 6
  if (category === 'case' && (stageId === 'technical' || stageId === 'portfolio')) score += 6
  return score
}

export const buildQuestionDeck = ({
  templateId = 'ats-clean',
  industryId = 'auto',
  rolePackId = templateInterviewPack[templateId] || 'general',
  stageId = 'hiring-manager',
  market = 'vietnam',
} = {}) => {
  const pack = interviewPacks.find(item => item.id === rolePackId)
    || interviewPacks.find(item => item.id === 'general')
  const vietnam = market === 'global' ? [] : vietnamQuestionBank.filter(item => item.pack === 'general' || item.pack === rolePackId)
  const global = market === 'vietnam' ? [] : globalQuestionBank.filter(item => item.pack === 'general' || item.pack === rolePackId)
  const industry = resolvePracticeIndustry(templateId, industryId)
  const candidates = [
    ...buildTemplatePracticeQuestions(templateId),
    ...buildIndustryPracticeQuestions(industry, rolePackId),
    ...coreQuestions,
    ...(pack?.questions || []),
    ...vietnam,
    ...global,
  ]
  const seen = new Set()
  return candidates.filter(item => {
    if (!item?.id || seen.has(item.id)) return false
    seen.add(item.id)
    return true
  }).sort((a, b) => interviewStageWeight(a.category, stageId) - interviewStageWeight(b.category, stageId))
}
