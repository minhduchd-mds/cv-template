import { expect, test } from '@playwright/test'

const workspace = {
  format: 'cv-studio-workspace',
  schemaVersion: 3,
  updatedAt: '2026-09-26T00:00:00.000Z',
  source: 'test',
  profile: {
    name: 'Nguyen Test',
    role: 'Senior Product Designer',
    summary: 'Product designer focused on complex B2B workflows, design systems and measurable outcomes.',
    experience: [{
      role: 'Senior Product Designer',
      company: 'Example Co',
      bullets: [
        'Led a design system across 15 modules and improved design-to-development handoff by 40%.',
        'Redesigned a complex workflow that reduced task completion time by 31% in usability testing.',
      ],
    }],
    projects: [{
      name: 'Design QA',
      impact: 'Reduced recurring visual defects by 25%',
      result: 'Created a repeatable design QA workflow with engineering.',
    }],
  },
  studio: {
    selectedId: 'soft-portfolio-pro',
  },
  ats: {
    target: {},
    versions: [],
    applications: [{
      id: 'app-vn-1',
      company: 'Viettel Digital',
      role: 'Senior Product Designer',
      status: 'Interview',
      jd: 'Design systems user research stakeholder management product metrics',
      notes: 'Hiring manager round',
    }],
  },
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((value) => {
    // The same tab may reload to test persistence. Seed only once per test,
    // otherwise a navigation silently wipes the fixture we're verifying.
    if (window.sessionStorage.getItem('__interview_e2e_seeded__') === '1') return
    window.sessionStorage.setItem('__interview_e2e_seeded__', '1')
    window.localStorage.setItem('cv-studio-workspace-v3', JSON.stringify(value))
    window.localStorage.removeItem('interview-studio-sessions-v2')
    window.localStorage.removeItem('interview-studio-claim-evidence-v1')
    window.localStorage.removeItem('interview-studio-story-bank-v1')
  }, workspace)
})

test('opens standalone Interview Studio from selected CV', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/#interview-studio')

  await expect(page.getByRole('link', { name: 'Interview Studio', exact: true })).toBeVisible()
  const wideNavigation = await page.evaluate(() => matchMedia('(min-width: 901px)').matches)
  if (wideNavigation) await expect(page.getByText('Practice & Evidence Lab')).toBeVisible()
  else await expect(page.getByText('Practice & Evidence Lab')).toBeHidden()
  await expect(page.getByRole('heading', { name: /Biến CV thành/i })).toBeVisible()
  await expect(page.locator('.is-sidebar__context')).toContainText('Soft Portfolio')
  await expect(page.locator('.is-sidebar__context')).toContainText('UI/UX & Product Design')
  await expect(page.locator('.is-nav').getByRole('button', { name: 'Overview', exact: true })).toBeVisible()
  await expect(page.getByText(/TopCV/).first()).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('Vue Interview Studio uses the canonical industry question catalogue', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByLabel('Ngành nghề').selectOption('telecom')
  await page.getByRole('button', { name: /Question Bank/ }).click()
  await expect(page.locator('.is-question').filter({ hasText: /ngành Telecom/i }).first()).toBeVisible()
})

test('compiled standalone Interview Studio fallback loads without src imports', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const missing = []
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/src/')) missing.push(response.url())
  })
  await page.goto('/interview-studio/')
  await expect(page.locator('#module-nav')).toContainText('Question Bank')
  await expect(page.locator('#app-view')).toContainText('CV thật')
  await page.locator('#industry-field').selectOption('telecom')
  await page.locator('[data-module="questions"]').click()
  await expect(page.locator('.question').filter({ hasText: /ngành Telecom/i }).first()).toBeVisible()
  expect(missing).toEqual([])
  expect(errors).toEqual([])
})

test('legacy interview hash stays compatible with Interview Studio', async ({ page }) => {
  await page.goto('/#interview')
  await expect(page.getByRole('link', { name: 'Interview Studio', exact: true })).toBeVisible()
})

test('question bank keeps Vietnam source provenance', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: /Question Bank/ }).click()

  await page.getByPlaceholder(/stakeholder, design system/).fill('quy trình thiết kế')
  const question = page.locator('.is-question').filter({ hasText: 'Quy trình thiết kế' }).first()
  await expect(question).toBeVisible()
  if (!(await question.evaluate((node) => node.open))) await question.locator('summary').click()
  await expect(question.getByText(/Glints Vietnam/)).toBeVisible()
  await expect(question.getByText(/ITviec/)).toBeVisible()
})

