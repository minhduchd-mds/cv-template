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

  await page.getByRole('button', { name: /Design.*Type, scale & layout/i }).click()
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

  await page.locator('.template-card').filter({ hasText: 'Brand Motion' }).click()
  await expect(page.locator('#paper .ref-brand-skills')).toHaveCSS('display', 'flex')
  const brandSkillGap = await page.locator('#paper .ref-brand-skills').evaluate((node) => getComputedStyle(node).gap)
  expect(parseFloat(brandSkillGap)).toBeGreaterThan(0)
  const campaignCards = page.locator('#paper .ref-brand-projects article')
  await expect(campaignCards).toHaveCount(3)
  const campaignTops = await campaignCards.evaluateAll((nodes) => nodes.slice(0, 3).map((node) => Math.round(node.getBoundingClientRect().top)))
  expect(new Set(campaignTops).size).toBe(1)

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

  await page.locator('.tab[data-tab="design"]').click()
  await page.locator('#textScale').fill('110')
  await page.locator('#headingScale').fill('115')
  await expect(page.locator('#textScaleValue')).toHaveText('110%')
  await expect(page.locator('#headingScaleValue')).toHaveText('115%')
  await expect.poll(async () => page.locator('#paper').evaluate((node) => getComputedStyle(node).getPropertyValue('--text-scale').trim())).toBe('1.1')
  await expect.poll(async () => page.locator('#paper').evaluate((node) => getComputedStyle(node).getPropertyValue('--heading-scale').trim())).toBe('1.15')

  await page.locator('.template-card').filter({ hasText: 'Brand Motion' }).click()
  await page.locator('.tab[data-tab="design"]').click()
  const brandCards = page.locator('#paper .ref-brand-projects article')
  const cardTops = await brandCards.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)))
  expect(new Set(cardTops).size).toBe(1)

  await page.locator('#projectList').click()
  await expect(page.locator('#paper')).toHaveClass(/projects-list/)
  const listTops = await brandCards.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)))
  expect(listTops[1]).toBeGreaterThan(listTops[0])

  await page.locator('#projectCards').click()
  await expect(page.locator('#paper')).toHaveClass(/projects-cards/)
  const cardTopsAgain = await brandCards.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().top)))
  expect(new Set(cardTopsAgain).size).toBe(1)

  await page.locator('.template-card').filter({ hasText: 'Revenue Driver' }).click()
  await page.locator('.tab[data-tab="design"]').click()
  await expect(page.locator('#projectCards')).toBeDisabled()
  await expect(page.locator('#projectList')).toBeDisabled()
  await expect(page.locator('#projectDisplayHint')).toContainText('does not use a project section')

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


test('all 20 curated templates stay inside A4 and remain editable', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/studio/')

  const names = [
    'Executive Edge',
    'Soft Portfolio',
    'Product Operator',
    'Code Aware',
    'ATS Precision',
    'Insight Grid',
    'Brand Motion',
    'Revenue Driver',
    'People First',
    'Next Start',
    'Bento Resume',
    'Executive Navy',
    'ATS Clean',
    'Mono Grid',
    'Creator Cards',
    'Strategy Brief',
    'Clinical Clean',
    'Finance Ledger',
    'Studio Director',
    'Research Scholar',
  ]

  for (const name of names) {
    const card = page.locator('.template-card').filter({ hasText: name })
    await expect(card).toHaveCount(1)
    await card.click()

    const paper = page.locator('#paper')
    const metrics = await paper.evaluate((node) => ({
      scrollWidth: node.scrollWidth,
      clientWidth: node.clientWidth,
      left: node.getBoundingClientRect().left,
      right: node.getBoundingClientRect().right,
      bodyScrollWidth: document.documentElement.scrollWidth,
      bodyClientWidth: document.documentElement.clientWidth,
      editZones: node.querySelectorAll('[data-edit-pane]').length,
      offsetHeight: node.offsetHeight,
      expectedPaperHeight: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--paper-h')) || 1123,
    }))

    expect(metrics.scrollWidth, `${name} horizontal paper overflow`).toBeLessThanOrEqual(metrics.clientWidth + 2)
    expect(metrics.bodyScrollWidth, `${name} horizontal page overflow`).toBeLessThanOrEqual(metrics.bodyClientWidth + 2)
    expect(metrics.editZones, `${name} missing edit zones`).toBeGreaterThan(0)
    expect(metrics.offsetHeight, `${name} exceeds A4 height`).toBeLessThanOrEqual(metrics.expectedPaperHeight + 24)
  }
})


test('preview toolbar stays sticky while scrolling the CV canvas', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/studio/')
  const toolbar = page.locator('.preview-toolbar')
  await expect(toolbar).toBeVisible()

  await page.evaluate(() => window.scrollTo(0, 620))
  await page.waitForTimeout(80)

  const position = await toolbar.evaluate((node) => {
    const rect = node.getBoundingClientRect()
    return { top: rect.top, bottom: rect.bottom, width: rect.width }
  })

  expect(position.top).toBeGreaterThanOrEqual(68)
  expect(position.top).toBeLessThanOrEqual(92)
  expect(position.bottom).toBeLessThan(180)
  expect(position.width).toBeGreaterThan(320)
})


