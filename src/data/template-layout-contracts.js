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

export const TEMPLATE_PRINT_POLICIES = {
  'executive-edge': { multiPage:'preserve-flow' },
  'soft-portfolio-pro': { multiPage:'stack-safe' },
  'product-operator': { multiPage:'stack-safe' },
  'code-aware': { multiPage:'preserve-flow' },
  'ats-precision': { multiPage:'stack-safe' },
  'insight-grid': { multiPage:'stack-safe' },
  'brand-motion': { multiPage:'stack-safe' },
  'revenue-driver': { multiPage:'stack-safe' },
  'people-first': { multiPage:'stack-safe' },
  'next-start': { multiPage:'stack-safe' },
  'modern-bento': { multiPage:'stack-safe' },
  'executive-navy': { multiPage:'stack-safe' },
  'ats-clean': { multiPage:'preserve-flow' },
  'modern-mono': { multiPage:'preserve-flow' },
  'young-creator-cards': { multiPage:'stack-safe' },
  'strategy-brief': { multiPage:'stack-safe' },
  'clinical-clean': { multiPage:'preserve-flow' },
  'finance-ledger': { multiPage:'stack-safe' },
  'studio-director': { multiPage:'stack-safe' },
  'research-scholar': { multiPage:'preserve-flow' },
}

export const DEFAULT_TEMPLATE_FIELDS = {
  avatar: { supported: true, label: 'Avatar' },
  headline: { supported: false, label: 'Headline' },
  quote: { supported: false, label: 'Quote' },
  projectImages: { supported: true, label: 'Project images' },
}

const fixed = (config) => ({ mode:'fixed', page:'1–2 pages', ...config })
const flexible = (label, structure, traits=[]) => ({
  mode:'flexible',
  label,
  page:'1–2 pages',
  structure,
  traits,
  fields:{ ...DEFAULT_TEMPLATE_FIELDS },
})

