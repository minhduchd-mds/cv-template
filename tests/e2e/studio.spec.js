import { Buffer } from 'node:buffer'
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
  await expect(page.locator('.template-card')).toHaveCount(15)
  await expect(page.locator('.template-panel')).toHaveCSS('overflow-y', 'auto')

  const avatarPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  await page.locator('.role-avatar-upload input').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: avatarPng })
  await expect(page.locator('.role-preset-avatar img')).toHaveCount(4)
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}').avatar || '')).toMatch(/^data:image\/webp;base64,/)

  await page.locator('.quick-avatar-framing').getByRole('button', { name: 'Rounded' }).click()
  await page.locator('.quick-avatar-framing').getByRole('button', { name: 'L', exact: true }).click()
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-avatar-size-large/)
  await page.locator('.quick-avatar-framing input[type="range"]').nth(0).evaluate((input) => { input.value = '30'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.locator('.quick-avatar-framing input[type="range"]').nth(1).evaluate((input) => { input.value = '72'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.locator('.quick-avatar-framing input[type="range"]').nth(2).evaluate((input) => { input.value = '160'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.locator('.quick-avatar-framing input[type="range"]').nth(3).evaluate((input) => { input.value = '25'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await expect(page.locator('.role-avatar-preview')).toHaveClass(/avatar-shape-rounded/)
  await expect(page.locator('.role-avatar-preview img')).toHaveCSS('object-position', '30% 72%')
  await expect(page.locator('.role-avatar-preview img')).toHaveAttribute('style', /scale\(1\.6\).*rotate\(25deg\)/)

  const avatarBox = await page.locator('.role-avatar-preview').boundingBox()
  expect(avatarBox).not.toBeNull()
  await page.mouse.move(avatarBox.x + avatarBox.width / 2, avatarBox.y + avatarBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(avatarBox.x + avatarBox.width / 2 + 10, avatarBox.y + avatarBox.height / 2 + 6)
  await page.mouse.up()

  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-settings-v1') || '{}').appearance?.avatarShape)).toBe('rounded')
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-settings-v1') || '{}').appearance?.avatarZoom)).toBe(1.6)
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-settings-v1') || '{}').appearance?.avatarRotate)).toBe(25)

  await page.getByRole('button', { name: /Design.*Type, density & shape/i }).click()
  await page.locator('.editor-field').filter({ hasText: 'Typography' }).locator('select').selectOption('serif')
  await page.locator('.editor-field').filter({ hasText: 'Content density' }).locator('select').selectOption('compact')
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-font-serif/)
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-density-compact/)
  await page.getByRole('button', { name: /Projects.*Selected work/i }).click()
  await page.getByRole('button', { name: /List/i }).click()
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-projects-list/)
  await page.getByRole('button', { name: /Card/i }).click()
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-projects-cards/)

  await page.getByRole('button', { name: /Profile.*Identity & contact/i }).click()

  await page.getByRole('button', { name: /Senior UI\/UX.*Portfolio led/i }).click()
  await expect(page.locator('.preview-toolbar')).toContainText('Soft Portfolio')
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-avatar-size-large/)

  await page.getByRole('button', { name: /Design Engineer.*Code aware/i }).click()
  await expect(page.locator('.preview-toolbar')).toContainText('Code Aware')
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-font-mono/)
  await expect(page.locator('.cv-sheet').first()).toHaveClass(/cv-density-compact/)

  const fullNameInput = page.locator('.editor-field').filter({ hasText: 'Full name' }).locator('input')
  await expect(fullNameInput).toHaveValue('Alex Chen')
  await fullNameInput.fill('Alex Chen QA')
  await expect(page.locator('.cv-sheet').first()).toContainText('Alex Chen QA')
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}').name)).toBe('Alex Chen QA')

  await page.getByRole('button', { name: 'Close CV builder' }).click()
  await expect(page.locator('.profile-editor')).not.toHaveClass(/open/)

  await page.getByRole('button', { name: 'Undo last change' }).click()
  await expect(page.locator('.cv-sheet').first()).toContainText('Alex Chen')
  await page.getByRole('button', { name: 'Redo last change' }).click()
  await expect(page.locator('.cv-sheet').first()).toContainText('Alex Chen QA')

  const sectionsBeforeDrag = await page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}').sections.map((section) => section.id))
  const projectsSection = page.locator('.cv-sheet.is-editable [data-section-id="projects"]').first()
  const experienceSection = page.locator('.cv-sheet.is-editable [data-section-id="experience"]').first()
  await projectsSection.dragTo(experienceSection)
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}').sections.map((section) => section.id))).not.toEqual(sectionsBeforeDrag)

  await page.getByRole('button', { name: 'Undo last change' }).click()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-profile-v1') || '{}').sections.map((section) => section.id))).toEqual(sectionsBeforeDrag)
  await page.getByRole('button', { name: 'Redo last change' }).click()

  await page.locator('.cv-sheet.is-editable [data-edit-section="experience"]').first().click()
  await expect(page.locator('.profile-editor')).toHaveClass(/open/)
  await expect(page.locator('.editor-tabs button.active')).toContainText('Experience')
  await page.getByRole('button', { name: 'Close CV builder' }).click()

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


