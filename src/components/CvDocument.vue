<template>
  <component
    :is="referenceComponent"
    v-if="referenceComponent"
    :profile="profile"
    :accent="accent"
    :appearance="appearance"
    :interactive="interactive"
    :template-id="template.id"
    @edit-section="$emit('edit-section', $event)"
    @reorder-section="$emit('reorder-section', $event)"
  />
  <article v-else
    class="cv-sheet"
    :class="[`cv-${template.variant}`, template.theme ? `theme-${template.theme}` : '', ...appearanceClasses, { 'is-editable': interactive }]"
    :style="{ '--cv-accent': accent }"
    @click="handleEditRequest"
    @keydown="handleEditKeydown"
    @dragstart="handleSectionDragStart"
    @dragover="handleSectionDragOver"
    @drop="handleSectionDrop"
    @dragend="handleSectionDragEnd"
  >
    <template v-if="template.variant === 'ats'">
      <header class="cv-header ats-header" v-bind="editAttrs('profile')">
        <div class="ats-header-main">
          <div>
            <p class="cv-kicker">{{ profile.role }}</p>
            <h1>{{ profile.name }}</h1>
          </div>
          <div v-if="profile.avatar" class="cv-avatar ats-avatar"><img :src="profile.avatar" alt="" :style="avatarImageStyle" /></div>
        </div>
        <div class="contact-row">
          <span>{{ profile.location }}</span><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span>
        </div>
      </header>
      <div class="cv-section-stack">
        <section v-if="visible('summary')" class="ats-summary" :style="sectionStyle('summary')" v-bind="editAttrs('profile', 'summary')">
          <h2>Profile</h2><p>{{ profile.summary }}</p>
        </section>
        <section v-if="visible('highlights')" class="ats-highlight-section" :style="sectionStyle('highlights')" v-bind="editAttrs('impact', 'highlights')">
          <h2>Impact</h2><div class="ats-highlights"><div v-for="item in profile.highlights" :key="item.id || item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
        </section>
        <section v-if="visible('experience')" :style="sectionStyle('experience')" v-bind="editAttrs('experience', 'experience')">
          <h2>Experience</h2>
          <div v-for="job in profile.experience" :key="job.id || `${job.role}-${job.company}`" class="experience-item ats-experience">
            <div class="experience-head"><strong>{{ job.role }} · {{ job.company }}</strong><span>{{ job.period }}</span></div>
            <ul><li v-for="(bullet, bulletIndex) in job.bullets" :key="bulletIndex">{{ bullet }}</li></ul>
          </div>
        </section>
        <section v-if="visible('projects')" :style="sectionStyle('projects')" v-bind="editAttrs('projects', 'projects')">
          <h2>Selected work</h2>
          <div class="ats-project-grid">
            <article v-for="project in profile.projects" :key="project.id || project.name">
              <div v-if="project.image" class="cv-project-cover ats-cover" :style="imageStyle(project.image)"></div>
              <strong>{{ project.name }}</strong><span>{{ project.type }} · {{ project.impact }}</span><p>{{ project.description }}</p>
            </article>
          </div>
        </section>
        <section v-if="visible('skills')" :style="sectionStyle('skills')" v-bind="editAttrs('skills', 'skills')"><h2>Core skills</h2><p class="inline-list">{{ profile.skills.join(' · ') }}</p></section>
        <section v-if="visible('education')" :style="sectionStyle('education')" v-bind="editAttrs('education', 'education')"><h2>Education</h2><p v-for="item in profile.education" :key="item.id || `${item.title}-${item.place}`"><strong>{{ item.title }}</strong><br />{{ item.place }} · {{ item.period }}</p></section>
        <section v-if="visible('certificates')" :style="sectionStyle('certificates')" v-bind="editAttrs('education', 'certificates')"><h2>Certificates</h2><div class="credential-list"><p v-for="item in profile.certificates" :key="item.id || `${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><br />{{ item.issuer }} · {{ item.period }}</p></div></section>
        <section v-if="visible('languages')" :style="sectionStyle('languages')" v-bind="editAttrs('skills', 'languages')"><h2>Languages</h2><p class="inline-list">{{ profile.languages.join(' · ') }}</p></section>
      </div>
    </template>

    <template v-else-if="template.variant === 'creative'">
      <header class="creative-header" v-bind="editAttrs('profile')">
        <div class="creative-number">01</div>
        <div>
          <p class="cv-kicker">Portfolio résumé</p>
          <h1>{{ profile.name }}</h1>
          <h3>{{ profile.role }}</h3>
        </div>
        <div v-if="profile.avatar" class="cv-avatar creative-avatar"><img :src="profile.avatar" alt="" :style="avatarImageStyle" /></div>
        <div class="creative-contact"><span>{{ profile.email }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div>
      </header>
      <div class="creative-intro section-flow">
        <p v-if="visible('summary')" :style="sectionStyle('summary')" v-bind="editAttrs('profile', 'summary')">{{ profile.summary }}</p>
        <div v-if="visible('highlights')" class="highlight-strip" :style="sectionStyle('highlights')" v-bind="editAttrs('impact', 'highlights')"><div v-for="item in profile.highlights" :key="item.id || item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
      </div>
      <div class="creative-layout">
        <main class="section-flow">
          <section v-if="visible('experience')" :style="sectionStyle('experience')" v-bind="editAttrs('experience', 'experience')"><div class="label-row"><span>02</span><h2>Experience</h2></div>
            <article v-for="job in profile.experience" :key="job.id || `${job.role}-${job.company}`" class="experience-item creative-job">
              <div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><span>{{ job.period }}</span></div>
              <ul><li v-for="(bullet, bulletIndex) in job.bullets" :key="bulletIndex">{{ bullet }}</li></ul>
            </article>
          </section>
          <section v-if="visible('projects')" :style="sectionStyle('projects')" v-bind="editAttrs('projects', 'projects')"><div class="label-row"><span>03</span><h2>Selected projects</h2></div>
            <div class="creative-projects"><article v-for="project in profile.projects" :key="project.id || project.name"><div v-if="project.image" class="cv-project-cover creative-cover" :style="imageStyle(project.image)"></div><span>{{ project.type }}</span><h3>{{ project.name }}</h3><strong>{{ project.impact }}</strong><p>{{ project.description }}</p></article></div>
          </section>
        </main>
        <aside class="creative-aside section-flow">
          <div v-if="visible('skills')" :style="sectionStyle('skills')" v-bind="editAttrs('skills', 'skills')"><span class="aside-label">Capabilities</span><ul class="skill-list"><li v-for="(skill, skillIndex) in profile.skills" :key="skillIndex">{{ skill }}</li></ul></div>
          <div v-if="visible('education')" :style="sectionStyle('education')" v-bind="editAttrs('education', 'education')"><span class="aside-label">Education</span><article v-for="item in profile.education" :key="item.id || `${item.title}-${item.place}`"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></div>
          <div v-if="visible('certificates')" :style="sectionStyle('certificates')" v-bind="editAttrs('education', 'certificates')"><span class="aside-label">Certificates</span><article v-for="item in profile.certificates" :key="item.id || `${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><span>{{ item.issuer }}</span><small>{{ item.period }}</small></article></div>
          <div v-if="visible('languages')" :style="sectionStyle('languages')" v-bind="editAttrs('skills', 'languages')"><span class="aside-label">Languages</span><p v-for="(language, languageIndex) in profile.languages" :key="languageIndex">{{ language }}</p></div>
        </aside>
      </div>
    </template>

    <template v-else-if="template.variant === 'executive'">
      <header class="executive-header" v-bind="editAttrs('profile')">
        <div class="executive-identity"><div v-if="profile.avatar" class="cv-avatar executive-avatar"><img :src="profile.avatar" alt="" :style="avatarImageStyle" /></div><div><p class="cv-kicker">Curriculum vitae</p><h1>{{ profile.name }}</h1><h3>{{ profile.role }}</h3></div></div>
        <div class="executive-contact"><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div>
      </header>
      <div class="executive-rule"></div>
      <div class="executive-layout">
        <main class="section-flow">
          <section v-if="visible('summary')" class="executive-summary" :style="sectionStyle('summary')" v-bind="editAttrs('profile', 'summary')"><span>Profile</span><p>{{ profile.summary }}</p></section>
          <section v-if="visible('highlights')" :style="sectionStyle('highlights')" v-bind="editAttrs('impact', 'highlights')"><h2>Selected impact</h2><div class="executive-impact-grid"><div v-for="item in profile.highlights" :key="item.id || item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div></section>
          <section v-if="visible('experience')" :style="sectionStyle('experience')" v-bind="editAttrs('experience', 'experience')"><h2>Professional experience</h2><article v-for="job in profile.experience" :key="job.id || `${job.role}-${job.company}`" class="experience-item executive-job"><div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }} · {{ job.location }}</span></div><span>{{ job.period }}</span></div><ul><li v-for="(bullet, bulletIndex) in job.bullets" :key="bulletIndex">{{ bullet }}</li></ul></article></section>
          <section v-if="visible('projects')" :style="sectionStyle('projects')" v-bind="editAttrs('projects', 'projects')"><h2>Selected work</h2><article v-for="project in profile.projects" :key="project.id || project.name" class="executive-project"><div v-if="project.image" class="cv-project-cover executive-cover" :style="imageStyle(project.image)"></div><div><strong>{{ project.name }}</strong><span>{{ project.type }}</span></div><p>{{ project.description }}</p></article></section>
        </main>
        <aside class="section-flow">
          <section v-if="visible('skills')" :style="sectionStyle('skills')" v-bind="editAttrs('skills', 'skills')"><h2>Expertise</h2><ul class="executive-skills"><li v-for="(skill, skillIndex) in profile.skills" :key="skillIndex">{{ skill }}</li></ul></section>
          <section v-if="visible('education')" :style="sectionStyle('education')" v-bind="editAttrs('education', 'education')"><h2>Education</h2><article v-for="item in profile.education" :key="item.id || `${item.title}-${item.place}`"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></section>
          <section v-if="visible('certificates')" :style="sectionStyle('certificates')" v-bind="editAttrs('education', 'certificates')"><h2>Certificates</h2><article v-for="item in profile.certificates" :key="item.id || `${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><span>{{ item.issuer }}</span><small>{{ item.period }}</small></article></section>
          <section v-if="visible('languages')" :style="sectionStyle('languages')" v-bind="editAttrs('skills', 'languages')"><h2>Languages</h2><p v-for="(language, languageIndex) in profile.languages" :key="languageIndex">{{ language }}</p></section>
        </aside>
      </div>
    </template>

    <template v-else>
      <aside class="product-sidebar section-flow">
        <div class="profile-monogram" :class="{ 'has-avatar': profile.avatar }" v-bind="editAttrs('profile')"><img v-if="profile.avatar" :src="profile.avatar" alt="" :style="avatarImageStyle" /><span v-else>{{ monogram }}</span></div>
        <div v-bind="editAttrs('profile')"><p class="cv-kicker">Senior profile</p><h1>{{ profile.name }}</h1><h3>{{ profile.role }}</h3></div>
        <p v-if="visible('summary')" class="product-summary" :style="sectionStyle('summary')" v-bind="editAttrs('profile', 'summary')">{{ profile.summary }}</p>
        <div class="product-contact" v-bind="editAttrs('profile')"><span>{{ profile.location }}</span><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span></div>
        <section v-if="visible('skills')" :style="sectionStyle('skills')" v-bind="editAttrs('skills', 'skills')"><span class="aside-label">Core stack</span><ul class="product-skills"><li v-for="(skill, skillIndex) in profile.skills" :key="skillIndex">{{ skill }}</li></ul></section>
        <section v-if="visible('education')" :style="sectionStyle('education')" v-bind="editAttrs('education', 'education')"><span class="aside-label">Education</span><article v-for="item in profile.education" :key="item.id || `${item.title}-${item.place}`"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></section>
        <section v-if="visible('certificates')" :style="sectionStyle('certificates')" v-bind="editAttrs('education', 'certificates')"><span class="aside-label">Certificates</span><article v-for="item in profile.certificates" :key="item.id || `${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><span>{{ item.issuer }}</span><small>{{ item.period }}</small></article></section>
        <section v-if="visible('languages')" :style="sectionStyle('languages')" v-bind="editAttrs('skills', 'languages')"><span class="aside-label">Languages</span><p v-for="(language, languageIndex) in profile.languages" :key="languageIndex">{{ language }}</p></section>
      </aside>
      <main class="product-main section-flow">
        <div v-if="visible('highlights')" class="product-topline" :style="sectionStyle('highlights')" v-bind="editAttrs('impact', 'highlights')"><span>Selected impact</span><div class="product-highlights"><div v-for="item in profile.highlights" :key="item.id || item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div></div>
        <section v-if="visible('experience')" :style="sectionStyle('experience')" v-bind="editAttrs('experience', 'experience')"><div class="product-section-head"><span>01</span><h2>Experience</h2></div><article v-for="job in profile.experience" :key="job.id || `${job.role}-${job.company}`" class="experience-item product-job"><div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><span>{{ job.period }}</span></div><ul><li v-for="(bullet, bulletIndex) in job.bullets" :key="bulletIndex">{{ bullet }}</li></ul></article></section>
        <section v-if="visible('projects')" :style="sectionStyle('projects')" v-bind="editAttrs('projects', 'projects')"><div class="product-section-head"><span>02</span><h2>Selected work</h2></div><div class="product-projects"><article v-for="project in profile.projects" :key="project.id || project.name"><div v-if="project.image" class="cv-project-cover product-cover" :style="imageStyle(project.image)"></div><div><span>{{ project.type }}</span><strong>{{ project.name }}</strong></div><p>{{ project.description }}</p><small>{{ project.impact }}</small></article></div></section>
      </main>
    </template>
  </article>
