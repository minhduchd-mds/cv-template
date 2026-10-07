import { test, expect } from '@playwright/test'

test('static ATS scanner separates readiness from target fit and supports edits', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.getByRole('button', { name: /^ATS Scan/i }).click()

  await expect(page.getByRole('heading', { name: 'ATS Scanner' })).toBeVisible()
  await expect(page.locator('#atsProReadiness')).not.toHaveText('—')
  await expect(page.locator('#atsProFit')).not.toHaveText('—')
  await expect(page.locator('#atsProMetrics article')).toHaveCount(5)
  await expect(page.locator('.ats-pro-method')).toContainText('Text extraction 30%')

  await page.getByRole('button', { name: /Optimize/ }).click()
  await page.locator('#atsProRole').selectOption('sales')
  await page.locator('#atsProIndustry').selectOption('technology')
  await page.locator('#atsProSeniority').selectOption('senior')
  await expect(page.locator('#atsProTargetHint')).toContainText('Sales · Business Development')

  await page.getByRole('button', { name: /Overview/ }).click()
  const nameRow = page.locator('.ats-field-row').filter({ hasText: 'Name' }).first()
  await expect(nameRow).toContainText(/Readable|Partial/)
  await nameRow.getByRole('button', { name: 'Edit' }).click()
  await expect(page.locator('#editor')).not.toHaveClass(/collapsed/)
  await expect(page.locator('#name')).toBeFocused()

  await page.getByRole('button', { name: /^ATS Scan/i }).click()
  await page.getByRole('button', { name: /Verify/ }).click()
  await page.getByRole('button', { name: 'ATS sees this' }).click()
  await expect(page.locator('#atsPlainText')).toContainText('Alex Chen')

  await page.getByRole('button', { name: /Optimize/ }).click()
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

  await page.getByRole('button', { name: /^ATS Scan/i }).click()
  await page.getByRole('button', { name: /Verify/ }).click()
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
  await page.locator('.template-card').filter({ hasText: 'Executive Edge' }).click()
  await page.getByRole('button', { name: /^ATS Scan/i }).click()
  await page.getByRole('button',{name:/Optimize/}).click()
  await expect(page.locator('#atsShell').getByText('ATS Heatmap', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Show heatmap' }).click()
  await expect(page.locator('#paper')).toHaveClass(/ats-heatmap-active/)
  await expect(page.locator('#atsHeatmapLegend')).toBeVisible()
  await expect(page.locator('#paper .ats-heat').first()).toBeVisible()

  const summary = page.locator('#paper [data-ats-heat-field="Summary"]').first()
  await expect(summary).toHaveClass(/ats-heat-/)

  await page.getByRole('button', { name: 'Close ATS Scanner', exact: true }).click()
  await page.getByRole('button', { name: 'Hide ATS heatmap' }).click()
  await expect(page.locator('#paper')).not.toHaveClass(/ats-heatmap-active/)

  expect(runtimeErrors).toEqual([])
})


test('ATS Auto Fix applies factual safe fixes and supports undo', async ({ page }) => {
  const runtimeErrors = []
  page.on('pageerror', (error) => runtimeErrors.push(error.message))

  await page.addInitScript(() => {
    const key='cv-studio-static-v2'
    const saved=JSON.parse(localStorage.getItem(key)||'{}')
    saved.summary=''
    saved.skills=['Product Design','Figma']
    saved.experience=[{
      role:'Product Designer',
      company:'Example Co',
      period:'2022 — Present',
      location:'Hanoi',
      bullets:['Responsible for design systems across product teams.']
    }]
    localStorage.setItem(key,JSON.stringify(saved))
  })

  await page.goto('/studio/')
  await page.getByRole('button', { name: /^ATS Scan/i }).click()

  await page.getByRole('button',{name:/Optimize/}).click()
  await expect(page.getByText('ATS Auto Fix')).toBeVisible()
  await expect(page.locator('#atsAutoFixList .ats-auto-card.safe').first()).toBeVisible()

  const before=await page.locator('#summary').inputValue()
  await page.locator('#atsAutoFixList [data-auto-apply="summary"]').click()
  await expect(page.locator('#summary')).not.toHaveValue(before)
  await expect(page.locator('#paper')).toContainText('Product Designer')

  await page.locator('#atsAutoUndo').click()
  await expect(page.locator('#summary')).toHaveValue(before)

  expect(runtimeErrors).toEqual([])
})


test('ATS versions save compare and restore snapshots locally', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:/Applications/}).click()
  await page.getByRole('button',{name:'Versions'}).click()

  await expect(page.getByText('CV Version Compare')).toBeVisible()
  await page.locator('#atsVersionName').fill('Baseline')
  await page.locator('#atsVersionSave').click()
  await expect(page.locator('#atsVersionList')).toContainText('Baseline')

  await page.getByRole('button', { name: 'Close ATS Scanner', exact: true }).click()
  await page.getByRole('button', { name: 'Edit CV', exact: true }).click()
  const skills=page.locator('#skills')
  await skills.fill((await skills.inputValue())+'\\nUser Research')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:/Applications/}).click()
  await page.getByRole('button',{name:'Versions'}).click()
  await page.locator('#atsVersionName').fill('Tailored')
  await page.locator('#atsVersionSave').click()

  await expect(page.locator('#atsVersionList .ats-version-card')).toHaveCount(2)
  const baselineId = await page.locator('#atsCompareA option').filter({ hasText: 'Baseline' }).getAttribute('value')
  const tailoredId = await page.locator('#atsCompareB option').filter({ hasText: 'Tailored' }).getAttribute('value')
  await page.locator('#atsCompareA').selectOption(baselineId)
  await page.locator('#atsCompareB').selectOption(tailoredId)
  await page.locator('#atsCompareRun').click()
  await expect(page.locator('#atsCompareResult')).toBeVisible()
  await expect(page.locator('#atsCompareContent')).toContainText('User Research')

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cv-studio-ats-versions-v1')||'[]'))
  expect(saved).toHaveLength(2)
  expect(saved[0].profile.avatar).toBe('')
  expect(runtimeErrors).toEqual([])
})


