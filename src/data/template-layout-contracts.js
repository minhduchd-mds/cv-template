export const DEFAULT_LAYOUT_SECTIONS = {
  summary: { supported: true, group: 'main', placement: 'Main content' },
  highlights: { supported: true, group: 'main', placement: 'Main content' },
  experience: { supported: true, group: 'main', placement: 'Main content' },
  projects: { supported: true, group: 'main', placement: 'Main content' },
  skills: { supported: true, group: 'side', placement: 'Side content' },
  education: { supported: true, group: 'side', placement: 'Side content' },
  certificates: { supported: true, group: 'side', placement: 'Side content' },
  languages: { supported: true, group: 'side', placement: 'Side content' },
}

export const TEMPLATE_LAYOUT_CONTRACTS = {
  'executive-edge': { mode:'fixed',label:'Executive hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Executive summary'},experience:{supported:true,group:'main',placement:'Primary content'},projects:{supported:true,group:'main',placement:'Selected achievements',limit:4},skills:{supported:false,group:'side'},languages:{supported:false,group:'side'},certificates:{supported:false,group:'side'}}},
  'soft-portfolio-pro': { mode:'fixed',label:'Portfolio hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Hero'},experience:{supported:true,group:'main',placement:'Experience highlights',limit:3},projects:{supported:true,group:'main',placement:'Selected case studies',limit:3},skills:{supported:true,group:'side',placement:'Skills + tools rail'},education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'}}},
  'product-operator': { mode:'fixed',label:'Product leadership hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Profile rail'},experience:{supported:true,group:'main',placement:'Primary content'},projects:{supported:true,group:'main',placement:'Product highlights'},skills:{supported:true,group:'side',placement:'Profile rail'},education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'}}},
  'code-aware': { mode:'fixed',label:'Technical hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'About'},experience:{supported:true,group:'main',placement:'Experience'},projects:{supported:true,group:'main',placement:'Selected work'},skills:{supported:true,group:'side',placement:'Skills'},education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'}}},
  'ats-precision': { mode:'guided',label:'Recruiter-first hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Header'},experience:{supported:true,group:'main',placement:'Main column'},projects:{supported:true,group:'main',placement:'Side column',limit:2},skills:{supported:true,group:'side',placement:'Side column'},education:{supported:true,group:'side',placement:'Main column'},certificates:{supported:true,group:'side',placement:'Side column'},languages:{supported:false,group:'side'}}},
  'insight-grid': { mode:'fixed',label:'Analytics hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Data summary'},experience:{supported:true,group:'main',placement:'Bottom primary'},projects:{supported:true,group:'main',placement:'Key achievements'},skills:{supported:true,group:'side',placement:'Skills + tools'},education:{supported:true,group:'side',placement:'Education rail'},certificates:{supported:true,group:'side',placement:'Certification rail'},languages:{supported:false,group:'side'}}},
  'brand-motion': { mode:'fixed',label:'Campaign hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Brand hero'},experience:{supported:true,group:'main',placement:'Work experience'},projects:{supported:true,group:'main',placement:'Selected campaigns',limit:3},skills:{supported:true,group:'side',placement:'Visual rail'},languages:{supported:true,group:'side',placement:'Visual rail'},education:{supported:false,group:'side'},certificates:{supported:false,group:'side'}}},
  'revenue-driver': { mode:'fixed',label:'Sales hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Primary column'},experience:{supported:true,group:'main',placement:'Primary column'},projects:{supported:false,group:'main'},skills:{supported:true,group:'side',placement:'Side column'},education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'}}},
  'people-first': { mode:'fixed',label:'People hierarchy',page:'1–2 pages',sections:{summary:{supported:true,group:'main',placement:'Hero'},experience:{supported:true,group:'main',placement:'Primary content'},projects:{supported:false,group:'main'},skills:{supported:true,group:'side',placement:'Competencies rail'},education:{supported:true,group:'side',placement:'Competencies rail'},languages:{supported:true,group:'side',placement:'Additional information'},certificates:{supported:false,group:'side'}}},
  'next-start': { mode:'fixed',label:'Early-career hierarchy',page:'1 page preferred',sections:{summary:{supported:false,group:'main'},experience:{supported:true,group:'main',placement:'Internships'},projects:{supported:true,group:'main',placement:'Projects',limit:2},skills:{supported:true,group:'side',placement:'Skills rail'},education:{supported:true,group:'side',placement:'Education'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'}}},
  'modern-bento': {mode:'flexible',label:'Two-column flexible',page:'1–2 pages'},
  'executive-navy': {mode:'flexible',label:'Executive flexible',page:'1–2 pages'},
  'ats-clean': {mode:'flexible',label:'ATS flexible',page:'1–2 pages'},
  'modern-mono': {mode:'flexible',label:'Technical flexible',page:'1–2 pages'},
  'young-creator-cards': {mode:'flexible',label:'Creative flexible',page:'1–2 pages'},
  'strategy-brief': {mode:'flexible',label:'Consulting flexible',page:'1–2 pages'},
  'clinical-clean': {mode:'flexible',label:'Clinical flexible',page:'1–2 pages'},
  'finance-ledger': {mode:'flexible',label:'Finance flexible',page:'1–2 pages'},
  'studio-director': {mode:'flexible',label:'Editorial flexible',page:'1–2 pages'},
  'research-scholar': {mode:'flexible',label:'Academic flexible',page:'1–2 pages'},
}

export const getTemplateLayoutContract=(templateId)=>{
  const contract=TEMPLATE_LAYOUT_CONTRACTS[templateId]||{mode:'flexible',label:'Flexible layout',page:'1–2 pages'}
  return {...contract,sections:{...DEFAULT_LAYOUT_SECTIONS,...(contract.sections||{})}}
}
export const getTemplateSectionConfig=(templateId,sectionId)=>getTemplateLayoutContract(templateId).sections[sectionId]||DEFAULT_LAYOUT_SECTIONS[sectionId]||{supported:true,group:'main',placement:'Template section'}
export const isTemplateSectionVisible=(profile,templateId,sectionId)=>{
  if(getTemplateSectionConfig(templateId,sectionId).supported===false)return false
  const config=(profile?.sections||[]).find((section)=>section.id===sectionId)
  return config ? config.enabled!==false : true
}
export const canReorderTemplateSection=(templateId,sectionId)=>getTemplateLayoutContract(templateId).mode==='flexible'&&getTemplateSectionConfig(templateId,sectionId).supported!==false
export const sameTemplateSectionGroup=(templateId,a,b)=>getTemplateSectionConfig(templateId,a).group===getTemplateSectionConfig(templateId,b).group
