import { patchCanonicalWorkspace, readCanonicalWorkspace, WORKSPACE_KEY } from './workspace-store'

export const BACKUP_FORMAT='cv-studio-backup'
export const BACKUP_SCHEMA=1
const DB_NAME='cv-studio-ats-workspace'
const DB_VERSION=1
const PDF_STORE='pdfs'

const clone=(value)=>value==null?value:JSON.parse(JSON.stringify(value))
const readJson=(key,fallback)=>{
  try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}
}

const legacyKeys=[
  'cv-studio-profile-v1',
  'cv-studio-settings-v1',
  'cv-studio-static-v2',
  'cv-studio-static-settings-v2',
  'cv-studio-ats-target-v2',
  'cv-studio-ats-versions-v1',
  'cv-studio-ats-applications-v1',
]

const openDb=()=>new Promise((resolve,reject)=>{
  if(!window.indexedDB)return resolve(null)
  const request=indexedDB.open(DB_NAME,DB_VERSION)
  request.onupgradeneeded=()=>{
    const db=request.result
    if(!db.objectStoreNames.contains(PDF_STORE))db.createObjectStore(PDF_STORE,{keyPath:'applicationId'})
  }
  request.onsuccess=()=>resolve(request.result)
  request.onerror=()=>reject(request.error)
})

const readPdfs=async()=>{
  const db=await openDb()
  if(!db||!db.objectStoreNames.contains(PDF_STORE))return []
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PDF_STORE,'readonly')
    const req=tx.objectStore(PDF_STORE).getAll()
    req.onsuccess=()=>resolve(req.result||[])
    req.onerror=()=>reject(req.error)
  })
}

const putPdf=async(record)=>{
  const db=await openDb()
  if(!db)return
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PDF_STORE,'readwrite')
    tx.objectStore(PDF_STORE).put(record)
    tx.oncomplete=()=>resolve()
    tx.onerror=()=>reject(tx.error)
  })
}

const blobToDataUrl=(blob)=>new Promise((resolve,reject)=>{
  const reader=new FileReader()
  reader.onload=()=>resolve(String(reader.result||''))
  reader.onerror=()=>reject(reader.error)
  reader.readAsDataURL(blob)
})

const dataUrlToBlob=(value,fallbackType='application/pdf')=>{
  const parts=String(value||'').split(',',2)
  if(parts.length!==2||!(/;base64/i).test(parts[0]))return null
  const match=parts[0].match(/^data:([^;]+)/i)
  const binary=atob(parts[1])
  const bytes=new Uint8Array(binary.length)
  for(let index=0;index<binary.length;index+=1)bytes[index]=binary.charCodeAt(index)
  return new Blob([bytes],{type:match?.[1]||fallbackType})
}

export const workspaceSummary=(workspace=readCanonicalWorkspace())=>{
  const profile=workspace?.profile||readJson('cv-studio-profile-v1',{})
  return {
    name:String(profile.name||'').trim()||'Unnamed CV',
    experience:Array.isArray(profile.experience)?profile.experience.length:0,
    projects:Array.isArray(profile.projects)?profile.projects.length:0,
    versions:Array.isArray(workspace?.ats?.versions)?workspace.ats.versions.length:0,
    applications:Array.isArray(workspace?.ats?.applications)?workspace.ats.applications.length:0,
  }
}

export async function createWorkspaceBackup(includePdfs=false){
  const workspace=readCanonicalWorkspace()
  const data={[WORKSPACE_KEY]:workspace}
  legacyKeys.forEach((key)=>{data[key]=readJson(key,key.includes('versions')||key.includes('applications')?[]:{})})
  const records=includePdfs?await readPdfs():[]
  const pdfs=[]
  for(const record of records){
    if(!record?.applicationId||!record?.file)continue
    pdfs.push({
      applicationId:record.applicationId,
      name:record.name||record.file.name||'cv.pdf',
      type:record.type||record.file.type||'application/pdf',
      size:Number(record.size||record.file.size||0),
      savedAt:record.savedAt||new Date().toISOString(),
      dataUrl:await blobToDataUrl(record.file),
    })
  }
  return {
    format:BACKUP_FORMAT,
    schemaVersion:BACKUP_SCHEMA,
    createdAt:new Date().toISOString(),
    includesPdfs:Boolean(includePdfs),
    summary:workspaceSummary(workspace),
    data,
    pdfs,
  }
}

