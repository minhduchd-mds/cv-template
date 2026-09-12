<template>
  <div class="studio-shell" :class="{ 'focus-mode': focusMode }">
    <header class="topbar studio-only">
      <a class="brand" href="#top" aria-label="CV Studio home">
        <span class="brand-mark">CV</span>
        <span><strong>CV Studio</strong><small>Resume system for product & tech</small></span>
      </a>
      <div class="topbar-actions">
        <span class="shortcut-hint" aria-label="Keyboard shortcuts"><kbd>E</kbd> Edit <kbd>F</kbd> Focus <kbd>N</kbd> Next</span>
        <a class="ghost-button" href="#templates">Templates</a>
        <button class="editor-trigger" type="button" @click="editorOpen = true">Edit CV</button>
        <button class="primary-button" type="button" @click="printCv"><span>Export / Print PDF</span><span aria-hidden="true">↗</span></button>
      </div>
    </header>

    <main id="top">
      <section class="hero studio-only">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> CV system · 2026 edition</div>
          <h1>One profile.<br /><em>Multiple CV directions.</em></h1>
          <p>A modern, code-aware resume studio built for Senior UI/UX, Product Design and technology roles. Pick a template, edit your profile, tune the accent and export an A4-ready CV.</p>
          <div class="hero-meta"><div><strong>6</strong><span>starter templates</span></div><div><strong>A4</strong><span>print-ready layout</span></div><div><strong>1</strong><span>shared editable profile</span></div></div>
        </div>
        <div class="hero-orbit" aria-hidden="true"><div class="orbit-card orbit-card-a"><span>01</span><b>ATS Clean</b></div><div class="orbit-card orbit-card-b"><span>02</span><b>Product</b></div><div class="orbit-card orbit-card-c"><span>03</span><b>Design Engineer</b></div><div class="hero-badge">A4<br /><small>PDF</small></div></div>
      </section>

      <section id="templates" class="workspace studio-only">
        <aside class="template-panel">
          <div class="section-heading"><div><span class="section-index">01</span><h2>Choose a direction</h2></div><p>Each template uses the same structured profile data, so content stays consistent.</p></div>
          <div class="category-tabs" role="tablist" aria-label="CV template categories">
            <button v-for="item in categories" :key="item" type="button" :class="['category-tab', { active: category === item }]" @click="category = item">{{ item }}</button>
          </div>
          <div class="template-grid">
            <button v-for="template in filteredTemplates" :key="template.id" type="button" :class="['template-card', { active: selectedId === template.id }]" @click="chooseTemplate(template)">
              <div class="template-thumb" :class="[`thumb-${template.variant}`, template.theme ? `thumb-theme-${template.theme}` : '']" :style="{ '--thumb-accent': template.accent }"><span class="thumb-sidebar"></span><span class="thumb-head"></span><span class="thumb-line line-a"></span><span class="thumb-line line-b"></span><span class="thumb-line line-c"></span></div>
              <span class="template-info"><span class="template-kicker">{{ template.category }}</span><strong>{{ template.name }}</strong><span>{{ template.description }}</span></span><span class="template-check" aria-hidden="true">✓</span>
            </button>
          </div>
        </aside>

        <div class="preview-panel">
          <div class="preview-toolbar">
            <div><span class="section-index">02</span><div><strong>Live preview</strong><small>{{ selectedTemplate.name }} · A4</small></div></div>
            <div class="preview-actions">
              <div class="quality-score" :style="{ '--score-angle': `${cvScore * 3.6}deg` }" :title="`CV quality score: ${cvScore}/100 · ${scoreLabel}`" aria-live="polite"><span class="score-ring"><span>{{ cvScore }}</span></span><span><strong>CV score</strong><small>{{ scoreLabel }}</small></span></div>
              <button class="cycle-control" type="button" title="Next template (N)" @click="cycleTemplate">Next style ↻</button>
              <button class="focus-control" :class="{ active: focusMode }" type="button" :aria-pressed="focusMode" title="Toggle focus preview (F)" @click="focusMode = !focusMode">{{ focusMode ? 'Exit focus' : 'Focus' }}</button>
              <label class="zoom-control"><span>Zoom</span><select v-model.number="zoom" aria-label="CV preview zoom"><option :value="0.75">75%</option><option :value="0.85">85%</option><option :value="1">100%</option></select></label>
              <label class="color-control"><span>Accent</span><input v-model="accent" type="color" aria-label="Change CV accent color" /></label>
            </div>
          </div>
          <div class="preview-stage"><div class="preview-zoom" :style="{ '--preview-zoom': zoom }"><CvDocument :key="selectedTemplate.id" :profile="candidate" :template="selectedTemplate" :accent="accent" /></div></div>
        </div>
      </section>

      <section class="principles studio-only">
        <div class="section-heading compact"><div><span class="section-index">03</span><h2>Built as a design system</h2></div></div>
        <div class="principle-grid"><article><span>DATA</span><h3>Content separated from layout</h3><p>Edit one profile and every template updates consistently.</p></article><article><span>UX</span><h3>Readable before decorative</h3><p>Clear hierarchy, restrained density and strong recruiter scanning patterns.</p></article><article><span>CODE</span><h3>Template variants, not duplicated pages</h3><p>Shared renderer and reusable tokens keep future CV styles easy to maintain.</p></article><article><span>OUTPUT</span><h3>A4 and browser PDF ready</h3><p>Print rules remove the studio UI and preserve the selected CV document.</p></article></div>
      </section>

      <footer class="site-footer studio-only"><span>CV Studio · Vue 3.5.42 · Vite 8.3.0</span><span>Editable · Responsive · Motion-aware · Print ready</span></footer>
      <div class="print-only print-document"><CvDocument :profile="candidate" :template="selectedTemplate" :accent="accent" /></div>
    </main>

    <ProfileEditor
      :open="editorOpen"
      :profile="candidate"
      @close="editorOpen = false"
      @update-field="updateProfileField"
      @update-item="updateProfileItem"
      @update-array="updateProfileArray"
      @add-item="addProfileItem"
      @remove-item="removeProfileItem"
      @move-item="moveProfileItem"
      @reset="resetCandidate"
    />
  </div>
