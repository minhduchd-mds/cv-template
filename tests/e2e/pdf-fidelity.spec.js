import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const templates = [
  ['executive-edge','Executive Edge'],
  ['soft-portfolio-pro','Soft Portfolio'],
  ['product-operator','Product Operator'],
  ['code-aware','Code Aware'],
  ['ats-precision','ATS Precision'],
  ['insight-grid','Insight Grid'],
  ['brand-motion','Brand Motion'],
  ['revenue-driver','Revenue Driver'],
  ['people-first','People First'],
  ['next-start','Next Start'],
  ['modern-bento','Bento Resume'],
  ['executive-navy','Executive Navy'],
  ['ats-clean','ATS Clean'],
  ['modern-mono','Mono Grid'],
  ['young-creator-cards','Creator Cards'],
  ['strategy-brief','Strategy Brief'],
  ['clinical-clean','Clinical Clean'],
  ['finance-ledger','Finance Ledger'],
  ['studio-director','Studio Director'],
  ['research-scholar','Research Scholar'],
]

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}+#./@%-]+/gu,' ')
  .replace(/\s+/g,' ')
  .trim()

const command = (name,args=[]) => execFileSync(name,args,{ encoding:'utf8',stdio:['ignore','pipe','pipe'] })

const requirePdfTools = () => {
  for (const name of ['pdftotext','pdfinfo']) {
    try { command(name,['-v']) }
    catch (error) {
      throw new Error(
        name+' is required for the real PDF fidelity audit. Install Poppler (pdftotext + pdfinfo) before running npm run test:pdf-fidelity.\\n'+
        String(error?.stderr || error?.message || error)
      )
    }
  }
}

const pdfInfo = (file) => {
  const raw=command('pdfinfo',[file])
  const pages=Number(raw.match(/^Pages:\s+(\d+)/mi)?.[1] || 0)
  const size=raw.match(/^Page size:\s+([0-9.]+)\s+x\s+([0-9.]+)\s+pts/mi)
  return {
    pages,
    widthPt:Number(size?.[1] || 0),
    heightPt:Number(size?.[2] || 0),
  }
}

const pdfText = (file) => {
  const output=file+'.txt'
  execFileSync('pdftotext',['-layout',file,output],{stdio:['ignore','pipe','pipe']})
  return readFileSync(output,'utf8')
}

const matchValue = (haystack,value) => {
  const needle=normalize(value)
  if(!needle)return true
  if(haystack.includes(needle))return true
  const words=needle.split(' ').filter(Boolean)
  if(words.length>=7)return haystack.includes(words.slice(0,6).join(' '))
  if(words.length>=4)return haystack.includes(words.slice(0,4).join(' '))
  return false
}

const selectTemplate = async (page,name) => {
  const card=page.locator('.template-card').filter({hasText:name}).first()
  await expect(card,'Template card missing: '+name).toBeVisible()
  await card.click()
  await expect(page.locator('.preview-title')).toContainText(name)
}

const prepareVuePrint = async (page) => {
  await page.evaluate(() => {
    window.__printCalled=false
    window.print=()=>{ window.__printCalled=true }
  })
  await page.getByRole('button',{name:/Export PDF/i}).click()
  await expect(page.getByRole('heading',{name:'PDF Preflight'})).toBeVisible()
  const one=page.locator('.vue-preflight-dialog input[value="one"]')
  const onePagePossible=!(await one.isDisabled())
  const selectedMode=onePagePossible?'one':'multi'
  await page.getByRole('button',{name:'Open print dialog'}).click()
  await expect.poll(()=>page.evaluate(()=>window.__printCalled)).toBe(true)

  const state=await page.locator('.print-document .cv-sheet').evaluate((sheet)=>({
    mode:sheet.dataset.printMode || '',
    fit:Number(sheet.dataset.printFit || '1'),
    policy:sheet.classList.contains('print-stack-safe')?'stack-safe':'preserve-flow',
    width:sheet.style.getPropertyValue('--print-width'),
    minHeight:sheet.style.getPropertyValue('--print-min-height'),
  }))
  expect(state.mode).toBe(selectedMode)
  expect(state.fit).toBeGreaterThanOrEqual(.68)
  expect(state.fit).toBeLessThanOrEqual(1)
  return {onePagePossible,...state}
}

const semanticSource = async (page) => page.locator('.print-document .cv-sheet').evaluate((sheet)=>{
  const source=String(sheet.innerText||sheet.textContent||'').replace(/\u00a0/g,' ').trim()
  const anchors=[...sheet.querySelectorAll('h1,h2,h3,.ref-contact span,.contact-row span,.product-contact span,.creative-contact span,.executive-contact span')]
    .filter((node)=>node.getClientRects().length > 0)
    .map((node)=>String(node.textContent||'').replace(/\s+/g,' ').trim())
    .filter((value)=>value.length>=3&&value.length<=120)
  const lines=source.split(/\n+/).map((line)=>line.replace(/\s+/g,' ').trim())
    .filter((line)=>line.length>=4&&line.length<=180)
  return {
    source,
    anchors:[...new Set(anchors)].slice(0,18),
    lines:[...new Set(lines)].slice(0,45),
  }
})