test('static fallback builder keeps core editing and template controls functional', async ({ page }) => {
  const runtimeErrors = watchRuntimeErrors(page)
  await page.goto('/studio/')

  await expect(page.getByRole('button', { name: 'Edit CV' })).toBeVisible()
  await expect(page.locator('.template-card')).toHaveCount(15)
  await expect(page.locator('.templates')).toHaveCSS('overflow-y', 'auto')

  const referenceChecks = [
    ['Executive Edge', 'executive-edge', '.ref-executive-edge'],
    ['Soft Portfolio', 'soft-portfolio-pro', '.ref-soft-portfolio'],
    ['Product Operator', 'product-operator', '.ref-product-operator'],
    ['Code Aware', 'code-aware', '.ref-code-aware'],
    ['ATS Precision', 'ats-precision', '.ref-ats-precision'],
    ['Insight Grid', 'insight-grid', '.ref-insight-grid'],
    ['Brand Motion', 'brand-motion', '.ref-brand-motion'],
    ['Revenue Driver', 'revenue-driver', '.ref-revenue-driver'],
    ['People First', 'people-first', '.ref-people-first'],
    ['Next Start', 'next-start', '.ref-next-start'],
  ]

  for (const [label, themeId, rootSelector] of referenceChecks) {
    await page.locator('.template-card').filter({ hasText: label }).click()
    await expect(page.locator('#paper')).toHaveClass(new RegExp(`theme-${themeId}`))
    const root = page.locator(`#paper ${rootSelector}`)
    await expect(root).toHaveCount(1)
    const overflow = await root.evaluate((node) => ({
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      left: node.getBoundingClientRect().left,
      right: node.getBoundingClientRect().right,
      paperLeft: node.parentElement.getBoundingClientRect().left,
      paperRight: node.parentElement.getBoundingClientRect().right,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1)
    expect(overflow.left).toBeGreaterThanOrEqual(overflow.paperLeft - 1)
    expect(overflow.right).toBeLessThanOrEqual(overflow.paperRight + 1)
    await expect(root.locator('[data-edit-pane]').first()).toBeVisible()
    await root.locator('[data-edit-pane]').first().click()
    await expect(page.locator('#editor')).not.toHaveClass(/collapsed/)
  }

  await page.locator('.template-card').filter({ hasText: 'Soft Portfolio' }).click()

  const avatarPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  await page.locator('#staticAvatarInput').setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: avatarPng })
  await expect(page.locator('[data-preset-avatar] img')).toHaveCount(4)
  await expect(page.locator('#paper .ref-soft-avatar img')).toHaveCount(1)

  await page.locator('[data-avatar-shape="square"]').click()
  await page.locator('[data-avatar-size="small"]').click()
  await expect(page.locator('#paper')).toHaveClass(/avatar-size-small/)
  await page.locator('#avatarX').evaluate((input) => { input.value = '20'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.locator('#avatarY').evaluate((input) => { input.value = '80'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.locator('#avatarZoom').evaluate((input) => { input.value = '175'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await page.locator('#avatarRotate').evaluate((input) => { input.value = '-18'; input.dispatchEvent(new Event('input', { bubbles: true })) })
  await expect(page.locator('#paper')).toHaveClass(/avatar-square/)
  await expect(page.locator('#paper .ref-soft-avatar img')).toHaveCSS('object-position', '20% 80%')
  await expect(page.locator('#paper .ref-soft-avatar img')).toHaveAttribute('style', /scale\(1\.75\).*rotate\(-18deg\)/)

  const fallbackAvatarBox = await page.locator('#staticAvatarPreview').boundingBox()
  expect(fallbackAvatarBox).not.toBeNull()
  await page.mouse.move(fallbackAvatarBox.x + fallbackAvatarBox.width / 2, fallbackAvatarBox.y + fallbackAvatarBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(fallbackAvatarBox.x + fallbackAvatarBox.width / 2 - 8, fallbackAvatarBox.y + fallbackAvatarBox.height / 2 + 5)
  await page.mouse.up()

  await page.getByRole('button', { name: 'Edit CV' }).click()
  await expect(page.locator('#editor')).not.toHaveClass(/collapsed/)

  await page.locator('#projectList').click()
  await expect(page.locator('#paper')).toHaveClass(/projects-list/)
  await page.locator('#projectCards').click()
  await expect(page.locator('#paper')).toHaveClass(/projects-cards/)

  await page.locator('[data-target-preset="uiux"]').click()
  await expect(page.locator('#activeTemplateLabel')).toContainText('Soft Portfolio')
  await expect(page.locator('#paper')).toHaveClass(/avatar-size-large/)

  await page.locator('[data-target-preset="engineer"]').click()
  await expect(page.locator('#activeTemplateLabel')).toContainText('Code Aware')
  await expect(page.locator('#paper')).toHaveClass(/font-mono/)
  await expect(page.locator('#paper')).toHaveClass(/density-compact/)

  await page.locator('.template-card').filter({ hasText: 'Mono Grid' }).click()
  const fallbackOrderBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-static-settings-v2') || '{}').sectionOrder)
  await page.locator('#paper [data-section-key="projects"]').dragTo(page.locator('#paper [data-section-key="experience"]'))
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-static-settings-v2') || '{}').sectionOrder)).not.toEqual(fallbackOrderBefore)

  await page.locator('#undoStatic').click()
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-static-settings-v2') || '{}').sectionOrder)).toEqual(fallbackOrderBefore)
  await page.locator('#redoStatic').click()

  await page.locator('#paper [data-edit-focus="#experienceEditor"]').click()
  await expect(page.locator('[data-pane="content"]')).toHaveClass(/active/)

  await page.locator('#name').fill('Alex Chen Static QA')
  await expect(page.locator('#paper')).toContainText('Alex Chen Static QA')
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem('cv-studio-static-v2') || '{}').name)).toBe('Alex Chen Static QA')

  await page.locator('#undoStatic').click()
  await expect(page.locator('#paper')).toContainText('Alex Chen')
  await page.locator('#redoStatic').click()
  await expect(page.locator('#paper')).toContainText('Alex Chen Static QA')

  await expectNoHorizontalOverflow(page)
  expect(runtimeErrors).toEqual([])
})


test('static fallback keeps 1366 workspace aligned with editor open', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/studio/')
  await page.getByRole('button', { name: 'Edit CV' }).click()
  await expect(page.locator('#editor')).not.toHaveClass(/collapsed/)

  const layout = await page.evaluate(() => {
    const body = document.documentElement
    const paper = document.querySelector('#paper')
    const preview = document.querySelector('.preview')
    const editor = document.querySelector('#editor')
    const templates = document.querySelector('.templates')
    const rect = (node) => {
      const box = node.getBoundingClientRect()
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width }
    }
    return {
      body: { clientWidth: body.clientWidth, scrollWidth: body.scrollWidth },
      paper: rect(paper),
      preview: rect(preview),
      editor: rect(editor),
      templates: rect(templates),
    }
  })

  expect(layout.body.scrollWidth).toBeLessThanOrEqual(layout.body.clientWidth + 2)
  expect(layout.paper.left).toBeGreaterThanOrEqual(layout.preview.left - 1)
  expect(layout.paper.right).toBeLessThanOrEqual(layout.editor.left + 1)
  expect(layout.templates.top).toBeGreaterThanOrEqual(67)
  expect(layout.templates.bottom).toBeLessThanOrEqual(769)
})
