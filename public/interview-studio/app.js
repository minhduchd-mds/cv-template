import {
  buildIndustryPracticeQuestions,
  buildTemplatePracticeQuestions,
  coreQuestions,
  globalQuestionBank,
  industryPracticeProfiles,
  interviewPacks,
  interviewSources,
  interviewStages,
  questionCategories,
  seniorityLevels,
  templateDefaultIndustry,
  templateInterviewPack,
  vietnamQuestionBank,
} from '../../src/data/interview-prep.js'
import {
  aggregateInterviewReport,
  analyzeApplicationEvidence,
  buildAdaptiveFollowUp,
  buildApplicationPracticeSet,
  buildInterviewStageMatrix,
  buildNextPracticePlan,
  claimProbes,
  interviewerModes,
  pressureLevels,
  evaluateInterviewResponse,
  extractCvClaims,
  getUnassignedClaimNotes,
  matchQuestionsToClaim,
  migrateLegacyClaimEvidence,
  questionRelevanceScore,
  relatedClaimsForAnswer,
} from '../../src/interview/interview-studio-engine.js'
import {
  buildQuestionDeck as assembleQuestionDeck,
  practiceContextBonus as catalogContextBonus,
  resolvePracticeIndustry,
} from '../../src/interview/question-catalog.js'
import { clearInterviewLocalData, downloadInterviewDataExport } from '../../src/interview/interview-data-controls.js'
import {
  JOB_MARKET_AS_OF, observedJobSignals, salaryBenchmarks, verifiedEmployers,
  salaryDisplay, jobSourceForRole, isObservedJobCurrent,
} from '../../src/data/job-market-vn.js'
import '../studio/safe-dom.js'

const safeDom = window.CVSafeDom


const WORKSPACE_KEY='cv-studio-workspace-v3'
const SESSION_KEY='interview-studio-sessions-v2'
const CLAIM_KEY='interview-studio-claim-evidence-v1'
const STORY_KEY='interview-studio-story-bank-v1'
const PREF_KEY='interview-studio-preferences-v1'
const modules=[
  {id:'overview',label:'Overview',icon:'◇'},
  {id:'applications',label:'Application Lab',icon:'◎',badge:'JD'},
  {id:'questions',label:'Question Bank',icon:'?'},
  {id:'claims',label:'Claim Defense',icon:'⌁',badge:'CV'},
  {id:'stories',label:'Story Bank',icon:'✦',badge:'NEW'},
  {id:'mock',label:'Mock Interview',icon:'▶'},
  {id:'reports',label:'Reports',icon:'▥'},
]
const templates=[
  ['executive-edge','Executive Edge'],['soft-portfolio-pro','Soft Portfolio'],['product-operator','Product Operator'],
  ['code-aware','Code Aware'],['ats-precision','ATS Precision'],['insight-grid','Insight Grid'],
  ['brand-motion','Brand Motion'],['revenue-driver','Revenue Driver'],['people-first','People First'],
  ['next-start','Next Start'],['modern-bento','Bento Resume'],['executive-navy','Executive Navy'],
  ['ats-clean','ATS Clean'],['modern-mono','Mono Grid'],['young-creator-cards','Creator Cards'],
  ['strategy-brief','Strategy Brief'],['clinical-clean','Clinical Clean'],['finance-ledger','Finance Ledger'],
  ['studio-director','Studio Director'],['research-scholar','Research Scholar'],
].map(([id,name])=>({id,name}))

const readJson=(key,fallback)=>{
  try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch{return fallback}
}
const preferences=readJson(PREF_KEY,{industryId:'auto',seniority:'Senior',market:'vietnam'})
let workspace=readJson(WORKSPACE_KEY,{profile:{},studio:{},ats:{target:{},versions:[],applications:[]}})
const initialTemplate=workspace?.studio?.selectedId&&templates.some(t=>t.id===workspace.studio.selectedId)?workspace.studio.selectedId:'soft-portfolio-pro'
const state={
  activeModule:'overview',
  selectedTemplateId:initialTemplate,
  rolePackId:templateInterviewPack[initialTemplate]||'general',
  industryId:preferences.industryId||'auto',
  seniority:preferences.seniority||'Senior',
  stageId:'hiring-manager',
  market:preferences.market||'vietnam',
  categoryId:'all',
  query:'',
  applicationId:'',
  applicationDraft:{id:'',company:'',role:'',status:'Interview',jd:'',notes:'',sourceUrl:''},
  applicationStatuses:['Saved','Applied','Screening','Interview','Technical','Portfolio','Final','Offer','Closed'],
  jobMarketTab:'jobs',
  jobMarketSearch:'',
  jobMarketCompany:'all',
  jobMarketCity:'all',
  jobMarketSalaryCity:'hanoi',
  jobMarketSalaryYears:'1-5',
  showMarketExplorer:true,
  interviewerMode:'hiring-manager',
  pressureLevel:'realistic',
  selectedClaimId:'',
  claimEvidence:readJson(CLAIM_KEY,{}),
  storyBank:readJson(STORY_KEY,[]),
  sessions:readJson(SESSION_KEY,[]),
  practice:null,
  timerId:null,
  timerRunning:false,
  timerRemaining:90,
  speech:null,
  speechRecording:false,
}
const root=document.querySelector('#app-view')
const nav=document.querySelector('#module-nav')
const moduleTitle=document.querySelector('#module-title')
const applicationLabel=document.querySelector('#application-label')
const applicationSelect=document.querySelector('#application-select')
const profileContext=document.querySelector('#profile-context')