test('ATS application workspace creates tracks and restores a job snapshot', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:'Applications'}).click()

  await expect(page.getByText('Track one job from JD to final PDF')).toBeVisible()
  await page.locator('#atsAppCompany').fill('Example Corp')
  await page.locator('#atsAppRole').fill('Senior Product Designer')
  await page.locator('#atsAppJd').fill('Design systems, user research and stakeholder management.')
  await page.locator('#atsAppNotes').fill('Referral from design team')
  await page.locator('#atsAppCreate').click()

  await expect(page.locator('#atsAppList .ats-app-card')).toHaveCount(1)
  await expect(page.locator('#atsAppList')).toContainText('Example Corp')
  await expect(page.locator('#atsAppList')).toContainText('Referral from design team')

  await page.locator('[data-app-status]').selectOption('Applied')
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('cv-studio-ats-applications-v1')||'[]'))
  expect(stored).toHaveLength(1)
  expect(stored[0].status).toBe('Applied')
  expect(stored[0].profile.avatar).toBe('')
  expect(stored[0].jd).toContain('Design systems')

  expect(runtimeErrors).toEqual([])
})


test('ATS application analytics summarizes pipeline keywords and follow-ups', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))

  await page.addInitScript(() => {
    localStorage.setItem('cv-studio-ats-applications-v1',JSON.stringify([
      {
        id:'a1',company:'Alpha',role:'Senior Product Designer',status:'Interview',
        updatedAt:'2026-09-24T08:00:00.000Z',followUpDate:'2026-09-24',
        source:{versionName:'UIUX v1'},target:{role:'uiux',industry:'technology',seniority:'senior'},
        scores:{readiness:88,targetFit:76,pdfFidelity:94,jdMatch:72},
        jd:'User research accessibility stakeholder management design systems',
        profile:{role:'Senior Product Designer',skills:['Design Systems'],summary:'Enterprise product designer',experience:[],projects:[]},
        stageHistory:[{status:'Applied',at:'2026-09-20T08:00:00.000Z'},{status:'Interview',at:'2026-09-23T08:00:00.000Z'}]
      },
      {
        id:'a2',company:'Beta',role:'Product Designer',status:'Applied',
        updatedAt:'2026-09-24T08:00:00.000Z',followUpDate:'2026-09-30',
        source:{versionName:'UIUX v2'},target:{role:'uiux',industry:'technology',seniority:'senior'},
        scores:{readiness:92,targetFit:81,pdfFidelity:96,jdMatch:78},
        jd:'Accessibility user research product strategy',
        profile:{role:'Product Designer',skills:['Product Strategy'],summary:'Product designer',experience:[],projects:[]},
        stageHistory:[{status:'Applied',at:'2026-09-24T08:00:00.000Z'}]
      }
    ]))
  })

  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:/Applications/}).click()
  await page.getByRole('button',{name:'Analytics'}).click()

  await expect(page.getByText('Pipeline & CV evidence')).toBeVisible()
  await expect(page.locator('#atsAnalyticsHeadline')).toContainText('2')
  await expect(page.locator('#atsAnalyticsFunnel')).toContainText('Interview')
  await expect(page.locator('#atsAnalyticsKeywords')).toContainText('accessibility')
  await expect(page.locator('#atsAnalyticsRoles')).toContainText('Senior Product Designer')
  await expect(page.locator('#atsAnalyticsVersions')).toContainText('UIUX v1')
  expect(runtimeErrors).toEqual([])
})


