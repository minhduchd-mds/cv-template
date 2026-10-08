import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildQuestionDeck,
  practiceContextBonus,
  resolvePracticeIndustry,
} from '../../src/interview/question-catalog.js'
import {
  extractCvClaims,
  getUnassignedClaimNotes,
  migrateLegacyClaimEvidence,
} from '../../src/interview/interview-studio-engine.js'
import { interviewSources, templateInterviewPack } from '../../src/data/interview-prep.js'
import {
  INTERVIEW_LOCAL_KEYS,
  buildInterviewDataExport,
  clearInterviewLocalData,
} from '../../src/interview/interview-data-controls.js'

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

test('legacy evidence is archived without guessing which claim it belongs to', () => {
  const claims = extractCvClaims({
    experience: [{ bullets: ['Led a design system across 15 modules and improved handoff quality.'] }],
  })
  const item = claims[0]
  const stored = { [item.legacyId]: { note: 'Baseline measured before rollout', ready: true } }
  const migrated = migrateLegacyClaimEvidence(stored)
  assert.equal(migrated[item.id], undefined, 'No inferred assignment to hashed IDs')
  const notes = getUnassignedClaimNotes(migrated)
  assert.equal(notes.length, 1)
  assert.equal(notes[0].note, stored[item.legacyId].note)
  assert.equal(notes[0].appliedTo, '')
  assert.equal(notes[0].wasReady, true)
  const again = migrateLegacyClaimEvidence(migrated)
  assert.equal(getUnassignedClaimNotes(again).length, 1, 'No duplicate migrations')
  const archived = {
    ...again,
    __legacyNotes: again.__legacyNotes.map(note => ({ ...note, appliedTo: item.id })),
  }
  assert.equal(getUnassignedClaimNotes(archived).length, 0)
  const edited = extractCvClaims({
    experience: [{ bullets: ['Led a design system across 16 modules and improved handoff quality.'] }],
  })
  assert.notEqual(item.id, edited[0].id)
})

test('privacy backup preserves interview data and scoped deletion keeps shared CV/JD', () => {
  const workspace = {
    format: 'cv-studio-workspace',
    schemaVersion: 3,
    studio: { selectedId: 'soft-portfolio-pro' },
    profile: { name: 'Only for verification' },
    ats: { applications: [{ id: 'job-1', company: 'Demo Corp', jd: 'Design Systems' }] },
  }
  const values = new Map([
    ['cv-studio-workspace-v3', JSON.stringify(workspace)],
    ['interview-studio-sessions-v2', '[{"id":"s1"}]'],
    ['interview-studio-claim-evidence-v1', '{"claim-key":{"note":"evidence"}}'],
    ['interview-studio-story-bank-v1', '[{"id":"story-1"}]'],
  ])
  const store = {
    getItem: key => values.has(key) ? values.get(key) : null,
    removeItem: key => values.delete(key),
  }
  const backup = buildInterviewDataExport(store, '2026-10-08T00:00:00Z')
  assert.equal(backup.format, 'interview-studio-backup')
  assert.equal(backup.sharedReadOnlyContext.applications[0].id, 'job-1')
  assert.equal(backup.localStorageEntries['interview-studio-sessions-v2'], '[{"id":"s1"}]')
  assert.equal(backup.localStorageEntries['cv-studio-workspace-v3'], undefined)
  assert.equal(backup.exportedAt, '2026-10-08T00:00:00Z')
  assert.equal(clearInterviewLocalData(store), INTERVIEW_LOCAL_KEYS.length)
  assert.equal(store.getItem('interview-studio-story-bank-v1'), null)
  assert.deepEqual(JSON.parse(store.getItem('cv-studio-workspace-v3')), workspace)
})


import {
  JOB_MARKET_AS_OF, observedJobSignals, salaryBenchmarks, verifiedEmployers,
  jobMarketSources, salaryDisplay, isObservedJobCurrent, jobSourceForRole,
} from '../../src/data/job-market-vn.js'

test('market snapshot has traceable employer and salary sources', () => {
  assert.equal(JOB_MARKET_AS_OF, '2026-10-08')
  const employerIds = new Set(verifiedEmployers.map(item => item.id))
  const sourceIds = new Set(jobMarketSources.map(item => item.id))
  assert.ok(verifiedEmployers.length >= 5)
  assert.ok(salaryBenchmarks.length >= 10)
  assert.ok(observedJobSignals.length >= 5)
  for (const employer of verifiedEmployers) assert.match(employer.careersUrl, /^https:\/\//)
  for (const job of observedJobSignals) {
    assert.ok(employerIds.has(job.employerId), 'unknown employer ' + job.employerId)
    assert.match(job.sourceUrl, /^https:\/\//)
    assert.equal(job.pay, 'undisclosed')
    assert.ok(job.checkedAt)
  }
  for (const role of salaryBenchmarks) {
    assert.ok(sourceIds.has(role.sourceId), 'unverified salary source ' + role.sourceId)
    assert.ok(jobSourceForRole(role)?.url)
    assert.ok(['median','range-gross'].includes(role.kind))
  }
})

test('salary labels never attribute market data to an employer', () => {
  const ux = salaryBenchmarks.find(item => item.id === 'ux')
  const frontend = salaryBenchmarks.find(item => item.id === 'frontend')
  assert.equal(salaryDisplay(ux, 'hanoi', '1-5'), '20–40 tr/tháng · gross')
  assert.equal(salaryDisplay(ux, 'hanoi', '5+'), '40–80 tr/tháng · gross')
  assert.match(salaryDisplay(frontend), /34,8 tr\/tháng · trung vị VN/)
  assert.equal(salaryDisplay(null), 'Chưa có dữ liệu')
})

test('expiration excludes out-of-date company job signals', () => {
  const deadline = observedJobSignals.find(job => job.id === 'viettel-project')
  assert.equal(isObservedJobCurrent(deadline, JOB_MARKET_AS_OF), true)
  assert.equal(isObservedJobCurrent(deadline, '2026-12-01'), false)
})