export const TEMPLATE_LAYOUT_CONTRACTS = {
  'executive-edge': fixed({
    label:'Executive hierarchy',
    audience:'Leadership & Senior Management',
    structure:'Header → Summary → Leadership impact → Experience → Achievements → Education',
    traits:['executive','impact'],
    fields:{
      avatar:{supported:false,label:'Avatar'},
      headline:{supported:false,label:'Headline'},
      quote:{supported:false,label:'Quote'},
      projectImages:{supported:false,label:'Project images'},
    },
    sections:{
      summary:{supported:true,group:'main',placement:'Executive summary'},
      highlights:{supported:true,group:'main',placement:'Leadership impact'},
      experience:{supported:true,group:'main',placement:'Primary content'},
      projects:{supported:true,group:'main',placement:'Selected achievements',limit:4},
      skills:{supported:false,group:'side'},
      education:{supported:true,group:'side',placement:'Education & development'},
      certificates:{supported:false,group:'side'},
      languages:{supported:false,group:'side'},
    },
  }),
  'soft-portfolio-pro': fixed({
    label:'Portfolio hierarchy',
    audience:'UI/UX & Product Design',
    structure:'Hero → Metrics → Case studies → Skills & tools → Experience highlights',
    traits:['portfolio','visual','avatar'],
    fields:{
      avatar:{supported:true,label:'Avatar'},
      headline:{supported:false,label:'Headline'},
      quote:{supported:false,label:'Quote'},
      projectImages:{supported:false,label:'Project images'},
    },
    sections:{
      summary:{supported:true,group:'main',placement:'Hero'},
      highlights:{supported:true,group:'main',placement:'Impact metrics'},
      experience:{supported:true,group:'main',placement:'Experience highlights',limit:3},
      projects:{supported:true,group:'main',placement:'Selected case studies',limit:3},
      skills:{supported:true,group:'side',placement:'Skills + tools rail'},
      education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'},
    },
  }),
  'product-operator': fixed({
    label:'Product leadership hierarchy',
    audience:'Product Management & Product Ops',
    structure:'Profile rail → Impact metrics → Experience → Product highlights → Roadmap',
    traits:['product','impact','avatar'],
    fields:{avatar:{supported:true,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'Profile rail'},
      highlights:{supported:true,group:'main',placement:'Impact metrics'},
      experience:{supported:true,group:'main',placement:'Primary content'},
      projects:{supported:true,group:'main',placement:'Product highlights'},
      skills:{supported:true,group:'side',placement:'Profile rail'},
      education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'},
    },
  }),
  'code-aware': fixed({
    label:'Technical hierarchy',
    audience:'Design Engineer & Frontend',
    structure:'Code hero → About → Experience → Skills → Selected work',
    traits:['technical','ats-readable'],
    fields:{avatar:{supported:false,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'About'},
      highlights:{supported:false,group:'main'},
      experience:{supported:true,group:'main',placement:'Experience'},
      projects:{supported:true,group:'main',placement:'Selected work'},
      skills:{supported:true,group:'side',placement:'Skills'},
      education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'},
    },
  }),
  'ats-precision': {
    mode:'guided',
    label:'Recruiter-first hierarchy',
    audience:'Software & Technical Roles',
    page:'1–2 pages',
    structure:'Profile → Experience & education → Skills → Selected projects → Certifications',
    traits:['ats','recruiter'],
    fields:{avatar:{supported:false,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'Header'},
      highlights:{supported:false,group:'main'},
      experience:{supported:true,group:'main',placement:'Main column'},
      projects:{supported:true,group:'main',placement:'Side column',limit:2},
      skills:{supported:true,group:'side',placement:'Side column'},
      education:{supported:true,group:'side',placement:'Main column'},
      certificates:{supported:true,group:'side',placement:'Side column'},
      languages:{supported:false,group:'side'},
    },
  },
  'insight-grid': fixed({
    label:'Analytics hierarchy',
    audience:'Data Analyst & Business Intelligence',
    structure:'Header → Data summary → KPI metrics → Skills → Achievements → Experience → Credentials',
    traits:['data','impact'],
    fields:{avatar:{supported:false,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'Data summary'},
      highlights:{supported:true,group:'main',placement:'KPI metrics'},
      experience:{supported:true,group:'main',placement:'Bottom primary'},
      projects:{supported:true,group:'main',placement:'Key achievements'},
      skills:{supported:true,group:'side',placement:'Skills + tools'},
      education:{supported:true,group:'side',placement:'Education rail'},
      certificates:{supported:true,group:'side',placement:'Certification rail'},
      languages:{supported:false,group:'side'},
    },
  }),
  'brand-motion': fixed({
    label:'Campaign hierarchy',
    audience:'Marketing & Communications',
    structure:'Visual rail → Brand hero → Metrics → Experience → Campaigns',
    traits:['portfolio','visual','avatar'],
    fields:{avatar:{supported:true,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'Brand hero'},
      highlights:{supported:true,group:'main',placement:'Campaign metrics'},
      experience:{supported:true,group:'main',placement:'Work experience'},
      projects:{supported:true,group:'main',placement:'Selected campaigns',limit:3},
      skills:{supported:true,group:'side',placement:'Visual rail'},
      education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},
      languages:{supported:true,group:'side',placement:'Visual rail'},
    },
  }),
  'revenue-driver': fixed({
    label:'Sales hierarchy',
    audience:'Sales & Business Development',
    structure:'Sales hero → Summary → KPI highlights → Experience → Skills & clients → Quote',
    traits:['sales','impact','avatar'],
    fields:{avatar:{supported:true,label:'Avatar'},headline:{supported:true,label:'Headline'},quote:{supported:true,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'Primary column'},
      highlights:{supported:true,group:'main',placement:'KPI highlights'},
      experience:{supported:true,group:'main',placement:'Primary column'},
      projects:{supported:false,group:'main'},
      skills:{supported:true,group:'side',placement:'Side column'},
      education:{supported:false,group:'side'},certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'},
    },
  }),
  'people-first': fixed({
    label:'People hierarchy',
    audience:'HR, Talent & People Operations',
    structure:'People hero → Competencies → Experience → Education → Additional info',
    traits:['people','avatar'],
    fields:{avatar:{supported:true,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:true,group:'main',placement:'Hero'},
      highlights:{supported:false,group:'main'},
      experience:{supported:true,group:'main',placement:'Primary content'},
      projects:{supported:false,group:'main'},
      skills:{supported:true,group:'side',placement:'Competencies rail'},
      education:{supported:true,group:'side',placement:'Competencies rail'},
      certificates:{supported:false,group:'side'},
      languages:{supported:true,group:'side',placement:'Additional information'},
    },
  }),
  'next-start': fixed({
    label:'Early-career hierarchy',
    audience:'Fresh Graduate & Entry Level',
    page:'1 page preferred',
    structure:'Graduate hero → Skills rail → Education → Projects → Internships → Activities',
    traits:['entry-level','one-page','avatar'],
    fields:{avatar:{supported:true,label:'Avatar'},headline:{supported:false,label:'Headline'},quote:{supported:false,label:'Quote'},projectImages:{supported:false,label:'Project images'}},
    sections:{
      summary:{supported:false,group:'main'},
      highlights:{supported:false,group:'main'},
      experience:{supported:true,group:'main',placement:'Internships'},
      projects:{supported:true,group:'main',placement:'Projects',limit:2},
      skills:{supported:true,group:'side',placement:'Skills rail'},
      education:{supported:true,group:'side',placement:'Education'},
      certificates:{supported:false,group:'side'},languages:{supported:false,group:'side'},
    },
  }),
  'modern-bento': flexible('Two-column flexible','Profile → Summary → Impact → Experience → Projects → Skills & credentials',['portfolio','visual','avatar']),
  'executive-navy': flexible('Executive flexible','Executive profile → Summary → Impact → Experience → Projects → Expertise & credentials',['executive','avatar']),
  'ats-clean': flexible('ATS flexible','Recruiter-first profile → Summary → Impact → Experience → Projects → Skills & credentials',['ats','recruiter','avatar']),
  'modern-mono': flexible('Technical flexible','Technical profile → Summary → Impact → Experience → Projects → Skills & credentials',['technical','ats-readable','avatar']),
  'young-creator-cards': flexible('Creative flexible','Creative profile → Summary → Impact → Experience → Portfolio projects → Skills & credentials',['portfolio','visual','avatar']),
  'strategy-brief': flexible('Consulting flexible','Executive profile → Summary → Engagement impact → Experience → Selected work → Expertise',['consulting','avatar']),
  'clinical-clean': flexible('Clinical flexible','Clinical profile → Summary → Experience → Selected work → Skills → Credentials & languages',['ats','healthcare','avatar']),
  'finance-ledger': flexible('Finance flexible','Executive profile → Summary → Quantified impact → Experience → Selected work → Expertise',['finance','avatar']),
  'studio-director': flexible('Editorial flexible','Editorial hero → Summary → Experience → Portfolio work → Capabilities',['portfolio','visual','avatar']),
  'research-scholar': flexible('Academic flexible','Research profile → Summary → Experience → Selected work → Skills → Education & credentials',['ats-readable','academic','avatar']),
}

