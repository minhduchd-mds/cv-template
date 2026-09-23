<template>
  <article class="cv-sheet ref-cv ref-executive-edge" :class="referenceAppearanceClasses" :style="{ '--cv-accent': accent }" @click="handleEditRequest" @keydown="handleKeydown" @dragstart="handleDragStart" @dragover="handleDragOver" @drop="handleDrop" @dragend="handleDragEnd">
    <header class="ref-exec-head" v-bind="editAttrs('profile')">
      <div><h1>{{ profile.name }}</h1><h2>{{ profile.role }}</h2></div>
      <div class="ref-exec-motto">PEOPLE<br>STRATEGY<br>GROWTH<br>LASTING IMPACT</div>
    </header>
    <div class="ref-contact"><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.location }}</span><span>{{ profile.website }}</span></div>
    <section class="ref-section ref-summary" v-bind="editAttrs('profile','summary')"><h3>Executive Summary</h3><p>{{ profile.summary }}</p></section>
    <section class="ref-section" v-bind="editAttrs('impact','highlights')"><h3>Leadership Impact</h3><div class="ref-exec-impact"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div></section>
    <section class="ref-section" v-bind="editAttrs('experience','experience')"><h3>Professional Experience</h3><div class="ref-exec-experience"><article v-for="job in profile.experience" :key="job.role"><div class="ref-job-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }} · {{ job.location }}</span></div><time>{{ job.period }}</time></div><ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul></article></div></section>
    <section class="ref-section" v-bind="editAttrs('projects','projects')"><h3>Selected Achievements</h3><div class="ref-projects ref-achievement-row"><article v-for="(project,index) in profile.projects.slice(0,4)" :key="project.name"><div class="ref-project-index">0{{ index+1 }}</div><div><span>{{ project.type }}</span><strong>{{ project.name }}</strong></div><small>{{ project.impact }}</small></article></div></section>
    <section v-if="profile.education?.length" class="ref-section" v-bind="editAttrs('education','education')"><h3>Education & Professional Development</h3><div class="ref-education"><article v-for="item in profile.education" :key="item.title"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></div></section>
  </article>
</template>
<script>
import { referenceTemplateMixin } from './reference-template-mixin'
export default { name:'ExecutiveEdgeTemplate', mixins:[referenceTemplateMixin] }
</script>