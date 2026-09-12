import { test, expect } from '@playwright/test'

const waitForStableFrame = async (page) => {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready
  })
  await page.waitForTimeout(120)
}

const capture = async (page, testInfo, name) => {
  await waitForStableFrame(page)
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
  })
}

const expectCriticalSurface = async (locator) => {
  await expect(locator).toBeVisible()
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  expect(box.width).toBeGreaterThan(40)
  expect(box.height).toBeGreaterThan(24)
}

test('capture production visual surfaces for review', async ({ page }, testInfo) => {
  await page.goto('/')
  await expectCriticalSurface(page.getByRole('heading', { name: /Turn one career story/i }))
  await expectCriticalSurface(page.locator('.landing-product'))
  await capture(page, testInfo, 'landing')

  await page.goto('/#studio')
  await expectCriticalSurface(page.locator('.preview-panel'))
  await expectCriticalSurface(page.locator('.cv-sheet').first())
  await capture(page, testInfo, 'studio')

  await page.goto('/#concept-bento')
  await expectCriticalSurface(page.locator('.concept-app.concept-bento'))
  await expectCriticalSurface(page.locator('.bento-board'))
  await capture(page, testInfo, 'concept-bento')
})
