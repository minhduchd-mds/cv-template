<template>
  <div v-if="open" class="vue-backup-shell studio-only" role="presentation">
    <button class="vue-dialog-backdrop" type="button" aria-label="Close backup dialog" @click="$emit('close')"></button>
    <section class="vue-backup-dialog" role="dialog" aria-modal="true" aria-labelledby="vueBackupTitle">
      <header>
        <div><span>Data safety</span><h2 id="vueBackupTitle">Backup & Recovery</h2><p>Export the full CV Studio workspace or preview a backup before restoring it.</p></div>
        <button type="button" aria-label="Close backup dialog" @click="$emit('close')">×</button>
      </header>

      <div class="vue-backup-summary">
        <article><span>Profile</span><strong>{{ summary.name }}</strong></article>
        <article><span>Experience</span><strong>{{ summary.experience }}</strong></article>
        <article><span>Projects</span><strong>{{ summary.projects }}</strong></article>
        <article><span>Versions</span><strong>{{ summary.versions }}</strong></article>
        <article><span>Applications</span><strong>{{ summary.applications }}</strong></article>
      </div>

      <section class="vue-backup-card">
        <div><span>01 · Export</span><strong>Save a local backup</strong><p>Canonical workspace and legacy mirrors are included for safe rollback.</p></div>
        <label class="vue-backup-check"><input v-model="includePdfs" type="checkbox" /><span><strong>Include attached PDFs</strong><small>Larger file, but restores final application PDFs too.</small></span></label>
        <button type="button" class="primary-button" :disabled="busy" @click="download">{{ busy ? 'Preparing…' : 'Download backup' }}</button>
      </section>

      <section class="vue-backup-card">
        <div><span>02 · Restore</span><strong>Preview before replacing data</strong><p>Selecting a file never changes current data until Restore is confirmed.</p></div>
        <label class="vue-backup-file"><input type="file" accept=".json,.cvstudio,application/json" @change="chooseFile" /><span>Choose backup file</span></label>
        <div class="vue-backup-preview" :class="{ error: importError }">
          <template v-if="preview">
            <div><span>Profile</span><strong>{{ preview.name }}</strong></div>
            <div><span>Experience</span><strong>{{ preview.experience }}</strong></div>
            <div><span>Versions</span><strong>{{ preview.versions }}</strong></div>
            <div><span>Applications</span><strong>{{ preview.applications }}</strong></div>
            <div><span>PDFs</span><strong>{{ pending?.pdfs?.length || 0 }}</strong></div>
          </template>
          <small v-else>{{ importError || 'No backup selected.' }}</small>
        </div>
        <button type="button" class="primary-button" :disabled="!pending || busy" @click="restore">Restore selected backup</button>
      </section>
      <footer>{{ status }}</footer>
    </section>
  </div>
</template>

<script>
import { createWorkspaceBackup, downloadWorkspaceBackup, restoreWorkspaceBackup, validateWorkspaceBackup, workspaceSummary } from '../data/workspace-backup'

export default {
  name:'WorkspaceBackupDialog',
  props:{open:{type:Boolean,default:false}},
  emits:['close','restored'],
  data(){return{includePdfs:false,busy:false,pending:null,preview:null,importError:'',status:'Everything stays on this device unless you download the backup file.'}},
  computed:{summary(){return workspaceSummary()}},
  methods:{
    async download(){
      this.busy=true
      this.status='Preparing backup…'
      try{
        const payload=await createWorkspaceBackup(this.includePdfs)
        downloadWorkspaceBackup(payload)
        this.status='Backup downloaded · '+payload.summary.applications+' applications · '+payload.pdfs.length+' PDFs.'
      }catch(error){console.error(error);this.status='Backup could not be created. No workspace data was changed.'}
      finally{this.busy=false}
    },
    async chooseFile(event){
      this.pending=null;this.preview=null;this.importError=''
      const file=event.target.files?.[0]
      if(!file)return
      try{
        const payload=JSON.parse(await file.text())
        const validation=validateWorkspaceBackup(payload)
        if(!validation.ok){this.importError=validation.message;return}
        this.pending=payload
        this.preview=payload.summary||workspaceSummary(payload.data?.['cv-studio-workspace-v3'])
      }catch{this.importError='The selected file is not valid JSON.'}
    },
    async restore(){
      if(!this.pending||!window.confirm('Restore this CV Studio backup? Current structured workspace data will be replaced.'))return
      this.busy=true;this.status='Restoring backup…'
      try{await restoreWorkspaceBackup(this.pending);this.status='Backup restored. Reloading…';this.$emit('restored');window.location.reload()}
      catch(error){console.error(error);this.status='Restore failed. Current page has not been reloaded.';this.busy=false}
    },
  },
}
</script>

