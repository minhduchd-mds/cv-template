const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
const stage=document.querySelector('.stage')
if(stage&&!reduceMotion){
  stage.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch') return
    const r=stage.getBoundingClientRect()
    const x=((e.clientX-r.left)/r.width)*100
    const y=((e.clientY-r.top)/r.height)*100
    stage.style.setProperty('--mx',`${x}%`)
    stage.style.setProperty('--my',`${y}%`)
    stage.style.setProperty('--ry',`${(x-50)*.03}deg`)
    stage.style.setProperty('--rx',`${(50-y)*.025}deg`)
  })
  stage.addEventListener('pointerleave',()=>{
    stage.style.setProperty('--ry','0deg')
    stage.style.setProperty('--rx','0deg')
    stage.style.setProperty('--mx','50%')
    stage.style.setProperty('--my','40%')
  })
}

const revealNodes=[...document.querySelectorAll('.reveal')]
if(reduceMotion||!('IntersectionObserver' in window)){
  revealNodes.forEach(el=>el.classList.add('in'))
}else{
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in')
      io.unobserve(entry.target)
    }
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'})
  revealNodes.forEach(el=>io.observe(el))
}

const el=(tag,className,text)=>{
  const node=document.createElement(tag)
  if(className) node.className=className
  if(text!==undefined) node.textContent=text
  return node
}

const addRuntimeStyles=()=>{
  if(document.querySelector('link[data-profile-runtime]')) return
  const link=document.createElement('link')
  link.rel='stylesheet'
  link.href='./profile-runtime.css'
  link.dataset.profileRuntime='true'
  document.head.append(link)
}

const initials=name=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase()
const setText=(selector,value,root=document)=>{
  const node=root.querySelector(selector)
  if(node&&value) node.textContent=value
}
const proofValue=(profile,needle,fallback='')=>profile.proof.find(item=>item.label.toLowerCase().includes(needle.toLowerCase()))?.value||fallback
const triageValue=profile=>{
  const impact=profile.projects.find(project=>project.id==='signal-ai')?.impact||''
  const match=impact.match(/from\s+(\d+)\s+to\s+(\d+)/i)
  return match?`${match[1]}→${match[2]}`:'7→3'
}

const syncProjectCards=(cards,projects,{copy='result'}={})=>{
  cards.forEach((card,index)=>{
    const project=projects[index]
    if(!project) return
    setText('h3',project.name,card)
    setText('p',project[copy]||project.result||project.impact,card)
    const proof=card.querySelector('footer b')
    if(proof) proof.textContent=project.impact
    card.dataset.projectId=project.id
  })
}

