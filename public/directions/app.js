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
{id:'relay',code:'RLY-10',name:'Relay',kind:'OUTCOME PIPELINE',intent:'Show how value moves',audience:'Design engineer / Product',story:'Frame the career as a transformation pipeline from challenge to thinking, design, shipped work and measurable outcome.',steps:[['Input','Start with context, constraints and challenge.'],['Transform','Show research, system thinking and craft.'],['Output','End on shipped result, metric and learning.']]},
{id:'visual-hero',code:'VIS-11',name:'Visual Hero',kind:'IMAGE-FIRST COVER',intent:'Let the first 10 seconds be visual',audience:'Senior UI / Product / Creative tech',story:'Turn the opening viewport into a visual CV cover. Identity, system thinking, workflow craft and measurable outcomes are seen before the reader reaches dense biography.',steps:[['Cover','Use original project imagery as the first layer of meaning.'],['Proof','Overlay only essential role and outcome anchors.'],['Depth','Move detailed evidence below the fold after visual interest is earned.']]}
]

const fullWorlds={
  'signal-field':'./worlds/signal-field.html',
  'threadscape':'./worlds/threadscape.html',
  'focus-lens':'./worlds/focus-lens.html',
  'relay':'./worlds/relay.html',
  'visual-hero':'./worlds/visual-hero.html'
}

const grid=document.querySelector('#direction-grid')
const visualCard=document.createElement('button')
visualCard.className='card'
visualCard.dataset.id='visual-hero'
visualCard.dataset.index='10'
visualCard.innerHTML='<div class="art art-visual"><span></span><span></span><span></span><span></span></div><span class="index">11</span><small>Image-first cover</small><h3>Visual Hero</h3><p>A CV hero built from original imagery before biography.</p><footer>visual scan <b>↗</b></footer>'
grid.appendChild(visualCard)

const metaCount=document.querySelector('.meta span:first-child')
if(metaCount) metaCount.textContent='11 directions'

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
const openLabel=document.createTextNode('Open full world ')
const openArrow=document.createElement('span')
openArrow.textContent='↗'
openWorld.append(openLabel,openArrow)
stageFoot.insertBefore(openWorld,next)
let current=0

function renderSteps(steps){
  storyGrid.replaceChildren(...steps.map((step,index)=>{
    const article=document.createElement('article')
    const number=document.createElement('span')
    const heading=document.createElement('h3')
    const paragraph=document.createElement('p')
    number.textContent=`0${index+1}`
    heading.textContent=step[0]
    paragraph.textContent=step[1]
    article.append(number,heading,paragraph)
    return article
  }))
}

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
  renderSteps(item.steps)
  cards.forEach((card,i)=>{
    const active=i===current
    card.classList.toggle('active',active)
    card.setAttribute('aria-pressed',String(active))
    if(fullWorlds[card.dataset.id]) card.dataset.complete='true'
  })
  const hasWorld=Boolean(fullWorlds[item.id])
  openWorld.hidden=!hasWorld
  openWorld.setAttribute('aria-label',hasWorld?`Open ${item.name} full portfolio world`:'Full portfolio world not available yet')
}

cards.forEach((card,index)=>{
  card.addEventListener('mouseenter',()=>render(index))
  card.addEventListener('focus',()=>render(index))
  card.addEventListener('click',()=>{
    render(index)
    document.querySelector('.stage-shell').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'})
  })
  card.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(event.key)) return
    event.preventDefault()
    const step=(event.key==='ArrowRight'||event.key==='ArrowDown')?1:-1
    const target=(index+step+cards.length)%cards.length
    cards[target].focus()
  })
})
next.addEventListener('click',()=>render(current+1))
openWorld.addEventListener('click',()=>{
  const route=fullWorlds[directions[current].id]
  if(route) window.location.href=route
})

const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
if(stage&&!reduceMotion){
  stage.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch') return
    const box=stage.getBoundingClientRect()
    const x=((event.clientX-box.left)/box.width)*100
    const y=((event.clientY-box.top)/box.height)*100
    stage.style.setProperty('--mx',`${x}%`)
    stage.style.setProperty('--my',`${y}%`)
    const ry=(x-50)*.035
    const rx=(50-y)*.03
    stage.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`
  })
  stage.addEventListener('pointerleave',()=>{
    stage.style.transform='rotateX(0deg) rotateY(0deg)'
    stage.style.setProperty('--mx','50%')
    stage.style.setProperty('--my','40%')
  })
}

const style=document.createElement('style')
style.textContent='.card[data-complete="true"]::after{content:"FULL WORLD";position:absolute;left:14px;top:14px;z-index:4;font-size:7px;letter-spacing:.14em;padding:6px 8px;border-radius:999px;background:#f1eee6;color:#111216;font-weight:800}.art-visual{display:grid;grid-template-columns:1.2fr .8fr;grid-template-rows:1fr 1fr;gap:4px;padding:4px}.art-visual span{display:block;border-radius:8px;background:linear-gradient(145deg,#8b7cff,#272a36)}.art-visual span:first-child{grid-row:1/3;background:radial-gradient(circle at 45% 30%,#f1c9ad 0 16%,#3b315f 17% 38%,#15171d 39%)}.art-visual span:nth-child(2){background:linear-gradient(135deg,#6ff0cf,#162b2a)}.art-visual span:nth-child(3){background:linear-gradient(135deg,#ffb06a,#302017)}.lab[data-direction="visual-hero"] .stage{background:linear-gradient(145deg,#0c0d11,#1d1e27)}.lab[data-direction="visual-hero"] .visual>*{opacity:0}.lab[data-direction="visual-hero"] .visual::before{content:"";position:absolute;inset:3%;border-radius:24px;background:linear-gradient(90deg,#8b7cff 0 48%,transparent 48% 50%,#6ff0cf 50% 73%,transparent 73% 75%,#ffb06a 75%);opacity:.78;box-shadow:0 0 70px #8b7cff22}.lab[data-direction="visual-hero"] .visual::after{content:"VISUAL / CAREER / COVER";position:absolute;left:8%;bottom:10%;font-size:clamp(28px,5vw,70px);font-weight:900;letter-spacing:-.07em;max-width:70%;line-height:.82}'
document.head.appendChild(style)

render(0)