</template>

<script>
import { getTemplateLayoutContract, getTemplateSectionConfig, isTemplateSectionVisible, sameTemplateSectionGroup } from '../data/template-layout-contracts'
import ExecutiveEdgeTemplate from './templates/ExecutiveEdgeTemplate.vue'
import SoftPortfolioTemplate from './templates/SoftPortfolioTemplate.vue'
import ProductOperatorTemplate from './templates/ProductOperatorTemplate.vue'
import CodeAwareTemplate from './templates/CodeAwareTemplate.vue'
import AtsPrecisionTemplate from './templates/AtsPrecisionTemplate.vue'
import InsightGridTemplate from './templates/InsightGridTemplate.vue'
import BrandMotionTemplate from './templates/BrandMotionTemplate.vue'
import RevenueDriverTemplate from './templates/RevenueDriverTemplate.vue'
import PeopleFirstTemplate from './templates/PeopleFirstTemplate.vue'
import NextStartTemplate from './templates/NextStartTemplate.vue'

const referenceTemplateMap = {
  'executive-edge': ExecutiveEdgeTemplate,
  'soft-portfolio-pro': SoftPortfolioTemplate,
  'product-operator': ProductOperatorTemplate,
  'code-aware': CodeAwareTemplate,
  'ats-precision': AtsPrecisionTemplate,
  'insight-grid': InsightGridTemplate,
  'brand-motion': BrandMotionTemplate,
  'revenue-driver': RevenueDriverTemplate,
  'people-first': PeopleFirstTemplate,
  'next-start': NextStartTemplate,
}

