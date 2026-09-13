const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
const stage=document.querySelector('.stage')
if(stage&&!reduceMotion){
  stage.addEventListener('pointermove',e=>{
    if(e.pointerType==='touch') return
    const r=stage.getBoundingClientRect()
    const x=((e.clientX-r.left)/r.width)*100
    const y=((e.clientY-r.top)/r.height)*100
    stage.style.setProperty('--mx',`${x}%`)
    stage.style.setProperty('--my',`${y}%`)
    stage.style.setProperty('--ry',`${(x-50)*.03}deg`)
    stage.style.setProperty('--rx',`${(50-y)*.025}deg`)
  })
  stage.addEventListener('pointerleave',()=>{
    stage.style.setProperty('--ry','0deg')
    stage.style.setProperty('--rx','0deg')
    stage.style.setProperty('--mx','50%')
    stage.style.setProperty('--my','40%')
  })
}

const revealNodes=[...document.querySelectorAll('.reveal')]
if(reduceMotion||!('IntersectionObserver' in window)){
  revealNodes.forEach(el=>el.classList.add('in'))
}else{
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in')
      io.unobserve(entry.target)
    }
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'})
  revealNodes.forEach(el=>io.observe(el))
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape') window.location.href='../'
})
