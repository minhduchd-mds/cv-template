import { getTemplateFieldConfig, getTemplateLayoutContract, getTemplateSectionConfig } from './template-layout-contracts'

const words=(value)=>String(value||'').trim().split(/\s+/).filter(Boolean).length
const numericEvidence=(value)=>(/\d|%|\$|€|£|×|\bx\b/i).test(String(value||''))
const normalize=(value)=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()

const finding=(id,group,level,title,detail,action={})=>({id,group,level,title,detail,...action})

export function analyzeContentHealth(profile={},templateId=''){
  const out=[]
  const contract=getTemplateLayoutContract(templateId)
  const summaryWords=words(profile.summary)

  if(summaryWords>110)out.push(finding('summary-long','Readability','warning','Summary is too long',summaryWords+' words. Tighten the opening summary so the first page stays scannable.',{tab:'profile',field:'summary'}))
  else if(summaryWords>85)out.push(finding('summary-dense','Readability','review','Summary is getting dense',summaryWords+' words may create unnecessary page pressure.',{tab:'profile',field:'summary'}))
  else if(summaryWords>0&&summaryWords<28)out.push(finding('summary-thin','Evidence','review','Summary is very short',summaryWords+' words may not explain scope, domain and strengths clearly.',{tab:'profile',field:'summary'}))

  ;(profile.experience||[]).forEach((job,index)=>{
    const bullets=(job?.bullets||[]).filter(Boolean)
    bullets.forEach((bullet,bulletIndex)=>{
      const count=words(bullet)
      const chars=String(bullet||'').length
      if(chars>210||count>34)out.push(finding('experience-long-'+index+'-'+bulletIndex,'Readability',chars>260?'warning':'review','Long experience bullet',(job.role||('Experience '+(index+1)))+' · bullet '+(bulletIndex+1)+' is '+count+' words.',{tab:'experience',itemIndex:index}))
    })
    if(bullets.length>=2&&!numericEvidence(bullets.join(' ')))out.push(finding('experience-evidence-'+index,'Evidence','review','Experience has no measurable evidence',(job.role||('Experience '+(index+1)))+' has multiple achievements but no numeric result, scale or measurable scope.',{tab:'experience',itemIndex:index}))
  })

  const seen=new Set()
  const duplicates=[]
  ;(profile.skills||[]).forEach((skill)=>{
    const key=normalize(skill)
    if(!key)return
    if(seen.has(key)&&!duplicates.includes(key))duplicates.push(key)
    seen.add(key)
  })
  if(duplicates.length){
    const labels=duplicates.map((key)=>(profile.skills||[]).find((skill)=>normalize(skill)===key)).filter(Boolean)
    out.push(finding('skills-duplicate','Readability','warning','Duplicate skills found',labels.join(', ')+'. Exact duplicates add noise without improving ATS coverage.',{tab:'skills',safeFix:'dedupe-skills'}))
  }

  ;(profile.projects||[]).forEach((project,index)=>{
    if(!String(project?.impact||'').trim())out.push(finding('project-impact-'+index,'Evidence','warning','Project is missing impact',(project?.name||('Project '+(index+1)))+' has no outcome or impact statement.',{tab:'projects',itemIndex:index}))
    const count=words(project?.description)
    if(count>55)out.push(finding('project-description-'+index,'Readability','review','Project description is long',(project?.name||('Project '+(index+1)))+' is '+count+' words.',{tab:'projects',itemIndex:index}))
  })

  if((profile.highlights||[]).length){
    const invalid=(profile.highlights||[]).filter((item)=>!String(item?.value||'').trim()||!String(item?.label||'').trim())
    if(invalid.length)out.push(finding('highlights-incomplete','Evidence','warning','Impact metrics are incomplete',invalid.length+' metric'+(invalid.length===1?'':'s')+' need both a value and a label.',{tab:'impact'}))
  }

  const fieldValues={
    avatar:String(profile.avatar||'').trim(),
    headline:String(profile.headline||'').trim(),
    quote:String(profile.quote||'').trim(),
  }
  const fieldLabels={avatar:'Profile photo',headline:'Headline',quote:'Quote'}
  for(const [field,value] of Object.entries(fieldValues)){
    if(!value)continue
    if(getTemplateFieldConfig(templateId,field).supported===false){
      out.push(finding(
        'field-unused-'+field,
        'Template coverage',
        'info',
        fieldLabels[field]+' is saved but not shown',
        contract.label+' does not render this field. The value stays available when you switch templates.',
        {tab:'profile',field}
      ))
    }
  }

  const sourceCounts={
    summary:String(profile.summary||'').trim()?1:0,
    highlights:(profile.highlights||[]).length,
    experience:(profile.experience||[]).length,
    projects:(profile.projects||[]).length,
    skills:(profile.skills||[]).length,
    education:(profile.education||[]).length,
    certificates:(profile.certificates||[]).length,
    languages:(profile.languages||[]).length,
  }
  const sectionTab={summary:'profile',highlights:'impact',experience:'experience',projects:'projects',skills:'skills',education:'education',certificates:'education',languages:'skills'}
  for(const [section,count] of Object.entries(sourceCounts)){
    if(!count)continue
    const config=getTemplateSectionConfig(templateId,section)
    const sourceSection=(profile.sections||[]).find((item)=>item.id===section)
    if(config.supported===false){
      out.push(finding('unsupported-'+section,'Template coverage','info',(sourceSection?.label||section)+' is not used by this template',contract.label+' intentionally omits this section. The source data stays saved.',{tab:sectionTab[section]}))
      continue
    }
    if(sourceSection&&sourceSection.enabled===false){
      out.push(finding('hidden-'+section,'Template coverage','review',(sourceSection.label||section)+' is hidden',count+' source item'+(count===1?'':'s')+' exist but this section is disabled.',{tab:'layout',sectionId:section,safeFix:'show-section'}))
    }
    if(config.limit&&count>config.limit){
      out.push(finding('limit-'+section,'Template coverage','info',(sourceSection?.label||section)+' is intentionally capped',config.limit+' of '+count+' source item'+(count===1?'':'s')+' are shown by this template.',{tab:sectionTab[section]}))
    }
  }

  return out
}

export function contentHealthSummary(findings=[]){
  const actionable=findings.filter((item)=>item.level==='warning'||item.level==='review')
  const warnings=findings.filter((item)=>item.level==='warning').length
  const reviews=findings.filter((item)=>item.level==='review').length
  return {warnings,reviews,info:findings.length-warnings-reviews,clear:Math.max(0,10-Math.min(10,actionable.length)),total:10}
}
