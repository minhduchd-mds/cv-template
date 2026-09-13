const directions=[
{id:'signal-field',code:'SGN-01',name:'Signal Field',kind:'IDENTITY FIELD',intent:'Presence before pages',audience:'Product / UX / AI',story:'Start from a professional core, then reveal skills and evidence as signals with different relevance and intensity.',steps:[['Core','Name and role form the single anchor.'],['Signals','Skills, work and impact emerge by relevance.'],['Evidence','Each signal leads to proof instead of decoration.']]},
{id:'prism-shift',code:'PRM-02',name:'Prism Shift',kind:'PERSPECTIVE SYSTEM',intent:'One person, many angles',audience:'Hybrid designer',story:'Reframe the same career through craft, system, code and impact so one project can be understood from several useful angles.',steps:[['Surface','Open with a concise professional statement.'],['Refraction','Split each project into decision layers.'],['Recombine','Bring those layers back into a capability profile.']]},
{id:'orbit-ledger',code:'ORB-03',name:'Orbit Ledger',kind:'CAREER GRAVITY',intent:'Experience has gravity',audience:'Senior / Lead',story:'Replace the default vertical timeline with a gravity model where the most influential work sits closest to the professional core.',steps:[['Gravity','Core strengths define the center.'],['Orbit','Roles sit at different distances by influence.'],['Trajectory','Scope and ownership become visible over time.']]},
{id:'threadscape',code:'THR-04',name:'Threadscape',kind:'CONNECTED WORK',intent:'Show the connections',audience:'Systems thinker',story:'Treat projects as crossings in longer threads of skill, decision-making and accumulated experience instead of isolated portfolio cards.',steps:[['Threads','Capabilities run across the whole story.'],['Crossings','Projects show where several threads meet.'],['Continuity','Patterns make long-term growth visible.']]},
{id:'kinetic-type',code:'KNT-05',name:'Kinetic Type',kind:'TYPE CHOREOGRAPHY',intent:'Words carry motion',audience:'Visual / Brand / UI',story:'Use typography as the stage itself. Scale, rhythm and position carry the narrative before decorative interface elements are introduced.',steps:[['Statement','Begin with a memorable professional thesis.'],['Rhythm','Let type establish the pace of project reveals.'],['Signature','Close on one strong career statement.']]},
{id:'atlas-flow',code:'ATL-06',name:'Atlas Flow',kind:'CAREER GEOGRAPHY',intent:'A career has terrain',audience:'Multi-domain designer',story:'Translate work history into abstract geography: roles are stops, scope changes are routes and major projects become landmarks.',steps:[['Origin','Establish the starting foundation.'],['Routes','Show how domains and roles connect.'],['Landmarks','Mark projects that changed capability or scope.']]},
{id:'pulse-stack',code:'PLS-07',name:'Pulse Stack',kind:'IMPACT RHYTHM',intent:'Make impact feel alive',audience:'Product / Growth',story:'Lead with measurable impact as rhythm, then reveal the project context behind each result so outcomes are felt before they are explained.',steps:[['Pulse','Surface measurable outcomes immediately.'],['Context','Reveal the project behind every metric.'],['Pattern','Connect repeated impact across roles.']]},
{id:'lattice',code:'LTC-08',name:'Lattice',kind:'CAPABILITY MATRIX',intent:'Capability over decoration',audience:'Design systems / Platform',story:'Build an evidence-linked capability network instead of percentage bars. Strength comes from connections between work, responsibility and artifacts.',steps:[['Cells','Every capability is a node with evidence.'],['Links','Projects activate multiple related nodes.'],['Coverage','Breadth and depth become readable at a glance.']]},
{id:'focus-lens',code:'FCS-09',name:'Focus Lens',kind:'PROJECT IMMERSION',intent:'Depth over volume',audience:'Case-study heavy',story:'Keep only one flagship project in sharp focus while everything else recedes, reducing noise and encouraging deeper reading.',steps:[['Select','Choose a flagship project first.'],['Focus','Bring problem, role and decisions forward.'],['Resolve','End with impact and learning before switching.']]},
{id:'relay',code:'RLY-10',name:'Relay',kind:'OUTCOME PIPELINE',intent:'Show how value moves',audience:'Design engineer / Product',story:'Frame the career as a transformation pipeline from challenge to thinking, design, shipped work and measurable outcome.',steps:[['Input','Start with context, constraints and challenge.'],['Transform','Show research, system thinking and craft.'],['Output','End on shipped result, metric and learning.']]}
]

const fullWorlds={
  'signal-field':'./worlds/signal-field.html',
  'threadscape':'./worlds/threadscape.html',
  'focus-lens':'./worlds/focus-lens.html',
  'relay':'./worlds/relay.html'
}

const lab=document.querySelector('.lab')
const stage=document.querySelector('.stage')
const cards=[...document.querySelectorAll('.card')]
const code=document.querySelector('#stage-code')
const intent=document.querySelector('#stage-intent')
const kind=document.querySelector('#stage-kind')
const name=document.querySelector('#stage-name')
const audience=document.querySelector('#stage-audience')
const title=document.querySelector('#story-title')
const copy=document.querySelector('#story-copy')
const storyGrid=document.querySelector('#story-grid')
const next=document.querySelector('#next-direction')
const stageFoot=document.querySelector('.stage-foot')
const openWorld=document.createElement('button')
openWorld.type='button'
openWorld.id='open-world'
openWorld.innerHTML='Open full world <span>↗</span>'
stageFoot.insertBefore(openWorld,next)
let current=0

function render(index){
  current=(index+directions.length)%directions.length
  const item=directions[current]
  lab.dataset.direction=item.id
  code.textContent=item.code
  intent.textContent=item.intent
  kind.textContent=item.kind
  name.textContent=item.name
  audience.textContent=item.audience
  title.textContent=item.name
  copy.textContent=item.story
  storyGrid.innerHTML=item.steps.map((step,i)=>`<article><span>0${i+1}</span><h3>${step[0]}</h3><p>${step[1]}</p></article>`).join('')
  cards.forEach((card,i)=>card.classList.toggle('active',i===current))
  openWorld.hidden=!fullWorlds[item.id]
  openWorld.setAttribute('aria-label',fullWorlds[item.id]?`Open ${item.name} full portfolio world`:'Full portfolio world not available yet')
}

cards.forEach((card,index)=>{
  card.addEventListener('mouseenter',()=>render(index))
  card.addEventListener('focus',()=>render(index))
  card.addEventListener('click',()=>{render(index);document.querySelector('.stage-shell').scrollIntoView({behavior:'smooth',block:'center'})})
})
next.addEventListener('click',()=>render(current+1))
openWorld.addEventListener('click',()=>{
  const route=fullWorlds[directions[current].id]
  if(route) window.location.href=route
})

stage.addEventListener('pointermove',(event)=>{
  const box=stage.getBoundingClientRect()
  const x=((event.clientX-box.left)/box.width)*100
  const y=((event.clientY-box.top)/box.height)*100
  stage.style.setProperty('--mx',`${x}%`)
  stage.style.setProperty('--my',`${y}%`)
  const ry=(x-50)*.035
  const rx=(50-y)*.03
  stage.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`
})
stage.addEventListener('pointerleave',()=>{stage.style.transform='rotateX(0deg) rotateY(0deg)';stage.style.setProperty('--mx','50%');stage.style.setProperty('--my','40%')})

render(0)
