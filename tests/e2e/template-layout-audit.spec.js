import { test, expect } from '@playwright/test'

const templates = [
  { id:'executive-edge', name:'Executive Edge', mode:'fixed', projects:4 },
  { id:'soft-portfolio-pro', name:'Soft Portfolio', mode:'fixed', projects:3 },
  { id:'product-operator', name:'Product Operator', mode:'fixed' },
  { id:'code-aware', name:'Code Aware', mode:'fixed' },
  { id:'ats-precision', name:'ATS Precision', mode:'guided', projects:2 },
  { id:'insight-grid', name:'Insight Grid', mode:'fixed' },
  { id:'brand-motion', name:'Brand Motion', mode:'fixed', projects:3 },
  { id:'revenue-driver', name:'Revenue Driver', mode:'fixed', projects:0 },
  { id:'people-first', name:'People First', mode:'fixed', projects:0 },
  { id:'next-start', name:'Next Start', mode:'fixed', projects:2, summary:false },
  { id:'modern-bento', name:'Bento Resume', mode:'flexible' },
  { id:'executive-navy', name:'Executive Navy', mode:'flexible' },
  { id:'ats-clean', name:'ATS Clean', mode:'flexible' },
  { id:'modern-mono', name:'Mono Grid', mode:'flexible' },
  { id:'young-creator-cards', name:'Creator Cards', mode:'flexible' },
  { id:'strategy-brief', name:'Strategy Brief', mode:'flexible' },
  { id:'clinical-clean', name:'Clinical Clean', mode:'flexible' },
  { id:'finance-ledger', name:'Finance Ledger', mode:'flexible' },
  { id:'studio-director', name:'Studio Director', mode:'flexible' },
  { id:'research-scholar', name:'Research Scholar', mode:'flexible' },
]

const selectTemplate = async (page, template) => {
  await page.locator('.template-card').filter({ hasText: template.name }).click()
  await expect(page.locator('#activeTemplateLabel')).toContainText(template.name)
}

test.describe('20-template visual layout audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/studio/')
  })

  for (const template of templates) {
    test(template.name+' stays within the paper and matches its layout contract', async ({ page }, testInfo) => {
      const runtimeErrors=[]
      page.on('pageerror',(error)=>runtimeErrors.push(error.message))
      await selectTemplate(page,template)

      const geometry=await page.locator('#paper').evaluate((paper)=>{
        const root=paper.getBoundingClientRect()
        const offenders=[...paper.querySelectorAll('*')].map((node)=>{
          const rect=node.getBoundingClientRect()
          return {
            tag:node.tagName,
            cls:String(node.className||'').slice(0,80),
            left:rect.left-root.left,
            right:rect.right-root.right,
          }
        }).filter((item)=>item.left < -2 || item.right > 2).slice(0,12)
        return {
          scrollWidth:paper.scrollWidth,
          clientWidth:paper.clientWidth,
          scrollHeight:paper.scrollHeight,
          clientHeight:paper.clientHeight,
          offenders,
        }
      })
      expect(geometry.scrollWidth,JSON.stringify(geometry.offenders)).toBeLessThanOrEqual(geometry.clientWidth+2)
      expect(geometry.offenders,JSON.stringify(geometry.offenders)).toHaveLength(0)

      await page.locator('#toggleEditor').click()
      await page.getByRole('button',{name:'Layout'}).click()
      await expect(page.locator('#layoutMaster')).toContainText(template.name)
      const modeText=template.mode==='flexible'?'Flexible hierarchy':template.mode==='guided'?'Guided hierarchy':'Fixed hierarchy'
      await expect(page.locator('#layoutMaster')).toContainText(modeText)

      if(template.mode==='flexible'){
        await expect(page.locator('#layoutMaster [data-layout-section].draggable')).toHaveCount(5)
      }else{
        await expect(page.locator('#layoutMaster [data-layout-section].draggable')).toHaveCount(0)
      }

      const projectRow=page.locator('[data-layout-section="projects"]')
      if(template.projects===0){
        await expect(projectRow).toContainText('Not used by this template')
        await expect(projectRow.locator('[data-layout-toggle]')).toHaveCount(0)
      }else if(template.projects){
        const text=await projectRow.textContent()
        expect(text).toContain(String(template.projects)+' of')
      }

      if(template.summary===false){
        const summaryRow=page.locator('[data-layout-section="summary"]')
        await expect(summaryRow).toContainText('Not used by this template')
      }

      const masterBounds=await page.locator('#layoutMaster').evaluate((node)=>({
        scrollWidth:node.scrollWidth,clientWidth:node.clientWidth
      }))
      expect(masterBounds.scrollWidth).toBeLessThanOrEqual(masterBounds.clientWidth+1)
      expect(runtimeErrors).toEqual([])

      if(testInfo.project.name==='desktop-chromium'){
        await page.screenshot({path:testInfo.outputPath('template-'+template.id+'.png'),fullPage:true})
      }
    })
  }

  test('flexible templates reorder only inside their column group', async ({ page }) => {
    await selectTemplate(page,templates.find((item)=>item.id==='modern-bento'))
    await page.locator('#toggleEditor').click()
    await page.getByRole('button',{name:'Layout'}).click()

    const summary=page.locator('[data-layout-section="summary"]')
    const experience=page.locator('[data-layout-section="experience"]')
    await summary.dragTo(experience)

    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cv-studio-static-settings-v2')||'{}').sectionOrder)
    expect(saved.indexOf('summary')).toBeGreaterThan(saved.indexOf('experience'))

    const skills=page.locator('[data-layout-section="skills"]')
    await experience.dragTo(skills)
    const afterCrossGroup=await page.evaluate(()=>JSON.parse(localStorage.getItem('cv-studio-static-settings-v2')||'{}').sectionOrder)
    expect(afterCrossGroup).toEqual(saved)
  })

  test('template preview remains contained at the current viewport', async ({ page }) => {
    for(const template of templates){
      await selectTemplate(page,template)
      const shell=await page.evaluate(()=>({
        bodyScroll:document.documentElement.scrollWidth,
        viewport:window.innerWidth,
        stageScroll:document.querySelector('.paper-stage')?.scrollWidth||0,
        stageClient:document.querySelector('.paper-stage')?.clientWidth||0,
      }))
      expect(shell.bodyScroll).toBeLessThanOrEqual(shell.viewport+2)
      expect(shell.stageScroll).toBeGreaterThanOrEqual(shell.stageClient)
    }
  })
})