test('claim defense extracts measurable CV claims and persists evidence', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: /Claim Defense/ }).click()

  await expect(page.getByRole('heading', { name: /Led a design system across 15 modules/ })).toBeVisible()
  await expect(page.getByText(/Con số này lấy baseline nào/)).toBeVisible()

  const note = page.getByPlaceholder(/Baseline, phạm vi mình sở hữu/)
  await note.fill('15 modules · design system owner · adoption tracked in release review')
  await note.blur()
  await page.getByRole('button', { name: /Đánh dấu evidence ready/ }).click()

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('interview-studio-claim-evidence-v1') || '{}')
  )
  expect(Object.values(stored).some((item) => item.ready)).toBeTruthy()
})

test('mock interview adapts to weak answers and creates traceable report', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: /Mock Interview/ }).click()

  await page.locator('.is-mock-config').getByLabel('Application').selectOption('app-vn-1')
  await page.getByLabel('Interviewer mode').selectOption('skeptical')
  await page.getByLabel('Pressure').selectOption('pressure')
  await page.getByLabel('Timer / câu').selectOption('60')
  await page.getByLabel('Số câu').selectOption('5')
  await page.getByRole('button', { name: /Bắt đầu session/ }).click()

  // Deliberately weak first answer: the interviewer should inject a real follow-up.
  await page.getByPlaceholder(/Nói hoặc nhập đúng cách/).fill('Team tôi làm dự án này và kết quả khá tốt.')
  await page.getByPlaceholder(/Project · ownership/).fill('')
  await page.getByRole('button', { name: /Đánh giá câu này/ }).click()
  await expect(page.getByText('practice signal')).toBeVisible()
  await page.getByRole('button', { name: /Phân tích & tiếp tục/ }).click()

  await expect(page.getByText('ADAPTIVE FOLLOW-UP')).toBeVisible()
  await expect(page.getByText('WHY THIS FOLLOW-UP')).toBeVisible()
  await expect(page.locator('.is-live-session__meta').getByText(/Skeptical Panel/)).toBeVisible()
  await expect(page.locator('.is-live-session__meta').getByText(/Pressure/)).toBeVisible()
  await expect(page.getByRole('heading', { name: /Tôi chưa bị thuyết phục|Hãy chứng minh rõ hơn|challenge/i })).toBeVisible()

  // Finish the adaptive follow-up and the remaining base/adaptive questions.
  for (let turn = 0; turn < 8; turn += 1) {
    if (await page.getByText(/LATEST PRACTICE SIGNAL/).isVisible().catch(() => false)) break

    await page.getByPlaceholder(/Nói hoặc nhập đúng cách/).fill(
      'Tôi trực tiếp sở hữu phần thiết kế. Bối cảnh là workflow phức tạp. Tôi chọn phương án dựa trên usability test, chấp nhận trade-off về thời gian và kết quả cải thiện 31%. Nếu làm lại tôi sẽ validate sớm hơn.'
    )
    await page.getByPlaceholder(/Project · ownership/).fill(
      'Project Atlas · tôi sở hữu flow và interaction · baseline usability · result 31% · learning validate sớm'
    )
    await page.getByRole('button', { name: /Đánh giá câu này/ }).click()
    await expect(page.getByText('practice signal')).toBeVisible()

    const next = page.locator('.is-session-actions .is-button--primary')
    await next.click()
  }

  await expect(page.getByText(/LATEST PRACTICE SIGNAL/)).toBeVisible()
  await expect(page.locator('.is-report-hero').getByText(/Viettel Digital · Senior Product Designer/)).toBeVisible()
  await expect(page.locator('.is-branch-trace')).toBeVisible()
  await expect(page.getByText(/BRANCH MEMORY/)).toBeVisible()
  await expect(page.getByText(/Interviewer đã rẽ nhánh/)).toBeVisible()
  await expect(page.getByText(/NEXT PRACTICE PLAN/)).toBeVisible()
  await expect(page.getByRole('button', { name: /Luyện plan này/ })).toBeVisible()

  const sessions = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('interview-studio-sessions-v2') || '[]')
  )
  expect(sessions).toHaveLength(1)
  expect(sessions[0].applicationId).toBe('app-vn-1')
  expect(sessions[0].interviewerMode).toBe('skeptical')
  expect(sessions[0].pressureLevel).toBe('pressure')
  expect(sessions[0].adaptiveFollowUps).toBeGreaterThanOrEqual(1)
  expect(sessions[0].report.adaptiveCount).toBeGreaterThanOrEqual(1)
  expect(sessions[0].report.interviewerModes).toContain('Skeptical Panel')
  expect(sessions[0].report.pressureLevels).toContain('Pressure')
  expect(sessions[0].report.adaptiveReasons.length).toBeGreaterThanOrEqual(1)
  expect(sessions[0].report.adaptiveTrace.length).toBeGreaterThanOrEqual(1)
  expect(sessions[0].report.adaptiveTrace[0].interviewerLabel).toBe('Skeptical Panel')
  expect(sessions[0].report.adaptiveTrace[0].pressureLabel).toBe('Pressure')
  expect(sessions[0].report.overall).toBeGreaterThan(0)
})

