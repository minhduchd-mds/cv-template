(() => {
  'use strict'
  const KEY='cv-studio-workspace-v3'
  const FORMAT='cv-studio-workspace'
  const SCHEMA=3
  const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value))
  const record=(value)=>value&&typeof value==='object'&&!Array.isArray(value)
  const normalize=(value)=>{
    if(!record(value)||value.format!==FORMAT||Number(value.schemaVersion)!==SCHEMA)return null
    return {
      format:FORMAT,
      schemaVersion:SCHEMA,
      updatedAt:typeof value.updatedAt==='string'?value.updatedAt:new Date().toISOString(),
      source:typeof value.source==='string'?value.source:'unknown',
      profile:record(value.profile)?clone(value.profile):{},
      studio:record(value.studio)?clone(value.studio):{},
      ats:{
        target:record(value.ats?.target)?clone(value.ats.target):{},
        versions:Array.isArray(value.ats?.versions)?clone(value.ats.versions):[],
        applications:Array.isArray(value.ats?.applications)?clone(value.ats.applications):[],
      },
    }
  }
  const read=()=>{
    try{return normalize(JSON.parse(localStorage.getItem(KEY)||'null'))}
    catch{return null}
  }
  const patch=(partial={},source='static')=>{
    const current=read()||{format:FORMAT,schemaVersion:SCHEMA,updatedAt:new Date().toISOString(),source,profile:{},studio:{},ats:{target:{},versions:[],applications:[]}}
    const next={
      ...current,
      format:FORMAT,
      schemaVersion:SCHEMA,
      updatedAt:new Date().toISOString(),
      source,
      profile:record(partial.profile)?clone(partial.profile):current.profile,
      studio:record(partial.studio)?{...current.studio,...clone(partial.studio)}:current.studio,
      ats:{
        target:record(partial.ats?.target)?clone(partial.ats.target):current.ats.target,
        versions:Array.isArray(partial.ats?.versions)?clone(partial.ats.versions):current.ats.versions,
        applications:Array.isArray(partial.ats?.applications)?clone(partial.ats.applications):current.ats.applications,
      },
    }
    try{localStorage.setItem(KEY,JSON.stringify(next));return next}
    catch(error){console.warn('Unable to persist canonical CV Studio workspace.',error);return current}
  }
  window.CVStudioWorkspace={KEY,FORMAT,SCHEMA,read,patch}
})()
