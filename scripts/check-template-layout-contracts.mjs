import fs from 'node:fs'
import { TEMPLATE_LAYOUT_CONTRACTS, getTemplateLayoutContract } from '../src/data/template-layout-contracts.js'

const fail=(message)=>{ console.error('✗ '+message); process.exitCode=1 }
const cvSource=fs.readFileSync(new URL('../src/data/cv.js',import.meta.url),'utf8')
const templateMatches=[...cvSource.matchAll(/\{\s*id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?status:\s*'live'/g)]
const templates=templateMatches.map((match)=>({id:match[1],name:match[2]}))
const ids=templates.map((item)=>item.id)
const contractIds=Object.keys(TEMPLATE_LAYOUT_CONTRACTS)

if(ids.length!==20)fail('Expected 20 live templates, found '+ids.length)

for(const id of ids){
  if(!TEMPLATE_LAYOUT_CONTRACTS[id])fail('Missing layout contract for '+id)
  const contract=getTemplateLayoutContract(id)
  if(!['fixed','guided','flexible'].includes(contract.mode))fail('Invalid mode for '+id)
  for(const [section,config] of Object.entries(contract.sections)){
    if(config.supported!==false && !['main','side'].includes(config.group))fail('Invalid group '+id+' / '+section)
    if(config.limit!=null && (!Number.isInteger(config.limit)||config.limit<1))fail('Invalid limit '+id+' / '+section)
  }
}
for(const id of contractIds){
  if(!ids.includes(id))fail('Layout contract has unknown template '+id)
}

const staticSource=fs.readFileSync(new URL('../public/studio/app.js',import.meta.url),'utf8')
for(const id of ids){
  if(!staticSource.includes("'"+id+"':"))fail('Static Studio contract missing '+id)
}
const audit=fs.readFileSync(new URL('../docs/TEMPLATE_LAYOUT_AUDIT.md',import.meta.url),'utf8')
for(const template of templates){
  if(!audit.includes('| '+template.name+' |'))fail('Audit table missing '+template.name)
}
if(!process.exitCode)console.log('✓ 20 template layout contracts are synchronized across source, static Studio and audit docs')
