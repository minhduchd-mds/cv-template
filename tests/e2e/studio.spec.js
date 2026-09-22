import { test, expect } from '@playwright/test'

const expectNoHorizontalOverflow = async (page) => {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 2)
}

const watchRuntimeErrors = (page) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test('landing explains the product, uses local sample media and stays responsive', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Turn one career story/i })).toBeVisible()
  await expect(page.getByText('Local-first', { exact: true })).toBeVisible()
  await expect(page.locator('.landing-product')).toBeVisible()
  await expect(page.locator('.landing-case-grid')).toBeVisible()
  await page.locator('.landing-nav .landing-brand').click()
  await expect(page).toHaveURL(/#studio$/)
  await expect(page.getByRole('button', { name: 'Edit CV' })).toBeVisible()

  const imageSources = await page.locator('.landing-page img').evaluateAll((images) => images.map((image) => image.getAttribute('src') || ''))
  expect(imageSources.length).toBeGreaterThan(0)
  expect(imageSources.every((source) => source.includes('sample/'))).toBeTruthy()

  await expectNoHorizontalOverflow(page)
  expect(runtimeErrors).toEqual([])
})

test('builder opens from its route, edits shared data and persists locally', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page)
  await page.goto('/#studio')

  await expect(page.getByRole('button', { name: 'Edit CV' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit CV' }).click()
  await expect(page.getByRole('heading', { name: /Edit once\. Update every CV/i })).toBeVisible()
  await expect(page.getByRole('progressbar', { name: 'CV completeness' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Profile.*Identity & contact/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Experience.*Roles & achievements/i })).toBeVisible()
  await expect(page.locator('.template-card')).toHaveCount(12)

  await page.getByRole('button', { name: /Design.*Type, density & shape/i }).click()
  await page.locator('.editor-field').filter({ hasText: 'Typography' }).locator('select').selectOption('serif')
  await page.locator('.editor-field').filter({ hasText: 'Content density' }).locator('select').selectOption('compact')
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-font-serif/)
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-density-compact/)
  await page.getByRole('button', { name: /Profile.*Identity & contact/i }).click()

  const fullNameInput = page.locator('.editor-field').filter({ hasText: 'Full name' }).locator('input')
  await expect(fullNameInput).toHaveValue('Alex Chen')
  await fullNameInput.fill('Alex Chen QA')
  await expect(page.locator('.cv-sheet').first()).toContainText('Alex Chen QA')

  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}').name)).toBe('Alex Chen QA')

  await page.getByRole('button', { name: 'Close CV builder' }).click()
  await expect(page.locator('.profile-editor')).not.toHaveClass(/open/)
  await expectNoHorizontalOverflow(page)
  expect(runtimeErrors).toEqual([])
})

test('Auto-complete CV fills only missing content and marks custom drafts for review', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page)
  await page.addInitScript(() => {
    localStorage.setItem('cv-studio-profile-v1', JSON.stringify({
      name: 'Sam Rivera',
      role: 'Product Designer',
      location: '',
      email: 'sam@portfolio.test',
      phone: '',
      website: '',
      avatar: '',
      headline: '',
      availability: '',
      summary: '',
      sections: [],
      highlights: [],
      experience: [],
      projects: [],
      skills: [],
      tools: [],
      education: [],
      certificates: [],
      languages: [],
      recognition: [],
      testimonials: [],
      interests: [],
    }))
  })

  await page.goto('/#studio')
  const autoComplete = page.getByRole('button', { name: /Complete missing CV fields/i })
  await expect(autoComplete).toBeVisible()
  await expect(autoComplete).not.toContainText('100%')
  await autoComplete.click()

  await expect(page.locator('.auto-complete-toast')).toContainText('Auto-complete applied')
  await expect(page.locator('.auto-complete-toast')).toContainText('[Review]')
  await expect(page.getByRole('heading', { name: /Edit once\. Update every CV/i })).toBeVisible()

  const stored = await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}'))).toMatchObject({
    name: 'Sam Rivera',
    role: 'Product Designer',
    email: 'sam@portfolio.test',
  })

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}'))
  expect(saved.name).toBe('Sam Rivera')
  expect(saved.role).toBe('Product Designer')
  expect(saved.email).toBe('sam@portfolio.test')
  expect(saved.summary).toContain('[Review:')
  expect(saved.highlights.length).toBeGreaterThan(0)
  expect(saved.projects.length).toBeGreaterThan(0)
  expect(saved.skills.length).toBeGreaterThan(0)

  await expectNoHorizontalOverflow(page)
  expect(runtimeErrors).toEqual([])
})

test('concept routes remain reachable and keyboard navigation has no dead end', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page)
  await page.goto('/#concept-bento')

  await expect(page.locator('.concept-app.concept-bento')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Biến kinh nghiệm/i })).toBeVisible()

  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/#concept-engineer$/)
  await expect(page.locator('.concept-app.concept-engineer')).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/#studio$/)
  await expect(page.getByRole('button', { name: 'Edit CV' })).toBeVisible()

  await expectNoHorizontalOverflow(page)
  expect(runtimeErrors).toEqual([])
})