test('Story Bank saves a strong answer and can start focused practice', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: /Mock Interview/ }).click()
  await page.locator('.is-mock-config').getByLabel('Application').selectOption('app-vn-1')
  await page.getByRole('button', { name: /Bắt đầu session/ }).click()

  await page.getByPlaceholder(/Nói hoặc nhập đúng cách/).fill(
    'Bối cảnh là một workflow nhiều bước. Tôi trực tiếp sở hữu flow và interaction, dùng usability test làm evidence, chọn phương án đơn giản hơn dù phải giảm một số tuỳ chọn, và kết quả task completion cải thiện 31%. Nếu làm lại tôi sẽ validate sớm hơn.'
  )
  await page.getByPlaceholder(/Project · ownership/).fill(
    'Atlas · ownership flow · usability baseline · trade-off giảm option · result 31% · learning validate sớm'
  )
  await page.getByRole('button', { name: /Đánh giá câu này/ }).click()
  await page.getByRole('button', { name: /Lưu vào Story Bank/ }).click()
  await expect(page.getByRole('button', { name: /Đã lưu Story Bank/ })).toBeVisible()

  const stored = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('interview-studio-story-bank-v1') || '[]')
  )
  expect(stored).toHaveLength(1)
  expect(stored[0].answer).toContain('31%')
  expect(stored[0].evidence).toContain('ownership')

  await page.getByRole('button', { name: 'Story Bank', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Lưu những câu chuyện nghề nghiệp/ })).toBeVisible()
  await expect(page.getByText(/31%/).first()).toBeVisible()
  await page.getByRole('button', { name: /Luyện lại/ }).click()
  await expect(page.getByText(/QUESTION 1/)).toBeVisible()
  await expect(page.getByPlaceholder(/Nói hoặc nhập đúng cách/)).toHaveValue(/31%/)
})

test('Application Lab saves JD context, shows evidence coverage and starts a targeted round', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: /Application Lab/ }).click()

  await expect(page.getByRole('heading', { name: /Mỗi job là một workspace phỏng vấn riêng/ })).toBeVisible()
  await page.getByRole('button', { name: /New/ }).click()
  await page.getByPlaceholder(/Viettel Digital, FPT, Shopee/).fill('FPT Software')
  await page.getByPlaceholder(/Senior Product Designer/).fill('Lead Product Designer')
  await page.getByPlaceholder(/Dán toàn bộ JD/).fill(
    'Lead product design for complex enterprise workflows. Own design system governance, stakeholder management, user research, product metrics and collaboration with frontend engineering.'
  )
  await expect(page.getByText(/EVIDENCE COVERAGE/)).toBeVisible()
  await expect(page.getByText(/MATCHED SIGNALS/)).toBeVisible()
  await expect(page.getByText(/EVIDENCE GAPS/)).toBeVisible()
  await expect(page.getByText(/INTERVIEW STAGE MATRIX/)).toBeVisible()
  await expect(page.getByText(/HR \/ Recruiter/)).toBeVisible()
  await expect(page.getByText(/Hiring Manager/).first()).toBeVisible()

  await page.getByRole('button', { name: 'Lưu context' }).click()

  const saved = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('cv-studio-workspace-v3') || 'null')
  )
  expect(saved.ats.applications.some((item) => item.company === 'FPT Software' && item.role === 'Lead Product Designer')).toBeTruthy()

  await page.getByRole('button', { name: /Luyện job này/ }).click()
  await expect(page.getByText(/QUESTION 1/)).toBeVisible()
})

