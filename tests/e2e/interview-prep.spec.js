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
  await expect(page.getByText(/Nielsen Norman Group/)).toBeVisible()
  await expect(page.locator('.interview-question')).toHaveCount(11)
  expect(pageErrors).toEqual([])
})

test('can change pack, stage and search interview questions', async ({ page }) => {
  await page.goto('/#interview')

  await page.getByLabel('Role pack').selectOption('technical')
  await page.getByLabel('Vòng phỏng vấn').selectOption('technical')
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