test.describe.configure({mode:'serial'})

test.beforeAll(() => {
  requirePdfTools()
})

test('PDF Fidelity 20/20: A4 output retains semantic text and respects preflight mode', async ({page},testInfo) => {
  test.setTimeout(180_000)
  const matrix=[]

  await page.goto('/#studio')
  for(const [id,name] of templates){
    await page.emulateMedia({media:'screen'})
    await selectTemplate(page,name)
    const printState=await prepareVuePrint(page)
    await page.emulateMedia({media:'print'})
    const semantic=await semanticSource(page)

    const pdfPath=testInfo.outputPath('pdf-'+id+'.pdf')
    await page.emulateMedia({media:'print'})
    await page.pdf({
      path:pdfPath,
      printBackground:true,
      preferCSSPageSize:true,
      tagged:true,
      outline:false,
    })

    const info=pdfInfo(pdfPath)
    const extracted=pdfText(pdfPath)
    const normalizedPdf=normalize(extracted)
    const anchorMatched=semantic.anchors.filter((value)=>matchValue(normalizedPdf,value)).length
    const lineMatched=semantic.lines.filter((value)=>matchValue(normalizedPdf,value)).length
    const anchorRetention=semantic.anchors.length ? anchorMatched/semantic.anchors.length : 1
    const lineRetention=semantic.lines.length ? lineMatched/semantic.lines.length : 1

    expect.soft(info.widthPt,name+' PDF width').toBeGreaterThan(590)
    expect.soft(info.widthPt,name+' PDF width').toBeLessThan(600)
    expect.soft(info.heightPt,name+' PDF height').toBeGreaterThan(837)
    expect.soft(info.heightPt,name+' PDF height').toBeLessThan(847)
    expect.soft(anchorRetention,name+' critical text retention').toBeGreaterThanOrEqual(.9)
    expect.soft(lineRetention,name+' source text retention').toBeGreaterThanOrEqual(.72)
    expect.soft(normalizedPdf,name+' name missing from PDF').toContain(normalize(semantic.anchors[0] || ''))
    if(printState.mode==='one')expect.soft(info.pages,name+' one-page preflight produced extra pages').toBe(1)
    else expect.soft(info.pages,name+' multi-page output').toBeGreaterThanOrEqual(1)

    matrix.push({
      id,name,
      mode:printState.mode,
      fit:printState.fit,
      policy:printState.policy,
      pages:info.pages,
      pageSizePt:[info.widthPt,info.heightPt],
      missingAnchors:semantic.anchors.filter((value)=>!matchValue(normalizedPdf,value)),
      anchors:{matched:anchorMatched,total:semantic.anchors.length,retention:Number(anchorRetention.toFixed(3))},
      sourceLines:{matched:lineMatched,total:semantic.lines.length,retention:Number(lineRetention.toFixed(3))},
    })
  }

  const matrixPath=testInfo.outputPath('pdf-fidelity-matrix.json')
  writeFileSync(matrixPath,JSON.stringify(matrix,null,2))
  await testInfo.attach('PDF Fidelity matrix',{path:matrixPath,contentType:'application/json'})
})