test('five expansion templates expose distinct theme classes', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/studio/')

  const checks = [
    ['Strategy Brief', 'theme-strategy-brief'],
    ['Clinical Clean', 'theme-clinical-clean'],
    ['Finance Ledger', 'theme-finance-ledger'],
    ['Studio Director', 'theme-studio-director'],
    ['Research Scholar', 'theme-research-scholar'],
  ]

  for (const [name, themeClass] of checks) {
    await page.locator('.template-card').filter({ hasText: name }).click()
    await expect(page.locator('#paper')).toHaveClass(new RegExp(themeClass))
  }
})


test('static template search filters the 20-template library', async ({ page }) => {
  await page.goto('/studio/')
  await expect(page.locator('.template-card')).toHaveCount(20)

  await page.locator('#templateSearch').fill('Healthcare')
  await expect(page.locator('.template-card')).toHaveCount(1)
  await expect(page.locator('.template-card').first()).toContainText('Clinical Clean')
  await expect(page.locator('#templateCountLabel')).toContainText('1 of 20 templates')

  await page.locator('#templateSearch').fill('')
  await expect(page.locator('.template-card')).toHaveCount(20)
  await expect(page.locator('#templateCountLabel')).toContainText('20 curated templates')
})


test('Revenue Driver tagline and quote are directly editable without forced line breaks', async ({ page }) => {
  await page.goto('/studio/')
  await page.locator('.template-card').filter({ hasText: 'Revenue Driver' }).click()

  const tagline = page.locator('#paper .ref-revenue-driver > header p')
  const quote = page.locator('#paper .ref-sales-body blockquote')

  await expect(tagline).toContainText('Driving revenue')
  await tagline.click()
  await expect(page.locator('#headline')).toBeVisible()
  await expect(page.locator('#headline')).toBeFocused()
  await page.locator('#headline').fill('Build trust. Create value. Grow revenue.')
  await expect(tagline).toHaveText('Build trust. Create value. Grow revenue.')

  await quote.click()
  await expect(page.locator('#quote')).toBeVisible()
  await expect(page.locator('#quote')).toBeFocused()
  await page.locator('#quote').fill('One clear sentence, no forced break.')
  await expect(quote).toContainText('One clear sentence, no forced break.')
  await expect(quote.locator('br')).toHaveCount(0)
})

test('PDF export computes a one-page print fit when CV content exceeds A4', async ({ page }) => {
  await page.goto('/studio/')
  await page.locator('.template-card').filter({ hasText: 'Revenue Driver' }).click()

  await page.evaluate(() => {
    window.print = () => { window.__printCalled = true }
    const experience = document.querySelector('#paper .ref-sales-experience')
    if (experience) experience.style.paddingBottom = '620px'
  })

  await page.locator('#print').click()
  await expect(page.getByRole('heading',{name:'PDF Preflight'})).toBeVisible()
  await page.locator('#exportModeOne').check()
  await page.locator('#exportPreflightPrint').click()

  const result = await page.locator('#paper').evaluate((node) => ({
    fit: Number(node.dataset.printFit || '1'),
    mode: node.dataset.printMode,
    called: Boolean(window.__printCalled),
  }))
  expect(result.called).toBe(true)
  expect(result.mode).toBe('one')
  expect(result.fit).toBeLessThan(1)
  expect(result.fit).toBeGreaterThanOrEqual(.68)
})


test('workspace backup previews import before restore', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))
  await page.goto('/studio/')
  await page.locator('#backupWorkspace').click()
  await expect(page.getByRole('heading',{name:'Backup & Recovery'})).toBeVisible()
  await expect(page.locator('#workspaceBackupSummary')).toContainText('Applications')

  const backup={
    format:'cv-studio-backup',
    schemaVersion:1,
    createdAt:'2026-09-24T00:00:00.000Z',
    includesPdfs:false,
    summary:{name:'Imported Candidate',experience:2,projects:1,versions:3,applications:4},
    data:{
      'cv-studio-static-v2':{name:'Imported Candidate',experience:[],projects:[],skills:[],languages:[]},
      'cv-studio-static-settings-v2':{},
      'cv-studio-ats-target-v2':{},
      'cv-studio-ats-versions-v1':[],
      'cv-studio-ats-applications-v1':[]
    },
    pdfs:[]
  }
  await page.locator('#backupImportFile').setInputFiles({
    name:'workspace.cvstudio.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(backup))
  })
  await expect(page.locator('#backupImportPreview')).toContainText('Imported Candidate')
  await expect(page.locator('#backupRestoreNow')).toBeEnabled()
  expect(runtimeErrors).toEqual([])
})