test('ATS UX V3 consolidates scanner navigation and next action', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))

  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()

  await expect(page.locator('#atsV3Nav [data-v3-group]')).toHaveCount(4)
  await expect(page.locator('.ats-v3-legacy-tabs')).toBeHidden()
  await expect(page.locator('#atsV3Next')).toBeVisible()

  await page.getByRole('button',{name:/Optimize/}).click()
  await expect(page.locator('#atsProTarget')).toBeVisible()
  await expect(page.locator('#atsAutoFix')).toBeAttached()

  await page.getByRole('button',{name:/Verify/}).click()
  await page.getByRole('button',{name:'PDF verify'}).click()
  await expect(page.locator('[data-ats-pane="pdf"]')).toHaveClass(/active/)

  await page.getByRole('button',{name:/Applications/}).click()
  await expect(page.locator('.ats-panel')).toHaveClass(/ats-v3-wide/)
  await page.getByRole('button',{name:'Analytics'}).click()
  await expect(page.locator('[data-ats-pane="analytics"]')).toHaveClass(/active/)

  expect(runtimeErrors).toEqual([])
})


test('ATS V3 layout remains bounded across viewport sizes', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))
  for (const viewport of [{width:1440,height:900},{width:768,height:1024},{width:390,height:844}]) {
    await page.setViewportSize(viewport)
    await page.goto('/studio/')
    await page.getByRole('button',{name:/^ATS Scan/i}).click()
    await page.getByRole('button',{name:/Applications/}).click()
    const bounds=await page.locator('.ats-panel').evaluate((panel)=>({
      left:panel.getBoundingClientRect().left,
      right:panel.getBoundingClientRect().right,
      width:panel.getBoundingClientRect().width,
      viewport:window.innerWidth,
      scrollWidth:panel.scrollWidth,
      clientWidth:panel.clientWidth
    }))
    expect(bounds.left).toBeGreaterThanOrEqual(-1)
    expect(bounds.right).toBeLessThanOrEqual(bounds.viewport+1)
    expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.clientWidth+1)
  }
  expect(runtimeErrors).toEqual([])
})


