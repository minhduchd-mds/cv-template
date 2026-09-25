import fs from 'node:fs'

const files=[
  ['public/studio/app.js','Static Studio app'],
  ['public/studio/ats.js','Static ATS module'],
  ['public/studio/workspace-store.js','Static workspace store'],
]

let failed=false
const fail=(message)=>{ failed=true; console.error('✗ '+message) }

for(const [path,label] of files){
  const source=fs.readFileSync(new URL('../'+path,import.meta.url),'utf8')
  try{ new Function(source) }
  catch(error){ fail(label+' syntax error: '+error.message) }
}

const app=fs.readFileSync(new URL('../public/studio/app.js',import.meta.url),'utf8')
app.split('\n').forEach((line,index)=>{
  if(/^\s*\$\([^)]*\)\.(?:forEach|map|filter|some|every)\s*\(/.test(line)){
    fail('Single-node $ helper used with collection method at public/studio/app.js:'+(index+1)+' -> '+line.trim())
  }
})

const index=fs.readFileSync(new URL('../public/studio/index.html',import.meta.url),'utf8')
const workspaceIndex=index.indexOf('workspace-store.js')
const appIndex=index.indexOf('app.js')
const atsIndex=index.indexOf('ats.js')
if(workspaceIndex<0||appIndex<0||atsIndex<0)fail('Static Studio scripts are missing from index.html')
if(!(workspaceIndex<appIndex&&appIndex<atsIndex))fail('Static Studio script order must be workspace-store.js → app.js → ats.js')

if(!failed)console.log('✓ Static Studio runtime guard passed')
if(failed)process.exitCode=1