const e=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]))
const list=(items=[],tag='li')=>items.map(item=>`<${tag}>${e(item)}</${tag}>`).join('')
const activePack=()=>interviewPacks.find(p=>p.id===state.rolePackId)||interviewPacks.find(p=>p.id==='general')||interviewPacks[0]
const resolvedIndustryId=()=>resolvePracticeIndustry(state.selectedTemplateId,state.industryId)
const activeIndustry=()=>industryPracticeProfiles[resolvedIndustryId()]||industryPracticeProfiles['technology-software']
const industryOptions=()=>[
  {id:'auto',label:'Auto · '+(industryPracticeProfiles[templateDefaultIndustry[state.selectedTemplateId]]?.label||'Software / IT')},
  ...Object.entries(industryPracticeProfiles).map(([id,profile])=>({id,label:profile.label})),
]
const activeStage=()=>interviewStages.find(s=>s.id===state.stageId)||interviewStages[0]
const activeInterviewer=()=>interviewerModes.find(item=>item.id===state.interviewerMode)||interviewerModes[1]
const activePressure=()=>pressureLevels.find(item=>item.id===state.pressureLevel)||pressureLevels[1]
const interviewerForStage=stage=>({hr:'recruiter','hiring-manager':'hiring-manager',technical:'craft',portfolio:'craft',final:'executive'})[stage]||'hiring-manager'
const applications=()=>Array.isArray(workspace?.ats?.applications)?workspace.ats.applications:[]
const activeApplication=()=>applications().find(a=>a.id===state.applicationId)||null
const cvClaims=()=>extractCvClaims(workspace?.profile||{})
state.claimEvidence=migrateLegacyClaimEvidence(state.claimEvidence)
const claimRisk=item=>Math.min(99,34+(item?.numbers?.length?22:0)+(item?.leadershipSignal?20:0)+(item?.outcomeSignal?17:0)+(item?.specificity>=75?8:0))
const highRiskClaims=()=>cvClaims().filter(item=>claimRisk(item)>=70)
const marketLabel=()=>state.market==='vietnam'?'Việt Nam':state.market==='global'?'Quốc tế':'VN + Quốc tế'
const categoryName=id=>questionCategories.find(c=>c.id===id)?.label||'Role-specific'
const dimensionLabel=key=>({relevance:'Question fit',structure:'Structure',evidence:'Evidence',ownership:'Ownership',depth:'Depth',credibility:'Credibility',delivery:'Delivery'})[key]||key
const stageWeight=item=>{
  const maps={
    hr:{core:1,behavioral:2,challenge:3,role:4,case:5,askback:6},
    'hiring-manager':{role:1,core:2,case:3,behavioral:4,challenge:5,askback:6},
    technical:{role:1,case:2,challenge:3,core:4,behavioral:5,askback:6},
    portfolio:{case:1,role:2,core:3,behavioral:4,challenge:5,askback:6},
    final:{behavioral:1,challenge:2,role:3,core:4,case:5,askback:6},
  }
  return maps[state.stageId]?.[item.category]||9
}
const practiceContextBonus=q=>catalogContextBonus(q,{
  templateId:state.selectedTemplateId,
  industryId:state.industryId,
  rolePackId:state.rolePackId,
  seniority:state.seniority,
  stageId:state.stageId,
  market:state.market,
})
const questionDeck=()=>assembleQuestionDeck({
  templateId:state.selectedTemplateId,
  industryId:state.industryId,
  rolePackId:state.rolePackId,
  stageId:state.stageId,
  market:state.market,
})
const filteredQuestions=()=>questionDeck().filter(item=>{
  if(state.categoryId!=='all'&&item.category!==state.categoryId)return false
  if(!state.query)return true
  return [item.question,item.why,item.example,...(item.framework||[]),...(item.followUps||[]),...(item.avoid||[])].join(' ').toLocaleLowerCase('vi').includes(state.query.toLocaleLowerCase('vi'))
})
const activeSources=()=>{
  const seen=new Set()
  return interviewSources.filter(source=>{
    const pack=source.packs.includes(state.rolePackId)||source.packs.includes('general')
    if(!pack)return false
    const region=source.region||'global'
    if(state.market==='vietnam'&&region!=='vietnam')return false
    if(state.market==='global'&&region==='vietnam')return false
    if(seen.has(source.id))return false
    seen.add(source.id);return true
  }).slice(0,14)
}
const questionSources=item=>(item?.sourceIds||[]).map(id=>interviewSources.find(s=>s.id===id)).filter(Boolean)
const evidenceReadyCount=()=>cvClaims().filter(item=>state.claimEvidence[item.id]?.ready).length
const latestReport=()=>state.sessions.find(session=>session.report)||null
const practiceDataCoverage=()=>{
  const deck=questionDeck()
  const sourced=deck.filter(item=>Array.isArray(item.sourceIds)&&item.sourceIds.length).length
  const categories=new Set(deck.map(item=>item.category).filter(Boolean)).size
  const templateSpecific=deck.filter(item=>item.templateId===state.selectedTemplateId).length
  const industrySpecific=deck.filter(item=>item.industryId===resolvedIndustryId()).length
  const volumeScore=Math.min(25,Math.round(deck.length/24*25))
  const sourceScore=Math.min(25,Math.round(sourced/12*25))
  const categoryScore=Math.min(15,categories*3)
  const templateScore=Math.min(15,templateSpecific*5)
  const industryScore=Math.min(20,industrySpecific*7)
  return Math.min(100,volumeScore+sourceScore+categoryScore+templateScore+industryScore)
}
const evidenceCoverage=()=>{
  const claims=cvClaims()
  return claims.length?Math.round(evidenceReadyCount()/claims.length*100):0
}
const readiness=()=>{
  const latest=latestReport()
  const data=practiceDataCoverage()
  const evidence=evidenceCoverage()
  if(!latest)return Math.round(data*.68+evidence*.32)
  return Math.round(data*.22+Number(latest.report.overall||0)*.58+evidence*.20)
}
const readinessLabel=()=>{
  const score=readiness()
  const data=practiceDataCoverage()
  const latest=latestReport()
  if(!latest&&data>=75)return 'Bộ luyện theo CV đã sẵn sàng · chưa có lịch sử luyện'
  if(!latest)return data>=55?'Bộ luyện đã có nền · cần thêm evidence CV':'Đang xây bộ luyện theo CV'
  return score>=82?'Sẵn sàng luyện vòng sâu':score>=68?'Nền tốt · còn evidence gaps':score>=50?'Cần củng cố câu chuyện':'Cần luyện thêm để có tín hiệu ổn định'
}
const readinessDetail=()=>{
  const deck=questionDeck()
  const templateSpecific=deck.filter(item=>item.templateId===state.selectedTemplateId).length
  const industrySpecific=deck.filter(item=>item.industryId===resolvedIndustryId()).length
  const sourced=deck.filter(item=>Array.isArray(item.sourceIds)&&item.sourceIds.length).length
  const latest=latestReport()
  if(!latest)return `${deck.length} câu đang hoạt động · ${templateSpecific} theo CV · ${industrySpecific} theo ngành ${activeIndustry().label} · ${sourced} có nguồn.`
  return `Độ phủ dữ liệu ${practiceDataCoverage()}% · evidence CV ${evidenceCoverage()}% · ngành ${activeIndustry().label} · ${state.sessions.length} phiên luyện.`
}
const saveClaims=()=>{try{localStorage.setItem(CLAIM_KEY,JSON.stringify(state.claimEvidence))}catch{toast('Không lưu được: bộ nhớ trình duyệt đã đầy hoặc bị khóa')}}
const saveSessions=()=>{state.sessions=state.sessions.slice(0,30);localStorage.setItem(SESSION_KEY,JSON.stringify(state.sessions))}
const saveStories=()=>{state.storyBank=(Array.isArray(state.storyBank)?state.storyBank:[]).slice(0,60);localStorage.setItem(STORY_KEY,JSON.stringify(state.storyBank))}
const toast=message=>{
  document.querySelector('.toast')?.remove()
  const node=document.createElement('div');node.className='toast';node.textContent=message;document.body.appendChild(node)
  setTimeout(()=>node.remove(),2200)
}
const formatDate=value=>{try{return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value))}catch{return value}}
const options=(items,valueFn,labelFn,selected)=>items.map(item=>`<option value="${e(valueFn(item))}" ${valueFn(item)===selected?'selected':''}>${e(labelFn(item))}</option>`).join('')

function renderNav(){
  safeDom(nav).html =modules.map(item=>`<button type="button" data-module="${item.id}" class="${state.activeModule===item.id?'active':''}"><span class="icon">${item.icon}</span><span>${item.label}</span>${item.badge?`<b>${item.badge}</b>`:''}</button>`).join('')
  nav.querySelectorAll('[data-module]').forEach(button=>button.addEventListener('click',()=>{state.activeModule=button.dataset.module;render()}))
}
function renderTop(){
  moduleTitle.textContent=modules.find(m=>m.id===state.activeModule)?.label||'Interview Studio'
  const app=activeApplication()
  applicationLabel.textContent=app?`${app.company} · ${app.role}`:'CV hiện tại · chưa gắn job'
  safeDom(applicationSelect).html =`<option value="">CV hiện tại · không gắn job</option>`+applications().map(a=>`<option value="${e(a.id)}" ${a.id===state.applicationId?'selected':''}>${e(a.company)} · ${e(a.role)}</option>`).join('')
  applicationSelect.onchange=()=>{state.applicationId=applicationSelect.value;renderTop();if(state.activeModule==='overview'||state.activeModule==='mock')renderView()}
  const template=templates.find(t=>t.id===state.selectedTemplateId)
  safeDom(profileContext).html =`<span class="eyebrow">ACTIVE PROFILE</span><strong>${e(template?.name||state.selectedTemplateId)}</strong><p>${e(activePack().label)}</p><div class="chips"><span>${e(activeIndustry().label)}</span><span>${e(state.seniority)}</span><span>${e(marketLabel())}</span></div>`
}
document.querySelector('#quick-practice').addEventListener('click',()=>{state.activeModule='mock';render()})

function render(){
  renderNav();renderTop();renderView()
}
function pageHeading(kicker,title,description,count){
  return `<div class="page-heading"><div><span class="eyebrow">${e(kicker)}</span><h1>${title}</h1>${description?`<p>${e(description)}</p>`:''}</div><div class="heading-number">${e(count)}</div></div>`
}
function renderOverview(){
  const deck=questionDeck()
  const templateSpecific=deck.filter(q=>q.templateId===state.selectedTemplateId).length
  const industrySpecific=deck.filter(q=>q.industryId===resolvedIndustryId()).length
  const sourced=deck.filter(q=>Array.isArray(q.sourceIds)&&q.sourceIds.length).length
  safeDom(root).html =`
    <section class="hero compact-hero">
      <div><span class="eyebrow">INTERVIEW STUDIO</span><h1>Luyện phỏng vấn theo <em>CV thật.</em></h1><div class="hero-actions"><button class="primary" data-start-quick="5">Luyện 5 câu</button><button class="secondary" data-go="claims">CV Claims</button></div></div>
      <article class="readiness compact-readiness"><div class="score-row"><span>READINESS</span><b>${readiness()}</b></div><strong>${e(readinessLabel())}</strong><div class="bar"><span style="width:${readiness()}%"></span></div></article>
    </section>
    <section class="stats compact-stats">
      <article><span>Questions</span><b>${deck.length}</b></article>
      <article><span>CV type</span><b>${templateSpecific}</b></article>
      <article><span>Industry</span><b>${industrySpecific}</b></article>
      <article><span>Sources</span><b>${sourced}</b></article>
      <article><span>Sessions</span><b>${state.sessions.length}</b></article>
      <article><span>Stories</span><b>${state.storyBank.length}</b></article>
    </section>
    <div class="grid2 compact-grid">
      <section class="panel context-panel"><div class="panel-title"><span class="eyebrow">CONTEXT</span><h2>Thiết lập luyện</h2></div><div class="fields">
        <label class="field"><span>Mẫu CV</span><select id="template-field">${options(templates,x=>x.id,x=>x.name,state.selectedTemplateId)}</select></label>
        <label class="field"><span>Role</span><select id="pack-field">${options(interviewPacks,x=>x.id,x=>x.label,state.rolePackId)}</select></label>
        <label class="field"><span>Ngành</span><select id="industry-field">${options(industryOptions(),x=>x.id,x=>x.label,state.industryId)}</select></label>
        <label class="field"><span>Level</span><select id="seniority-field">${seniorityLevels.map(x=>`<option ${x===state.seniority?'selected':''}>${e(x)}</option>`).join('')}</select></label>
        <label class="field"><span>Vòng</span><select id="stage-field">${options(interviewStages,x=>x.id,x=>x.label,state.stageId)}</select></label>
        <label class="field"><span>Nguồn</span><select id="market-field"><option value="vietnam" ${state.market==='vietnam'?'selected':''}>Việt Nam</option><option value="all" ${state.market==='all'?'selected':''}>VN + Global</option><option value="global" ${state.market==='global'?'selected':''}>Global</option></select></label>
      </div></section>
      <section class="panel quick-panel"><span class="eyebrow">QUICK PRACTICE</span><div class="quick-context"><strong>${e(activeIndustry().label)}</strong><span>${e(activeStage().label)}</span><span>${e(state.seniority)}</span></div><div class="quick-actions"><button class="primary" data-start-quick="5">5 câu</button><button class="secondary" data-start-quick="8">8 câu</button></div><div class="quick-links"><button data-go="questions">Question Bank</button><button data-go="claims">Claims</button><button data-go="reports">Reports</button></div></section>
    </div>
    <section class="panel source-panel"><div class="panel-title inline"><span class="eyebrow">SOURCES · ${e(marketLabel())}</span><b>${activeSources().length}</b></div><div class="sources compact-sources">${activeSources().map(s=>`<a href="${e(s.url)}" target="_blank" rel="noreferrer noopener"><span>${s.region==='vietnam'?'VN':'GL'}</span><strong>${e(s.name)}</strong><small>${e(s.label)}</small></a>`).join('')}</div></section>
  `
  bindGo()
  root.querySelectorAll('[data-start-quick]').forEach(button=>button.onclick=()=>{state.activeModule='mock';startMock(Number(button.dataset.startQuick||5),90)})
  document.querySelector('#template-field').onchange=ev=>{state.selectedTemplateId=ev.target.value;state.rolePackId=templateInterviewPack[state.selectedTemplateId]||'general';render()}
  document.querySelector('#pack-field').onchange=ev=>{state.rolePackId=ev.target.value;render()}
  const savePracticePrefs=()=>{try{localStorage.setItem(PREF_KEY,JSON.stringify({industryId:state.industryId,seniority:state.seniority,market:state.market}))}catch{}}
  document.querySelector('#industry-field').onchange=ev=>{state.industryId=ev.target.value;savePracticePrefs();render()}
  document.querySelector('#seniority-field').onchange=ev=>{state.seniority=ev.target.value;savePracticePrefs();render()}
  document.querySelector('#stage-field').onchange=ev=>{state.stageId=ev.target.value;render()}
  document.querySelector('#market-field').onchange=ev=>{state.market=ev.target.value;savePracticePrefs();render()}
}
function bindGo(){root.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{state.activeModule=b.dataset.go;render()}))}

