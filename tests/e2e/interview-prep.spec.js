import { expect, test } from '@playwright/test'

const workspace = {
  format: 'cv-studio-workspace',
  schemaVersion: 3,
  updatedAt: '2026-09-25T00:00:00.000Z',
  source: 'test',
  profile: {
    personal: { role: 'Senior Product Designer' },
  },
  studio: {
    selectedId: 'soft-portfolio-pro',
  },
  ats: {
    target: {},
    versions: [],
    applications: [],
  },
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript((value) => {
    window.localStorage.setItem('cv-studio-workspace-v3', JSON.stringify(value))
  }, workspace)
})

test('opens role-aware Interview Prep from the selected CV', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('/#interview')

  await expect(page.getByRole('heading', { name: /Các câu hỏi phỏng vấn thường gặp/i })).toBeVisible()
  await expect(page.getByText('Soft Portfolio', { exact: true })).toBeVisible()
  await expect(page.getByText(/UI\/UX & Product Design/).first()).toBeVisible()
  await expect(page.getByLabel('Nguồn dữ liệu')).toHaveValue('vietnam')
  await expect(page.getByText(/Glints Vietnam/).first()).toBeVisible()
  await expect(page.getByText(/TopCV/).first()).toBeVisible()
  await expect(page.locator('.interview-question')).toHaveCount(20)
  expect(pageErrors).toEqual([])
})

test('can change pack, stage and search interview questions', async ({ page }) => {
  await page.goto('/#interview')

  await page.getByLabel('Role pack').selectOption('technical')
  await page.getByLabel('Vòng phỏng vấn').selectOption('technical')
  await page.getByLabel('Nguồn dữ liệu').selectOption('all')
  await page.getByPlaceholder('Tìm: stakeholder, metric, failure...').fill('debug')

  await expect(page.getByText(/debug lỗi không tái hiện được/i)).toBeVisible()
  await expect(page.getByText(/Software \/ Technical/).first()).toBeVisible()
})

test('mobile Interview Prep has no horizontal page overflow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-only overflow check')

  await page.goto('/#interview')

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth,
  }))

  expect(overflow.page).toBeLessThanOrEqual(overflow.viewport + 1)
  await expect(page.getByRole('link', { name: 'Mở CV Studio' })).toBeHidden()
})


test('Vietnam dataset keeps source provenance visible on question cards', async ({ page }) => {
  await page.goto('/#interview')

  await page.getByPlaceholder('Tìm: stakeholder, metric, failure...').fill('quy trình thiết kế')
  const question = page.locator('.interview-question').filter({ hasText: 'Quy trình thiết kế' }).first()
  await expect(question).toBeVisible()
  await question.locator('summary').click()
  await expect(question.getByText(/Glints Vietnam/)).toBeVisible()
  await expect(question.getByText(/ITviec/)).toBeVisible()
})


test('mock interview session uses application context and stores practice evidence locally', async ({ page }) => {
  await page.addInitScript(() => {
    const value = JSON.parse(window.localStorage.getItem('cv-studio-workspace-v3') || 'null')
    value.ats.applications = [{
      id: 'app-vn-1',
      company: 'Viettel Digital',
      role: 'Senior Product Designer',
      status: 'Interview',
      jd: 'Design systems user research stakeholder management product metrics',
      notes: 'Hiring manager round',
    }]
    window.localStorage.setItem('cv-studio-workspace-v3', JSON.stringify(value))
  })

  await page.goto('/#interview')

  await page.getByLabel('Application context').selectOption('app-vn-1')
  await page.getByRole('button', { name: 'Bắt đầu mock interview' }).click()

  await expect(page.locator('.interview-practice-session')).toBeVisible()
  await expect(page.getByText(/QUESTION 1 \/ 5/)).toBeVisible()
  await expect(page.getByText(/Viettel Digital · Senior Product Designer/)).toBeVisible()

  for (let index = 0; index < 5; index += 1) {
    const session = page.locator('.interview-practice-session')
    await session.getByPlaceholder(/Trả lời theo cách anh sẽ nói thật/).fill('Tôi sẽ trả lời bằng một ví dụ thực tế.')
    await session.getByPlaceholder(/Project, phạm vi mình sở hữu/).fill('Project A · ownership · trade-off · result')
    await session.getByLabel('Mức tự tin').selectOption('4')
    if (index === 0) {
      await page.getByRole('button', { name: /Mở coach guidance/ }).click()
      await expect(page.getByText('Họ muốn kiểm tra gì?')).toBeVisible()
    }
    await session.getByRole('button', { name: index === 4 ? 'Hoàn tất & lưu session' : 'Câu tiếp theo →' }).click()
  }

  await expect(page.getByText(/Đã lưu session/)).toBeVisible()
  await expect(page.locator('.interview-practice-history article')).toHaveCount(1)

  const sessions = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('cv-studio-interview-sessions-v1') || '[]')
  )
  expect(sessions).toHaveLength(1)
  expect(sessions[0].applicationId).toBe('app-vn-1')
  expect(sessions[0].answered).toBe(5)
  expect(sessions[0].evidenceReady).toBe(5)
  expect(sessions[0].averageConfidence).toBe(4)
})
