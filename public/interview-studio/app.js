import {
  coreQuestions,
  interviewPacks,
  interviewSources,
  interviewStages,
  questionCategories,
  seniorityLevels,
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
  matchQuestionsToClaim,
  questionRelevanceScore,
  relatedClaimsForAnswer,
} from '../../src/interview/interview-studio-engine.js'

const WORKSPACE_KEY='cv-studio-workspace-v3'
const SESSION_KEY='interview-studio-sessions-v2'
const CLAIM_KEY='interview-studio-claim-evidence-v1'
const STORY_KEY='interview-studio-story-bank-v1'
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
let workspace=readJson(WORKSPACE_KEY,{profile:{},studio:{},ats:{target:{},versions:[],applications:[]}})
const initialTemplate=workspace?.studio?.selectedId&&templates.some(t=>t.id===workspace.studio.selectedId)?workspace.studio.selectedId:'soft-portfolio-pro'
const state={
  activeModule:'overview',
  selectedTemplateId:initialTemplate,
  rolePackId:templateInterviewPack[initialTemplate]||'general',
  seniority:'Senior',
  stageId:'hiring-manager',
  market:'vietnam',
  categoryId:'all',
  query:'',
  applicationId:'',
  applicationDraft:{id:'',company:'',role:'',status:'Interview',jd:'',notes:'',sourceUrl:''},
  applicationStatuses:['Saved','Applied','Screening','Interview','Technical','Portfolio','Final','Offer','Closed'],
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
const activeStage=()=>interviewStages.find(s=>s.id===state.stageId)||interviewStages[0]
const activeInterviewer=()=>interviewerModes.find(item=>item.id===state.interviewerMode)||interviewerModes[1]
const activePressure=()=>pressureLevels.find(item=>item.id===state.pressureLevel)||pressureLevels[1]
const interviewerForStage=stage=>({hr:'recruiter','hiring-manager':'hiring-manager',technical:'craft',portfolio:'craft',final:'executive'})[stage]||'hiring-manager'
const applications=()=>Array.isArray(workspace?.ats?.applications)?workspace.ats.applications:[]
const activeApplication=()=>applications().find(a=>a.id===state.applicationId)||null
const cvClaims=()=>extractCvClaims(workspace?.profile||{})
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
const questionDeck=()=>{
  const local=state.market==='global'?[]:vietnamQuestionBank.filter(item=>item.pack==='general'||item.pack===state.rolePackId)
  const seen=new Set()
  return [...coreQuestions,...activePack().questions,...local].filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true}).sort((a,b)=>stageWeight(a)-stageWeight(b))
}
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
  }).slice(0,10)
}
const questionSources=item=>(item?.sourceIds||[]).map(id=>interviewSources.find(s=>s.id===id)).filter(Boolean)
const evidenceReadyCount=()=>cvClaims().filter(item=>state.claimEvidence[item.id]?.ready).length
const latestReport=()=>state.sessions.find(session=>session.report)||null
const readiness=()=>{
  const latest=latestReport()
  if(!latest){const claims=cvClaims();const base=claims.length?Math.round(evidenceReadyCount()/claims.length*45):0;return Math.min(55,20+base)}
  return Math.round(latest.report.overall*.78+Math.min(22,evidenceReadyCount()*2))
}
const readinessLabel=()=>{
  const score=readiness()
  return score>=82?'Sẵn sàng luyện vòng sâu':score>=68?'Nền tốt · còn evidence gaps':score>=50?'Cần củng cố câu chuyện':'Chưa có đủ dữ liệu luyện tập'
}
const saveClaims=()=>localStorage.setItem(CLAIM_KEY,JSON.stringify(state.claimEvidence))
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
  nav.innerHTML=modules.map(item=>`<button type="button" data-module="${item.id}" class="${state.activeModule===item.id?'active':''}"><span class="icon">${item.icon}</span><span>${item.label}</span>${item.badge?`<b>${item.badge}</b>`:''}</button>`).join('')
  nav.querySelectorAll('[data-module]').forEach(button=>button.addEventListener('click',()=>{state.activeModule=button.dataset.module;render()}))
}
function renderTop(){
  moduleTitle.textContent=modules.find(m=>m.id===state.activeModule)?.label||'Interview Studio'
  const app=activeApplication()
  applicationLabel.textContent=app?`${app.company} · ${app.role}`:'CV hiện tại · chưa gắn job'
  applicationSelect.innerHTML=`<option value="">CV hiện tại · không gắn job</option>`+applications().map(a=>`<option value="${e(a.id)}" ${a.id===state.applicationId?'selected':''}>${e(a.company)} · ${e(a.role)}</option>`).join('')
  applicationSelect.onchange=()=>{state.applicationId=applicationSelect.value;renderTop();if(state.activeModule==='overview'||state.activeModule==='mock')renderView()}
  const template=templates.find(t=>t.id===state.selectedTemplateId)
  profileContext.innerHTML=`<span class="eyebrow">ACTIVE PROFILE</span><strong>${e(template?.name||state.selectedTemplateId)}</strong><p>${e(activePack().label)}</p><div class="chips"><span>${e(state.seniority)}</span><span>${e(marketLabel())}</span></div>`
}
document.querySelector('#quick-practice').addEventListener('click',()=>{state.activeModule='mock';render()})