function persistApplications(nextApplications){
  workspace={
    ...workspace,
    format:workspace.format||'cv-studio-workspace',
    schemaVersion:Number(workspace.schemaVersion||3),
    updatedAt:new Date().toISOString(),
    source:'interview-studio',
    ats:{
      target:workspace?.ats?.target||{},
      versions:Array.isArray(workspace?.ats?.versions)?workspace.ats.versions:[],
      applications:nextApplications,
    },
  }
  localStorage.setItem(WORKSPACE_KEY,JSON.stringify(workspace))
}
function newApplication(){
  state.applicationId=''
  state.applicationDraft={id:'',company:'',role:'',status:'Interview',jd:'',notes:'',sourceUrl:''}
}
function editApplication(app){
  if(!app)return newApplication()
  state.applicationDraft={
    id:app.id||'',
    company:app.company||'',
    role:app.role||'',
    status:app.status||'Interview',
    jd:app.jd||'',
    notes:app.notes||'',
    sourceUrl:app.sourceUrl||app.url||'',
  }
}
function applicationAnalysis(app=state.applicationDraft){
  if(![app?.company,app?.role,app?.jd].some(v=>String(v||'').trim()))return null
  return analyzeApplicationEvidence({application:app,claims:cvClaims(),stories:state.storyBank,questions:questionDeck()})
}
function applicationStageMatrix(app=state.applicationDraft){
  if(!applicationAnalysis(app))return []
  return buildInterviewStageMatrix({application:app,claims:cvClaims(),stories:state.storyBank,questions:questionDeck()})
}
function saveApplicationDraft(){
  const d=state.applicationDraft
  if(!String(d.company||'').trim()&&!String(d.role||'').trim()){toast('Cần ít nhất tên công ty hoặc vị trí');return}
  const id=d.id||'app-'+Date.now()
  const next={id,company:String(d.company||'').trim(),role:String(d.role||'').trim(),status:d.status||'Interview',jd:String(d.jd||'').trim(),notes:String(d.notes||'').trim(),sourceUrl:String(d.sourceUrl||'').trim(),updatedAt:new Date().toISOString()}
  const nextApps=applications().some(a=>a.id===id)?applications().map(a=>a.id===id?{...a,...next}:a):[next,...applications()]
  persistApplications(nextApps);state.applicationId=id;editApplication(next);toast('Đã lưu application');render()
}
function deleteApplication(id){
  persistApplications(applications().filter(a=>a.id!==id))
  if(state.applicationId===id)newApplication()
  toast('Đã xóa application');render()
}
function startApplicationPractice(app=activeApplication()||state.applicationDraft){
  let contextApp=app
  if(!contextApp?.id){
    const d=state.applicationDraft
    if(!String(d.company||'').trim()&&!String(d.role||'').trim()){toast('Cần ít nhất tên công ty hoặc vị trí');return}
    const id='app-'+Date.now()
    contextApp={id,company:String(d.company||'').trim(),role:String(d.role||'').trim(),status:d.status||'Interview',jd:String(d.jd||'').trim(),notes:String(d.notes||'').trim(),sourceUrl:String(d.sourceUrl||'').trim(),updatedAt:new Date().toISOString()}
    persistApplications([contextApp,...applications()])
    state.applicationId=id
    editApplication(contextApp)
  }
  const analysis=applicationAnalysis(contextApp)
  if(!analysis)return
  state.stageId=analysis.recommendedStage||state.stageId
  state.interviewerMode=interviewerForStage(state.stageId)
  const selected=buildApplicationPracticeSet({application:contextApp,claims:cvClaims(),stories:state.storyBank,questions:[...questionDeck()].sort((a,b)=>practiceContextBonus(b)-practiceContextBonus(a)),limit:5})
  if(!selected.length){toast('Chưa đủ dữ liệu để tạo practice set');return}
  if(contextApp.id)state.applicationId=contextApp.id
  state.practice={questions:selected,index:0,drafts:{},startedAt:new Date().toISOString(),timerChoice:90,baseSize:selected.length,adaptiveInserted:0}
  selected.forEach(q=>state.practice.drafts[q.id]={answer:'',evidence:'',confidence:3,evaluation:null})
  state.activeModule='mock';startTimer();render()
}
const renderMarketExplorer=()=>{
  const keyword=state.jobMarketSearch.trim().toLocaleLowerCase('vi')
  const jobs=observedJobSignals.filter(j=>isObservedJobCurrent(j,JOB_MARKET_AS_OF)&&
    (state.jobMarketCompany==='all'||j.employerId===state.jobMarketCompany)&&
    (state.jobMarketCity==='all'||j.location.toLocaleLowerCase('vi').includes(state.jobMarketCity))&&
    (!keyword||[j.title,verifiedEmployers.find(x=>x.id===j.employerId)?.name,j.location].join(' ').toLocaleLowerCase('vi').includes(keyword)))
  const roles=salaryBenchmarks.filter(r=>!keyword||[r.role,r.group,...r.skills].join(' ').toLocaleLowerCase('vi').includes(keyword))
  const jobCards=jobs.map(j=>{const company=verifiedEmployers.find(c=>c.id===j.employerId);return `<article class="market-card"><div><strong>${e(company?.name)}</strong><small>${e(j.location)}</small></div><h3>${e(j.title)}</h3><small>Đối chiếu ${e(j.checkedAt)} · Lương chưa công bố</small><footer><a href="${e(j.sourceUrl)}" target="_blank" rel="noopener noreferrer">Xem nguồn ↗</a><button type="button" data-market-job="${e(j.id)}">Dùng job này →</button></footer></article>`}).join('')
  const roleCards=roles.map(r=>{const source=jobSourceForRole(r);return `<article class="market-card"><div><strong>${e(r.group)}</strong><small>${e(source?.year)}</small></div><h3>${e(r.role)}</h3><b>${e(salaryDisplay(r,state.jobMarketSalaryCity,state.jobMarketSalaryYears))}</b><footer><small>Lương thị trường · không phải offer</small><a href="${e(source?.url)}" target="_blank" rel="noopener noreferrer">${e(source?.name)} ↗</a></footer></article>`}).join('')
  const companies=verifiedEmployers.map(c=>`<article class="market-card"><div><strong>${e(c.category)}</strong><small>${e(c.location)}</small></div><h3>${e(c.name)}</h3><footer><small>${e(c.source)}</small><a href="${e(c.careersUrl)}" target="_blank" rel="noopener noreferrer">Trang tuyển dụng ↗</a></footer></article>`).join('')
  const tabs=['jobs','salary','companies'].map((id,i)=>`<button type="button" data-market-tab="${id}" class="${state.jobMarketTab===id?'active':''}" aria-pressed="${state.jobMarketTab===id}">${['Vị trí đã đối chiếu','Lương theo role','Công ty'][i]}</button>`).join('')
  return `<section class="market-section" aria-label="Việc làm và lương Việt Nam"><header><div><span class="eyebrow">JOB MARKET · VIETNAM</span><h2>Khám phá cơ hội & lương</h2><small>Dữ liệu đối chiếu ${JOB_MARKET_AS_OF} · Không phải feed trực tiếp</small></div><button type="button" id="toggle-market" aria-expanded="${state.showMarketExplorer}">${state.showMarketExplorer?'Thu gọn':'Mở khám phá'}</button></header>${state.showMarketExplorer?`<div class="market-body"><div class="market-tools"><div class="market-tabs">${tabs}</div>${state.jobMarketTab==='companies'?'':`<input id="market-search" type="search" placeholder="Tìm role / công ty..." aria-label="Tìm role hoặc công ty" value="${e(state.jobMarketSearch)}" />`}${state.jobMarketTab==='jobs'?`<select id="market-company" aria-label="Lọc công ty"><option value="all">Tất cả công ty</option>${options(verifiedEmployers,x=>x.id,x=>x.name,state.jobMarketCompany)}</select><select id="market-city" aria-label="Lọc khu vực"><option value="all">Toàn quốc</option><option value="hà nội" ${state.jobMarketCity==='hà nội'?'selected':''}>Hà Nội</option><option value="tp.hcm" ${state.jobMarketCity==='tp.hcm'?'selected':''}>TP.HCM</option></select>`:''}${state.jobMarketTab==='salary'?`<select id="market-salary-city" aria-label="Thành phố tham khảo"><option value="hanoi" ${state.jobMarketSalaryCity==='hanoi'?'selected':''}>Hà Nội</option><option value="hcm" ${state.jobMarketSalaryCity==='hcm'?'selected':''}>TP.HCM</option></select><select id="market-salary-years" aria-label="Kinh nghiệm tham khảo"><option value="1-5" ${state.jobMarketSalaryYears==='1-5'?'selected':''}>1–5 năm</option><option value="5+" ${state.jobMarketSalaryYears==='5+'?'selected':''}>Trên 5 năm</option></select>`:''}</div><div class="market-grid">${state.jobMarketTab==='jobs'?jobCards:state.jobMarketTab==='salary'?roleCards:companies}</div>${state.jobMarketTab==='jobs'&&!jobs.length?'<p>Không có kết quả. Thử bộ lọc khác.</p>':''}<p class="market-disclaimer">Tin đăng có thể hết hạn. Lương ITviec là trung vị thị trường; Adecco là khoảng gross tham khảo, không phải lương của công ty.</p></div>`:''}</section>`
}
const bindMarketExplorer=()=>{
  const toggle=document.querySelector('#toggle-market');if(toggle)toggle.onclick=()=>{state.showMarketExplorer=!state.showMarketExplorer;renderApplications()}
  root.querySelectorAll('[data-market-tab]').forEach(node=>node.onclick=()=>{state.jobMarketTab=node.dataset.marketTab;renderApplications()})
  for(const [id,key] of [['#market-company','jobMarketCompany'],['#market-city','jobMarketCity'],['#market-salary-city','jobMarketSalaryCity'],['#market-salary-years','jobMarketSalaryYears']]){
    const node=document.querySelector(id);if(node)node.onchange=()=>{state[key]=node.value;renderApplications()}
  }
  const search=document.querySelector('#market-search');if(search)search.onchange=()=>{state.jobMarketSearch=search.value;renderApplications()}
  root.querySelectorAll('[data-market-job]').forEach(node=>node.onclick=()=>{
    const j=observedJobSignals.find(item=>item.id===node.dataset.marketJob)
    const company=verifiedEmployers.find(item=>item.id===j?.employerId)
    if(!j||!company)return
    newApplication();state.applicationDraft={...state.applicationDraft,company:company.name,role:j.title,status:'Saved',sourceUrl:j.sourceUrl,notes:'Nguồn: '+company.source+' · quan sát '+j.checkedAt+(j.expiresAt?' · hạn đăng '+j.expiresAt:'')+(j.note?' · '+j.note:'')}
    state.showMarketExplorer=false;renderApplications();renderTop()
  })
}
function renderApplications(){
  if(!state.applicationDraft.id&&state.applicationId){
    const app=activeApplication();if(app)editApplication(app)
  }
  if(!state.applicationDraft.id&&!state.applicationId&&applications().length){
    state.applicationId=applications()[0].id;editApplication(applications()[0])
  }
  const analysis=applicationAnalysis()
  safeDom(root).html =pageHeading('APPLICATION LAB','Ứng tuyển <em>theo từng job.</em>','',applications().length)+`
    ${renderMarketExplorer()}
    <div class="application-layout">
      <aside class="application-list">
        <div class="application-list-head"><span class="eyebrow">APPLICATIONS</span><button id="new-app">＋ New</button></div>
        ${applications().map(a=>`<button data-app="${e(a.id)}" class="${state.applicationDraft.id===a.id?'active':''}"><span><small>${e(a.status||'Saved')}</small><strong>${e(a.company||'Chưa có công ty')}</strong><p>${e(a.role||'Chưa có vị trí')}</p></span><b>→</b></button>`).join('')}
        ${applications().length?'':'<div class="empty">Chưa có application. Tạo job đầu tiên ở bên phải.</div>'}
      </aside>
      <section class="application-editor">
        <div class="application-editor-head"><div><span class="eyebrow">${state.applicationDraft.id?'EDIT APPLICATION':'NEW APPLICATION'}</span><h2>${e(state.applicationDraft.company||'Cơ hội tuyển dụng mới')}</h2></div>${analysis?`<div class="coverage-score"><b>${analysis.coverage}</b><span>evidence coverage</span></div>`:''}</div>
        <div class="application-form">
          <label><span>Công ty</span><input id="app-company" value="${e(state.applicationDraft.company)}" placeholder="Viettel Digital, FPT, Shopee..." /></label>
          <label><span>Vị trí</span><input id="app-role" value="${e(state.applicationDraft.role)}" placeholder="Senior Product Designer" /></label>
          <label><span>Pipeline</span><select id="app-status">${state.applicationStatuses.map(s=>`<option ${s===state.applicationDraft.status?'selected':''}>${e(s)}</option>`).join('')}</select></label>
          <label><span>JD / nguồn</span><input id="app-url" value="${e(state.applicationDraft.sourceUrl)}" placeholder="https://..." /></label>
          <label class="wide"><span>Job Description</span><textarea id="app-jd" rows="10" placeholder="Dán JD hoặc yêu cầu chính...">${e(state.applicationDraft.jd)}</textarea></label>
          <label class="wide"><span>Ghi chú</span><textarea id="app-notes" rows="4" placeholder="Hiring manager round, ngôn ngữ, team...">${e(state.applicationDraft.notes)}</textarea></label>
        </div>
        <div class="application-actions">${state.applicationDraft.id?'<button id="delete-app" class="text-btn danger">Xóa application</button>':'<span></span>'}<span></span><button id="save-app" class="secondary">Lưu context</button><button id="practice-app" class="primary" ${analysis?'':'disabled'}>Luyện job này →</button></div>
        ${analysis?`
          <div class="coverage-summary"><div class="coverage-ring"><b>${analysis.coverage}</b><span>/100</span></div><div><span class="eyebrow">EVIDENCE COVERAGE</span><h3>${e(analysis.summary)}</h3><span class="chip">${e(interviewStages.find(s=>s.id===analysis.recommendedStage)?.label||'Hiring Manager')}</span></div></div>
          <div class="coverage-grid"><section><span class="eyebrow">MATCHED SIGNALS</span><div class="signal-tags">${analysis.matchedSignals.map(s=>`<span>${e(s)}</span>`).join('')||'<small>Chưa có signal đủ rõ.</small>'}</div></section><section><span class="eyebrow">EVIDENCE GAPS</span><div class="signal-tags gaps">${analysis.gapSignals.map(s=>`<span>${e(s)}</span>`).join('')||'<small>Không phát hiện gap token đáng kể.</small>'}</div></section></div>
          <div class="coverage-grid"><section><span class="eyebrow">TOP CV EVIDENCE</span><ol class="coverage-list">${analysis.topClaims.map(x=>`<li><strong>${e(x.label)}</strong><p>${e(x.text)}</p></li>`).join('')||'<li><p>Chưa có CV evidence phù hợp.</p></li>'}</ol></section><section><span class="eyebrow">TOP STORY EVIDENCE</span><ol class="coverage-list">${analysis.topStories.map(x=>`<li><strong>${e(x.label)}</strong><p>${e(x.text)}</p></li>`).join('')||'<li><p>Chưa có Story Bank phù hợp.</p></li>'}</ol></section></div>
          <section class="stage-matrix"><div class="stage-matrix-head"><div><span class="eyebrow">INTERVIEW STAGES</span></div></div><div class="stage-matrix-grid">${applicationStageMatrix().map(stage=>`<article class="${stage.recommended?'recommended':''}"><div class="stage-card-top"><div>${stage.recommended?'<span>RECOMMENDED NEXT</span>':''}<strong>${e(stage.label)}</strong></div><b>${stage.preparedness}</b></div><p>${e(stage.evidence)}</p><div class="stage-focus">${stage.focus.map(term=>`<span>${e(term)}</span>`).join('')}</div><ol>${stage.questions.map(q=>`<li>${e(q.question)}</li>`).join('')}</ol><button data-stage-practice="${e(stage.id)}">Luyện vòng này →</button></article>`).join('')}</div></section>
          <section class="application-questions"><span class="eyebrow">RECOMMENDED INTERVIEW QUESTIONS</span><ol>${analysis.recommendedQuestions.slice(0,5).map(x=>`<li><span>${e(categoryName(x.category))}</span><strong>${e(x.question)}</strong></li>`).join('')}</ol></section>`
        :''}
      </section>
    </div>`
  bindMarketExplorer()
  const bindField=(id,key)=>{const node=document.querySelector(id);if(!node)return;node.oninput=()=>{state.applicationDraft[key]=node.value};node.onchange=()=>{state.applicationDraft[key]=node.value;if(key==='jd'||key==='status')renderApplications()}}
  bindField('#app-company','company');bindField('#app-role','role');bindField('#app-status','status');bindField('#app-url','sourceUrl');bindField('#app-jd','jd');bindField('#app-notes','notes')
  document.querySelector('#new-app').onclick=()=>{newApplication();renderApplications()}
  root.querySelectorAll('[data-app]').forEach(b=>b.onclick=()=>{state.applicationId=b.dataset.app;editApplication(applications().find(a=>a.id===state.applicationId));renderApplications();renderTop()})
  document.querySelector('#save-app').onclick=saveApplicationDraft
  const del=document.querySelector('#delete-app');if(del)del.onclick=()=>deleteApplication(state.applicationDraft.id)
  const practice=document.querySelector('#practice-app');if(practice)practice.onclick=()=>startApplicationPractice(state.applicationDraft)
  root.querySelectorAll('[data-stage-practice]').forEach(button=>button.onclick=()=>{
    state.stageId=button.dataset.stagePractice
    startApplicationPractice(state.applicationDraft)
  })
}

