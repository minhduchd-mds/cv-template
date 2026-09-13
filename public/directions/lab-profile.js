const labRoot=document.querySelector('.lab')
const directionCards=[...document.querySelectorAll('.card')]

const createProfileChip=profile=>{
  const meta=document.querySelector('.meta')
  if(!meta) return
  const chip=document.createElement('span')
  chip.className='profile-chip'
  chip.textContent=`Profile · ${profile.identity.preferredName||profile.identity.name}`
  chip.title=profile.identity.role
  meta.append(chip)
  document.documentElement.dataset.profileModel='ready'
  window.CV_PROFILE=profile
}

const restoreDirection=()=>{
  const saved=localStorage.getItem('cvstudio:last-direction')
  if(!saved) return
  const card=directionCards.find(item=>item.dataset.id===saved)
  if(card) card.click()
}

if(labRoot){
  const observer=new MutationObserver(()=>{
    const direction=labRoot.dataset.direction
    if(direction) localStorage.setItem('cvstudio:last-direction',direction)
  })
  observer.observe(labRoot,{attributes:true,attributeFilter:['data-direction']})
  restoreDirection()
}

const style=document.createElement('style')
style.textContent='.profile-chip{border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:7px 10px!important;color:#f4f2ec!important;background:rgba(255,255,255,.05)}@media(max-width:920px){.profile-chip{display:none}}'
document.head.append(style)

document.documentElement.dataset.profileModel='loading'
fetch('./data/profile.json')
  .then(response=>{
    if(!response.ok) throw new Error(`Profile request failed: ${response.status}`)
    return response.json()
  })
  .then(createProfileChip)
  .catch(error=>{
    document.documentElement.dataset.profileModel='error'
    console.error('Direction Lab profile failed to load',error)
  })
