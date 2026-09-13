(()=>{
  const root=document.querySelector('[data-proof-index]')
  if(!root) return

  const create=(tag,className,text)=>{
    const node=document.createElement(tag)
    if(className) node.className=className
    if(text!==undefined) node.textContent=text
    return node
  }

  const normalize=value=>String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()
  const graph=document.querySelector('#proof-graph')
  const svg=document.querySelector('#proof-lines')
  const filters=[...document.querySelectorAll('.proof-filter')]
  const summary={
    projects:document.querySelector('[data-summary="projects"]'),
    metrics:document.querySelector('[data-summary="metrics"]'),
    artifacts:document.querySelector('[data-summary="artifacts"]'),
    capabilities:document.querySelector('[data-summary="capabilities"]')
  }
  const columns={
    metrics:document.querySelector('[data-list="metrics"]'),
    projects:document.querySelector('[data-list="projects"]'),
    capabilities:document.querySelector('[data-list="capabilities"]'),
    artifacts:document.querySelector('[data-list="artifacts"]')
  }
  let profile=null
  let projectGroups=new Map()
  let activeFilter='all'

  const groupKeywords={
    product:['product','workflow','user flow','information architecture','interaction','prototype','usability','dashboard','tables','ux'],
    systems:['design system','token','component','governance','accessibility','design qa','documentation','system'],
    technical:['html','css','scss','vue','react','typescript','git','vite','responsive','engineering','code','implementation','component'],
    ai:['ai','human in the loop','explainability','prompt','trust','assistant','confidence']
  }

  const resolveGroups=project=>{
    const haystack=normalize([project.type,project.role,project.problem,project.method,project.result,...(project.tags||[])].join(' '))
    const groups=Object.entries(groupKeywords).filter(([,keywords])=>keywords.some(keyword=>haystack.includes(normalize(keyword)))).map(([group])=>group)
    if(!groups.length) groups.push('product')
    return groups
  }

  const capabilityPreview=(group,items)=>{
    const card=create('article','proof-node cap-group')
    card.dataset.node=`cap-${group}`
    card.dataset.group=group
    card.append(create('small','',group))
    const chips=create('div','cap-chips')
    items.slice(0,5).forEach(item=>chips.append(create('span','',item)))
    card.append(chips)
    return card
  }

  const render=()=>{
    Object.values(columns).forEach(column=>column.replaceChildren())
    projectGroups=new Map()

    const linkedMetrics=(profile.proof||[]).filter(item=>item.projectId)
    const artifactCount=(profile.projects||[]).reduce((total,project)=>total+(project.evidence?.artifacts?.length||0),0)
    summary.projects.textContent=String(profile.projects?.length||0).padStart(2,'0')
    summary.metrics.textContent=String(linkedMetrics.length).padStart(2,'0')
    summary.artifacts.textContent=String(artifactCount).padStart(2,'0')
    summary.capabilities.textContent=String(Object.keys(profile.capabilities||{}).length).padStart(2,'0')

    ;(profile.proof||[]).forEach((item,index)=>{
      const metric=create('article','proof-node metric-node')
      metric.dataset.node=`metric-${index}`
      metric.dataset.metricProject=item.projectId||''
      metric.dataset.linked=String(Boolean(item.projectId))
      if(item.projectId) metric.dataset.projectId=item.projectId
      metric.append(create('b','',item.value),create('span','',item.label))
      columns.metrics.append(metric)
    })

    ;(profile.projects||[]).forEach((project,index)=>{
      const groups=resolveGroups(project)
      projectGroups.set(project.id,groups)
      const card=create('article','proof-node project-node')
      card.tabIndex=0
      card.dataset.node=`project-${project.id}`
      card.dataset.projectId=project.id
      card.dataset.groups=groups.join(' ')
      card.append(create('small','',`${String(index+1).padStart(2,'0')} / ${project.type}`))
      card.append(create('h3','',project.name))
      card.append(create('p','',project.impact))
      const footer=create('footer')
      footer.append(create('span','',`${groups.length} capability ${groups.length===1?'lane':'lanes'}`),create('span','','Open evidence ↗'))
      card.append(footer)
      columns.projects.append(card)
    })

    Object.entries(profile.capabilities||{}).forEach(([group,items])=>{
      columns.capabilities.append(capabilityPreview(group,items))
    })

    ;(profile.projects||[]).forEach(project=>{
      ;(project.evidence?.artifacts||[]).forEach((item,index)=>{
        const artifact=create('article','proof-node artifact-node')
        artifact.dataset.node=`artifact-${project.id}-${index}`
        artifact.dataset.artifactProject=project.id
        artifact.append(create('b','',item.type||'Artifact'),create('span','',item.label||'Evidence item'))
        columns.artifacts.append(artifact)
      })
    })

    if(window.CV_EVIDENCE_BOOT) window.CV_EVIDENCE_BOOT(profile)
    applyFilter(activeFilter)
  }

  const matchesProject=(projectNode,filter)=>filter==='all'||projectNode.dataset.groups.split(' ').includes(filter)

  const applyFilter=filter=>{
    activeFilter=filter
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===filter)))
    const projectNodes=[...columns.projects.querySelectorAll('.project-node')]
    const visibleIds=new Set(projectNodes.filter(node=>matchesProject(node,filter)).map(node=>node.dataset.projectId))

    projectNodes.forEach(node=>node.classList.toggle('filtered',!visibleIds.has(node.dataset.projectId)))
    columns.metrics.querySelectorAll('.metric-node').forEach(node=>{
      const linked=node.dataset.metricProject
      node.classList.toggle('filtered',Boolean(linked)&&!visibleIds.has(linked))
    })
    columns.artifacts.querySelectorAll('.artifact-node').forEach(node=>node.classList.toggle('filtered',!visibleIds.has(node.dataset.artifactProject)))
    columns.capabilities.querySelectorAll('.cap-group').forEach(node=>{
      const group=node.dataset.group
      const groupUsed=[...visibleIds].some(id=>(projectGroups.get(id)||[]).includes(group))
      node.classList.toggle('filtered',filter!=='all'?!groupUsed:false)
    })
    root.dataset.filter=filter
    requestAnimationFrame(drawLines)
  }

  const svgPoint=(node,side)=>{
    const graphBox=graph.getBoundingClientRect()
    const box=node.getBoundingClientRect()
    return {
      x:(side==='left'?box.left:box.right)-graphBox.left,
      y:box.top-graphBox.top+(box.height/2)
    }
  }

  const addPath=(from,to,className)=>{
    const dx=Math.max(34,Math.abs(to.x-from.x)*.45)
    const path=document.createElementNS('http://www.w3.org/2000/svg','path')
    path.setAttribute('d',`M ${from.x} ${from.y} C ${from.x+dx} ${from.y}, ${to.x-dx} ${to.y}, ${to.x} ${to.y}`)
    path.setAttribute('class',className)
    svg.append(path)
  }

  const visible=node=>node&&!node.classList.contains('filtered')&&node.getClientRects().length>0

  const drawLines=()=>{
    if(!profile||window.innerWidth<=1050) return svg.replaceChildren()
    svg.replaceChildren()
    const height=Math.max(graph.scrollHeight,graph.getBoundingClientRect().height)
    const width=graph.getBoundingClientRect().width
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`)
    svg.setAttribute('preserveAspectRatio','none')

    ;(profile.proof||[]).forEach((item,index)=>{
      if(!item.projectId) return
      const metric=columns.metrics.querySelector(`[data-node="metric-${index}"]`)
      const project=columns.projects.querySelector(`[data-node="project-${item.projectId}"]`)
      if(visible(metric)&&visible(project)) addPath(svgPoint(metric,'right'),svgPoint(project,'left'),'metric-link')
    })

    ;(profile.projects||[]).forEach(project=>{
      const projectNode=columns.projects.querySelector(`[data-node="project-${project.id}"]`)
      if(!visible(projectNode)) return
      ;(projectGroups.get(project.id)||[]).forEach(group=>{
        const cap=columns.capabilities.querySelector(`[data-node="cap-${group}"]`)
        if(visible(cap)) addPath(svgPoint(projectNode,'right'),svgPoint(cap,'left'),'cap-link')
      })
      ;(project.evidence?.artifacts||[]).forEach((item,index)=>{
        const artifact=columns.artifacts.querySelector(`[data-node="artifact-${project.id}-${index}"]`)
        if(visible(artifact)) addPath(svgPoint(projectNode,'right'),svgPoint(artifact,'left'),'artifact-link')
      })
    })
  }

  filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)))
  window.addEventListener('resize',()=>requestAnimationFrame(drawLines),{passive:true})

  document.documentElement.dataset.proofModel='loading'
  fetch('./data/profile.json')
    .then(response=>{
      if(!response.ok) throw new Error(`Proof profile request failed: ${response.status}`)
      return response.json()
    })
    .then(data=>{
      profile=data
      window.CV_PROFILE=profile
      render()
      document.documentElement.dataset.proofModel='ready'
      requestAnimationFrame(()=>requestAnimationFrame(drawLines))
    })
    .catch(error=>{
      document.documentElement.dataset.proofModel='error'
      console.error('Proof Index failed to load',error)
    })
})()
