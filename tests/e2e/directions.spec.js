import { test, expect } from '@playwright/test'

const worlds = [
  ['/directions/', 'Choose a visual world.'],
  ['/directions/proof-index.html', 'See the proof,'],
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
        if (response.url().includes('/directions/') && response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`)
      })
      await page.goto(path, { waitUntil: 'networkidle' })
      await expect(page.locator('body')).toContainText(expectedText)
      expect(badResponses).toEqual([])
    })
  }

  test('direction lab exposes completed worlds, shared profile and proof index', async ({ page }) => {
    await page.goto('/directions/', { waitUntil: 'networkidle' })
    await expect(page.getByRole('button', { name: /Visual Hero/i })).toBeVisible()
    await expect(page.locator('.card[data-complete="true"]')).toHaveCount(5)
    await expect(page.locator('html')).toHaveAttribute('data-profile-model', 'ready')
    await expect(page.locator('a.proof-index-link')).toHaveAttribute('href', './proof-index.html')
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

  test('evidence drawer connects a visible metric to baseline, method, result and artifacts', async ({ page }) => {
    await page.goto('/directions/worlds/signal-field.html', { waitUntil: 'networkidle' })
    await expect(page.locator('html')).toHaveAttribute('data-evidence-model', 'ready')
    const metric = page.locator('.metrics .metric[data-evidence-project="atlas-ops"]').first()
    await expect(metric).toBeVisible()
    await expect(metric).toContainText('31%')
    await metric.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Project evidence' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Atlas Ops')
    await expect(dialog).toContainText('Baseline')
    await expect(dialog).toContainText('How it was measured')
    await expect(dialog).toContainText('Artifact package')
    await expect(dialog).toContainText('Before / after task-path comparison')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(metric).toBeFocused()
  })

  test('proof index maps outcomes to projects, capabilities, artifacts and ten generated visuals', async ({ page }) => {
    await page.goto('/directions/proof-index.html', { waitUntil: 'networkidle' })
    await expect(page.locator('html')).toHaveAttribute('data-proof-model', 'ready')
    await expect(page.locator('html')).toHaveAttribute('data-media-model', 'ready')
    await expect(page.locator('[data-summary="projects"]')).toHaveText('04')
    await expect(page.locator('[data-summary="metrics"]')).toHaveText('03')
    await expect(page.locator('[data-summary="artifacts"]')).toHaveText('12')
    await expect(page.locator('[data-summary="capabilities"]')).toHaveText('04')
    await expect(page.locator('.project-node')).toHaveCount(4)
    await expect(page.locator('.project-node .proof-project-media')).toHaveCount(4)
    await expect(page.locator('.artifact-node')).toHaveCount(12)
    await expect(page.locator('.artifact-node .proof-artifact-media')).toHaveCount(12)
    const sampleImages = page.locator('.proof-media-grid img')
    await expect(sampleImages).toHaveCount(10)
    for (let index = 0; index < 10; index += 1) {
      await expect(sampleImages.nth(index)).toHaveAttribute('alt', /.+/)
      await expect(sampleImages.nth(index)).toHaveAttribute('src', /.+/)
    }
    await page.getByRole('button', { name: 'AI', exact: true }).click()
    await expect(page.locator('[data-proof-index]')).toHaveAttribute('data-filter', 'ai')
    await expect(page.locator('.project-node:not(.filtered)')).toHaveCount(1)
    await expect(page.locator('.project-node:not(.filtered)')).toContainText('Signal AI Assistant')
    await page.getByRole('button', { name: 'All evidence' }).click()
    const atlas = page.locator('.project-node[data-project-id="atlas-ops"]')
    await atlas.focus()
    await page.keyboard.press('Enter')
    const dialog = page.getByRole('dialog', { name: 'Project evidence' })
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Atlas Ops')
    await expect(dialog).toContainText('Before / after task-path comparison')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(atlas).toBeFocused()
  })

  test('visual hero variants keep meaningful alternative text', async ({ page }) => {
    await page.goto('/directions/worlds/visual-hero-variants.html')
    const images = page.locator('img')
    const count = await images.count()
    expect(count).toBeGreaterThan(10)
    for (let index = 0; index < count; index += 1) await expect(images.nth(index)).toHaveAttribute('alt', /.+/)
  })
})
