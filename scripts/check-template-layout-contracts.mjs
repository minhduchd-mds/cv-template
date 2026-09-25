import fs from 'node:fs'
import { DEFAULT_TEMPLATE_FIELDS, TEMPLATE_LAYOUT_CONTRACTS, getTemplateLayoutContract } from '../src/data/template-layout-contracts.js'

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
  for(const field of Object.keys(DEFAULT_TEMPLATE_FIELDS)){
    const config=contract.fields[field]
    if(!config||typeof config.supported!=='boolean')fail('Invalid field contract '+id+' / '+field)
  }
  if(!contract.structure)fail('Missing structure for '+id)
  if(!Array.isArray(contract.traits))fail('Missing traits for '+id)
}
for(const id of contractIds){
  if(!ids.includes(id))fail('Layout contract has unknown template '+id)
}

const staticSource=fs.readFileSync(new URL('../public/studio/app.js',import.meta.url),'utf8')
for(const id of ids){
  if(!staticSource.includes("'"+id+"':"))fail('Static Studio contract missing '+id)
}
const staticV2Start=staticSource.indexOf('const templateContractV2Meta = {')
const staticV2End=staticSource.indexOf('Object.entries(templateContractV2Meta)',staticV2Start)
const staticV2=staticV2Start>=0&&staticV2End>staticV2Start?staticSource.slice(staticV2Start,staticV2End):''
if(!staticV2)fail('Static Studio field-level contract V2 metadata missing')
for(const id of ids){
  if(!staticV2.includes("'"+id+"':"))fail('Static Studio field contract missing '+id)
}
for(const field of ['avatar','headline','quote']){
  if(!staticV2.includes(field+':'))fail('Static Studio field metadata missing '+field)
}
const audit=fs.readFileSync(new URL('../docs/TEMPLATE_LAYOUT_AUDIT.md',import.meta.url),'utf8')
for(const template of templates){
  if(!audit.includes('| '+template.name+' |'))fail('Audit table missing '+template.name)
}
if(!process.exitCode)console.log('✓ 20 template layout contracts are synchronized across source, static Studio and audit docs')
