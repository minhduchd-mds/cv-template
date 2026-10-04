(()=>{
  const labRoot=document.querySelector('.lab')
  const directionCards=[...document.querySelectorAll('.card')]

  const applyProfile=profile=>{
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

  document.documentElement.dataset.profileModel='loading'
  fetch('./data/profile.json')
    .then(response=>{
      if(!response.ok) throw new Error(`Profile request failed: ${response.status}`)
      return response.json()
    })
    .then(applyProfile)
    .catch(error=>{
      document.documentElement.dataset.profileModel='error'
      console.error('Direction Lab profile failed to load',error)
    })
})()