function renderQuestions(){
  const qs=filteredQuestions()
  safeDom(root).html =pageHeading('QUESTION BANK','Câu hỏi <em>phù hợp context.</em>','',qs.length)+`
    <section class="filterbar">
      <label><span>Tìm câu hỏi</span><input id="q-search" type="search" value="${e(state.query)}" placeholder="stakeholder, design system, failure, metric..." /></label>
      <label><span>Nhóm</span><select id="q-category">${options(questionCategories,x=>x.id,x=>x.label,state.categoryId)}</select></label>
      <label><span>Dữ liệu</span><select id="q-market"><option value="vietnam" ${state.market==='vietnam'?'selected':''}>Việt Nam</option><option value="all" ${state.market==='all'?'selected':''}>VN + Quốc tế</option><option value="global" ${state.market==='global'?'selected':''}>Quốc tế</option></select></label>
    </section>
    <div class="questions">${qs.map((q,i)=>`
      <details class="question" ${i===0?'open':''}><summary><span class="qnum">${String(i+1).padStart(2,'0')}</span><div><small>${e(categoryName(q.category))}${q.market==='vietnam'?' <b>SOURCE VN</b>':q.market==='global'?' <b>SOURCE GL</b>':q.provenance==='template-generated'?' <b>CV TYPE</b>':q.provenance==='industry-generated'?' <b>INDUSTRY</b>':''}</small><strong>${e(q.question)}</strong></div><span class="plus">+</span></summary>
      <div class="qbody"><section><span>Recruiter intent</span><p>${e(q.why)}</p></section><section><span>Answer framework</span><ol>${list(q.framework)}</ol></section><section class="wide"><span>Ví dụ tham khảo</span><p>“${e(q.example)}”</p></section><section><span>Follow-up</span><ul>${list(q.followUps)}</ul></section><section><span>Red flags</span><ul>${list(q.avoid)}</ul></section>
      ${questionSources(q).length?`<section class="wide"><span>Provenance</span><div class="source-links">${questionSources(q).map(s=>`<a href="${e(s.url)}" target="_blank" rel="noreferrer noopener">${e(s.name)} · ${e(s.label)} ↗</a>`).join('')}</div></section>`:''}</div></details>`).join('')}</div>`
  let timer
  document.querySelector('#q-search').addEventListener('input',ev=>{clearTimeout(timer);state.query=ev.target.value;timer=setTimeout(renderQuestions,120)})
  document.querySelector('#q-category').onchange=ev=>{state.categoryId=ev.target.value;renderQuestions()}
  document.querySelector('#q-market').onchange=ev=>{state.market=ev.target.value;render()}
}