test('mobile Interview Studio has no horizontal page overflow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only overflow check')

  await page.goto('/#interview-studio')
  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }))

  expect(overflow.page).toBeLessThanOrEqual(overflow.viewport + 1)
})

test('Interview Studio exports locally and deletes only interview-owned data', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.evaluate(() => {
    localStorage.setItem('interview-studio-sessions-v2', JSON.stringify([{ id: 'qa-session', answered: 1 }]))
    localStorage.setItem('interview-studio-story-bank-v1', JSON.stringify([{ id: 'qa-story', answer: 'Prepared evidence' }]))
    localStorage.setItem('interview-studio-claim-evidence-v1', JSON.stringify({ 'claim-1': { note: 'Old note' } }))
  })
  await page.reload()
  await page.getByRole('button', { name: 'Reports', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /Xuất dữ liệu Interview Studio/ }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^interview-studio-backup-.*\.json$/)

  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: /Xóa dữ liệu luyện tập trên thiết bị/ }).click()
  const kept = await page.evaluate(() => ({
    workspace: localStorage.getItem('cv-studio-workspace-v3'),
    session: localStorage.getItem('interview-studio-sessions-v2'),
    stories: localStorage.getItem('interview-studio-story-bank-v1'),
    claims: localStorage.getItem('interview-studio-claim-evidence-v1'),
  }))
  expect(kept.workspace).toContain('app-vn-1')
  expect(kept.session).toBeNull()
  expect(kept.stories).toBeNull()
  expect(kept.claims).toBeNull()
})

test('Legacy notes are archived and applied only after explicit user selection', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.evaluate(() => {
    localStorage.setItem('interview-studio-claim-evidence-v1', JSON.stringify({
      'claim-1': { note: 'Old baseline note to review', ready: true },
    }))
  })
  await page.reload()
  await page.getByRole('button', { name: 'Claim Defense' }).click()
  await expect(page.getByText('Old baseline note to review')).toBeVisible()
  await page.getByRole('button', { name: 'Gán vào claim đang chọn' }).click()
  const note = page.getByPlaceholder(/Baseline, phạm vi mình sở hữu/)
  await expect(note).toHaveValue('Old baseline note to review')
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('interview-studio-claim-evidence-v1') || '{}'))
  expect(state.__legacyNotes[0].appliedTo).toMatch(/^claim-/)
  const assigned = state[state.__legacyNotes[0].appliedTo]
  expect(assigned.ready).toBe(false)
  expect(assigned.needsReview).toBe(true)
})


test('Job Market explorer shows sourced role salary and fills a draft application', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: /Application Lab/ }).click()

  const market = page.locator('.is-market')
  await expect(market.getByRole('heading', { name: 'Khám phá cơ hội & lương' })).toBeVisible()
  await market.getByRole('button', { name: 'Mở khám phá' }).click()
  await market.getByRole('button', { name: 'Lương theo role' }).click()
  await market.getByLabel('Tìm role hoặc công ty').fill('UI/UX')
  await expect(market.getByText('20–40 tr/tháng · gross')).toBeVisible()
  await expect(market.getByText(/không phải offer/i).first()).toBeVisible()
  await expect(market.getByRole('link', { name: /Adecco/ })).toHaveAttribute('href', /adecco.com/)

  await market.getByRole('button', { name: 'Vị trí đã đối chiếu' }).click()
  await market.getByLabel('Tìm role hoặc công ty').fill('')
  await market.getByLabel('Lọc công ty').selectOption('vng')
  await market.getByRole('button', { name: 'Dùng job này' }).first().click()

  await expect(page.getByPlaceholder(/Viettel Digital, FPT, Shopee/)).toHaveValue('VNG')
  await expect(page.getByPlaceholder(/Senior Product Designer/)).toHaveValue(/AI Engineer/)
  await expect(page.getByPlaceholder('https://...')).toHaveValue(/career.vng.com.vn/)
  await expect(market.getByRole('button', { name: 'Mở khám phá' })).toBeVisible()
  expect(pageErrors).toEqual([])
})

