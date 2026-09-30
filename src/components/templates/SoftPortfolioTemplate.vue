<template>
  <article class="cv-sheet ref-cv ref-soft-portfolio" :class="referenceAppearanceClasses" :style="{ '--cv-accent': accent }" @click="handleEditRequest" @keydown="handleKeydown" @dragstart="handleDragStart" @dragover="handleDragOver" @drop="handleDrop" @dragend="handleDragEnd">
    <header class="ref-soft-hero" v-bind="editAttrs('profile')">
      <div class="ref-soft-copy"><span class="ref-eyebrow">Senior UI/UX Designer</span><h1>{{ profile.name }}</h1><h2>{{ profile.role }}</h2><p v-if="visible('summary')">{{ profile.summary }}</p><div class="ref-contact"><span>{{ profile.email }}</span><span>{{ profile.location }}</span><span>{{ profile.website }}</span></div></div>
      <div class="ref-soft-portrait"><div class="ref-soft-avatar"><img v-if="profile.avatar" :src="profile.avatar" alt="" :style="avatarImageStyle"><span v-else>{{ initials }}</span></div><span class="ref-hand-note">Good design<br>builds better<br>tomorrows.</span></div>
    </header>
    <div class="ref-soft-metrics" v-bind="editAttrs('impact','highlights')"><div v-for="item in profile.highlights" :key="item.id || item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
    <div class="ref-soft-body">
      <main v-bind="editAttrs('projects','projects')"><div class="ref-section-title">Selected Case Studies</div><div class="ref-projects ref-soft-projects"><article v-for="(project,index) in profile.projects.slice(0,3)" :key="project.id || project.name"><div class="ref-project-index">0{{ index+1 }}</div><div><span>{{ project.type }}</span><strong>{{ project.name }}</strong></div><p>{{ project.description }}</p><small>{{ project.impact }}</small></article></div></main>
      <aside><div v-bind="editAttrs('skills','skills')"><div class="ref-section-title">Core Skills</div><div class="ref-skills ref-soft-skills"><span v-for="(skill, skillIndex) in profile.skills" :key="skillIndex">{{ skill }}</span></div><div class="ref-section-title">Tools</div><div class="ref-tool-grid"><span v-for="(skill, skillIndex) in profile.skills.slice(0,9)" :key="skillIndex">{{ skill }}</span></div></div></aside>
    </div>
    <section class="ref-soft-highlights" v-bind="editAttrs('experience','experience')"><div class="ref-section-title">Experience Highlights</div><div class="ref-soft-experience"><article v-for="job in profile.experience.slice(0,3)" :key="job.id || job.role"><div class="ref-job-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><time>{{ job.period }}</time></div></article></div></section>
  </article>
</template>
<script>
import { referenceTemplateMixin } from './reference-template-mixin'
export default { name:'SoftPortfolioTemplate', mixins:[referenceTemplateMixin] }
</script>