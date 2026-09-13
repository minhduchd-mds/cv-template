import { test, expect } from '@playwright/test'

const worlds = [
  ['/directions/', 'Choose a visual world.'],
  ['/directions/worlds/signal-field.html', 'Make the'],
  ['/directions/worlds/threadscape.html', 'Threadscape'],
  ['/directions/worlds/focus-lens.html', 'Focus Lens'],
  ['/directions/worlds/relay.html', 'Relay'],
  ['/directions/worlds/visual-hero.html', 'Career,'],
  ['/directions/worlds/visual-hero-variants.html', 'Visual Hero / 5 Scenarios'],
]

test.describe('original direction lab', () => {
  for (const [path, expectedText] of worlds) {
    test(`${path} renders without broken local assets`, async ({ page }) => {
      const badResponses = []
      page.on('response', response => {
        if (response.url().includes('/directions/') && response.status() >= 400) {
          badResponses.push(`${response.status()} ${response.url()}`)
        }
      })

      await page.goto(path, { waitUntil: 'networkidle' })
      await expect(page.locator('body')).toContainText(expectedText)
      expect(badResponses).toEqual([])
    })
  }

  test('direction lab exposes completed worlds and visual hero', async ({ page }) => {
    await page.goto('/directions/')
    await expect(page.getByRole('button', { name: /Visual Hero/i })).toBeVisible()
    await expect(page.locator('.card[data-complete="true"]')).toHaveCount(5)
  })

  test('visual hero variants keep meaningful alternative text', async ({ page }) => {
    await page.goto('/directions/worlds/visual-hero-variants.html')
    const images = page.locator('img')
    const count = await images.count()
    expect(count).toBeGreaterThan(10)
    for (let index = 0; index < count; index += 1) {
      await expect(images.nth(index)).toHaveAttribute('alt', /.+/)
    }
  })
})