test('standalone Job Market fallback renders employer and salary source links', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', error => pageErrors.push(error.message))
  await page.goto('/interview-studio/')
  await page.locator('[data-module="applications"]').click()
  await expect(page.locator('.market-section')).toContainText('Khám phá cơ hội & lương')
  await page.locator('#toggle-market').click()
  await page.locator('[data-market-tab="salary"]').click()
  await expect(page.locator('.market-section')).toContainText('20–40 tr/tháng · gross')
  await page.locator('[data-market-tab="jobs"]').click()
  await page.locator('[data-market-job="vng-ai"]').click()
  await expect(page.locator('#app-company')).toHaveValue('VNG')
  await expect(page.locator('#app-role')).toHaveValue(/AI Engineer/)
  expect(pageErrors).toEqual([])
})


test('Interview Studio is light by default and starts a salary scenario', async ({ page }) => {
  await page.goto('/#interview-studio')
  const theme = await page.locator('.is-sidebar').evaluate(element => getComputedStyle(element).backgroundColor)
  expect(theme).toMatch(/rgba?\(255, 255, 255/)
  await page.getByRole('button', { name: 'Mock Interview', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Chọn kịch bản phỏng vấn' })).toBeVisible()
  await expect(page.locator('.is-scenario-card')).toHaveCount(5)
  await page.getByRole('button', { name: 'Xem đủ 10 kịch bản' }).click()
  await expect(page.locator('.is-scenario-card')).toHaveCount(10)
  const salary = page.locator('.is-scenario-card').filter({ hasText: 'Đàm phán lương' })
  await salary.click()
  await expect(salary).toHaveAttribute('aria-pressed','true')
  await expect(page.getByText('HR hỏi kỳ vọng, cơ cấu gross/net')).toBeVisible()
  await page.getByRole('button',{name:'Luyện kịch bản này'}).click()
  await expect(page.getByRole('heading',{name:/Mức thu nhập mong muốn/})).toBeVisible()
  await expect(page.getByText(/Đàm phán lương ·/).first()).toBeVisible()
})

test('standalone recovery app keeps the same light theme and scenario selection', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/interview-studio/')
  const theme = await page.locator('.sidebar').evaluate(element => getComputedStyle(element).backgroundColor)
  expect(theme).toMatch(/rgba?\(255, 255, 255/)
  await page.locator('[data-module="mock"]').click()
  await expect(page.locator('.scenario-card')).toHaveCount(5)
  await page.locator('#toggle-scenarios').click()
  await expect(page.locator('.scenario-card')).toHaveCount(10)
  await page.locator('[data-scenario="ux-portfolio"]').click()
  await expect(page.locator('[data-scenario="ux-portfolio"]')).toHaveAttribute('aria-pressed','true')
  await page.locator('#start-scenario').click()
  await expect(page.locator('.live h2')).toContainText('case study')
  expect(errors).toEqual([])
})


test('Growth Coach gives a beginner three-question path and remembers the chosen goal', async ({ page }) => {
  await page.goto('/#interview-studio')
  const coach=page.getByRole('region', { name:'Lộ trình luyện phỏng vấn cá nhân' })
  await expect(coach.getByRole('heading',{name:'Luyện đúng điểm cần cải thiện'})).toBeVisible()
  await coach.getByRole('button',{name:'UI/UX & Product Design'}).click()
  await expect(coach.getByRole('button',{name:'UI/UX & Product Design'})).toHaveAttribute('aria-pressed','true')
  expect(await page.evaluate(()=>localStorage.getItem('interview-studio-growth-goal-v1'))).toBe('design')
  await coach.getByRole('button',{name:'Luyện 3 câu đầu tiên'}).click()
  await expect(page.locator('.is-live-session')).toBeVisible()
  await expect(page.locator('.is-live-session__meta')).toContainText('QUESTION 1 / 3')
  await expect(page.locator('.is-live-session h2')).toContainText('case study')
})

test('standalone Growth Coach preserves role and starts same short drill', async ({ page }) => {
  const errors=[]
  page.on('pageerror', e=>errors.push(e.message))
  await page.goto('/interview-studio/')
  await expect(page.locator('.growth-coach')).toContainText('Luyện đúng điểm cần cải thiện')
  await page.locator('[data-growth-goal="design"]').click()
  await expect(page.locator('[data-growth-goal="design"]')).toHaveAttribute('aria-pressed','true')
  await page.locator('#start-growth').click()
  await expect(page.locator('.live h2')).toContainText('case study')
  await expect(page.locator('.live-meta')).toContainText('QUESTION 1 / 3')
  expect(errors).toEqual([])
})


test('Vue guided answer retry gives same-question comparison', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name:/Mock Interview/ }).click()
  await page.getByRole('button', { name:/Bắt đầu session/ }).click()
  await page.getByPlaceholder(/Nói hoặc nhập đúng cách/).fill('Team chúng tôi làm dự án.')
  await page.getByRole('button',{name:'Đánh giá câu này'}).click()
  await expect(page.locator('.is-retry-coach')).toBeVisible()
  await page.getByRole('button',{name:/Sửa và đánh giá lại/}).click()
  await page.getByPlaceholder(/Nói hoặc nhập đúng cách/).fill('Tôi trực tiếp phân tích vấn đề, thiết kế luồng thao tác và tổ chức usability test. Bối cảnh là quy trình phức tạp, tôi chọn giải pháp sau khi so sánh phương án và báo cáo kết quả.')
  await page.getByPlaceholder(/Project · ownership/).fill('Dự án thử nghiệm: vai trò trực tiếp, baseline, quyết định, trade-off, kết quả')
  await page.getByRole('button',{name:'Đánh giá câu này'}).click()
  await expect(page.locator('.is-retry-coach__comparison')).toContainText('Trước')
})