function render(){
  renderNav();renderTop();renderView()
}
function pageHeading(kicker,title,description,count){
  return `<div class="page-heading"><div><span class="eyebrow">${e(kicker)}</span><h1>${title}</h1><p>${e(description)}</p></div><div class="heading-number">${e(count)}</div></div>`
}
function renderOverview(){
  const claims=cvClaims(),ready=evidenceReadyCount(),vn=questionDeck().filter(q=>q.market==='vietnam').length
  const practiced=state.sessions.reduce((sum,s)=>sum+Number(s.answered||0),0)
  root.innerHTML=`
    <section class="hero">
      <div><span class="eyebrow">INTERVIEW STUDIO · VIETNAM-FIRST</span><h1>Biến CV thành <em>lợi thế trong phòng phỏng vấn.</em></h1><p>Interview Studio đọc CV, JD và lịch sử luyện tập để chuẩn bị câu hỏi, bảo vệ từng claim bằng evidence và giúp anh luyện cách trả lời trước vòng thật.</p><div class="hero-actions"><button class="primary" data-go="mock">Bắt đầu mock interview</button><button class="secondary" data-go="claims">Kiểm tra CV claims</button></div></div>
      <article class="readiness"><div class="score-row"><span>READINESS SIGNAL</span><b>${readiness()}</b></div><strong>${e(readinessLabel())}</strong><p>Đây là tín hiệu luyện tập nội bộ, không phải dự đoán kết quả tuyển dụng.</p><div class="bar"><span style="width:${readiness()}%"></span></div></article>
    </section>
    <section class="stats">
      <article><span>Question bank</span><b>${questionDeck().length}</b><small>${vn} câu có nguồn Việt Nam</small></article>
      <article><span>CV claims</span><b>${claims.length}</b><small>${highRiskClaims().length} claim cần chuẩn bị kỹ</small></article>
      <article><span>Practice sessions</span><b>${state.sessions.length}</b><small>${practiced} câu đã luyện</small></article>
      <article><span>Story bank</span><b>${state.storyBank.length}</b><small>${state.storyBank.filter(s=>String(s.evidence||'').trim().length>=12).length} story có evidence</small></article>
    </section>
    <div class="grid2">
      <section class="panel"><span class="eyebrow">INTERVIEW CONTEXT</span><h2>Chuẩn bị theo cơ hội đang ứng tuyển</h2><div class="fields">
        <label class="field"><span>Mẫu CV</span><select id="template-field">${options(templates,x=>x.id,x=>x.name,state.selectedTemplateId)}</select></label>
        <label class="field"><span>Role pack</span><select id="pack-field">${options(interviewPacks,x=>x.id,x=>x.label,state.rolePackId)}</select></label>
        <label class="field"><span>Seniority</span><select id="seniority-field">${seniorityLevels.map(x=>`<option ${x===state.seniority?'selected':''}>${e(x)}</option>`).join('')}</select></label>
        <label class="field"><span>Vòng phỏng vấn</span><select id="stage-field">${options(interviewStages,x=>x.id,x=>x.label,state.stageId)}</select></label>
        <label class="field"><span>Nguồn dữ liệu</span><select id="market-field"><option value="vietnam" ${state.market==='vietnam'?'selected':''}>Việt Nam · ưu tiên</option><option value="all" ${state.market==='all'?'selected':''}>Việt Nam + Quốc tế</option><option value="global" ${state.market==='global'?'selected':''}>Quốc tế</option></select></label>
      </div><div class="signal"><span>CV SIGNAL</span><strong>${e(activePack().signal)}</strong><p>Khả năng bị đào sâu: ${e(activePack().probe)}</p></div></section>
      <section class="panel"><span class="eyebrow">NEXT ACTION</span><h2>3 việc nên làm trước vòng phỏng vấn</h2><ol class="actions">
        <li><b>01</b><div><strong>Bảo vệ claim mạnh nhất</strong><p>Baseline, contribution, trade-off và cách đo cho claim có số liệu.</p></div><button data-go="claims">Mở →</button></li>
        <li><b>02</b><div><strong>Luyện 5 câu theo JD</strong><p>Question engine ưu tiên CV, role pack, vòng phỏng vấn và application context.</p></div><button data-go="mock">Luyện →</button></li>
        <li><b>03</b><div><strong>Xem evidence gaps</strong><p>Report chỉ ra câu dài dòng, thiếu ownership hoặc số liệu chưa có trong CV.</p></div><button data-go="reports">Xem →</button></li>
      </ol></section>
    </div>
    <section class="panel"><span class="eyebrow">SOURCE LAYER · ${e(marketLabel())}</span><h2>Dữ liệu có provenance, không phải câu hỏi sinh ngẫu nhiên</h2><div class="sources">${activeSources().map(s=>`<a href="${e(s.url)}" target="_blank" rel="noreferrer noopener"><span>${s.region==='vietnam'?'VN':'GL'}</span><strong>${e(s.name)}</strong><small>${e(s.label)}</small><p>${e(s.note)}</p></a>`).join('')}</div></section>
  `
  bindGo()
  document.querySelector('#template-field').onchange=ev=>{state.selectedTemplateId=ev.target.value;state.rolePackId=templateInterviewPack[state.selectedTemplateId]||'general';render()}
  document.querySelector('#pack-field').onchange=ev=>{state.rolePackId=ev.target.value;render()}
  document.querySelector('#seniority-field').onchange=ev=>{state.seniority=ev.target.value;render()}
  document.querySelector('#stage-field').onchange=ev=>{state.stageId=ev.target.value;render()}
  document.querySelector('#market-field').onchange=ev=>{state.market=ev.target.value;render()}
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
  const selected=buildApplicationPracticeSet({application:contextApp,claims:cvClaims(),stories:state.storyBank,questions:questionDeck(),limit:5})
  if(!selected.length){toast('Chưa đủ dữ liệu để tạo practice set');return}
  if(contextApp.id)state.applicationId=contextApp.id
  state.practice={questions:selected,index:0,drafts:{},startedAt:new Date().toISOString(),timerChoice:90,baseSize:selected.length,adaptiveInserted:0}
  selected.forEach(q=>state.practice.drafts[q.id]={answer:'',evidence:'',confidence:3,evaluation:null})
  state.activeModule='mock';startTimer();render()
}
function renderApplications(){
  if(!state.applicationDraft.id&&state.applicationId){
    const app=activeApplication();if(app)editApplication(app)
  }
  if(!state.applicationDraft.id&&!state.applicationId&&applications().length){
    state.applicationId=applications()[0].id;editApplication(applications()[0])
  }
  const analysis=applicationAnalysis()
  root.innerHTML=pageHeading('APPLICATION LAB','Mỗi job là một <em>workspace phỏng vấn riêng.</em>','Dán JD, giữ context tuyển dụng và xem Evidence Coverage giữa yêu cầu công việc với CV Claims, Story Bank và Question Bank.',applications().length)+`
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
          <div class="coverage-summary"><div class="coverage-ring"><b>${analysis.coverage}</b><span>/100</span></div><div><span class="eyebrow">EVIDENCE COVERAGE · KHÔNG PHẢI XÁC SUẤT ĐẬU</span><h3>${e(analysis.summary)}</h3><p>Stage đề xuất: ${e(interviewStages.find(s=>s.id===analysis.recommendedStage)?.label||'Hiring Manager')}</p></div></div>
          <div class="coverage-grid"><section><span class="eyebrow">MATCHED SIGNALS</span><div class="signal-tags">${analysis.matchedSignals.map(s=>`<span>${e(s)}</span>`).join('')||'<small>Chưa có signal đủ rõ.</small>'}</div></section><section><span class="eyebrow">EVIDENCE GAPS</span><div class="signal-tags gaps">${analysis.gapSignals.map(s=>`<span>${e(s)}</span>`).join('')||'<small>Không phát hiện gap token đáng kể.</small>'}</div></section></div>
          <div class="coverage-grid"><section><span class="eyebrow">TOP CV EVIDENCE</span><ol class="coverage-list">${analysis.topClaims.map(x=>`<li><strong>${e(x.label)}</strong><p>${e(x.text)}</p></li>`).join('')||'<li><p>Chưa có CV evidence phù hợp.</p></li>'}</ol></section><section><span class="eyebrow">TOP STORY EVIDENCE</span><ol class="coverage-list">${analysis.topStories.map(x=>`<li><strong>${e(x.label)}</strong><p>${e(x.text)}</p></li>`).join('')||'<li><p>Chưa có Story Bank phù hợp.</p></li>'}</ol></section></div>
          <section class="stage-matrix"><div class="stage-matrix-head"><div><span class="eyebrow">INTERVIEW STAGE MATRIX</span><h3>Mỗi vòng kiểm tra một loại evidence khác nhau</h3></div><small>Preparedness = tín hiệu chuẩn bị nội bộ</small></div><div class="stage-matrix-grid">${applicationStageMatrix().map(stage=>`<article class="${stage.recommended?'recommended':''}"><div class="stage-card-top"><div>${stage.recommended?'<span>RECOMMENDED NEXT</span>':''}<strong>${e(stage.label)}</strong></div><b>${stage.preparedness}</b></div><p>${e(stage.evidence)}</p><div class="stage-focus">${stage.focus.map(term=>`<span>${e(term)}</span>`).join('')}</div><ol>${stage.questions.map(q=>`<li>${e(q.question)}</li>`).join('')}</ol><button data-stage-practice="${e(stage.id)}">Luyện vòng này →</button></article>`).join('')}</div></section>
          <section class="application-questions"><span class="eyebrow">RECOMMENDED INTERVIEW QUESTIONS</span><ol>${analysis.recommendedQuestions.slice(0,5).map(x=>`<li><span>${e(categoryName(x.category))}</span><strong>${e(x.question)}</strong></li>`).join('')}</ol></section>`
        :''}
      </section>
    </div>`
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
  root.innerHTML=pageHeading('QUESTION BANK','Câu hỏi theo <em>role, CV, JD và vòng tuyển dụng.</em>','Mỗi câu có recruiter intent, framework, follow-up, red flags và provenance khi có.',qs.length)+`
    <section class="filterbar">
      <label><span>Tìm câu hỏi</span><input id="q-search" type="search" value="${e(state.query)}" placeholder="stakeholder, design system, failure, metric..." /></label>
      <label><span>Nhóm</span><select id="q-category">${options(questionCategories,x=>x.id,x=>x.label,state.categoryId)}</select></label>
      <label><span>Dữ liệu</span><select id="q-market"><option value="vietnam" ${state.market==='vietnam'?'selected':''}>Việt Nam</option><option value="all" ${state.market==='all'?'selected':''}>VN + Quốc tế</option><option value="global" ${state.market==='global'?'selected':''}>Quốc tế</option></select></label>
    </section>
    <div class="questions">${qs.map((q,i)=>`
      <details class="question" ${i===0?'open':''}><summary><span class="qnum">${String(i+1).padStart(2,'0')}</span><div><small>${e(categoryName(q.category))}${q.market==='vietnam'?' <b>SOURCE VN</b>':''}</small><strong>${e(q.question)}</strong></div><span class="plus">+</span></summary>
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
  root.innerHTML=pageHeading('CLAIM DEFENSE','Mọi claim trong CV đều phải <em>chịu được câu hỏi đào sâu.</em>','Hệ thống trích xuất statement quan trọng, phát hiện số liệu/ownership và tạo recruiter probes để chuẩn bị evidence.',claims.length)+`
  <div class="claim-layout">
    <aside class="claim-list">${claims.map(c=>`<button data-claim="${c.id}" class="${c.id===state.selectedClaimId?'active':''}"><span><small>${e(c.source)} · ${e(c.label)}</small><strong>${e(c.text)}</strong></span><b class="risk ${claimRisk(c)>=70?'high':''}">${claimRisk(c)}</b></button>`).join('')}</aside>
    ${selected?`<section class="claim-detail">
      <div class="claim-head"><div><span class="eyebrow">CLAIM ${claims.findIndex(c=>c.id===selected.id)+1} / ${claims.length}</span><h2>${e(selected.text)}</h2></div><div class="risk-ring"><b>${claimRisk(selected)}</b><span>probe risk</span></div></div>
      <div class="meta chips">${selected.numbers.map(n=>`<span># Có số liệu: ${e(n)}</span>`).join('')}${selected.leadershipSignal?'<span># Ownership / leadership</span>':''}${selected.outcomeSignal?'<span># Outcome claim</span>':''}<span># ${e(selected.source)}</span></div>
      <div class="section"><span class="eyebrow">RECRUITER PROBES</span><ol class="probe-list">${list(claimProbes(selected))}</ol></div>
      <div class="section"><span class="eyebrow">MATCHED QUESTIONS</span><ol class="probe-list">${list(matchQuestionsToClaim(selected,questionDeck()).map(q=>q.question))||'<li>Chưa có câu hỏi đủ gần; dùng recruiter probes phía trên.</li>'}</ol></div>
      <div class="section evidence-box"><span class="eyebrow">EVIDENCE NOTE</span><textarea id="claim-note" rows="6" placeholder="Baseline, phạm vi mình sở hữu, cách đo, ai tham gia, trade-off, result...">${e(state.claimEvidence[selected.id]?.note||'')}</textarea><div class="evidence-footer"><span id="claim-count">${(state.claimEvidence[selected.id]?.note||'').length} ký tự</span><button id="claim-ready" class="${state.claimEvidence[selected.id]?.ready?'ready':''}">${state.claimEvidence[selected.id]?.ready?'✓ Evidence ready':'Đánh dấu evidence ready'}</button></div></div>
    </section>`:'<section class="empty">CV hiện tại chưa có đủ nội dung để trích xuất claim.</section>'}
  </div>`
  root.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{state.selectedClaimId=b.dataset.claim;renderClaims()})
  if(selected){
    const note=document.querySelector('#claim-note')
    note.oninput=()=>{state.claimEvidence[selected.id]={...(state.claimEvidence[selected.id]||{}),note:note.value};document.querySelector('#claim-count').textContent=note.value.length+' ký tự'}
    note.onchange=saveClaims
    document.querySelector('#claim-ready').onclick=()=>{const current=state.claimEvidence[selected.id]||{};state.claimEvidence[selected.id]={...current,ready:!current.ready};saveClaims();renderClaims()}
  }
}

function renderStories(){
  const stories=Array.isArray(state.storyBank)?state.storyBank:[]
  const avg=stories.length?Math.round(stories.reduce((sum,s)=>sum+Number(s.score||0),0)/stories.length):0
  root.innerHTML=pageHeading('STORY BANK','Lưu những câu chuyện nghề nghiệp <em>đủ mạnh để dùng lại.</em>','Story Bank giữ câu trả lời tốt, evidence, claim liên quan và practice signal.',stories.length)
  const stats=document.createElement('section');stats.className='stats story-stats'
  stats.innerHTML='<article><span>Stories</span><b>'+stories.length+'</b><small>câu chuyện đã lưu</small></article><article><span>Evidence ready</span><b>'+stories.filter(s=>String(s.evidence||'').trim().length>=12).length+'</b><small>có STAR/evidence anchor</small></article><article><span>Average signal</span><b>'+(avg||'—')+'</b><small>practice signal trung bình</small></article>'
  root.appendChild(stats)
  if(!stories.length){const empty=document.createElement('div');empty.className='empty';empty.innerHTML='Chưa có story.<button class="text-btn" data-go="mock">Bắt đầu luyện →</button>';root.appendChild(empty);bindGo();return}
  const grid=document.createElement('div');grid.className='story-grid'
  stories.forEach(story=>{
    const card=document.createElement('article');card.className='story-card'
    card.innerHTML='<div class="story-top"><div><span>'+e(story.categoryLabel)+' · '+e(story.contextLabel)+'</span><h2>'+e(story.title)+'</h2></div><b>'+(story.score||'—')+'</b></div><p class="story-question">'+e(story.question)+'</p><blockquote>'+e(story.answer)+'</blockquote>'+(story.evidence?'<div class="story-evidence"><span>EVIDENCE</span><p>'+e(story.evidence)+'</p></div>':'')+(story.claims&&story.claims.length?'<div class="story-claims">'+story.claims.map(claim=>'<span>'+e(claim.label)+'</span>').join('')+'</div>':'')+'<div class="story-footer"><small>Cập nhật '+e(formatDate(story.updatedAt||story.createdAt))+'</small><div><button data-practice-story="'+e(story.id)+'">Luyện lại →</button><button class="danger" data-delete-story="'+e(story.id)+'">Xóa</button></div></div>'
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
  const ranked=questionDeck().map(q=>({q,score:questionRelevanceScore(q,app,cvClaims())+(8-stageWeight(q))})).sort((a,b)=>b.score-a.score)
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
    root.innerHTML=pageHeading('MOCK INTERVIEW','Trả lời như vòng thật. <em>Coach chỉ xuất hiện sau.</em>','Question engine ưu tiên JD, CV claims và vòng phỏng vấn. Có timer, speech input và evidence check.', '5Q')+`
      <section class="mock-start"><div class="mock-config"><h2>Tạo một vòng luyện có context</h2>
      <label class="field"><span>Application</span><select id="mock-app"><option value="">CV hiện tại · không gắn job</option>${applications().map(a=>`<option value="${e(a.id)}" ${a.id===state.applicationId?'selected':''}>${e(a.company)} · ${e(a.role)}</option>`).join('')}</select></label>
      <label class="field"><span>Vòng phỏng vấn</span><select id="mock-stage">${options(interviewStages,x=>x.id,x=>x.label,state.stageId)}</select></label>
      <label class="field"><span>Interviewer mode</span><select id="mock-interviewer">${options(interviewerModes,x=>x.id,x=>x.label,state.interviewerMode)}</select></label>
      <label class="field"><span>Pressure</span><select id="mock-pressure">${options(pressureLevels,x=>x.id,x=>x.label,state.pressureLevel)}</select></label>
      <label class="field"><span>Timer / câu</span><select id="mock-timer"><option value="60">60 giây</option><option value="90" selected>90 giây</option><option value="120">120 giây</option></select></label>
      <label class="field"><span>Số câu</span><select id="mock-size"><option value="5">5 câu · Quick round</option><option value="8">8 câu · Full round</option></select></label>
      </div><div class="mock-preview"><span class="eyebrow">WHAT THE ENGINE USES</span><div><b>${cvClaims().length}</b><span>CV claims</span></div><div><b>${activeApplication()?'JD':'CV'}</b><span>application context</span></div><div><b>${e(activeStage().label)}</b><span>interview stage</span></div><div><b>${e(activeInterviewer().shortLabel)}</b><span>${e(activeInterviewer().label)}</span></div><div><b>${e(activePressure().label)}</b><span>adaptive pressure</span></div><div><b>${e(marketLabel())}</b><span>question sources</span></div><button id="start-mock" class="primary">Bắt đầu session →</button></div></section>`
    document.querySelector('#mock-app').onchange=ev=>{state.applicationId=ev.target.value;renderTop()}
    document.querySelector('#mock-stage').onchange=ev=>{state.stageId=ev.target.value;state.interviewerMode=interviewerForStage(state.stageId);renderMock()}
    document.querySelector('#mock-interviewer').onchange=ev=>{state.interviewerMode=ev.target.value;renderMock()}
    document.querySelector('#mock-pressure').onchange=ev=>{state.pressureLevel=ev.target.value;renderMock()}
    document.querySelector('#start-mock').onclick=()=>startMock(Number(document.querySelector('#mock-size').value),Number(document.querySelector('#mock-timer').value))
    return
  }
  const q=currentQuestion(),draft=currentDraft(),evaluation=draft.evaluation
  root.innerHTML=pageHeading('MOCK INTERVIEW','Trả lời như vòng thật. <em>Coach chỉ xuất hiện sau.</em>','Đánh giá là practice signal, không phải dự đoán tuyển dụng.',`${state.practice.index+1}/${state.practice.questions.length}`)+`
    <section class="live"><div class="live-meta"><div><span>QUESTION ${state.practice.index+1} / ${state.practice.questions.length}${q.adaptive?.isFollowUp?' <b class="adaptive-badge">ADAPTIVE FOLLOW-UP</b>':''}</span><small>${e(categoryName(q.category))} · ${e(activeStage().label)} · ${e(activeInterviewer().label)} · ${e(activePressure().label)}</small></div><div class="timer ${state.timerRemaining<=20?'warning':''}"><b id="timer-value">${formatTimer()}</b><span>${state.timerRunning?'đang chạy':'tạm dừng'}</span></div></div>
    ${q.adaptive?.isFollowUp?`<div class="adaptive-reason"><span>WHY THIS FOLLOW-UP</span><p>${e(q.adaptive.reason)}</p><small>Trigger: ${e(dimensionLabel(q.adaptive.triggerDimension))} · ${q.adaptive.triggerScore}/100 · ${e(q.adaptive.interviewerLabel||activeInterviewer().label)} · ${e(q.adaptive.pressureLabel||activePressure().label)}</small></div>`:''}
    <h2>${e(q.question)}</h2><div class="tools"><button id="speak-q">🔊 Đọc câu hỏi</button><button id="speech-q" class="${state.speechRecording?'recording':''}">${state.speechRecording?'■ Dừng ghi âm':'🎙 Trả lời bằng giọng nói'}</button><button id="pause-timer">${state.timerRunning?'Ⅱ Tạm dừng timer':'▶ Tiếp tục timer'}</button></div>
    <div class="answer-grid"><label><span>Câu trả lời của anh</span><textarea id="mock-answer" rows="9" placeholder="Nói hoặc nhập đúng cách anh sẽ trả lời trong buổi phỏng vấn thật...">${e(draft.answer)}</textarea><small id="word-count">${draft.answer.trim().split(/\s+/).filter(Boolean).length} từ</small></label><label><span>Evidence / STAR anchors</span><textarea id="mock-evidence" rows="6" placeholder="Project · ownership · baseline · decision · trade-off · result · learning">${e(draft.evidence)}</textarea><small>Evidence riêng giúp engine không nhầm câu dài với câu có bằng chứng.</small></label></div>
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
  root.innerHTML=pageHeading('INTERVIEW REPORTS','Đo tiến bộ bằng <em>evidence và hành vi quan sát được.</em>','Không chấm cảm xúc hay dự đoán tuyển dụng. Report tập trung relevance, structure, evidence, ownership, depth, credibility và delivery.',state.sessions.length)+
  (latest?`<section class="report-hero"><div class="report-score"><span>LATEST PRACTICE SIGNAL</span><b>${latest.report.overall}</b><small>/100</small></div><div><strong>${e(latest.contextLabel)}</strong><p>${e(formatDate(latest.createdAt))} · ${e(latest.stageLabel)} · ${e(latest.interviewerLabel||'Interviewer')} · ${e(latest.pressureLabel||'Realistic')} · ${latest.answered}/${latest.total} câu</p><span class="chip">${latest.report.evidenceReady}/${latest.total} câu có evidence note · ${latest.report.adaptiveCount||0} adaptive follow-up</span></div></section><div class="grid2"><section class="panel"><span class="eyebrow">DIMENSIONS</span><h2>Điểm cần cải thiện</h2><div class="metric-bars">${Object.entries(latest.report.dimensions).map(([k,v])=>`<div><span>${e(dimensionLabel(k))}</span><i><b style="width:${v}%"></b></i><strong>${v}</strong></div>`).join('')}</div></section><section class="panel"><span class="eyebrow">EVIDENCE GAPS</span><h2>Việc cần sửa trước lần luyện sau</h2><ul class="warnings">${list(latest.report.warnings.length?latest.report.warnings:['Chưa phát hiện cảnh báo lớn trong session gần nhất.'])}</ul></section></div>${latest.report.adaptiveCount?`<section class="panel adaptive-report"><span class="eyebrow">ADAPTIVE TRACE</span><h2>Vì sao Interviewer đã hỏi sâu</h2><div class="adaptive-stats"><div><b>${latest.report.adaptiveCount}</b><span>follow-up đã chèn</span></div><div><b>${latest.report.adaptiveDimensions.length}</b><span>dimension bị đào sâu</span></div></div><ul class="warnings">${list(latest.report.adaptiveReasons)}</ul></section>`:''}`:'')+
  (latest?.report?.adaptiveTrace?.length?`<section class="panel branch-trace"><span class="eyebrow">BRANCH MEMORY</span><h2>Interviewer đã rẽ nhánh ở đâu và vì sao</h2><div class="branch-trace-list">${latest.report.adaptiveTrace.map(item=>`<article><div class="branch-index">${String(item.index).padStart(2,'0')}</div><div><span>${e(item.interviewerLabel||latest.interviewerLabel||'Interviewer')} · ${e(item.pressureLabel||latest.pressureLabel||'Realistic')}</span><strong>${e(item.question)}</strong><p>${e(item.reason)}</p></div><div class="branch-trigger"><span>${e(dimensionLabel(item.triggerDimension))}</span><b>${item.triggerScore}</b></div></article>`).join('')}</div></section>`:'')+
  (latest?.report?.practicePlan?practicePlanHtml(latest.report.practicePlan):'')+`<section class="panel"><span class="eyebrow">HISTORY</span><h2>Lịch sử luyện tập</h2>${state.sessions.length?`<div class="history">${state.sessions.map(s=>`<article><div><strong>${e(s.contextLabel)}</strong><small>${e(formatDate(s.createdAt))}</small></div><span>${e(s.stageLabel||'')}</span><span>${s.answered||0}/${s.total||0} answered</span><span>${s.report?.evidenceReady||s.evidenceReady||0} evidence</span><b>${s.report?.overall||'—'}</b></article>`).join('')}</div><button id="clear-history" class="text-btn">Xóa lịch sử local</button>`:`<div class="empty">Chưa có report.<button class="text-btn" data-go="mock">Bắt đầu luyện →</button></div>`}</section>`
  bindGo()
  const plan=document.querySelector('#practice-plan');if(plan&&latest?.report?.practicePlan)plan.onclick=()=>startPracticePlan(latest.report.practicePlan)
  const clear=document.querySelector('#clear-history');if(clear)clear.onclick=()=>{state.sessions=[];saveSessions();renderReports()}
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