export function validateWorkspaceBackup(payload){
  if(!payload||payload.format!==BACKUP_FORMAT)return{ok:false,message:'This is not a CV Studio backup file.'}
  if(Number(payload.schemaVersion)!==BACKUP_SCHEMA)return{ok:false,message:'Unsupported backup schema version.'}
  if(!payload.data||typeof payload.data!=='object'||Array.isArray(payload.data))return{ok:false,message:'Backup data is incomplete.'}
  return{ok:true,message:''}
}

export function downloadWorkspaceBackup(payload){
  const date=new Date().toISOString().slice(0,10)
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob)
  const anchor=document.createElement('a')
  anchor.href=url
  anchor.download='cv-studio-backup-'+date+'.cvstudio.json'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(()=>URL.revokeObjectURL(url),1000)
}

export async function restoreWorkspaceBackup(payload){
  const validation=validateWorkspaceBackup(payload)
  if(!validation.ok)throw new Error(validation.message)
  const canonical=payload.data?.[WORKSPACE_KEY]
  if(canonical&&canonical.format==='cv-studio-workspace'&&Number(canonical.schemaVersion)===3){
    localStorage.setItem(WORKSPACE_KEY,JSON.stringify(canonical))
  }else{
    const rawProfile=payload.data?.['cv-studio-profile-v1']||payload.data?.['cv-studio-static-v2']||{}
    const staticSettings=payload.data?.['cv-studio-static-settings-v2']||{}
    const vueSettings=payload.data?.['cv-studio-settings-v1']||{}
    const staticOrder=Array.isArray(staticSettings.sectionOrder)&&staticSettings.sectionOrder.length
      ? staticSettings.sectionOrder
      : ['summary','experience','projects','skills','languages']
    const labels={summary:'Profile',experience:'Experience',projects:'Projects',skills:'Skills',languages:'Languages'}
    const visibility={summary:'showSummary',experience:'showExperience',projects:'showProjects',skills:'showSkills',languages:'showLanguages'}
    const profile={
      ...rawProfile,
      availability:typeof rawProfile.availability==='string'?rawProfile.availability:'',
      highlights:Array.isArray(rawProfile.highlights)?rawProfile.highlights:[],
      education:Array.isArray(rawProfile.education)?rawProfile.education:[],
      certificates:Array.isArray(rawProfile.certificates)?rawProfile.certificates:[],
      sections:Array.isArray(rawProfile.sections)&&rawProfile.sections.length
        ? rawProfile.sections
        : staticOrder.map((id)=>({id,label:labels[id]||id,enabled:visibility[id]?staticSettings[visibility[id]]!==false:true})),
    }
    const appearanceKeys=['font','density','radius','projectLayout','textScale','headingScale','sectionSpacing','avatarShape','avatarSize','avatarX','avatarY','avatarZoom','avatarRotate']
    const staticAppearance={}
    appearanceKeys.forEach((key)=>{if(staticSettings[key]!=null)staticAppearance[key]=staticSettings[key]})
    const studio=Object.keys(vueSettings).length?vueSettings:{
      selectedId:staticSettings.templateId,
      accent:staticSettings.accent,
      zoom:staticSettings.zoom,
      appearance:staticAppearance,
    }
    const target=payload.data?.['cv-studio-ats-target-v2']||{}
    const versions=payload.data?.['cv-studio-ats-versions-v1']||[]
    const applications=payload.data?.['cv-studio-ats-applications-v1']||[]
    patchCanonicalWorkspace({profile,studio,ats:{target,versions,applications}},'restore')
  }

  for(const key of legacyKeys){
    if(Object.prototype.hasOwnProperty.call(payload.data,key))localStorage.setItem(key,JSON.stringify(clone(payload.data[key])))
  }

  if(payload.includesPdfs){
    for(const pdf of payload.pdfs||[]){
      const blob=dataUrlToBlob(pdf.dataUrl,pdf.type)
      if(!blob||!pdf.applicationId)continue
      const file=new File([blob],pdf.name||'cv.pdf',{type:pdf.type||blob.type||'application/pdf'})
      await putPdf({applicationId:pdf.applicationId,file,name:file.name,type:file.type,size:file.size,savedAt:pdf.savedAt||new Date().toISOString()})
    }
  }
}