const syncWorld=profile=>{
  const body=document.body
  const projects=profile.projects||[]
  body.dataset.sharedProfile='synced'

  if(body.classList.contains('signal')){
    setText('.stage-foot strong',`${profile.identity.name} / ${profile.identity.role.split('·')[0].trim()}`)
    const metricValues=[proofValue(profile,'faster completion','31%'),proofValue(profile,'design-system adoption','85%'),proofValue(profile,'design-to-dev clarification','40%'),proofValue(profile,'products and major surfaces','18+')]
    body.querySelectorAll('.metrics .metric b').forEach((node,index)=>{if(metricValues[index]) node.textContent=metricValues[index]})
    syncProjectCards([...body.querySelectorAll('.case-grid .case')],projects)
  }

  if(body.classList.contains('thread')){
    const metricValues=[proofValue(profile,'years designing','8+'),proofValue(profile,'design-system adoption','85%'),proofValue(profile,'design-to-dev clarification','40%'),proofValue(profile,'cross-functional teams','7')]
    body.querySelectorAll('.metrics .metric b').forEach((node,index)=>{if(metricValues[index]) node.textContent=metricValues[index]})
    syncProjectCards([...body.querySelectorAll('#crossings .case-grid .case')],projects)
  }

  if(body.classList.contains('focus')){
    const flagship=projects.find(project=>project.id==='atlas-ops')||projects[0]
    if(flagship){
      setText('.lens-copy h3',flagship.name)
      setText('.lens-copy p',flagship.problem)
      setText('#case .section-intro',flagship.problem)
      setText('#results .section-intro',flagship.result)
      setText('#results .metrics .metric b',proofValue(profile,'faster completion','31%'))
      const lens=body.querySelector('.lens-project')
      if(lens) lens.dataset.projectId=flagship.id
    }
  }

  if(body.classList.contains('relay-world')){
    const cards=[...body.querySelectorAll('#work .evidence-card')]
    cards.forEach((card,index)=>{
      const project=projects[index]
      if(!project) return
      setText('h3',project.name,card)
      const rows=[...card.querySelectorAll('.evidence-row b')]
      const content=[project.problem,project.method,project.result,project.impact]
      rows.forEach((row,rowIndex)=>{if(content[rowIndex]) row.textContent=content[rowIndex]})
      card.dataset.projectId=project.id
    })
    const metricValues=[proofValue(profile,'faster completion','31%'),proofValue(profile,'design-system adoption','85%'),proofValue(profile,'design-to-dev clarification','40%'),triageValue(profile)]
    body.querySelectorAll('#proof .metric b').forEach((node,index)=>{if(metricValues[index]) node.textContent=metricValues[index]})
  }

  if(body.querySelector('.vh')){
    const name=profile.identity.name.split(/\s+/).join('\n')
    const floatName=body.querySelector('.vh-float strong')
    if(floatName){
      floatName.replaceChildren(...name.split('\n').flatMap((part,index,array)=>index<array.length-1?[document.createTextNode(part),document.createElement('br')]:[document.createTextNode(part)]))
    }
    setText('.vh-tag',`Identity / ${profile.identity.role.split('·')[0].trim()}`)
    const stats=[proofValue(profile,'years designing','8+'),proofValue(profile,'products and major surfaces','18+'),proofValue(profile,'design-to-dev clarification','40%'),proofValue(profile,'cross-functional teams','7')]
    body.querySelectorAll('.vh-stat b').forEach((node,index)=>{if(stats[index]) node.textContent=stats[index]})
    const selected=[projects.find(project=>project.id==='atlas-ops'),projects.find(project=>project.id==='northstar-system'),projects.find(project=>project.id==='pulse-dashboard')].filter(Boolean)
    body.querySelectorAll('.vh-case').forEach((card,index)=>{
      const project=selected[index]
      if(!project) return
      setText('h3',project.name,card)
      setText('b',project.impact,card)
      card.dataset.projectId=project.id
    })
    const panelMetrics=body.querySelectorAll('.vh-right .vh-caption h2')
    if(panelMetrics[0]) panelMetrics[0].textContent=proofValue(profile,'design-system adoption','85%')
    if(panelMetrics[1]) panelMetrics[1].textContent=proofValue(profile,'faster completion','31%')
    if(panelMetrics[2]) panelMetrics[2].textContent=triageValue(profile)
  }
}