test('standalone guided retry keeps feedback on the same question', async ({ page }) => {
  await page.goto('/interview-studio/')
  await page.locator('[data-module="mock"]').click()
  await page.locator('#start-mock').click()
  await page.locator('#mock-answer').fill('Chúng tôi làm dự án.')
  await page.locator('#eval-q').click()
  await expect(page.locator('.retry-coach')).toBeVisible()
  await page.locator('#retry-answer').click()
  await page.locator('#mock-answer').fill('Tôi trực tiếp thiết kế quy trình mới và kiểm thử với người dùng. Tôi đã cân nhắc trade-off, đánh giá dữ liệu, lựa chọn phương án và tổng kết kết quả.')
  await page.locator('#mock-evidence').fill('Bối cảnh dự án, nguồn đo, quyết định cá nhân, kết quả')
  await page.locator('#eval-q').click()
  await expect(page.locator('.retry-comparison')).toContainText('Trước')
})

test('Vue invalidates old feedback when editing a scored response', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button',{name:/Mock Interview/}).click()
  await page.getByRole('button',{name:/Bắt đầu session/}).click()
  const answer=page.getByPlaceholder(/Nói hoặc nhập đúng cách/)
  await answer.fill('Tôi đã tham gia dự án và cải thiện luồng người dùng.')
  await page.getByRole('button',{name:'Đánh giá câu này'}).click()
  await expect(page.locator('.is-evaluation')).toBeVisible()
  await answer.fill('Tôi trực tiếp thiết kế và nghiên cứu người dùng, đo baseline và so sánh các phương án giải pháp.')
  await expect(page.locator('.is-evaluation')).toHaveCount(0)
  await expect(page.getByText(/Câu trả lời đã được sửa/)).toBeVisible()
  await page.getByRole('button',{name:'Đánh giá câu này'}).click()
  await expect(page.locator('.is-retry-coach__comparison')).toContainText('Trước')
})

test('standalone app invalidates old feedback when editing a scored response', async ({ page }) => {
  await page.goto('/interview-studio/')
  await page.locator('[data-module="mock"]').click()
  await page.locator('#start-mock').click()
  const answer=page.locator('#mock-answer')
  await answer.fill('Tôi tham gia dự án và có kết quả.')
  await page.locator('#eval-q').click()
  await expect(page.locator('.evaluation')).toBeVisible()
  await answer.fill('Tôi trực tiếp chịu trách nhiệm cho trải nghiệm người dùng, phân tích rủi ro và kiểm chứng kết quả.')
  await expect(page.locator('.evaluation')).toHaveCount(0)
  await expect(page.locator('.retry-hint')).toBeVisible()
  await page.locator('#eval-q').click()
  await expect(page.locator('.retry-comparison')).toContainText('Trước')
})

test('blank answers are shown as skipped, not awarded a practice score', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button',{name:/Mock Interview/}).click()
  await page.getByRole('button',{name:/Bắt đầu session/}).click()
  await expect(page.getByRole('button',{name:'Bỏ qua câu này →'})).toBeVisible()
  for(let i=0;i<5;i++){
    await page.getByRole('button',{name:'Bỏ qua câu này →'}).click()
  }
  await expect(page.getByText(/LATEST PRACTICE SIGNAL/)).toBeVisible()
  const record=await page.evaluate(()=>JSON.parse(localStorage.getItem('interview-studio-sessions-v2')||'[]')[0])
  expect(record.report.overall).toBe(0)
  expect(record.report.answered).toBe(0)
  expect(record.report.skipped).toBe(5)
  expect(record.adaptiveFollowUps).toBe(0)
})


