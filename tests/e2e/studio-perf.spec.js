import { test, expect } from '@playwright/test'

test('studio builder meets a local performance and typography budget', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  const started = Date.now()
  await page.goto('/#studio', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: 'Choose a direction' })).toBeVisible()
  await expect(page.locator('.cv-sheet').first()).toBeVisible()

  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0]
    const paints = Object.fromEntries(
      performance.getEntriesByType('paint').map((entry) => [entry.name, Math.round(entry.startTime)]),
    )
    const heading = document.querySelector('.template-panel .section-heading h2')
    const support = document.querySelector('.template-panel .section-heading p')
    const headingStyle = heading ? getComputedStyle(heading) : null
    const headingLines = heading && headingStyle
      ? Math.round(heading.getBoundingClientRect().height / parseFloat(headingStyle.lineHeight))
      : 0

    return {
      domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd || 0),
      firstContentfulPaint: paints['first-contentful-paint'] || 0,
      transferSize: Math.round(navigation?.transferSize || 0),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      headingLines,
      headingLetterSpacing: headingStyle?.letterSpacing || '',
      supportFontSize: support ? getComputedStyle(support).fontSize : '',
    }
  })

  expect(metrics.overflow, 'Studio must not scroll horizontally').toBeLessThanOrEqual(2)
  expect(metrics.headingLines, 'Choose a direction must stay on one or two lines').toBeLessThanOrEqual(2)
  expect(metrics.supportFontSize).toBe('13px')
  expect(metrics.domContentLoaded).toBeGreaterThan(0)
  expect(metrics.domContentLoaded).toBeLessThan(3000)
  expect(Date.now() - started).toBeLessThan(8000)
  expect(runtimeErrors).toEqual([])
})