<style scoped>
.vue-backup-shell{position:fixed;inset:0;z-index:160}.vue-dialog-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgba(15,23,42,.48);backdrop-filter:blur(6px)}
.vue-backup-dialog{position:absolute;left:50%;top:50%;width:min(680px,calc(100vw - 32px));max-height:min(800px,calc(100vh - 32px));overflow:auto;transform:translate(-50%,-50%);padding:20px;border:1px solid #dde2e9;border-radius:20px;background:#f7f8fa;box-shadow:0 34px 96px rgba(15,23,42,.28)}
.vue-backup-dialog>header{display:flex;justify-content:space-between;gap:18px}.vue-backup-dialog>header span{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#7b8494}.vue-backup-dialog h2{margin:4px 0 5px;font-size:25px}.vue-backup-dialog header p{margin:0;color:#737d8c;font-size:12px}.vue-backup-dialog>header>button{width:34px;height:34px;border:1px solid #d9dee6;border-radius:10px;background:#fff;font-size:20px}
.vue-backup-summary{display:grid;grid-template-columns:2fr repeat(4,1fr);gap:7px;margin:14px 0}.vue-backup-summary article{min-width:0;padding:10px;border:1px solid #e1e5eb;border-radius:11px;background:#fff}.vue-backup-summary span,.vue-backup-summary strong{display:block}.vue-backup-summary span{font-size:9px;text-transform:uppercase;color:#8a93a3}.vue-backup-summary strong{margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
.vue-backup-card{display:grid;gap:10px;margin-top:9px;padding:13px;border:1px solid #dfe3e8;border-radius:14px;background:#fff}.vue-backup-card>div:first-child span,.vue-backup-card>div:first-child strong{display:block}.vue-backup-card>div:first-child span{font-size:9px;font-weight:800;text-transform:uppercase;color:#8a93a3}.vue-backup-card>div:first-child strong{margin-top:3px;font-size:13px}.vue-backup-card p{margin:4px 0 0;color:#737d8c;font-size:11px}
.vue-backup-check{display:flex;gap:8px;padding:9px;border-radius:10px;background:#f8fafc}.vue-backup-check strong,.vue-backup-check small{display:block}.vue-backup-check small{margin-top:2px;color:#8a93a3;font-size:10px}.vue-backup-file{display:flex;justify-content:center;padding:13px;border:1px dashed #c7ced8;border-radius:10px;background:#fafbfc;font-size:11px;font-weight:700;cursor:pointer}.vue-backup-file input{position:absolute;width:1px;height:1px;opacity:0}
.vue-backup-preview{display:grid;grid-template-columns:2fr repeat(4,1fr);gap:6px;padding:9px;border:1px solid #e4e7ec;border-radius:10px;background:#fafbfc}.vue-backup-preview span,.vue-backup-preview strong{display:block}.vue-backup-preview span{font-size:9px;color:#8a93a3}.vue-backup-preview strong{font-size:11px}.vue-backup-preview>small{grid-column:1/-1;color:#8a93a3}.vue-backup-preview.error{border-color:#f1b8c2;background:#fff8f9}.vue-backup-card>.primary-button{justify-self:end}.vue-backup-dialog>footer{margin-top:10px;color:#737d8c;font-size:10px}
@media(max-width:720px){.vue-backup-dialog{inset:0;width:100vw;height:100vh;max-height:none;transform:none;border:0;border-radius:0;padding:16px}.vue-backup-summary,.vue-backup-preview{grid-template-columns:repeat(2,minmax(0,1fr))}.vue-backup-summary article:first-child,.vue-backup-preview>div:first-child{grid-column:1/-1}.vue-backup-card>.primary-button{width:100%;justify-self:stretch}}
</style>
