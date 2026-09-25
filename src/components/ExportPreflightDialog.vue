<template>
  <div v-if="open" class="vue-preflight-shell studio-only">
    <button class="vue-dialog-backdrop" type="button" aria-label="Close PDF preflight" @click="$emit('close')"></button>
    <section class="vue-preflight-dialog" role="dialog" aria-modal="true" aria-labelledby="vuePreflightTitle">
      <header><div><span>Export check</span><h2 id="vuePreflightTitle">PDF Preflight</h2><p>Check A4 pressure before opening the browser print dialog.</p></div><button type="button" aria-label="Close PDF preflight" @click="$emit('close')">×</button></header>
      <section :class="['vue-preflight-status',tone]">
        <div><span>Status</span><strong>{{ title }}</strong><p>{{ detail }}</p></div>
        <div class="vue-preflight-metrics"><span><small>One-page scale</small><strong>{{ percent }}%</strong></span><span><small>Natural length</small><strong>{{ health.naturalPages }} page{{ health.naturalPages===1?'':'s' }}</strong></span></div>
      </section>
      <section class="vue-preflight-pressure"><div><span>Content pressure</span><strong>Largest sections</strong></div><div><span v-for="item in health.pressure" :key="item.label"><strong>{{ item.label }}</strong><small>{{ Math.round(item.height/health.measuredHeight*100) }}% of content height</small></span><small v-if="!health.pressure.length">No large section detected.</small></div></section>
      <fieldset><legend>Export mode</legend><label><input v-model="mode" type="radio" value="one" :disabled="!health.onePagePossible" /><span><strong>Fit to one A4 page</strong><small>Uses the safe fit engine, never below 68%.</small></span></label><label><input v-model="mode" type="radio" value="multi" /><span><strong>Allow multiple pages</strong><small>Keeps text at 100% and lets the browser paginate naturally.</small></span></label></fieldset>
      <div class="vue-preflight-advice"><strong>{{ adviceTitle }}</strong><p>{{ advice }}</p></div>
      <footer><button type="button" class="ghost-button" @click="$emit('close')">Cancel</button><button type="button" class="primary-button" @click="$emit('print',mode)">Open print dialog</button></footer>
    </section>
  </div>
</template>

<script>
export default {
  name:'ExportPreflightDialog',
  props:{open:{type:Boolean,default:false},health:{type:Object,required:true}},
  emits:['close','print'],
  data(){return{mode:'one'}},
  computed:{
    percent(){return Math.round((this.health.appliedFit||1)*100)},
    tone(){if(!this.health.onePagePossible)return'overflow';if(this.health.appliedFit<.8)return'tight';if(this.health.appliedFit<.94)return'scaled';return'ready'},
    title(){return this.tone==='overflow'?'Multi-page recommended':this.tone==='tight'?'Very tight one-page fit':this.tone==='scaled'?'One-page fit with scaling':'A4 ready'},
    detail(){if(this.tone==='overflow')return'A one-page export would need to shrink below the 68% readability floor.';if(this.tone==='tight')return'The CV can fit one page, but text will scale to about '+this.percent+'%.';if(this.tone==='scaled')return'The CV will scale to about '+this.percent+'% to stay on one A4 page.';return'Current content fits without meaningful scaling.'},
    adviceTitle(){return this.tone==='overflow'?'Why one-page is disabled':this.tone==='tight'?'Readable, but compressed':'Preflight passed'},
    advice(){return this.tone==='overflow'?'Shorten content, use compact spacing, or export multiple pages.':this.tone==='tight'?'Consider compact spacing or shortening the largest section before sending the CV.':'Web content is within the supported one-page fit range. Verify the final PDF text layer before sending.'},
  },
  watch:{open(value){if(value)this.mode=this.health.onePagePossible?'one':'multi'},'health.onePagePossible'(value){if(!value)this.mode='multi'}},
}
</script>