function renderClaims(){
  const claims=cvClaims()
  if(!state.selectedClaimId||!claims.some(c=>c.id===state.selectedClaimId))state.selectedClaimId=claims[0]?.id||''
  const selected=claims.find(c=>c.id===state.selectedClaimId)
  safeDom(root).html =pageHeading('CLAIM DEFENSE','Bảo vệ <em>CV claims.</em>','',claims.length)+`
  <div class="claim-layout">
    <aside class="claim-list">${claims.map(c=>`<button data-claim="${c.id}" class="${c.id===state.selectedClaimId?'active':''}"><span><small>${e(c.source)} · ${e(c.label)}</small><strong>${e(c.text)}</strong></span><b class="risk ${claimRisk(c)>=70?'high':''}">${claimRisk(c)}</b></button>`).join('')}</aside>
    ${selected?`<section class="claim-detail">
      <div class="claim-head"><div><span class="eyebrow">CLAIM ${claims.findIndex(c=>c.id===selected.id)+1} / ${claims.length}</span><h2>${e(selected.text)}</h2></div><div class="risk-ring"><b>${claimRisk(selected)}</b><span>probe risk</span></div></div>
      <div class="meta chips">${selected.numbers.map(n=>`<span># Có số liệu: ${e(n)}</span>`).join('')}${selected.leadershipSignal?'<span># Ownership / leadership</span>':''}${selected.outcomeSignal?'<span># Outcome claim</span>':''}<span># ${e(selected.source)}</span></div>
      <div class="section"><span class="eyebrow">RECRUITER PROBES</span><ol class="probe-list">${list(claimProbes(selected))}</ol></div>
      <div class="section"><span class="eyebrow">MATCHED QUESTIONS</span><ol class="probe-list">${list(matchQuestionsToClaim(selected,questionDeck()).map(q=>q.question))||'<li>Chưa có câu hỏi đủ gần; dùng recruiter probes phía trên.</li>'}</ol></div>
      ${getUnassignedClaimNotes(state.claimEvidence).length?`<div class="section legacy-notes"><span class="eyebrow">GHI CHÚ CŨ CẦN GÁN LẠI</span><p>Không thể tự xác định ghi chú cũ thuộc claim nào sau khi sắp xếp lại CV. Chỉ gán khi anh xác nhận.</p>${getUnassignedClaimNotes(state.claimEvidence).map(note=>`<article><small>${e(note.legacyId)}</small><p>${e(note.note)}</p><button data-legacy-note="${e(note.legacyId)}" ${state.claimEvidence[selected.id]?.note?'disabled':''}>Gán vào claim đang chọn</button></article>`).join('')}</div>`:''}
      <div class="section evidence-box"><span class="eyebrow">EVIDENCE NOTE</span>${state.claimEvidence[selected.id]?.needsReview?'<p role="status">Ghi chú cũ cần xác minh lại theo claim hiện tại. Trạng thái ready không tự động được chuyển.</p>':''}<textarea id="claim-note" rows="6" placeholder="Baseline, phạm vi mình sở hữu, cách đo, ai tham gia, trade-off, result...">${e(state.claimEvidence[selected.id]?.note||'')}</textarea><div class="evidence-footer"><span id="claim-count">${(state.claimEvidence[selected.id]?.note||'').length} ký tự</span><button id="claim-ready" class="${state.claimEvidence[selected.id]?.ready?'ready':''}">${state.claimEvidence[selected.id]?.ready?'✓ Evidence ready':'Đánh dấu evidence ready'}</button></div></div>
    </section>`:'<section class="empty">CV hiện tại chưa có đủ nội dung để trích xuất claim.</section>'}
  </div>`
  root.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{state.selectedClaimId=b.dataset.claim;renderClaims()})
  if(selected){
    const note=document.querySelector('#claim-note')
    note.oninput=()=>{state.claimEvidence[selected.id]={...(state.claimEvidence[selected.id]||{}),note:note.value};document.querySelector('#claim-count').textContent=note.value.length+' ký tự'}
    note.onchange=saveClaims
    document.querySelector('#claim-ready').onclick=()=>{const current=state.claimEvidence[selected.id]||{};state.claimEvidence[selected.id]={...current,ready:!current.ready,needsReview:false,claimText:selected.text};saveClaims();renderClaims()}
    root.querySelectorAll('[data-legacy-note]').forEach(button=>button.onclick=()=>{
      if(String(state.claimEvidence[selected.id]?.note||'').trim())return
      const legacyId=button.dataset.legacyNote
      const original=getUnassignedClaimNotes(state.claimEvidence).find(item=>item.legacyId===legacyId)
      if(!original)return
      state.claimEvidence={
        ...state.claimEvidence,
        __legacyNotes:state.claimEvidence.__legacyNotes.map(item=>item.legacyId===legacyId?{...item,appliedTo:selected.id}:item),
        [selected.id]:{note:original.note,ready:false,needsReview:true,claimText:selected.text,legacySourceId:legacyId},
      }
      saveClaims();renderClaims()
    })
  }
}