</template>

<script>
import CvDocument from './components/CvDocument.vue'
import ProfileEditor from './components/ProfileEditor.vue'
import { candidate as defaultCandidate, templates } from './data/cv'

const STORAGE_KEY = 'cv-studio-profile-v1'
const STUDIO_KEY = 'cv-studio-settings-v1'
const cloneCandidate = () => JSON.parse(JSON.stringify(defaultCandidate))
const ITEM_FACTORIES = {
  highlights: () => ({ value: '10+', label: 'Meaningful outcome' }),
  experience: () => ({ role: 'Role title', company: 'Company', period: '2026 — Present', location: '', bullets: ['Describe your scope and measurable impact.'] }),
  projects: () => ({ name: 'New project', type: 'Product · Design', impact: 'Key measurable impact', description: 'Describe the problem, your role, the solution and what changed as a result.', image: '' }),
  education: () => ({ title: 'Program or degree', place: 'Institution', period: '2026' }),
  certificates: () => ({ title: 'Professional certificate', issuer: 'Issuer', period: '2026', url: '' }),
}

const hydrateCandidate = (saved) => {
  const base = cloneCandidate()
  if (!saved || typeof saved !== 'object') return base
  const hydrated = { ...base, ...saved }
  if (!Array.isArray(saved.sections) || !saved.sections.length) hydrated.sections = base.sections
  if (!Array.isArray(saved.certificates)) hydrated.certificates = base.certificates
  if (!Array.isArray(saved.education)) hydrated.education = base.education
  if (!Array.isArray(saved.projects)) hydrated.projects = base.projects
  hydrated.projects = hydrated.projects.map((project) => ({ image: '', ...project }))
  if (typeof hydrated.avatar !== 'string') hydrated.avatar = ''
  return hydrated
}