test('Vue can restore its original answer and compare actual revisions in Reports', async ({ page }) => {
  await page.goto('/#interview-studio')
  await page.getByRole('button', { name: 'Mock Interview', exact: true }).click()
  await page.getByRole('button', { name: /Bắt đầu session/ }).click()
  const answer = page.getByPlaceholder(/Nói hoặc nhập đúng cách/)
  await answer.fill('Cả nhóm hoàn thành dự án.')
  await page.getByRole('button', { name: 'Đánh giá câu này' }).click()
  await page.getByRole('button', { name: /Sửa và đánh giá lại/ }).click()
  await expect(page.locator('.is-revision-original')).toContainText('Cả nhóm hoàn thành dự án.')
  await answer.fill('Tôi trực tiếp phân tích workflow, thiết kế luồng, kiểm tra với người dùng và ghi lại kết quả sau kiểm thử.')
  await page.getByPlaceholder(/Project · ownership/).fill('Dự án UX · tôi sở hữu nghiên cứu và flow · usability evidence')
  await page.locator('.is-revision-original summary').click()
  await page.getByRole('button', { name: 'Khôi phục bản đầu' }).click()
  await expect(answer).toHaveValue('Cả nhóm hoàn thành dự án.')
  await expect(page.locator('.is-revision-original')).toHaveCount(0)

  await answer.fill('Bản đầu chỉ nói cả nhóm hoàn thành.')
  await page.getByRole('button', { name: 'Đánh giá câu này' }).click()
  await answer.fill('Tôi trực tiếp thiết kế luồng, tổ chức usability test, đưa ra lựa chọn và theo dõi kết quả.')
  await page.getByPlaceholder(/Project · ownership/).fill('Dự án thật · baseline · sở hữu flow · kết quả')
  await page.getByRole('button', { name: 'Đánh giá câu này' }).click()
  await expect(page.locator('.is-retry-coach__comparison')).toBeVisible()
  for (let i = 0; i < 9 && await page.locator('.is-live-session').count(); i++) {
    await page.locator('.is-session-actions .is-button--primary').click()
  }
  await expect(page.locator('.is-revision-report')).toBeVisible()
  await page.locator('.is-revision-report__item summary').first().click()
  await expect(page.locator('.is-revision-report__compare')).toContainText('Cả nhóm hoàn thành dự án.')
  await expect(page.locator('.is-revision-report__compare')).toContainText('Tôi trực tiếp thiết kế luồng')
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('interview-studio-sessions-v2') || '[]')[0])
  expect(stored.report.revisionReview).toHaveLength(1)
  expect(stored.report.revisionReview[0].questionId).toBeTruthy()
})

test('standalone Interview Studio restores and compares the first attempt', async ({ page }) => {
  await page.goto('/interview-studio/')
  await page.locator('[data-module="mock"]').click()
  await page.locator('#start-mock').click()
  await page.locator('#mock-answer').fill('Cả nhóm thực hiện dự án.')
  await page.locator('#eval-q').click()
  await page.locator('#retry-answer').click()
  await expect(page.locator('.revision-original')).toContainText('Cả nhóm thực hiện dự án.')
  await page.locator('.revision-original summary').click()
  await page.locator('#restore-answer').click()
  await expect(page.locator('#mock-answer')).toHaveValue('Cả nhóm thực hiện dự án.')
  await expect(page.locator('.revision-original')).toHaveCount(0)

  await page.locator('#mock-answer').fill('Chúng tôi triển khai dự án.')
  await page.locator('#eval-q').click()
  await page.locator('#mock-answer').fill('Tôi trực tiếp thiết kế luồng, cân nhắc trade-off và đo kết quả trên dự án.')
  await page.locator('#eval-q').click()
  for (let i = 0; i < 9 && await page.locator('.live').count(); i++) {
    await page.locator('#next-q').click()
  }
  await expect(page.locator('.revision-report')).toBeVisible()
  await page.locator('.revision-report-item summary').first().click()
  await expect(page.locator('.revision-pair')).toContainText('Cả nhóm thực hiện dự án.')
  await expect(page.locator('.revision-pair')).toContainText('Tôi trực tiếp thiết kế luồng')
})