const buildRecruiterMode=profile=>{
  addRuntimeStyles()
  window.CV_PROFILE=profile
  document.documentElement.dataset.profileModel='ready'
  syncWorld(profile)

  const dock=el('aside','profile-dock')
  dock.setAttribute('aria-label','Shared profile controls')
  const avatar=el('span','profile-dock__avatar',initials(profile.identity.name))
  const copy=el('div','profile-dock__copy')
  copy.append(el('b','',profile.identity.name),el('span','',profile.identity.role))
  const openButton=el('button','profile-dock__button','60s view')
  openButton.type='button'
  openButton.setAttribute('aria-expanded','false')
  dock.append(avatar,copy,openButton)

  const overlay=el('section','recruiter-overlay')
  overlay.setAttribute('role','dialog')
  overlay.setAttribute('aria-modal','true')
  overlay.setAttribute('aria-label','Recruiter 60 second profile')
  const shell=el('div','recruiter-shell')
  const top=el('div','recruiter-top')
  top.append(el('span','','Recruiter 60s · one profile / every world'))
  const closeButton=el('button','recruiter-close','Close ×')
  closeButton.type='button'
  top.append(closeButton)
  shell.append(top)

  const hero=el('section','recruiter-hero')
  const heroMain=el('div')
  heroMain.append(el('span','recruiter-kicker','Role / positioning'),el('h1','',profile.identity.name),el('p','',profile.identity.headline))
  const contact=el('div','recruiter-contact')
  contact.append(el('span','',profile.identity.role),el('span','',profile.identity.location),el('span','',profile.identity.availability))
  const email=el('a','',profile.identity.email)
  email.href=`mailto:${profile.identity.email}`
  const website=el('a','',profile.identity.website)
  website.href=profile.identity.website.startsWith('http')?profile.identity.website:`https://${profile.identity.website}`
  website.target='_blank'
  website.rel='noreferrer'
  contact.append(email,website)
  hero.append(heroMain,contact)
  shell.append(hero)

  const outcomes=el('section','recruiter-section')
  outcomes.append(el('h2','','Three strongest outcomes'))
  const outcomeGrid=el('div','recruiter-grid')
  const outcomeIds=profile.recruiter60?.outcomeIds||[0,1,2]
  outcomeIds.map(index=>profile.proof[index]).filter(Boolean).forEach(item=>{
    const card=el('article','recruiter-card')
    card.append(el('small','','Outcome'),el('b','',item.value),el('p','',item.label))
    outcomeGrid.append(card)
  })
  outcomes.append(outcomeGrid)
  shell.append(outcomes)

  const projects=el('section','recruiter-section')
  projects.append(el('h2','','Three strongest projects'))
  const projectGrid=el('div','recruiter-grid')
  const projectIds=profile.recruiter60?.projectIds||profile.projects.slice(0,3).map(project=>project.id)
  projectIds.map(id=>profile.projects.find(project=>project.id===id)).filter(Boolean).forEach(project=>{
    const card=el('article','recruiter-card')
    card.tabIndex=0
    card.append(el('small','',project.type),el('h3','',project.name),el('p','',project.impact))
    projectGrid.append(card)
  })
  projects.append(projectGrid)
  shell.append(projects)

  const capabilities=el('section','recruiter-section')
  capabilities.append(el('h2','','Core capabilities'))
  const tags=el('div','recruiter-tags')
  const groups=profile.recruiter60?.capabilityGroups||Object.keys(profile.capabilities)
  groups.flatMap(group=>profile.capabilities[group]||[]).slice(0,18).forEach(item=>tags.append(el('span','',item)))
  capabilities.append(tags)
  shell.append(capabilities)

  const bio=el('section','recruiter-section')
  bio.append(el('h2','','60-second summary'),el('p','',profile.positioning.shortBio))
  shell.append(bio,el('footer','recruiter-footer','Shared profile model · change profile.json once, every world updates together'))
  overlay.append(shell)
  document.body.append(dock,overlay)

  let lastFocus=null
  const open=()=>{
    lastFocus=document.activeElement
    overlay.classList.add('open')
    document.body.classList.add('recruiter-mode-lock')
    openButton.setAttribute('aria-expanded','true')
    closeButton.focus()
  }
  const close=()=>{
    overlay.classList.remove('open')
    document.body.classList.remove('recruiter-mode-lock')
    openButton.setAttribute('aria-expanded','false')
    if(lastFocus instanceof HTMLElement) lastFocus.focus()
  }
  openButton.addEventListener('click',open)
  closeButton.addEventListener('click',close)
  overlay.addEventListener('click',event=>{if(event.target===overlay) close()})
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&overlay.classList.contains('open')){
      event.preventDefault()
      close()
      return
    }
    if(event.key==='Escape') window.location.href='../'
  })
}

document.documentElement.dataset.profileModel='loading'
fetch('../data/profile.json')
  .then(response=>{
    if(!response.ok) throw new Error(`Profile request failed: ${response.status}`)
    return response.json()
  })
  .then(buildRecruiterMode)
  .catch(error=>{
    document.documentElement.dataset.profileModel='error'
    console.error('Shared profile failed to load',error)
  })
