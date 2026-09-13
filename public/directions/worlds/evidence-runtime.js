(()=>{
  const STYLE_ID='cv-evidence-runtime-style'
  const DRAWER_ID='cv-evidence-drawer'

  const create=(tag,className,text)=>{
    const node=document.createElement(tag)
    if(className) node.className=className
    if(text!==undefined) node.textContent=text
    return node
  }

  const injectStyles=()=>{
    if(document.getElementById(STYLE_ID)) return
    const style=document.createElement('style')
    style.id=STYLE_ID
    style.textContent=`
      .evidence-trigger{cursor:pointer;position:relative;outline:none}.evidence-trigger::after{content:'Evidence ↗';position:absolute;right:12px;top:10px;z-index:3;padding:5px 7px;border:1px solid rgba(255,255,255,.13);border-radius:999px;background:rgba(9,10,14,.72);backdrop-filter:blur(12px);color:#d9d8d3;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;opacity:0;transform:translateY(3px);transition:opacity .2s ease,transform .2s ease}.evidence-trigger:hover::after,.evidence-trigger:focus-visible::after{opacity:1;transform:none}.evidence-trigger:focus-visible{box-shadow:0 0 0 2px #65e6c4,0 0 0 5px rgba(101,230,196,.16)}
      .evidence-backdrop{position:fixed;inset:0;z-index:160;display:grid;justify-items:end;background:rgba(5,6,9,.62);backdrop-filter:blur(14px);opacity:0;pointer-events:none;transition:opacity .24s ease}.evidence-backdrop.open{opacity:1;pointer-events:auto}.evidence-drawer{width:min(680px,92vw);height:100%;overflow:auto;background:linear-gradient(180deg,#111319 0%,#0c0e13 100%);border-left:1px solid rgba(255,255,255,.12);box-shadow:-30px 0 100px rgba(0,0,0,.38);color:#f6f4ef;transform:translateX(30px);transition:transform .28s cubic-bezier(.2,.75,.2,1)}.evidence-backdrop.open .evidence-drawer{transform:none}.evidence-shell{padding:22px 24px 42px}.evidence-top{position:sticky;top:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:16px;margin:-22px -24px 0;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(15,17,22,.88);backdrop-filter:blur(18px)}.evidence-top span{font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#8f929d}.evidence-close{border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:9px 12px;background:rgba(255,255,255,.05);color:#f5f4ef;font:inherit;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}.evidence-close:focus-visible{outline:2px solid #65e6c4;outline-offset:3px}.evidence-hero{padding:36px 0 26px}.evidence-kicker{display:block;margin-bottom:12px;color:#8f929d;font-size:8px;letter-spacing:.16em;text-transform:uppercase}.evidence-hero h2{margin:0;font-size:clamp(38px,6vw,64px);line-height:.94;letter-spacing:-.055em}.evidence-impact{margin:18px 0 0;padding:15px 16px;border:1px solid rgba(101,230,196,.22);border-radius:18px;background:linear-gradient(135deg,rgba(101,230,196,.09),rgba(138,124,255,.07));font-size:13px;line-height:1.55;color:#e4e4df}.evidence-chain{display:grid;gap:10px}.evidence-step{display:grid;grid-template-columns:86px 1fr;gap:16px;padding:16px 0;border-top:1px solid rgba(255,255,255,.1)}.evidence-step small{padding-top:2px;color:#838691;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.evidence-step p{margin:0;color:#c4c5cc;font-size:12px;line-height:1.7}.evidence-step.result p{color:#f0efe9}.evidence-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:26px 0}.evidence-meta article{padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.025)}.evidence-meta small,.evidence-artifacts>small{display:block;margin-bottom:8px;color:#858893;font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.evidence-meta p{margin:0;color:#b9bbc3;font-size:11px;line-height:1.65}.evidence-artifacts{padding-top:24px;border-top:1px solid rgba(255,255,255,.1)}.evidence-artifact-grid{display:grid;gap:8px}.evidence-artifact{display:grid;grid-template-columns:90px 1fr;gap:12px;align-items:center;padding:13px 14px;border:1px solid rgba(255,255,255,.1);border-radius:15px;background:rgba(255,255,255,.025)}.evidence-artifact b{font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#8a7cff}.evidence-artifact span{font-size:11px;color:#d5d5d0}.evidence-note{margin:22px 0 0;color:#777a85;font-size:9px;line-height:1.6}.evidence-mode-lock{overflow:hidden}
      @media(max-width:680px){.evidence-drawer{width:100vw}.evidence-shell{padding:18px 18px 34px}.evidence-top{margin:-18px -18px 0;padding:15px 18px}.evidence-step{grid-template-columns:1fr;gap:7px}.evidence-meta{grid-template-columns:1fr}.evidence-artifact{grid-template-columns:74px 1fr}.evidence-trigger::after{opacity:.78}}
      @media(prefers-reduced-motion:reduce){.evidence-backdrop,.evidence-drawer,.evidence-trigger::after{transition:none!important}}
    `
    document.head.append(style)
  }

  const normalize=value=>String(value||'').replace(/\s+/g,' ').trim().toLowerCase()

  const resolveProject=(node,profile)=>{
    const explicit=node.closest('[data-project-id]')?.dataset.projectId
    if(explicit) return profile.projects.find(project=>project.id===explicit)||null

    const text=normalize(node.textContent).replace(/\s/g,'')
    const linkedProof=(profile.proof||[]).find(item=>item.projectId&&text.includes(normalize(item.value).replace(/\s/g,'')))
    if(linkedProof) return profile.projects.find(project=>project.id===linkedProof.projectId)||null

    if(text.includes('7→3')||text.includes('7to3')||text.includes('7→ 3')){
      return profile.projects.find(project=>project.id==='signal-ai')||null
    }
    return null
  }

  const buildDrawer=profile=>{
    const backdrop=create('div','evidence-backdrop')
    backdrop.id=DRAWER_ID
    backdrop.hidden=true
    backdrop.setAttribute('aria-hidden','true')
    backdrop.setAttribute('role','presentation')

    const drawer=create('section','evidence-drawer')
    drawer.setAttribute('role','dialog')
    drawer.setAttribute('aria-modal','true')
    drawer.setAttribute('aria-label','Project evidence')

    const shell=create('div','evidence-shell')
    const top=create('div','evidence-top')
    top.append(create('span','','Evidence chain · baseline to artifact'))
    const closeButton=create('button','evidence-close','Close ×')
    closeButton.type='button'
    top.append(closeButton)

    const hero=create('section','evidence-hero')
    const kicker=create('span','evidence-kicker')
    const title=create('h2')
    const impact=create('p','evidence-impact')
    hero.append(kicker,title,impact)

    const chain=create('section','evidence-chain')
    const fields=[
      ['Baseline','baseline'],
      ['Problem','problem'],
      ['Method','method'],
      ['Result','result']
    ]
    const chainText={}
    fields.forEach(([label,key])=>{
      const row=create('article',`evidence-step ${key==='result'?'result':''}`)
      row.append(create('small','',label))
      const copy=create('p')
      chainText[key]=copy
      row.append(copy)
      chain.append(row)
    })

    const meta=create('section','evidence-meta')
    const measureCard=create('article')
    measureCard.append(create('small','','How it was measured'))
    const measure=create('p')
    measureCard.append(measure)
    const confidenceCard=create('article')
    confidenceCard.append(create('small','','Confidence'))
    const confidence=create('p')
    confidenceCard.append(confidence)
    meta.append(measureCard,confidenceCard)

    const artifacts=create('section','evidence-artifacts')
    artifacts.append(create('small','','Artifact package'))
    const artifactGrid=create('div','evidence-artifact-grid')
    artifacts.append(artifactGrid)

    const note=create('p','evidence-note','Sample portfolio evidence model. Replace these sample artifacts with real case-study files, screenshots, research notes or sanitized project evidence before publishing a personal portfolio.')

    shell.append(top,hero,chain,meta,artifacts,note)
    drawer.append(shell)
    backdrop.append(drawer)
    document.body.append(backdrop)

    let lastFocus=null

    const render=project=>{
      const evidence=project.evidence||{}
      kicker.textContent=`${project.type} / ${project.role}`
      title.textContent=project.name
      impact.textContent=project.impact
      chainText.baseline.textContent=evidence.baseline||'Baseline evidence has not been added yet.'
      chainText.problem.textContent=project.problem||'Problem statement has not been added yet.'
      chainText.method.textContent=project.method||'Method evidence has not been added yet.'
      chainText.result.textContent=project.result||project.impact||'Result evidence has not been added yet.'
      measure.textContent=evidence.measure||'Measurement method has not been added yet.'
      confidence.textContent=evidence.confidence||'Confidence notes have not been added yet.'
      artifactGrid.replaceChildren()
      const items=evidence.artifacts||[]
      if(!items.length){
        const empty=create('div','evidence-artifact')
        empty.append(create('b','','Artifact'),create('span','','No artifact metadata yet'))
        artifactGrid.append(empty)
      }else{
        items.forEach(item=>{
          const artifact=create('div','evidence-artifact')
          artifact.append(create('b','',item.type||'Artifact'),create('span','',item.label||'Evidence item'))
          artifactGrid.append(artifact)
        })
      }
    }

    const open=(project,trigger)=>{
      lastFocus=trigger||document.activeElement
      render(project)
      backdrop.hidden=false
      backdrop.setAttribute('aria-hidden','false')
      requestAnimationFrame(()=>backdrop.classList.add('open'))
      document.body.classList.add('evidence-mode-lock')
      closeButton.focus()
    }

    const close=()=>{
      backdrop.classList.remove('open')
      backdrop.setAttribute('aria-hidden','true')
      backdrop.hidden=true
      document.body.classList.remove('evidence-mode-lock')
      if(lastFocus instanceof HTMLElement) lastFocus.focus()
    }

    closeButton.addEventListener('click',close)
    backdrop.addEventListener('click',event=>{if(event.target===backdrop) close()})
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!backdrop.hidden){
        event.preventDefault()
        event.stopImmediatePropagation()
        close()
      }
    },true)

    return {open}
  }

  const bindTriggers=(profile,drawer)=>{
    const candidates=[
      ...document.querySelectorAll('[data-project-id]'),
      ...document.querySelectorAll('.metric'),
      ...document.querySelectorAll('.vh-stat'),
      ...document.querySelectorAll('.vh-caption')
    ]
    const unique=[...new Set(candidates)]
    unique.forEach(node=>{
      if(node.dataset.evidenceBound==='true') return
      const project=resolveProject(node,profile)
      if(!project||!project.evidence) return
      node.dataset.evidenceBound='true'
      node.dataset.evidenceProject=project.id
      node.classList.add('evidence-trigger')
      const naturallyInteractive=['A','BUTTON'].includes(node.tagName)
      if(!naturallyInteractive){
        node.tabIndex=0
        node.setAttribute('role','button')
      }
      node.setAttribute('aria-haspopup','dialog')
      node.setAttribute('aria-label',`Open evidence for ${project.name}: ${project.impact}`)
      node.addEventListener('click',event=>{
        if(event.target.closest('a,button')&&event.target!==node) return
        drawer.open(project,node)
      })
      node.addEventListener('keydown',event=>{
        if((event.key==='Enter'||event.key===' ')&&!event.target.closest('a,button')){
          event.preventDefault()
          drawer.open(project,node)
        }
      })
    })
    document.documentElement.dataset.evidenceModel='ready'
  }

  window.CV_EVIDENCE_BOOT=profile=>{
    if(!profile||document.getElementById(DRAWER_ID)) return
    injectStyles()
    const drawer=buildDrawer(profile)
    bindTriggers(profile,drawer)
  }
})()