test('ATS analytics V2 infers skipped funnel stages but times explicit events only', async ({ page }) => {
  const runtimeErrors=[]
  page.on('pageerror',(error)=>runtimeErrors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('cv-studio-ats-applications-v1',JSON.stringify([
      {id:'v2-a1',company:'Alpha',role:'Senior Product Designer',status:'Offer',createdAt:'2026-09-01T08:00:00.000Z',updatedAt:'2026-09-10T08:00:00.000Z',source:{versionName:'UIUX Baseline'},scores:{readiness:90,targetFit:82,pdfFidelity:96,jdMatch:80},jd:'User research stakeholder management design systems accessibility',profile:{role:'Senior Product Designer',skills:['Design Systems'],summary:'Enterprise product designer',experience:[],projects:[]},stageHistory:[{status:'Applied',at:'2026-09-02T08:00:00.000Z',inferred:false},{status:'Interview',at:'2026-09-05T08:00:00.000Z',inferred:false},{status:'Offer',at:'2026-09-08T08:00:00.000Z',inferred:false}]},
      {id:'v2-a2',company:'Beta',role:'Product Designer',status:'Interview',createdAt:'2026-09-03T08:00:00.000Z',updatedAt:'2026-09-06T08:00:00.000Z',source:{versionName:'UIUX Tailored'},scores:{readiness:88,targetFit:78,pdfFidelity:94,jdMatch:75},jd:'Accessibility user research product strategy',profile:{role:'Product Designer',skills:['Product Strategy'],summary:'Product designer',experience:[],projects:[]},stageHistory:[{status:'Interview',at:'2026-09-06T08:00:00.000Z',inferred:false}]}
    ]))
  })
  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:/Applications/}).click()
  await page.getByRole('button',{name:'Analytics'}).click()
  await expect(page.locator('#atsAnalyticsV2Velocity')).toContainText('Reached Applied')
  await expect(page.locator('#atsAnalyticsV2Velocity')).toContainText('2')
  await expect(page.locator('#atsAnalyticsV2Velocity')).toContainText('3 d')
  await expect(page.locator('#atsAnalyticsVersionEvidence')).toContainText('UIUX Baseline')
  await expect(page.locator('#atsAnalyticsKeywords')).toContainText('user research')
  await expect(page.locator('#atsAnalyticsKeywords')).toContainText('stakeholder management')
  await expect(page.locator('#atsAnalyticsDataCoverage')).toContainText('Stage history')
  expect(runtimeErrors).toEqual([])
})

test('ATS application stage jump records inferred milestones for funnel integrity', async ({ page }) => {
  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:/Applications/}).click()
  await page.locator('#atsAppCompany').fill('Jump Corp')
  await page.locator('#atsAppRole').fill('Product Designer')
  await page.locator('#atsAppCreate').click()
  await page.locator('[data-app-status]').selectOption('Interview')
  const history=await page.evaluate(() => {const apps=JSON.parse(localStorage.getItem('cv-studio-ats-applications-v1')||'[]');return apps[0]?.stageHistory||[]})
  expect(history.some((entry)=>entry.status==='Applied'&&entry.inferred===true)).toBeTruthy()
  expect(history.some((entry)=>entry.status==='Interview'&&entry.inferred===false)).toBeTruthy()
})


test('ATS analytics keyword matching uses exact tokens for single words', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('cv-studio-ats-applications-v1',JSON.stringify([
      {
        id:'kw-exact',company:'Gamma',role:'Platform Designer',status:'Applied',
        source:{versionName:'Exact-token CV'},scores:{readiness:90,targetFit:79,jdMatch:70},
        jd:'Senior role requiring Java and stakeholder management.',
        profile:{role:'Platform Designer',skills:['JavaScript'],summary:'JavaScript platform designer',experience:[],projects:[]},
        stageHistory:[{status:'Applied',at:'2026-09-25T08:00:00.000Z',inferred:false}]
      }
    ]))
  })
  await page.goto('/studio/')
  await page.getByRole('button',{name:/^ATS Scan/i}).click()
  await page.getByRole('button',{name:/Applications/}).click()
  await page.getByRole('button',{name:'Analytics'}).click()
  await expect(page.locator('#atsAnalyticsKeywords')).toContainText('java')
  await expect(page.locator('#atsAnalyticsKeywords')).toContainText('stakeholder management')
  await expect(page.locator('#atsAnalyticsKeywords')).not.toContainText('requiring')
  await expect(page.locator('#atsAnalyticsKeywords')).not.toContainText('senior')
  await expect(page.locator('#atsAnalyticsKeywords')).not.toContainText('management.')
})
