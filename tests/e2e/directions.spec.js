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

  test('direction lab exposes completed worlds, shared profile and visual hero', async ({ page }) => {
    await page.goto('/directions/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Visual Hero/i })).toBeVisible()
    await expect(page.locator('.card[data-complete="true"]')).toHaveCount(5)
    await expect(page.locator('html')).toHaveAttribute('data-profile-model', 'ready')
    await expect(page.locator('.profile-chip')).toContainText('Alex')
  })

  test('direction choice persists when returning to the lab', async ({ page }) => {
    await page.goto('/directions/', { waitUntil: 'networkidle' })
    const relay = page.locator('.card[data-id="relay"]')
    await relay.click()
    await expect(page.locator('.lab')).toHaveAttribute('data-direction', 'relay')
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('.lab')).toHaveAttribute('data-direction', 'relay')
  })

  test('completed worlds load one profile model and recruiter 60s mode', async ({ page }) => {
    await page.goto('/directions/worlds/signal-field.html', { waitUntil: 'networkidle' })
    await expect(page.locator('html')).toHaveAttribute('data-profile-model', 'ready')
    await expect(page.locator('.profile-dock')).toContainText('Alex Chen')

    const trigger = page.getByRole('button', { name: '60s view' })
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Recruiter 60 second profile' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Three strongest outcomes')
    await expect(dialog).toContainText('Atlas Ops')
    await expect(dialog).toContainText('Northstar Design System')
    await expect(dialog).toContainText('Core capabilities')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(trigger).toBeFocused()
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