export const getTemplateLayoutContract=(templateId)=>{
  const contract=TEMPLATE_LAYOUT_CONTRACTS[templateId]||flexible('Flexible layout','Profile → Experience → Projects → Skills')
  return {
    ...contract,
    traits:Array.isArray(contract.traits)?[...contract.traits]:[],
    print:{ multiPage:'preserve-flow', ...(TEMPLATE_PRINT_POLICIES[templateId]||{}), ...(contract.print||{}) },
    fields:{...DEFAULT_TEMPLATE_FIELDS,...(contract.fields||{})},
    sections:{...DEFAULT_LAYOUT_SECTIONS,...(contract.sections||{})},
  }
}
export const getTemplateSectionConfig=(templateId,sectionId)=>getTemplateLayoutContract(templateId).sections[sectionId]||DEFAULT_LAYOUT_SECTIONS[sectionId]||{supported:true,group:'main',placement:'Template section'}
export const getTemplateFieldConfig=(templateId,fieldId)=>getTemplateLayoutContract(templateId).fields[fieldId]||DEFAULT_TEMPLATE_FIELDS[fieldId]||{supported:false,label:fieldId}
export const templateSupportsField=(templateId,fieldId)=>getTemplateFieldConfig(templateId,fieldId).supported!==false
export const templateHasTrait=(templateId,trait)=>getTemplateLayoutContract(templateId).traits.includes(trait)
export const isTemplateSectionVisible=(profile,templateId,sectionId)=>{
  if(getTemplateSectionConfig(templateId,sectionId).supported===false)return false
  const config=(profile?.sections||[]).find((section)=>section.id===sectionId)
  return config ? config.enabled!==false : true
}
export const canReorderTemplateSection=(templateId,sectionId)=>getTemplateLayoutContract(templateId).mode==='flexible'&&getTemplateSectionConfig(templateId,sectionId).supported!==false
export const sameTemplateSectionGroup=(templateId,a,b)=>getTemplateSectionConfig(templateId,a).group===getTemplateSectionConfig(templateId,b).group
