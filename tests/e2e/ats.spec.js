import { test, expect } from '@playwright/test'

test('static ATS scanner separates readiness from target fit and supports edits', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.getByRole('button', { name: /ATS Scan/i }).click()

  await expect(page.getByRole('heading', { name: 'ATS Scanner' })).toBeVisible()
  await expect(page.locator('#atsProReadiness')).not.toHaveText('—')
  await expect(page.locator('#atsProFit')).not.toHaveText('—')
  await expect(page.locator('#atsProMetrics article')).toHaveCount(5)
  await expect(page.locator('.ats-pro-method')).toContainText('Text extraction 30%')

  await page.locator('#atsProRole').selectOption('sales')
  await page.locator('#atsProIndustry').selectOption('technology')
  await page.locator('#atsProSeniority').selectOption('senior')
  await expect(page.locator('#atsProTargetHint')).toContainText('Sales · Business Development')

  const nameRow = page.locator('.ats-field-row').filter({ hasText: 'Name' }).first()
  await expect(nameRow).toContainText(/Readable|Partial/)
  await nameRow.getByRole('button', { name: 'Edit' }).click()
  await expect(page.locator('#editor')).not.toHaveClass(/collapsed/)
  await expect(page.locator('#name')).toBeFocused()

  await page.getByRole('button', { name: /ATS Scan/i }).click()
  await page.getByRole('button', { name: 'ATS sees this' }).click()
  await expect(page.locator('#atsPlainText')).toContainText('Alex Chen')

  await page.getByRole('button', { name: 'Target fit' }).click()
  await page.locator('#atsJobDescription').fill('Senior Product Designer design systems design systems Figma Figma usability testing usability testing stakeholder management stakeholder management')
  await expect(page.locator('#atsJobMatchLarge')).not.toHaveText('—')

  const target = await page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-ats-target-v2') || '{}'))
  expect(target.role).toBe('sales')
  expect(target.industry).toBe('technology')
  expect(target.seniority).toBe('senior')
  expect(runtimeErrors).toEqual([])
})


test('ATS PDF verification compares exported text with the live CV', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.evaluate(() => {
    window.__atsPdfTextExtractor = async () => ({
      pages: 1,
      text: [
        'Alex Chen',
        'Senior Product Designer',
        'alex.chen@example.com',
        'Product Platform',
        'Senior Product Designer',
        '2022 — Present',
        'Design systems',
        'Figma',
      ].join('\\n'),
    })
  })

  await page.getByRole('button', { name: /ATS Scan/i }).click()
  await page.getByRole('button', { name: 'PDF verify' }).click()
  await expect(page.getByText('Check the PDF ATS will receive')).toBeVisible()

  await page.locator('#atsPdfInput').setInputFiles({
    name: 'alex-chen-cv.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\\n% test fixture'),
  })

  await expect(page.locator('#atsPdfResult')).toBeVisible()
  await expect(page.locator('#atsPdfScore')).not.toHaveText('—')
  await expect(page.locator('#atsPdfMeta')).toContainText('1 page')
  await expect(page.locator('#atsPdfRawText')).toContainText('Alex Chen')

  const projectRow = page.locator('#atsPdfFieldList article').filter({ hasText: 'Projects' })
  await expect(projectRow).toContainText(/Missing|Partial|No source data/)

  expect(runtimeErrors).toEqual([])
})


test('ATS visual heatmap highlights readable and risky CV regions', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.getByRole('button', { name: /ATS Scan/i }).click()
  await expect(page.getByText('ATS Heatmap')).toBeVisible()

  await page.getByRole('button', { name: 'Show heatmap' }).click()
  await expect(page.locator('#paper')).toHaveClass(/ats-heatmap-active/)
  await expect(page.locator('#atsHeatmapLegend')).toBeVisible()
  await expect(page.locator('#paper .ats-heat').first()).toBeVisible()

  const summary = page.locator('#paper [data-edit-focus="#summary"]').first()
  await expect(summary).toHaveClass(/ats-heat-/)

  await page.getByRole('button', { name: 'Hide ATS heatmap' }).click()
  await expect(page.locator('#paper')).not.toHaveClass(/ats-heatmap-active/)

  expect(runtimeErrors).toEqual([])
})