<style scoped>
.vue-preflight-shell{position:fixed;inset:0;z-index:155}.vue-dialog-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgba(15,23,42,.46);backdrop-filter:blur(6px)}
.vue-preflight-dialog{position:absolute;left:50%;top:50%;width:min(620px,calc(100vw - 32px));max-height:min(780px,calc(100vh - 32px));overflow:auto;transform:translate(-50%,-50%);padding:20px;border:1px solid #dfe3e8;border-radius:20px;background:#f7f8fa;box-shadow:0 34px 96px rgba(15,23,42,.28)}
.vue-preflight-dialog>header{display:flex;justify-content:space-between;gap:18px}.vue-preflight-dialog>header span{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#7b8494}.vue-preflight-dialog h2{margin:4px 0 5px;font-size:25px}.vue-preflight-dialog header p{margin:0;color:#737d8c;font-size:12px}.vue-preflight-dialog>header>button{width:34px;height:34px;border:1px solid #d9dee6;border-radius:10px;background:#fff;font-size:20px}
.vue-preflight-status{display:grid;grid-template-columns:1.3fr .7fr;gap:10px;margin-top:14px;padding:13px;border:1px solid #dfe3e8;border-left:3px solid #16a34a;border-radius:14px;background:#fff}.vue-preflight-status.scaled{border-left-color:#2563eb}.vue-preflight-status.tight{border-left-color:#f59e0b}.vue-preflight-status.overflow{border-left-color:#e11d48}.vue-preflight-status span,.vue-preflight-status strong{display:block}.vue-preflight-status>div:first-child>span{font-size:9px;text-transform:uppercase;color:#8a93a3}.vue-preflight-status>div:first-child>strong{margin-top:3px;font-size:14px}.vue-preflight-status p{margin:4px 0 0;color:#6b7483;font-size:11px}.vue-preflight-metrics{display:grid;grid-template-columns:1fr 1fr;gap:6px}.vue-preflight-metrics span{padding:8px;border-radius:9px;background:#f8fafc}.vue-preflight-metrics small{font-size:9px;color:#8a93a3}.vue-preflight-metrics strong{margin-top:3px;font-size:12px}
.vue-preflight-pressure{margin-top:9px;padding:12px;border:1px solid #e4e7ec;border-radius:13px;background:#fff}.vue-preflight-pressure>div:first-child span,.vue-preflight-pressure>div:first-child strong{display:block}.vue-preflight-pressure>div:first-child span{font-size:9px;text-transform:uppercase;color:#8a93a3}.vue-preflight-pressure>div:last-child{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}.vue-preflight-pressure>div:last-child>span{padding:8px;border-radius:9px;background:#f8fafc}.vue-preflight-pressure strong,.vue-preflight-pressure small{display:block}.vue-preflight-pressure small{margin-top:2px;font-size:9px;color:#8a93a3}
.vue-preflight-dialog fieldset{display:grid;gap:7px;margin:9px 0 0;padding:12px;border:1px solid #e4e7ec;border-radius:13px;background:#fff}.vue-preflight-dialog legend{font-size:10px;font-weight:800;color:#667085}.vue-preflight-dialog label{display:flex;gap:8px;padding:9px;border-radius:10px;background:#f8fafc}.vue-preflight-dialog label strong,.vue-preflight-dialog label small{display:block}.vue-preflight-dialog label small{margin-top:2px;color:#8a93a3;font-size:10px}.vue-preflight-advice{margin-top:9px;padding:10px;border-radius:11px;background:#eef2ff}.vue-preflight-advice strong{font-size:11px;color:#3730a3}.vue-preflight-advice p{margin:3px 0 0;color:#4f5f8f;font-size:10px}.vue-preflight-dialog>footer{display:flex;justify-content:flex-end;gap:7px;margin-top:11px}
@media(max-width:720px){.vue-preflight-dialog{inset:0;width:100vw;height:100vh;max-height:none;transform:none;border:0;border-radius:0;padding:16px}.vue-preflight-status{grid-template-columns:1fr}.vue-preflight-pressure>div:last-child{grid-template-columns:1fr}.vue-preflight-dialog>footer .ghost-button,.vue-preflight-dialog>footer .primary-button{flex:1}}
</style>
