import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildQuestionDeck,
  practiceContextBonus,
  resolvePracticeIndustry,
} from '../../src/interview/question-catalog.js'
import {
  extractCvClaims,
  migrateLegacyClaimEvidence,
} from '../../src/interview/interview-studio-engine.js'
import { interviewSources, templateInterviewPack } from '../../src/data/interview-prep.js'

test('every one of the 20 CV templates maps to a working interview pack', () => {
  const ids = Object.keys(templateInterviewPack)
  assert.equal(ids.length, 20)
  for (const id of ids) {
    const deck = buildQuestionDeck({ templateId: id, market: 'vietnam' })
    assert.ok(deck.length >= 5, id + ' should provide a useful practice set')
    assert.ok(deck.some(q => q.templateId === id), id + ' should include template-specific questions')
  }
})

test('Vietnam, global, and industry context share one deterministic catalogue', () => {
  const base = { templateId: 'soft-portfolio-pro', rolePackId: 'design', industryId: 'telecom' }
  assert.equal(resolvePracticeIndustry(base.templateId, base.industryId), 'telecom')
  const vn = buildQuestionDeck({ ...base, market: 'vietnam' })
  const all = buildQuestionDeck({ ...base, market: 'all' })
  const global = buildQuestionDeck({ ...base, market: 'global' })
  assert.ok(vn.some(q => q.market === 'vietnam'))
  assert.ok(vn.some(q => q.industryId === 'telecom'))
  assert.ok(vn.some(q => q.templateId === base.templateId))
  assert.ok(!vn.some(q => q.market === 'global'))
  assert.ok(all.some(q => q.market === 'global'))
  assert.ok(!global.some(q => q.market === 'vietnam'))
  const sourceIds = new Set(interviewSources.map(s => s.id))
  for (const q of all) {
    for (const id of q.sourceIds || []) assert.ok(sourceIds.has(id), q.id + ' refers to missing source ' + id)
  }
})

test('seniority changes practice challenge priority without changing source content', () => {
  const q = { category: 'challenge', pack: 'design' }
  const context = { templateId: 'soft-portfolio-pro', rolePackId: 'design' }
  assert.ok(practiceContextBonus(q, { ...context, seniority: 'Director' })
    > practiceContextBonus(q, { ...context, seniority: 'Entry' }))
})

test('CV claim IDs remain stable when bullets are reordered', () => {
  const first = 'Led a design system across 15 modules and improved handoff quality.'
  const second = 'Reduced recurring visual defects across the design review process.'
  const make = bullets => ({
    experience: [{ role: 'Designer', company: 'Example', bullets }],
  })
  const a = extractCvClaims(make([first, second]))
  const b = extractCvClaims(make([second, first]))
  const findId = (items, text) => items.find(item => item.text === text)?.id
  assert.ok(findId(a, first))
  assert.equal(findId(a, first), findId(b, first))
  assert.equal(findId(a, second), findId(b, second))
  assert.notEqual(findId(a, first), findId(a, second))
})

test('legacy evidence is preserved as draft but never auto-validated', () => {
  const claims = extractCvClaims({
    experience: [{ bullets: ['Led a design system across 15 modules and improved handoff quality.'] }],
  })
  const item = claims[0]
  const stored = { [item.legacyId]: { note: 'Baseline measured before rollout', ready: true } }
  const migrated = migrateLegacyClaimEvidence(stored, claims)
  assert.equal(migrated[item.id].note, stored[item.legacyId].note)
  assert.equal(migrated[item.id].ready, false)
  assert.equal(migrated[item.id].needsReview, true)
  assert.equal(migrated[item.legacyId].ready, true)
  const edited = extractCvClaims({
    experience: [{ bullets: ['Led a design system across 16 modules and improved handoff quality.'] }],
  })
  assert.notEqual(item.id, edited[0].id)
})