export default {
  name: 'App',
  components: { CvDocument, ProfileEditor },
  data() {
    return { candidate: cloneCandidate(), templates, selectedId: templates[0].id, category: 'All', accent: templates[0].accent, zoom: 0.85, editorOpen: false, focusMode: false }
  },
  computed: {
    categories() { return ['All'].concat(Array.from(new Set(this.templates.map((item) => item.category)))) },
    filteredTemplates() { return this.category === 'All' ? this.templates : this.templates.filter((item) => item.category === this.category) },
    selectedTemplate() { return this.templates.find((item) => item.id === this.selectedId) || this.templates[0] },
    cvScore() {
      const profile = this.candidate
      let score = 0
      const contactFields = ['name', 'role', 'location', 'email', 'phone', 'website']
      score += contactFields.filter((key) => String(profile[key] || '').trim()).length * 5
      if (String(profile.summary || '').trim().length >= 80) score += 10
      if ((profile.experience || []).length >= 1) score += 10
      if ((profile.experience || []).length >= 2) score += 5
      if ((profile.projects || []).length >= 1) score += 10
      if ((profile.projects || []).length >= 3) score += 5
      if ((profile.skills || []).length >= 5) score += 10
      if ((profile.skills || []).length >= 10) score += 5
      if ((profile.education || []).length >= 1) score += 5
      if ((profile.certificates || []).length >= 1) score += 5
      if ((profile.languages || []).length >= 1) score += 5
      if ((profile.highlights || []).length >= 2) score += 5
      return Math.min(score, 100)
    },
    scoreLabel() { if (this.cvScore >= 90) return 'Excellent'; if (this.cvScore >= 80) return 'Strong'; if (this.cvScore >= 65) return 'Good base'; return 'Needs detail' },
  },
  watch: {
    candidate: { deep: true, handler(value) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)) } catch (error) { console.warn('Unable to persist CV profile locally. Uploaded images may exceed browser storage.', error) } } },
    selectedId: 'persistStudioSettings', accent: 'persistStudioSettings', zoom: 'persistStudioSettings',
  },
  mounted() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      this.candidate = hydrateCandidate(saved)
      const studioSettings = JSON.parse(localStorage.getItem(STUDIO_KEY) || '{}')
      if (this.templates.some((item) => item.id === studioSettings.selectedId)) this.selectedId = studioSettings.selectedId
      if (typeof studioSettings.accent === 'string') this.accent = studioSettings.accent
      if ([0.75, 0.85, 1].includes(studioSettings.zoom)) this.zoom = studioSettings.zoom
    } catch (error) { console.warn('Unable to restore saved CV Studio state.', error); this.candidate = cloneCandidate() }
    window.addEventListener('keydown', this.handleShortcut)
  },
  beforeUnmount() { window.removeEventListener('keydown', this.handleShortcut) },
  methods: {
    chooseTemplate(template) { this.selectedId = template.id; this.accent = template.accent },
    cycleTemplate() { const currentIndex = this.templates.findIndex((item) => item.id === this.selectedId); const nextTemplate = this.templates[(currentIndex + 1) % this.templates.length]; this.category = 'All'; this.chooseTemplate(nextTemplate) },
    handleShortcut(event) {
      const target = event.target
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return
      const key = event.key.toLowerCase()
      if (key === 'e') this.editorOpen = true
      else if (key === 'f') this.focusMode = !this.focusMode
      else if (key === 'n') this.cycleTemplate()
      else if (key === 'p') { event.preventDefault(); this.printCv() }
      else if (key === 'escape') { this.editorOpen = false; this.focusMode = false }
    },
    persistStudioSettings() { try { localStorage.setItem(STUDIO_KEY, JSON.stringify({ selectedId: this.selectedId, accent: this.accent, zoom: this.zoom })) } catch (error) { console.warn('Unable to persist CV Studio settings.', error) } },
    updateProfileField({ key, value }) { if (Object.prototype.hasOwnProperty.call(this.candidate, key)) this.candidate[key] = value },
    updateProfileItem({ section, index, key, value }) {
      const collection = this.candidate[section]
      if (Array.isArray(collection) && collection[index] && typeof collection[index] === 'object') collection[index][key] = value
    },
    updateProfileArray({ key, value }) { if (Array.isArray(this.candidate[key]) && Array.isArray(value)) this.candidate[key] = value },
    addProfileItem({ section }) { const factory = ITEM_FACTORIES[section]; if (factory && Array.isArray(this.candidate[section])) this.candidate[section].push(factory()) },
    removeProfileItem({ section, index }) { if (Array.isArray(this.candidate[section])) this.candidate[section].splice(index, 1) },
    moveProfileItem({ section, index, direction }) {
      const collection = this.candidate[section]
      if (!Array.isArray(collection)) return
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= collection.length) return
      const [item] = collection.splice(index, 1)
      collection.splice(nextIndex, 0, item)
    },
    resetCandidate() { this.candidate = cloneCandidate(); try { localStorage.removeItem(STORAGE_KEY) } catch (error) { console.warn('Unable to clear saved CV profile.', error) } },
    printCv() { window.print() },
  },
}
</script>
