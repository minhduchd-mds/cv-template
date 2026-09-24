import { test, expect } from '@playwright/test'

test('static ATS scanner shows parser visibility and job-description match', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await expect(page.getByRole('button', { name: /ATS Scan/i })).toBeVisible()

  await page.getByRole('button', { name: /ATS Scan/i }).click()
  await expect(page.getByRole('heading', { name: 'ATS Scanner' })).toBeVisible()
  await expect(page.locator('#atsOverallScore')).not.toHaveText('—')
  await expect(page.locator('#atsParseScore')).not.toHaveText('—')

  const nameRow = page.locator('.ats-field-row').filter({ hasText: 'Name' }).first()
  await expect(nameRow).toContainText(/Readable|Partial/)
  await expect(page.locator('#atsPlainText')).toContainText('Alex Chen')

  await page.getByRole('button', { name: 'ATS sees this' }).click()
  await expect(page.locator('#atsPlainText')).toBeVisible()

  await page.getByRole('button', { name: 'JD Match' }).click()
  await page.locator('#atsJobDescription').fill([
    'Senior Product Designer',
    'Design systems design systems',
    'Figma Figma',
    'Usability testing usability testing',
    'Product strategy',
    'Stakeholder management stakeholder management',
  ].join(' '))
  await expect(page.locator('#atsJobMatchLarge')).not.toHaveText('—')
  await expect(page.locator('#atsMatchedKeywords span').first()).toBeVisible()
  await expect(page.locator('#atsMissingKeywords span').first()).toBeVisible()

  expect(runtimeErrors).toEqual([])
})