test('PDF preflight recommends multi-page when one-page fit would be unreadable', async ({ page }) => {
  await page.goto('/studio/')
  await page.evaluate(() => {
    const paper=document.querySelector('#paper')
    if(paper) paper.style.paddingBottom='1800px'
  })
  await page.locator('#print').click()
  await expect(page.locator('#exportPreflightStatus')).toContainText('Multi-page recommended')
  await expect(page.locator('#exportModeOne')).toBeDisabled()
  await expect(page.locator('#exportModeMulti')).toBeChecked()
})


test('Content Health finds editorial and template coverage issues', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))
  await page.addInitScript(() => {
    const key='cv-studio-static-v2'
    const saved=JSON.parse(localStorage.getItem(key)||'{}')
    saved.summary=Array.from({length:120},(_,i)=>'word'+i).join(' ')
    saved.skills=['Figma','Design Systems','figma']
    saved.projects=[
      {name:'Hidden Project',type:'Product',impact:'',description:'A useful project description.'}
    ]
    saved.experience=[
      {role:'Product Designer',company:'Example',period:'2024 — Present',location:'Hanoi',bullets:['Designed product workflows for enterprise users.','Improved cross-team collaboration and delivery quality.']}
    ]
    localStorage.setItem(key,JSON.stringify(saved))
  })
  await page.goto('/studio/')
  await page.locator('#toggleEditor').click()
  await expect(page.getByText('Content Health')).toBeVisible()
  await expect(page.locator('#contentHealthList')).toContainText('Summary is too long')
  await expect(page.locator('#contentHealthList')).toContainText('Duplicate skills found')
  await expect(page.locator('#contentHealthList')).toContainText('Project is missing impact')

  await page.locator('.template-card').filter({hasText:'Revenue Driver'}).click()
  await expect(page.locator('#contentHealthList')).toContainText('Projects are not used by this template')

  await page.getByRole('button',{name:'Remove duplicates'}).click()
  const skills=await page.locator('#skills').inputValue()
  expect(skills.split('\n').filter((x)=>x.toLowerCase()==='figma')).toHaveLength(1)
  expect(runtimeErrors).toEqual([])
})


test('Layout Master respects per-template section contracts', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))
  await page.goto('/studio/')
  await page.locator('#toggleEditor').click()
  await page.getByRole('button',{name:'Layout'}).click()

  await expect(page.locator('#layoutMaster')).toContainText('Soft Portfolio')
  await expect(page.locator('[data-layout-section="projects"]')).toContainText('3 of')
  await page.locator('[data-layout-section="projects"] [data-layout-toggle]').click()
  await expect(page.locator('#paper .ref-soft-projects')).toHaveCount(0)

  await page.locator('.template-card').filter({hasText:'Revenue Driver'}).click()
  await page.getByRole('button',{name:'Layout'}).click()
  await expect(page.locator('[data-layout-section="projects"]')).toContainText('Not used by this template')
  await expect(page.locator('[data-layout-section="projects"] [data-layout-toggle]')).toHaveCount(0)

  await page.locator('[data-layout-section="experience"] [data-layout-toggle]').click()
  await expect(page.locator('#paper .ref-sales-experience')).toHaveCount(0)

  await page.locator('.template-card').filter({hasText:'Bento Resume'}).click()
  await page.getByRole('button',{name:'Layout'}).click()
  await expect(page.locator('#layoutMaster')).toContainText('Flexible hierarchy')
  await expect(page.locator('[data-layout-section="languages"] [data-layout-toggle]')).toHaveCount(1)
  expect(runtimeErrors).toEqual([])
})


test('canonical workspace mirrors static Studio edits', async ({ page }) => {
  await page.goto('/studio/')
  await page.locator('#toggleEditor').click()
  await page.locator('#name').fill('Canonical QA')
  await page.locator('#name').dispatchEvent('input')

  await expect.poll(async () => page.evaluate(() => {
    const workspace=JSON.parse(localStorage.getItem('cv-studio-workspace-v3')||'null')
    return workspace?.profile?.name || ''
  })).toBe('Canonical QA')

  await page.getByRole('button',{name:'Layout'}).click()
  await page.locator('[data-layout-section="projects"] [data-layout-toggle]').click()

  const workspace=await page.evaluate(()=>JSON.parse(localStorage.getItem('cv-studio-workspace-v3')||'null'))
  expect(workspace.format).toBe('cv-studio-workspace')
  expect(workspace.schemaVersion).toBe(3)
  expect(workspace.profile.sections.find((item)=>item.id==='projects').enabled).toBe(false)
  expect(workspace.studio.selectedId).toBeTruthy()
})


test('Vue export opens PDF Preflight and Backup uses canonical workspace', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button',{name:'Export PDF'}).click()
  await expect(page.getByRole('heading',{name:'PDF Preflight'})).toBeVisible()
  await page.getByRole('button',{name:'Close PDF preflight'}).click()

  await page.getByRole('button',{name:'Backup'}).click()
  await expect(page.getByRole('heading',{name:'Backup & Recovery'})).toBeVisible()
  const workspace=await page.evaluate(()=>JSON.parse(localStorage.getItem('cv-studio-workspace-v3')||'null'))
  expect(workspace?.schemaVersion).toBe(3)
})