test('multi-page export keeps the final evidence instead of clipping it', async ({page},testInfo) => {
  test.setTimeout(60_000)
  await page.goto('/#studio')
  await expect.poll(() => page.evaluate(() => Boolean(JSON.parse(localStorage.getItem('cv-studio-workspace-v3') || 'null')?.profile))).toBe(true)

  await page.evaluate(() => {
    const key='cv-studio-workspace-v3'
    const workspace=JSON.parse(localStorage.getItem(key)||'null')
    if(!workspace?.profile)throw new Error('Canonical workspace was not initialized.')
    const seed=workspace.profile.experience?.[0] || {
      role:'Product Designer',company:'Example',location:'Hanoi',period:'2024 — Present',bullets:['Delivered product design work.']
    }
    workspace.profile.experience=Array.from({length:9},(_,index)=>({
      ...seed,
      role:'PDF Stress Role '+(index+1),
      company:'PDF Stress Company '+(index+1),
      period:'202'+(index%6)+' — 202'+((index+1)%7),
      bullets:[
        'Led a cross-functional initiative across research, interaction design, prototyping, validation and delivery for a complex enterprise workflow.',
        'Documented design decisions and measurable product outcomes while collaborating with product, engineering and business stakeholders.',
        index===8 ? 'PDF FINAL EVIDENCE MARKER 98427' : 'Maintained clear implementation evidence and release documentation for this workstream.',
      ],
    }))
    workspace.updatedAt=new Date().toISOString()
    localStorage.setItem(key,JSON.stringify(workspace))
    localStorage.setItem('cv-studio-profile-v1',JSON.stringify(workspace.profile))
  })
  await page.reload()
  await selectTemplate(page,'ATS Clean')

  await page.evaluate(() => {
    window.__printCalled=false
    window.print=()=>{ window.__printCalled=true }
  })
  await page.getByRole('button',{name:/Export PDF/i}).click()
  await expect(page.getByRole('heading',{name:'PDF Preflight'})).toBeVisible()
  const multi=page.locator('.vue-preflight-dialog input[value="multi"]')
  await multi.check()
  await page.getByRole('button',{name:'Open print dialog'}).click()

  const state=await page.locator('.print-document .cv-sheet').evaluate((sheet)=>({
    mode:sheet.dataset.printMode,
    fit:Number(sheet.dataset.printFit||'0'),
  }))
  expect(state.mode).toBe('multi')
  expect(state.fit).toBe(1)

  const pdfPath=testInfo.outputPath('pdf-multipage-stress.pdf')
  await page.emulateMedia({media:'print'})
  await page.pdf({path:pdfPath,printBackground:true,preferCSSPageSize:true,tagged:true})
  const info=pdfInfo(pdfPath)
  const extracted=normalize(pdfText(pdfPath))
  expect(info.pages).toBeGreaterThanOrEqual(2)
  expect(extracted).toContain(normalize('PDF FINAL EVIDENCE MARKER 98427'))
})


test('dedicated stack-safe export preserves final experience evidence', async ({page},testInfo) => {
  test.setTimeout(70_000)
  await page.goto('/#studio')
  await expect.poll(() => page.evaluate(() => Boolean(JSON.parse(localStorage.getItem('cv-studio-workspace-v3') || 'null')?.profile))).toBe(true)

  await page.evaluate(() => {
    const key='cv-studio-workspace-v3'
    const workspace=JSON.parse(localStorage.getItem(key)||'null')
    if(!workspace?.profile)throw new Error('Canonical workspace was not initialized.')
    const base=workspace.profile.experience?.[0]||{
      role:'Business Development Manager',
      company:'Example Corp',
      location:'Hanoi',
      period:'2024 — Present',
      bullets:['Delivered commercial growth.'],
    }
    workspace.profile.experience=Array.from({length:8},(_,index)=>({
      ...base,
      role:'Revenue Stress Role '+(index+1),
      company:'Revenue Stress Company '+(index+1),
      period:'202'+(index%6)+' — 202'+((index+1)%7),
      bullets:[
        'Built and managed complex commercial partnerships across multiple stakeholders, product lines and delivery teams.',
        'Improved pipeline quality through account planning, structured discovery and measurable follow-up actions.',
        index===7 ? 'REVENUE FINAL EVIDENCE MARKER 77193' : 'Maintained documented outcomes and commercial evidence for this account portfolio.',
      ],
    }))
    workspace.updatedAt=new Date().toISOString()
    localStorage.setItem(key,JSON.stringify(workspace))
    localStorage.setItem('cv-studio-profile-v1',JSON.stringify(workspace.profile))
  })
  await page.reload()
  await selectTemplate(page,'Revenue Driver')

  await page.evaluate(() => {
    window.__printCalled=false
    window.print=()=>{ window.__printCalled=true }
  })
  await page.getByRole('button',{name:/Export PDF/i}).click()
  await expect(page.getByRole('heading',{name:'PDF Preflight'})).toBeVisible()
  await page.locator('.vue-preflight-dialog input[value="multi"]').check()
  await page.getByRole('button',{name:'Open print dialog'}).click()

  await page.emulateMedia({media:'print'})
  const policy=await page.locator('.print-document .cv-sheet').evaluate((sheet)=>({
    stackSafe:sheet.classList.contains('print-stack-safe'),
    mode:sheet.dataset.printMode,
    salesDisplay:getComputedStyle(sheet.querySelector('.ref-sales-body')).display,
  }))
  expect(policy.stackSafe).toBe(true)
  expect(policy.mode).toBe('multi')
  expect(policy.salesDisplay).toBe('block')

  const pdfPath=testInfo.outputPath('pdf-revenue-driver-stack-safe.pdf')
  await page.pdf({path:pdfPath,printBackground:true,preferCSSPageSize:true,tagged:true})
  const info=pdfInfo(pdfPath)
  const extracted=normalize(pdfText(pdfPath))
  expect(info.pages).toBeGreaterThanOrEqual(2)
  expect(extracted).toContain(normalize('REVENUE FINAL EVIDENCE MARKER 77193'))
})
