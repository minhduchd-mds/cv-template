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