function renderStories(){
  const stories=Array.isArray(state.storyBank)?state.storyBank:[]
  const avg=stories.length?Math.round(stories.reduce((sum,s)=>sum+Number(s.score||0),0)/stories.length):0
  safeDom(root).html =pageHeading('STORY BANK','Câu chuyện <em>đã lưu.</em>','',stories.length)
  const stats=document.createElement('section');stats.className='stats story-stats'
  safeDom(stats).html ='<article><span>Stories</span><b>'+stories.length+'</b><small>câu chuyện đã lưu</small></article><article><span>Evidence ready</span><b>'+stories.filter(s=>String(s.evidence||'').trim().length>=12).length+'</b><small>có STAR/evidence anchor</small></article><article><span>Average signal</span><b>'+(avg||'—')+'</b><small>practice signal trung bình</small></article>'
  root.appendChild(stats)
  if(!stories.length){const empty=document.createElement('div');empty.className='empty';safeDom(empty).html ='Chưa có story.<button class="text-btn" data-go="mock">Bắt đầu luyện →</button>';root.appendChild(empty);bindGo();return}
  const grid=document.createElement('div');grid.className='story-grid'
  stories.forEach(story=>{
    const card=document.createElement('article');card.className='story-card'
    safeDom(card).html ='<div class="story-top"><div><span>'+e(story.categoryLabel)+' · '+e(story.contextLabel)+'</span><h2>'+e(story.title)+'</h2></div><b>'+(story.score||'—')+'</b></div><p class="story-question">'+e(story.question)+'</p><blockquote>'+e(story.answer)+'</blockquote>'+(story.evidence?'<div class="story-evidence"><span>EVIDENCE</span><p>'+e(story.evidence)+'</p></div>':'')+(story.claims&&story.claims.length?'<div class="story-claims">'+story.claims.map(claim=>'<span>'+e(claim.label)+'</span>').join('')+'</div>':'')+'<div class="story-footer"><small>Cập nhật '+e(formatDate(story.updatedAt||story.createdAt))+'</small><div><button data-practice-story="'+e(story.id)+'">Luyện lại →</button><button class="danger" data-delete-story="'+e(story.id)+'">Xóa</button></div></div>'
    grid.appendChild(card)
  })
  root.appendChild(grid)
  root.querySelectorAll('[data-delete-story]').forEach(button=>button.onclick=()=>{state.storyBank=stories.filter(story=>story.id!==button.dataset.deleteStory);saveStories();renderStories()})
  root.querySelectorAll('[data-practice-story]').forEach(button=>button.onclick=()=>startStoryPractice(stories.find(story=>story.id===button.dataset.practiceStory)))
}
function saveCurrentStory(){
  const q=currentQuestion(),draft=currentDraft();if(!q||!draft||!draft.answer)return
  if(!draft.evaluation)evaluateCurrent()
  const related=relatedClaimsForAnswer(draft.answer,cvClaims(),3)
  const app=activeApplication(),appId=app?.id||''
  const existing=state.storyBank.find(story=>story.questionId===q.id&&story.applicationId===appId)
  const now=new Date().toISOString()
  const story={id:existing?.id||'story-'+Date.now(),createdAt:existing?.createdAt||now,updatedAt:now,questionId:q.id,question:q.question,title:related[0]?.label||categoryName(q.category),category:q.category,categoryLabel:categoryName(q.category),answer:String(draft.answer||'').trim(),evidence:String(draft.evidence||'').trim(),score:Number(draft.evaluation?.overall||0),applicationId:appId,contextLabel:app?app.company+' · '+app.role:activePack().label,rolePackId:state.rolePackId,stageId:state.stageId,claims:related.map(claim=>({id:claim.id,label:claim.label,text:claim.text}))}
  state.storyBank=existing?state.storyBank.map(item=>item.id===existing.id?story:item):[story,...state.storyBank]
  saveStories();toast('Đã lưu Story Bank');renderMock()
}
function startStoryPractice(story){
  if(!story)return
  const source=questionDeck().find(q=>q.id===story.questionId)||{id:story.questionId,question:story.question,why:'Kiểm tra liệu story này có chịu được câu hỏi đào sâu khi đổi context.',framework:['Kết luận','Ownership','Evidence','Trade-off','Learning'],example:story.answer,followUps:[],avoid:[],category:story.category||'behavioral'}
  state.applicationId=story.applicationId||state.applicationId
  state.practice={questions:[source],index:0,drafts:{},startedAt:new Date().toISOString(),timerChoice:90,baseSize:1,adaptiveInserted:0}
  state.practice.drafts[source.id]={answer:story.answer||'',evidence:story.evidence||'',confidence:4,evaluation:null}
  state.activeModule='mock';startTimer();render()
}
function startPracticePlan(plan){
  const ids=Array.isArray(plan?.recommendedQuestionIds)?plan.recommendedQuestionIds:[]
  const selected=ids.map(id=>questionDeck().find(q=>q.id===id)).filter(Boolean).slice(0,5)
  if(!selected.length){startMock(5,90);state.activeModule='mock';render();return}
  state.practice={questions:selected,index:0,drafts:{},startedAt:new Date().toISOString(),timerChoice:90,baseSize:selected.length,adaptiveInserted:0}
  selected.forEach(q=>state.practice.drafts[q.id]={answer:'',evidence:'',confidence:3,evaluation:null})
  state.activeModule='mock';startTimer();render()
}
function practicePlanHtml(plan){
  if(!plan)return ''
  return '<section class="panel practice-plan"><div class="panel-split"><div><span class="eyebrow">NEXT PRACTICE PLAN</span><h2>'+e(plan.summary)+'</h2></div><button id="practice-plan" class="primary">Luyện plan này →</button></div><div class="practice-focus">'+(plan.focusAreas||[]).map(area=>'<article><div><strong>'+e(area.label)+'</strong><b>'+area.score+'</b></div><p>'+e(area.objective)+'</p></article>').join('')+'</div><div class="section"><span class="eyebrow">RECOMMENDED QUESTIONS</span><ol class="probe-list">'+list((plan.recommendedQuestions||[]).map(item=>item.question))+'</ol></div></section>'
}
function stopTimer(){if(state.timerId)clearInterval(state.timerId);state.timerId=null;state.timerRunning=false}
function startTimer(){stopTimer();state.timerRemaining=state.practice?.timerChoice||90;state.timerRunning=true;state.timerId=setInterval(()=>{if(!state.timerRunning)return;if(state.timerRemaining<=1){state.timerRemaining=0;state.timerRunning=false;stopSpeech()}else state.timerRemaining--;const node=document.querySelector('#timer-value');if(node){node.textContent=formatTimer();node.parentElement.classList.toggle('warning',state.timerRemaining<=20)}},1000)}
const formatTimer=()=>`${String(Math.floor(state.timerRemaining/60)).padStart(2,'0')}:${String(state.timerRemaining%60).padStart(2,'0')}`
function startMock(size,timerChoice){
  const app=activeApplication()||{}
  const ranked=questionDeck().map(q=>({q,score:questionRelevanceScore(q,app,cvClaims())+(8-stageWeight(q))+practiceContextBonus(q)})).sort((a,b)=>b.score-a.score)
  const selected=[],cats=new Set()
  ranked.forEach(({q})=>{if(selected.length>=size)return;if(!cats.has(q.category)||selected.length>=Math.ceil(size/2)){selected.push(q);cats.add(q.category)}})
  ranked.forEach(({q})=>{if(selected.length<size&&!selected.some(x=>x.id===q.id))selected.push(q)})
  state.practice={questions:selected.slice(0,size),index:0,drafts:{},startedAt:new Date().toISOString(),timerChoice,baseSize:size,adaptiveInserted:0}
  state.practice.questions.forEach(q=>state.practice.drafts[q.id]={answer:'',evidence:'',confidence:3,evaluation:null})
  startTimer();renderMock()
}
const currentQuestion=()=>state.practice?.questions[state.practice.index]
const currentDraft=()=>state.practice?.drafts[currentQuestion()?.id]
function evaluateCurrent(){
  const q=currentQuestion(),draft=currentDraft();if(!q||!draft)return
  draft.evaluation=evaluateInterviewResponse({answer:draft.answer,evidence:draft.evidence,confidence:draft.confidence,question:q,claims:cvClaims(),elapsedSeconds:Math.max(0,state.practice.timerChoice-state.timerRemaining)})
}
function nextMock(){
  if(!currentDraft()?.evaluation)evaluateCurrent()
  const q=currentQuestion(),draft=currentDraft()
  const maxAdaptive=(state.practice.baseSize>=8?3:2)+Number(activePressure()?.followUpBonus||0)
  if(!q?.adaptive?.isFollowUp&&state.practice.adaptiveInserted<maxAdaptive){
    const followUp=buildAdaptiveFollowUp({
      question:q,
      evaluation:draft.evaluation,
      answer:draft.answer,
      claims:cvClaims(),
      sequence:state.practice.adaptiveInserted+1,
      interviewerMode:state.interviewerMode,
      pressureLevel:state.pressureLevel,
    })
    if(followUp&&!state.practice.questions.some(item=>item.id===followUp.id)){
      state.practice.questions.splice(state.practice.index+1,0,followUp)
      state.practice.drafts[followUp.id]={answer:'',evidence:'',confidence:3,evaluation:null}
      state.practice.adaptiveInserted+=1
    }
  }
  if(state.practice.index<state.practice.questions.length-1){stopSpeech();state.practice.index++;startTimer();renderMock();return}
  finishMock()
}
function finishMock(){
  stopTimer();stopSpeech()
  const responses=state.practice.questions.map(q=>{const d=state.practice.drafts[q.id];if(!d.evaluation)d.evaluation=evaluateInterviewResponse({answer:d.answer,evidence:d.evidence,confidence:d.confidence,question:q,claims:cvClaims(),elapsedSeconds:state.practice.timerChoice});return{questionId:q.id,question:q.question,answer:d.answer.trim(),evidence:d.evidence.trim(),confidence:d.confidence,evaluation:d.evaluation,adaptive:q.adaptive||null}})
  const report=aggregateInterviewReport(responses),app=activeApplication()
  report.practicePlan=buildNextPracticePlan({report,responses,questions:questionDeck(),claims:cvClaims(),application:app||{}})
  state.sessions=[{id:'interview-studio-'+Date.now(),createdAt:new Date().toISOString(),startedAt:state.practice.startedAt,applicationId:app?.id||'',contextLabel:app?`${app.company} · ${app.role}`:`${activePack().label} · CV`,stageLabel:activeStage().label,interviewerMode:state.interviewerMode,interviewerLabel:activeInterviewer().label,pressureLevel:state.pressureLevel,pressureLabel:activePressure().label,total:responses.length,baseQuestions:state.practice.baseSize,adaptiveFollowUps:responses.filter(r=>r.adaptive?.isFollowUp).length,answered:responses.filter(r=>r.answer||r.evidence).length,responses,report},...state.sessions]
  saveSessions();state.practice=null;state.activeModule='reports';render();toast('Đã tạo Interview Report')
}
function stopSpeech(){if(state.speech){try{state.speech.stop()}catch{}}state.speech=null;state.speechRecording=false}
function startSpeech(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition
  if(!Recognition){toast('Trình duyệt này chưa hỗ trợ speech recognition');return}
  const q=currentQuestion(),draft=currentDraft();if(!q||!draft)return
  stopSpeech();const recognition=new Recognition();recognition.lang='vi-VN';recognition.continuous=true;recognition.interimResults=true
  const base=draft.answer.replace(/\s*\[đang nghe:.*$/s,'').trim();let committed=''
  recognition.onresult=event=>{let interim='';for(let i=event.resultIndex;i<event.results.length;i++){const t=event.results[i][0]?.transcript||'';if(event.results[i].isFinal)committed+=t+' ';else interim+=t}draft.answer=[base,committed.trim()].filter(Boolean).join(' ')+(interim?` [đang nghe: ${interim}]`:'');const ta=document.querySelector('#mock-answer');if(ta)ta.value=draft.answer}
  recognition.onend=()=>{state.speechRecording=false;draft.answer=draft.answer.replace(/\s*\[đang nghe:.*$/s,'').trim();renderMock()}
  recognition.onerror=()=>{state.speechRecording=false}
  state.speech=recognition;state.speechRecording=true;recognition.start();renderMock()
}
function speakQuestion(){if(!window.speechSynthesis||!currentQuestion())return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(currentQuestion().question);u.lang='vi-VN';u.rate=.96;window.speechSynthesis.speak(u)}

function renderMock(){
  if(!state.practice){
    safeDom(root).html =pageHeading('MOCK INTERVIEW','Luyện như <em>vòng thật.</em>','', '5Q')+`
      <section class="mock-start"><div class="mock-config"><h2>Thiết lập phiên luyện</h2>
      <label class="field"><span>Application</span><select id="mock-app"><option value="">CV hiện tại · không gắn job</option>${applications().map(a=>`<option value="${e(a.id)}" ${a.id===state.applicationId?'selected':''}>${e(a.company)} · ${e(a.role)}</option>`).join('')}</select></label>
      <label class="field"><span>Vòng phỏng vấn</span><select id="mock-stage">${options(interviewStages,x=>x.id,x=>x.label,state.stageId)}</select></label>
      <label class="field"><span>Interviewer mode</span><select id="mock-interviewer">${options(interviewerModes,x=>x.id,x=>x.label,state.interviewerMode)}</select></label>
      <label class="field"><span>Pressure</span><select id="mock-pressure">${options(pressureLevels,x=>x.id,x=>x.label,state.pressureLevel)}</select></label>
      <label class="field"><span>Timer / câu</span><select id="mock-timer"><option value="60">60 giây</option><option value="90" selected>90 giây</option><option value="120">120 giây</option></select></label>
      <label class="field"><span>Số câu</span><select id="mock-size"><option value="5">5 câu · Quick round</option><option value="8">8 câu · Full round</option></select></label>
      </div><div class="mock-preview"><span class="eyebrow">SESSION</span><div><b>${cvClaims().length}</b><span>CV claims</span></div><div><b>${activeApplication()?'JD':'CV'}</b><span>application context</span></div><div><b>${e(activeStage().label)}</b><span>interview stage</span></div><div><b>${e(activeInterviewer().shortLabel)}</b><span>${e(activeInterviewer().label)}</span></div><div><b>${e(activePressure().label)}</b><span>adaptive pressure</span></div><div><b>${e(marketLabel())}</b><span>question sources</span></div><button id="start-mock" class="primary">Bắt đầu session →</button></div></section>`
    document.querySelector('#mock-app').onchange=ev=>{state.applicationId=ev.target.value;renderTop()}
    document.querySelector('#mock-stage').onchange=ev=>{state.stageId=ev.target.value;state.interviewerMode=interviewerForStage(state.stageId);renderMock()}
    document.querySelector('#mock-interviewer').onchange=ev=>{state.interviewerMode=ev.target.value;renderMock()}
    document.querySelector('#mock-pressure').onchange=ev=>{state.pressureLevel=ev.target.value;renderMock()}
    document.querySelector('#start-mock').onclick=()=>startMock(Number(document.querySelector('#mock-size').value),Number(document.querySelector('#mock-timer').value))
    return
  }
  const q=currentQuestion(),draft=currentDraft(),evaluation=draft.evaluation
  safeDom(root).html =pageHeading('MOCK INTERVIEW','Luyện như <em>vòng thật.</em>','',`${state.practice.index+1}/${state.practice.questions.length}`)+`
    <section class="live"><div class="live-meta"><div><span>QUESTION ${state.practice.index+1} / ${state.practice.questions.length}${q.adaptive?.isFollowUp?' <b class="adaptive-badge">ADAPTIVE FOLLOW-UP</b>':''}</span><small>${e(categoryName(q.category))} · ${e(activeStage().label)} · ${e(activeInterviewer().label)} · ${e(activePressure().label)}</small></div><div class="timer ${state.timerRemaining<=20?'warning':''}"><b id="timer-value">${formatTimer()}</b><span>${state.timerRunning?'đang chạy':'tạm dừng'}</span></div></div>
    ${q.adaptive?.isFollowUp?`<div class="adaptive-reason"><span>WHY THIS FOLLOW-UP</span><p>${e(q.adaptive.reason)}</p><small>Trigger: ${e(dimensionLabel(q.adaptive.triggerDimension))} · ${q.adaptive.triggerScore}/100 · ${e(q.adaptive.interviewerLabel||activeInterviewer().label)} · ${e(q.adaptive.pressureLabel||activePressure().label)}</small></div>`:''}
    <h2>${e(q.question)}</h2><div class="tools"><button id="speak-q">🔊 Đọc câu hỏi</button><button id="speech-q" class="${state.speechRecording?'recording':''}">${state.speechRecording?'■ Dừng ghi âm':'🎙 Trả lời bằng giọng nói'}</button><button id="pause-timer">${state.timerRunning?'Ⅱ Tạm dừng timer':'▶ Tiếp tục timer'}</button></div>
    <div class="answer-grid"><label><span>Câu trả lời của anh</span><textarea id="mock-answer" rows="9" placeholder="Nói hoặc nhập đúng cách anh sẽ trả lời trong buổi phỏng vấn thật...">${e(draft.answer)}</textarea><small id="word-count">${draft.answer.trim().split(/\s+/).filter(Boolean).length} từ</small></label><label><span>Evidence / STAR anchors</span><textarea id="mock-evidence" rows="6" placeholder="Project · ownership · baseline · decision · trade-off · result · learning">${e(draft.evidence)}</textarea></label></div>
    <label class="confidence"><span>Mức tự tin</span><input id="mock-confidence" type="range" min="1" max="5" value="${draft.confidence}"><b id="confidence-value">${draft.confidence}/5</b></label>
    ${evaluation?`<div class="evaluation"><div class="eval-score"><b>${evaluation.overall}</b><span>practice signal</span></div><div class="metric-bars">${Object.entries(evaluation.dimensions).map(([k,v])=>`<div><span>${e(dimensionLabel(k))}</span><i><b style="width:${v}%"></b></i><strong>${v}</strong></div>`).join('')}</div>${evaluation.warnings.length?`<ul class="warnings">${list(evaluation.warnings)}</ul>`:''}</div>`:''}
    <button id="coach-toggle" class="coach-toggle">Mở Answer Coach</button><div id="coach" class="coach-grid hidden"><section><span>Recruiter intent</span><p>${e(q.why)}</p></section><section><span>Framework</span><ol>${list(q.framework)}</ol></section><section><span>Reference answer</span><p>“${e(q.example)}”</p></section><section><span>Adaptive follow-up</span><ul>${list([...(evaluation?.dimensions?.evidence<65?['Evidence cụ thể nào chứng minh kết quả này? Baseline và nguồn đo là gì?']:[]),...(evaluation?.dimensions?.ownership<65?['Phần nào anh trực tiếp sở hữu, phần nào thuộc team?']:[]),...(q.followUps||[])].slice(0,4))}</ul></section></div>
    <div class="session-actions">${evaluation&&draft.answer?'<button id="save-story" class="secondary">'+(state.storyBank.some(story=>story.questionId===q.id&&story.applicationId===(activeApplication()?.id||''))?'✓ Đã lưu Story Bank':'✦ Lưu vào Story Bank')+'</button>':''}<button id="eval-q" class="secondary">Đánh giá câu này</button><button id="next-q" class="primary">${!q.adaptive?.isFollowUp&&state.practice.adaptiveInserted<((state.practice.baseSize>=8?3:2)+Number(activePressure()?.followUpBonus||0))?'Phân tích & tiếp tục →':state.practice.index===state.practice.questions.length-1?'Hoàn tất & tạo report':'Câu tiếp theo →'}</button></div></section>`
  const answer=document.querySelector('#mock-answer'),evd=document.querySelector('#mock-evidence'),conf=document.querySelector('#mock-confidence')
  answer.oninput=()=>{draft.answer=answer.value;document.querySelector('#word-count').textContent=answer.value.trim().split(/\s+/).filter(Boolean).length+' từ'}
  evd.oninput=()=>{draft.evidence=evd.value}
  conf.oninput=()=>{draft.confidence=Number(conf.value);document.querySelector('#confidence-value').textContent=conf.value+'/5'}
  const saveStory=document.querySelector('#save-story');if(saveStory)saveStory.onclick=saveCurrentStory
  document.querySelector('#eval-q').onclick=()=>{evaluateCurrent();renderMock()}
  document.querySelector('#next-q').onclick=nextMock
  document.querySelector('#coach-toggle').onclick=()=>document.querySelector('#coach').classList.toggle('hidden')
  document.querySelector('#pause-timer').onclick=()=>{state.timerRunning=!state.timerRunning;renderMock()}
  document.querySelector('#speak-q').onclick=speakQuestion
  document.querySelector('#speech-q').onclick=()=>state.speechRecording?stopSpeech():startSpeech()
}

function renderReports(){
  const latest=latestReport()
  safeDom(root).html =pageHeading('INTERVIEW REPORTS','Kết quả <em>luyện tập.</em>','',state.sessions.length)+
  (latest?`<section class="report-hero"><div class="report-score"><span>LATEST PRACTICE SIGNAL</span><b>${latest.report.overall}</b><small>/100</small></div><div><strong>${e(latest.contextLabel)}</strong><p>${e(formatDate(latest.createdAt))} · ${e(latest.stageLabel)} · ${e(latest.interviewerLabel||'Interviewer')} · ${e(latest.pressureLabel||'Realistic')} · ${latest.answered}/${latest.total} câu</p><span class="chip">${latest.report.evidenceReady}/${latest.total} câu có evidence note · ${latest.report.adaptiveCount||0} adaptive follow-up</span></div></section><div class="grid2"><section class="panel"><span class="eyebrow">DIMENSIONS</span><h2>Dimensions</h2><div class="metric-bars">${Object.entries(latest.report.dimensions).map(([k,v])=>`<div><span>${e(dimensionLabel(k))}</span><i><b style="width:${v}%"></b></i><strong>${v}</strong></div>`).join('')}</div></section><section class="panel"><span class="eyebrow">EVIDENCE GAPS</span><h2>Evidence gaps</h2><ul class="warnings">${list(latest.report.warnings.length?latest.report.warnings:['Chưa phát hiện cảnh báo lớn trong session gần nhất.'])}</ul></section></div>${latest.report.adaptiveCount?`<section class="panel adaptive-report"><span class="eyebrow">ADAPTIVE TRACE</span><h2>Adaptive trace</h2><div class="adaptive-stats"><div><b>${latest.report.adaptiveCount}</b><span>follow-up đã chèn</span></div><div><b>${latest.report.adaptiveDimensions.length}</b><span>dimension bị đào sâu</span></div></div><ul class="warnings">${list(latest.report.adaptiveReasons)}</ul></section>`:''}`:'')+
  (latest?.report?.adaptiveTrace?.length?`<section class="panel branch-trace"><span class="eyebrow">BRANCH MEMORY</span><h2>Branch trace</h2><div class="branch-trace-list">${latest.report.adaptiveTrace.map(item=>`<article><div class="branch-index">${String(item.index).padStart(2,'0')}</div><div><span>${e(item.interviewerLabel||latest.interviewerLabel||'Interviewer')} · ${e(item.pressureLabel||latest.pressureLabel||'Realistic')}</span><strong>${e(item.question)}</strong><p>${e(item.reason)}</p></div><div class="branch-trigger"><span>${e(dimensionLabel(item.triggerDimension))}</span><b>${item.triggerScore}</b></div></article>`).join('')}</div></section>`:'')+
  (latest?.report?.practicePlan?practicePlanHtml(latest.report.practicePlan):'')+`<section class="panel"><span class="eyebrow">HISTORY</span><h2>Lịch sử luyện tập</h2>${state.sessions.length?`<div class="history">${state.sessions.map(s=>`<article><div><strong>${e(s.contextLabel)}</strong><small>${e(formatDate(s.createdAt))}</small></div><span>${e(s.stageLabel||'')}</span><span>${s.answered||0}/${s.total||0} answered</span><span>${s.report?.evidenceReady||s.evidenceReady||0} evidence</span><b>${s.report?.overall||'—'}</b></article>`).join('')}</div><button id="clear-history" class="text-btn">Xóa lịch sử local</button>`:`<div class="empty">Chưa có report.<button class="text-btn" data-go="mock">Bắt đầu luyện →</button></div>`}</section>
  <section class="panel privacy-controls" aria-label="Quản lý dữ liệu Interview Studio">
    <span class="eyebrow">DATA PRIVACY</span>
    <h2>Kiểm soát dữ liệu luyện phỏng vấn</h2>
    <p>Câu trả lời, Story Bank và ghi chú evidence được lưu trong trình duyệt này. File JSON được xuất ra <strong>không mã hóa</strong>. CV và JD dùng chung với CV Studio sẽ được giữ lại khi xóa dữ liệu Interview Studio.</p>
    <div class="privacy-actions">
      <button id="export-interview" class="secondary">Xuất dữ liệu Interview Studio (.json)</button>
      <button id="erase-interview" class="secondary privacy-danger">Xóa dữ liệu luyện tập trên thiết bị</button>
    </div>
  </section>`
  bindGo()
  const plan=document.querySelector('#practice-plan');if(plan&&latest?.report?.practicePlan)plan.onclick=()=>startPracticePlan(latest.report.practicePlan)
  const clear=document.querySelector('#clear-history');if(clear)clear.onclick=()=>{
    if(!window.confirm('Xóa lịch sử mock interview trên thiết bị này?'))return
    state.sessions=[];saveSessions();renderReports()
  }
  document.querySelector('#export-interview').onclick=()=>{
    try {
      downloadInterviewDataExport(localStorage,document,URL,Blob)
    } catch(error) {
      console.warn('Interview export failed',error)
      toast('Không thể xuất dữ liệu. Hãy kiểm tra quyền bộ nhớ.')
    }
  }
  document.querySelector('#erase-interview').onclick=()=>{
    if(!window.confirm('Xóa toàn bộ lịch sử luyện tập, Story Bank, evidence và thiết lập Interview Studio? CV và JD dùng chung được giữ lại.'))return
    try {
      clearInterviewLocalData(localStorage)
      stopTimer();stopSpeech()
      state.practice=null
      state.sessions=[]
      state.claimEvidence={}
      state.storyBank=[]
      renderReports()
      toast('Đã xóa dữ liệu Interview Studio trên thiết bị')
    } catch(error) {
      console.warn('Interview cleanup failed',error)
      toast('Không thể xóa hết dữ liệu trên thiết bị này')
    }
  }
}

function renderView(){
  stopSpeech()
  if(state.activeModule!=='mock')stopTimer()
  if(state.activeModule==='overview')renderOverview()
  else if(state.activeModule==='applications')renderApplications()
  else if(state.activeModule==='questions')renderQuestions()
  else if(state.activeModule==='claims')renderClaims()
  else if(state.activeModule==='stories')renderStories()
  else if(state.activeModule==='mock')renderMock()
  else renderReports()
}

window.addEventListener('beforeunload',()=>{stopTimer();stopSpeech()})
render()
