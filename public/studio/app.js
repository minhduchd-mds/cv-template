(() => {
  const STORAGE='cv-studio-static-v1';
  const SETTINGS='cv-studio-static-settings-v1';
  const templates=[
    ['product-slate','Senior Product Designer','Product','product','#6d5dfc'],
    ['ats-clean','ATS Clean','ATS','ats','#0f766e'],
    ['creative-grid','Creative Portfolio','Creative','creative','#e44d7a'],
    ['executive-ink','Executive Minimal','Leadership','executive','#b7791f'],
    ['design-system-lead','Design System Lead','Product','system','#2563eb'],
    ['design-engineer','Design Engineer','Tech','tech','#111827'],
    ['product-ivory','Product Ivory','Product','product','#315C55'],
    ['product-midnight','Product Midnight','Product','product','#7C6DFF'],
    ['ats-compact','ATS Compact','ATS','ats','#334155'],
    ['ats-serif','ATS Serif','ATS','ats','#7C2D12'],
    ['creative-swiss','Swiss Grid','Creative','creative','#E10600'],
    ['executive-navy','Executive Navy','Leadership','executive','#244A73']
  ].map(([id,name,category,variant,accent])=>({id,name,category,variant,accent}));
  const demo={
    name:'Alex Chen',role:'Senior Product Designer',email:'alex.chen@example.com',phone:'+84 900 000 000',location:'Hanoi, Vietnam',website:'alexchen.design',
    summary:'Senior product designer focused on complex enterprise workflows, design systems and code-aware delivery. I connect product thinking, interface craft and implementation constraints to ship clearer digital products.',
    metrics:[['8+','Years experience'],['18+','Products shipped'],['85%','System adoption']],
    experience:[
      {role:'Senior Product Designer',company:'Product Platform',period:'2022 — Present',bullets:['Led workflow redesign across complex enterprise surfaces.','Built reusable design-system patterns with engineering.','Improved design-to-development handoff through shared component contracts.']},
      {role:'UI/UX Designer',company:'Digital Products',period:'2019 — 2022',bullets:['Designed responsive web applications and dashboards.','Ran usability reviews and accessibility-focused UI QA.']}
    ],
    projects:[
      {name:'Design QA Agent',type:'AI · Design Ops',impact:'Faster UI review',description:'Design-to-code review workflow with evidence, severity and exportable findings.'},
      {name:'Enterprise Dashboard',type:'Data · Platform',impact:'Unified reporting',description:'Decision-focused analytics workspace with progressive drill-down.'}
    ],
    skills:['Product strategy','UI/UX Design','Design Systems','Accessibility','Figma','Vue / React','HTML / CSS','AI Product UX'],
    languages:['Vietnamese · Native','English · Professional']
  };
  let profile=load(STORAGE,demo);
  let settings=load(SETTINGS,{templateId:'product-slate',accent:'#6d5dfc',zoom:.85,font:'sans',density:'balanced',radius:'soft'});
  const $=(q,el=document)=>el.querySelector(q), $$=(q,el=document)=>Array.from(el.querySelectorAll(q));
  function load(key,fallback){try{return {...structuredClone(fallback),...(JSON.parse(localStorage.getItem(key)||'null')||{})}}catch{return structuredClone(fallback)}}
  function save(){localStorage.setItem(STORAGE,JSON.stringify(profile));localStorage.setItem(SETTINGS,JSON.stringify(settings))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function activeTemplate(){return templates.find(t=>t.id===settings.templateId)||templates[0]}
  function renderTemplates(){
    const list=$('#template-list'); list.innerHTML='';
    templates.forEach(t=>{const b=document.createElement('button');b.className='template-card'+(t.id===settings.templateId?' active':'');b.innerHTML=`<span class="template-thumb" style="--accent:${t.accent}"></span><span><b>${t.name}</b><small>${t.category}</small></span>`;b.onclick=()=>{settings.templateId=t.id;settings.accent=t.accent;syncControls();renderAll()};list.appendChild(b)})
  }
  function renderCv(target){
    const t=activeTemplate();
    const metrics=(profile.metrics||demo.metrics).slice(0,3).map(x=>`<div class="metric card"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>`).join('');
    const jobs=(profile.experience||[]).map(j=>`<article class="job"><div class="job-head"><b>${esc(j.role)} · ${esc(j.company)}</b><span>${esc(j.period)}</span></div><ul>${(j.bullets||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
    const projects=(profile.projects||[]).map(p=>`<article class="project"><b>${esc(p.name)}</b><span>${esc(p.type)} · ${esc(p.impact)}</span><p>${esc(p.description)}</p></article>`).join('');
    const skills=(profile.skills||[]).map(s=>`<span class="tag card">${esc(s)}</span>`).join('');
    const langs=(profile.languages||[]).map(s=>`<p>${esc(s)}</p>`).join('');
    target.className=`cv-sheet theme-${t.variant} font-${settings.font} density-${settings.density} radius-${settings.radius}`;
    target.style.setProperty('--cv-accent',settings.accent);
    target.innerHTML=`
      <header class="cv-head"><div><div class="cv-kicker">${esc(profile.role)}</div><h1>${esc(profile.name)}</h1><h3>${esc(profile.role)}</h3></div><div class="contact"><span>${esc(profile.location)}</span><span>${esc(profile.email)}</span><span>${esc(profile.phone)}</span><span>${esc(profile.website)}</span></div></header>
      <p class="summary">${esc(profile.summary)}</p>
      <div class="metrics">${metrics}</div>
      <div class="cv-grid"><div><section class="section"><h2>Experience</h2>${jobs}</section><section class="section"><h2>Selected work</h2>${projects}</section></div><aside><section class="section"><h2>Core skills</h2><div class="tags">${skills}</div></section><section class="section"><h2>Languages</h2>${langs}</section></aside></div>`;
  }
  function renderEditor(){
    $$('[data-field]').forEach(el=>{el.value=profile[el.dataset.field]||''});
    $('#skills-input').value=(profile.skills||[]).join('\n'); $('#languages-input').value=(profile.languages||[]).join('\n');
    const ex=$('#experience-editor');ex.innerHTML='';(profile.experience||[]).forEach((j,i)=>{const box=document.createElement('div');box.className='item-editor';box.innerHTML=`<header><b>Experience ${i+1}</b><button type="button">Remove</button></header><label>Role<input data-k="role" value="${esc(j.role)}"></label><label>Company<input data-k="company" value="${esc(j.company)}"></label><label>Period<input data-k="period" value="${esc(j.period)}"></label><label>Bullets<textarea data-k="bullets" rows="5">${esc((j.bullets||[]).join('\n'))}</textarea></label>`;box.querySelector('button').onclick=()=>{profile.experience.splice(i,1);renderEditor();renderAll()};$$('[data-k]',box).forEach(el=>el.oninput=()=>{j[el.dataset.k]=el.dataset.k==='bullets'?el.value.split('\n').map(x=>x.trim()).filter(Boolean):el.value;renderAll()});ex.appendChild(box)});
    const pr=$('#projects-editor');pr.innerHTML='';(profile.projects||[]).forEach((p,i)=>{const box=document.createElement('div');box.className='item-editor';box.innerHTML=`<header><b>Project ${i+1}</b><button type="button">Remove</button></header><label>Name<input data-k="name" value="${esc(p.name)}"></label><label>Type<input data-k="type" value="${esc(p.type)}"></label><label>Impact<input data-k="impact" value="${esc(p.impact)}"></label><label>Description<textarea data-k="description" rows="5">${esc(p.description)}</textarea></label>`;box.querySelector('button').onclick=()=>{profile.projects.splice(i,1);renderEditor();renderAll()};$$('[data-k]',box).forEach(el=>el.oninput=()=>{p[el.dataset.k]=el.value;renderAll()});pr.appendChild(box)});
  }
  function syncControls(){
    $('#accent-input').value=settings.accent;$('#editor-accent').value=settings.accent;$('#zoom-select').value=String(settings.zoom);$('#font-select').value=settings.font;$('#density-select').value=settings.density;$('#radius-select').value=settings.radius;$('#active-template-name').textContent=activeTemplate().name;$('#preview-zoom').style.transform=`scale(${settings.zoom})`
  }
  function renderAll(){save();renderTemplates();renderCv($('#cv-sheet'));renderCv($('#print-sheet'));syncControls()}
  $$('[data-field]').forEach(el=>el.oninput=()=>{profile[el.dataset.field]=el.value;renderAll()});
  $('#skills-input').oninput=e=>{profile.skills=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);renderAll()};
  $('#languages-input').oninput=e=>{profile.languages=e.target.value.split('\n').map(x=>x.trim()).filter(Boolean);renderAll()};
  $('#add-experience').onclick=()=>{profile.experience.push({role:'New role',company:'Company',period:'2026 — Present',bullets:['Describe measurable impact.']});renderEditor();renderAll()};
  $('#add-project').onclick=()=>{profile.projects.push({name:'New project',type:'Product · Design',impact:'Key impact',description:'Problem, role, solution and result.'});renderEditor();renderAll()};
  $('#edit-toggle').onclick=()=>$('#editor').classList.add('open');$('#editor-close').onclick=$('#done-editing').onclick=()=>$('#editor').classList.remove('open');
  $('#print-btn').onclick=()=>window.print();
  $('#zoom-select').onchange=e=>{settings.zoom=Number(e.target.value);renderAll()};
  $('#accent-input').oninput=$('#editor-accent').oninput=e=>{settings.accent=e.target.value;renderAll()};
  $('#font-select').onchange=e=>{settings.font=e.target.value;renderAll()};$('#density-select').onchange=e=>{settings.density=e.target.value;renderAll()};$('#radius-select').onchange=e=>{settings.radius=e.target.value;renderAll()};
  $('#reset-profile').onclick=()=>{profile=structuredClone(demo);settings={templateId:'product-slate',accent:'#6d5dfc',zoom:.85,font:'sans',density:'balanced',radius:'soft'};renderEditor();renderAll()};
  $$('#editor-tabs button').forEach(btn=>btn.onclick=()=>{$$('#editor-tabs button').forEach(x=>x.classList.toggle('active',x===btn));$$('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==btn.dataset.tab)});
  window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'&&!/input|textarea|select/i.test(document.activeElement.tagName))$('#editor').classList.toggle('open');if(e.key.toLowerCase()==='p'&&!/input|textarea|select/i.test(document.activeElement.tagName))window.print()});
  renderEditor();renderAll();
})();