export default {
  name: 'CvDocument',
  props: {
    profile: { type: Object, required: true },
    template: { type: Object, required: true },
    accent: { type: String, required: true },
    appearance: {
      type: Object,
      default: () => ({ font: 'sans', density: 'balanced', radius: 'soft', projectLayout: 'cards', textScale: 1, headingScale: 1, sectionSpacing: 'balanced', avatarShape: 'circle', avatarSize: 'medium', avatarX: 50, avatarY: 50, avatarZoom: 1, avatarRotate: 0 }),
    },
    interactive: { type: Boolean, default: false },
  },
  emits: ['edit-section', 'reorder-section'],
  data() {
    return {
      dragSectionId: null,
      sectionDragJustEnded: false,
    }
  },
  computed: {
    referenceComponent() {
      return referenceTemplateMap[this.template?.id] || null
    },
    avatarImageStyle() {
      const x = Number.isFinite(Number(this.appearance?.avatarX)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarX))) : 50
      const y = Number.isFinite(Number(this.appearance?.avatarY)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarY))) : 50
      const zoom = Number.isFinite(Number(this.appearance?.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(this.appearance.avatarZoom))) : 1
      const rotate = Number.isFinite(Number(this.appearance?.avatarRotate)) ? Math.min(180, Math.max(-180, Number(this.appearance.avatarRotate))) : 0
      return {
        objectPosition: `${x}% ${y}%`,
        transform: `scale(${zoom}) rotate(${rotate}deg)`,
      }
    },
    printPolicyClass() {
      const policy=getTemplateLayoutContract(this.template?.id).print?.multiPage||'preserve-flow'
      return `print-${policy}`
    },
    appearanceClasses() {
      const font = ['sans', 'serif', 'mono'].includes(this.appearance?.font) ? this.appearance.font : 'sans'
      const density = ['compact', 'balanced', 'spacious'].includes(this.appearance?.density) ? this.appearance.density : 'balanced'
      const radius = ['sharp', 'soft', 'round'].includes(this.appearance?.radius) ? this.appearance.radius : 'soft'
      const projectLayout = ['cards', 'list'].includes(this.appearance?.projectLayout) ? this.appearance.projectLayout : 'cards'
      const spacing = ['compact', 'balanced', 'airy'].includes(this.appearance?.sectionSpacing) ? this.appearance.sectionSpacing : 'balanced'
      const textScale = Number.isFinite(Number(this.appearance?.textScale)) ? Math.round(Math.min(1.15, Math.max(.9, Number(this.appearance.textScale))) * 100) : 100
      const headingScale = Number.isFinite(Number(this.appearance?.headingScale)) ? Math.round(Math.min(1.2, Math.max(.9, Number(this.appearance.headingScale))) * 100) : 100
      const avatarShape = ['circle', 'rounded', 'square'].includes(this.appearance?.avatarShape) ? this.appearance.avatarShape : 'circle'
      const avatarSize = ['small', 'medium', 'large'].includes(this.appearance?.avatarSize) ? this.appearance.avatarSize : 'medium'
      return [
        `cv-font-${font}`,
        `cv-density-${density}`,
        `cv-radius-${radius}`,
        `cv-projects-${projectLayout}`,
        `cv-spacing-${spacing}`,
        `cv-text-${textScale}`,
        `cv-heading-${headingScale}`,
        `cv-avatar-${avatarShape}`,
        `cv-avatar-size-${avatarSize}`,
        this.printPolicyClass,
      ]
    },
    monogram() {
      return String(this.profile.name || 'CV').split(' ').filter(Boolean).slice(-2).map((word) => word.charAt(0)).join('')
    },
  },
  methods: {
    editAttrs(tab, sectionId = null) {
      const attrs = {}
      if (sectionId) attrs['data-section-id'] = sectionId
      if (!this.interactive) return attrs
      attrs['data-edit-section'] = tab
      attrs.tabindex = 0
      attrs.role = 'button'
      attrs['aria-label'] = `Edit ${tab} section`
      if (sectionId) attrs.draggable = 'true'
      return attrs
    },
    handleEditRequest(event) {
      if (!this.interactive || this.sectionDragJustEnded) return
      const target = event.target?.closest?.('[data-edit-section]')
      if (!target || !this.$el.contains(target)) return
      const tab = target.getAttribute('data-edit-section')
      if (tab) this.$emit('edit-section', tab)
    },
    handleEditKeydown(event) {
      if (!this.interactive || this.sectionDragJustEnded || !['Enter', ' '].includes(event.key)) return
      const target = event.target?.closest?.('[data-edit-section]')
      if (!target) return
      event.preventDefault()
      const tab = target.getAttribute('data-edit-section')
      if (tab) this.$emit('edit-section', tab)
    },
    clearSectionDragClasses() {
      if (!this.$el?.querySelectorAll) return
      this.$el.querySelectorAll('.is-section-dragging, .is-section-drop-target').forEach((node) => {
        node.classList.remove('is-section-dragging', 'is-section-drop-target')
      })
    },
    handleSectionDragStart(event) {
      if (!this.interactive) return
      const section = event.target?.closest?.('[data-section-id]')
      if (!section || !this.$el.contains(section)) return
      const sectionId = section.getAttribute('data-section-id')
      if (!sectionId) return
      this.dragSectionId = sectionId
      section.classList.add('is-section-dragging')
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', sectionId)
      }
    },
    handleSectionDragOver(event) {
      if (!this.interactive || !this.dragSectionId) return
      const section = event.target?.closest?.('[data-section-id]')
      if (!section || !this.$el.contains(section)) return
      const targetId = section.getAttribute('data-section-id')
      if (!targetId || targetId === this.dragSectionId || !sameTemplateSectionGroup(this.template?.id, this.dragSectionId, targetId)) return
      event.preventDefault()
      this.$el.querySelectorAll('.is-section-drop-target').forEach((node) => node.classList.remove('is-section-drop-target'))
      section.classList.add('is-section-drop-target')
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    },
    handleSectionDrop(event) {
      if (!this.interactive || !this.dragSectionId) return
      const section = event.target?.closest?.('[data-section-id]')
      const targetId = section?.getAttribute?.('data-section-id')
      if (!targetId || targetId === this.dragSectionId || !sameTemplateSectionGroup(this.template?.id, this.dragSectionId, targetId)) {
        this.handleSectionDragEnd()
        return
      }
      event.preventDefault()
      this.$emit('reorder-section', { source: this.dragSectionId, target: targetId })
      this.handleSectionDragEnd()
    },
    handleSectionDragEnd() {
      this.clearSectionDragClasses()
      this.dragSectionId = null
      this.sectionDragJustEnded = true
      window.setTimeout(() => { this.sectionDragJustEnded = false }, 0)
    },
    sectionConfig(id) {
      return (this.profile.sections || []).find((section) => section.id === id)
    },
    visible(id) { return isTemplateSectionVisible(this.profile, this.template?.id, id) },
    sectionStyle(id) {
      const index = (this.profile.sections || []).findIndex((section) => section.id === id)
      const config = getTemplateSectionConfig(this.template?.id, id)
      return { order: index === -1 ? 99 : index, '--layout-group': config.group }
    },
    imageStyle(url) {
      if (!url) return {}
      return { backgroundImage: `url("${String(url).replace(/"/g, '%22')}")` }
    },

  },
}
</script>
