<template>
  <article class="cv-sheet ref-cv ref-code-aware" :class="referenceAppearanceClasses" :style="{ '--cv-accent': accent }" @click="handleEditRequest" @keydown="handleKeydown" @dragstart="handleDragStart" @dragover="handleDragOver" @drop="handleDrop" @dragend="handleDragEnd">
    <header class="ref-code-head" v-bind="editAttrs('profile')"><div><span>&lt; CV /&gt;</span><h1>{{ profile.name }}</h1><h2>{{ profile.role }}</h2></div><div><span>// Build interfaces</span><span>// for a more human web.</span><div class="ref-contact"><span>{{ profile.email }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div></div></header>
    <div class="ref-code-grid"><section class="ref-code-about" v-bind="editAttrs('profile','summary')"><h3>01 / ABOUT</h3><p>{{ profile.summary }}</p></section><div class="ref-code-poster">DESIGN<br>×<br>CODE<br>×<br>PEOPLE<br>=<br><b>BETTER PRODUCTS</b></div></div>
    <section class="ref-section" v-bind="editAttrs('experience','experience')"><h3>02 / EXPERIENCE</h3><div class="ref-code-experience"><article v-for="job in profile.experience" :key="job.role"><div class="ref-job-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }} · {{ job.location }}</span></div><time>{{ job.period }}</time></div><ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul></article></div></section>
    <section class="ref-section" v-bind="editAttrs('skills','skills')"><h3>03 / SKILLS</h3><div class="ref-code-skills"><div v-for="(skill,index) in profile.skills" :key="skill"><span>{{ skill }}</span><i :style="{ '--level': Math.max(3, 7 - (index % 5)) }"></i></div></div></section>
    <section class="ref-section" v-bind="editAttrs('projects','projects')"><h3>04 / SELECTED WORK</h3><div class="ref-projects ref-code-work"><article v-for="(project,index) in profile.projects" :key="project.name"><div class="ref-project-index">0{{ index+1 }}</div><div><span>{{ project.type }}</span><strong>{{ project.name }}</strong></div><small>{{ project.impact }}</small></article></div></section>
  </article>
</template>
<script>
import { referenceTemplateMixin } from './reference-template-mixin'
export default { name:'CodeAwareTemplate', mixins:[referenceTemplateMixin] }
</script>