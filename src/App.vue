<template>
  <div class="studio-shell" :class="{ 'focus-mode': focusMode }">
    <header class="topbar studio-only">
      <a class="brand" href="#top" aria-label="CV Studio home">
        <span class="brand-mark">CV</span>
        <span><strong>CV Studio</strong><small>Resume system for product & tech</small></span>
      </a>
      <div class="topbar-actions">
        <span class="shortcut-hint" aria-label="Keyboard shortcuts"><kbd>E</kbd> Edit <kbd>F</kbd> Focus <kbd>N</kbd> Next</span>
        <div class="history-controls" role="group" aria-label="Edit history">
          <button type="button" :disabled="!canUndo" :title="undoTitle" aria-label="Undo last change" @click="undo">↶</button>
          <button type="button" :disabled="!canRedo" :title="redoTitle" aria-label="Redo last change" @click="redo">↷</button>
        </div>
        <a class="ghost-button" href="#templates">Templates</a>
        <button class="completion-button" type="button" :aria-label="`Complete missing CV fields · ${completionPercent}% complete`" @click="runAutoComplete">
          <span>Complete gaps</span><strong>{{ completionPercent }}%</strong>
        </button>
        <button class="editor-trigger primary-button" type="button" @click="openEditor('profile')">Edit CV</button>
        <button class="ghost-button export-button" type="button" @click="printCv"><span>Export PDF</span><span aria-hidden="true">↗</span></button>
      </div>
    </header>

    <div v-if="autoCompleteResult" class="auto-complete-toast studio-only" role="status" aria-live="polite">
      <div>
        <strong>{{ autoCompleteResult.changedFields ? 'Auto-complete applied' : 'CV already complete' }}</strong>
        <span v-if="autoCompleteResult.changedFields">
          {{ autoCompleteResult.changedFields }} missing field{{ autoCompleteResult.changedFields === 1 ? '' : 's' }} filled · {{ autoCompleteResult.before }}% → {{ autoCompleteResult.after }}%
        </span>
        <span v-else>No missing content was detected.</span>
        <small v-if="autoCompleteResult.reviewRequired">Draft placeholders are marked [Review]. Replace them with verified personal facts before export.</small>
      </div>
      <button type="button" aria-label="Dismiss Auto-complete status" @click="autoCompleteResult = null">×</button>
    </div>

    <main id="top">
      <section class="hero studio-only">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> CV system · 2026 edition</div>
          <h1>One profile.<br /><em>Multiple CV directions.</em></h1>
          <p>A modern, code-aware resume studio built for Senior UI/UX, Product Design and technology roles. Pick a template, edit your profile, tune the accent and export an A4-ready CV.</p>
          <div class="hero-meta"><div><strong>{{ templates.length }}</strong><span>starter templates</span></div><div><strong>A4</strong><span>print-ready layout</span></div><div><strong>360°</strong><span>sample profile data</span></div></div>
        </div>
        <div class="hero-orbit" aria-hidden="true"><div class="orbit-card orbit-card-a"><span>01</span><b>ATS Precision</b></div><div class="orbit-card orbit-card-b"><span>02</span><b>Soft Portfolio</b></div><div class="orbit-card orbit-card-c"><span>03</span><b>Executive Edge</b></div><div class="hero-badge">A4<br /><small>PDF</small></div></div>
      </section>

      <section id="templates" class="workspace studio-only">
        <aside class="template-panel">
          <div class="section-heading"><div><span class="section-index">01</span><h2>Choose a direction</h2></div><p>Each template uses the same structured profile data, so content stays consistent.</p></div>
          <div class="role-avatar-panel">
            <div
              class="role-avatar-preview"
              :class="[{ empty: !candidate.avatar, dragging: avatarDragging }, avatarShapeClass]"
              @pointerdown="startAvatarDrag"
              @pointermove="moveAvatarDrag"
              @pointerup="endAvatarDrag"
              @pointercancel="endAvatarDrag"
            >
              <img v-if="candidate.avatar" :src="candidate.avatar" alt="" :style="avatarImageStyle" />
              <span v-else>{{ candidateInitials }}</span>
            </div>
            <div class="role-avatar-copy">
              <strong>Profile photo</strong>
              <span>Shared across all 4 role presets and CV templates.</span>
              <div class="role-avatar-actions">
                <label class="role-avatar-upload">
                  <input type="file" accept="image/jpeg,image/png,image/webp" @change="uploadQuickAvatar" />
                  {{ candidate.avatar ? 'Replace photo' : 'Upload photo' }}
                </label>
                <button v-if="candidate.avatar" type="button" class="role-avatar-remove" @click="removeQuickAvatar">Remove</button>
              </div>
              <div v-if="candidate.avatar" class="quick-avatar-framing">
                <div class="avatar-shape-segmented" role="group" aria-label="Avatar shape">
                  <button v-for="shape in avatarShapes" :key="shape.id" type="button" :class="{ active: avatarShape === shape.id }" :aria-pressed="avatarShape === shape.id" @click="updateAvatarAppearance('avatarShape', shape.id)">{{ shape.label }}</button>
                </div>
                <div class="avatar-size-segmented" role="group" aria-label="Avatar size">
                  <span>Size</span>
                  <button v-for="size in avatarSizes" :key="size.id" type="button" :class="{ active: avatarSize === size.id }" :aria-pressed="avatarSize === size.id" @click="updateAvatarAppearance('avatarSize', size.id)">{{ size.label }}</button>
                </div>
                <label><span>X</span><input type="range" min="0" max="100" :value="avatarX" @input="updateAvatarAppearance('avatarX', Number($event.target.value))" /></label>
                <label><span>Y</span><input type="range" min="0" max="100" :value="avatarY" @input="updateAvatarAppearance('avatarY', Number($event.target.value))" /></label>
                <label><span>Zoom</span><input type="range" min="100" max="250" :value="Math.round(avatarZoom * 100)" @input="updateAvatarAppearance('avatarZoom', Number($event.target.value) / 100)" /></label>
                <label><span>Rotate</span><input type="range" min="-180" max="180" :value="avatarRotate" @input="updateAvatarAppearance('avatarRotate', Number($event.target.value))" /></label>
                <button type="button" class="avatar-reset-frame" @click="resetAvatarFraming">Reset</button>
              </div>
              <small v-if="avatarError" class="role-avatar-error" role="alert">{{ avatarError }}</small>
            </div>
          </div>
          <div class="role-presets" aria-label="Role presets">
            <button v-for="preset in rolePresets" :key="preset.id" type="button" @click="applyRolePreset(preset)">
              <span class="role-preset-avatar" :class="[{ empty: !candidate.avatar }, avatarShapeClass]">
                <img v-if="candidate.avatar" :src="candidate.avatar" alt="" :style="avatarImageStyle" />
                <span v-else>{{ candidateInitials }}</span>
              </span>
              <span class="role-preset-copy">
                <strong>{{ preset.label }}</strong>
                <span>{{ preset.note }}</span>
              </span>
            </button>
          </div>
          <div class="category-tabs" role="tablist" aria-label="CV template categories">
            <button v-for="item in categories" :key="item" type="button" :class="['category-tab', { active: category === item }]" @click="category = item">{{ item }}</button>
          </div>
          <div class="template-grid">
            <button v-for="template in filteredTemplates" :key="template.id" type="button" :class="['template-card', { active: selectedId === template.id }]" @click="chooseTemplate(template)">
              <div class="template-thumb" :class="[`thumb-${template.variant}`, template.theme ? `thumb-theme-${template.theme}` : '']" :style="{ '--thumb-accent': template.accent }"><span class="thumb-sidebar"></span><span class="thumb-head"></span><span class="thumb-line line-a"></span><span class="thumb-line line-b"></span><span class="thumb-line line-c"></span></div>
              <span class="template-info">
                <span class="template-meta-row">
                  <span class="template-kicker">{{ template.category }}</span>
                  <span v-if="template.badge" class="template-badge">{{ template.badge }}</span>
                </span>
                <strong>{{ template.name }}</strong>
                <span v-if="template.role" class="template-role">{{ template.role }}</span>
                <span>{{ template.description }}</span>
              </span>
              <span class="template-check" aria-hidden="true">✓</span>
            </button>
          </div>
        </aside>

        <div class="preview-panel">
          <div class="preview-toolbar preview-toolbar-v3">
            <div class="preview-title"><span class="section-index">02</span><div><strong>Live preview</strong><small>{{ selectedTemplate.name }} · A4</small></div></div>
            <div class="preview-status"><span>A4</span><span>Auto-saved</span></div>
            <div class="preview-actions">
              <div class="quality-score" :style="{ '--score-angle': `${cvScore * 3.6}deg` }" :title="`CV quality score: ${cvScore}/100 · ${scoreLabel}`" aria-live="polite"><span class="score-ring"><span>{{ cvScore }}</span></span><span><strong>CV score</strong><small>{{ scoreLabel }}</small></span></div>
              <button class="cycle-control" type="button" title="Next template (N)" @click="cycleTemplate">Next style ↻</button>
              <button class="focus-control" :class="{ active: focusMode }" type="button" :aria-pressed="focusMode" title="Toggle focus preview (F)" @click="focusMode = !focusMode">{{ focusMode ? 'Exit focus' : 'Focus' }}</button>
              <label class="zoom-control toolbar-control"><span>Zoom</span><select :value="zoom" aria-label="CV preview zoom" @change="setZoom(Number($event.target.value))"><option :value="0.75">75%</option><option :value="0.85">85%</option><option :value="1">100%</option></select></label>
              <label class="color-control toolbar-control accent-toolbar"><span>Accent</span><input :value="accent" type="color" aria-label="Change CV accent color" @input="updateAccent($event.target.value)" /></label>
            </div>
          </div>
          <div class="preview-stage"><div class="preview-zoom" :style="{ '--preview-zoom': zoom }"><CvDocument
                :key="selectedTemplate.id"
                :profile="candidate"
                :template="selectedTemplate"
                :accent="accent"
                :appearance="appearance"
                :interactive="true"
                @edit-section="openEditor"
                @reorder-section="reorderSection"
              /></div></div>
        </div>
      </section>

      <section class="principles studio-only">
        <div class="section-heading compact"><div><span class="section-index">03</span><h2>Built as a design system</h2></div></div>
        <div class="principle-grid"><article><span>DATA</span><h3>Content separated from layout</h3><p>Edit one profile and every template updates consistently.</p></article><article><span>UX</span><h3>Readable before decorative</h3><p>Clear hierarchy, restrained density and strong recruiter scanning patterns.</p></article><article><span>CODE</span><h3>Template variants, not duplicated pages</h3><p>Shared renderer and reusable tokens keep future CV styles easy to maintain.</p></article><article><span>OUTPUT</span><h3>A4 and browser PDF ready</h3><p>Print rules remove the studio UI and preserve the selected CV document.</p></article></div>
      </section>

      <footer class="site-footer studio-only"><span>CV Studio · Vue 3.5.42 · Vite 8.3.0</span><span>Editable · Responsive · Motion-aware · Print ready</span></footer>
      <div class="print-only print-document"><CvDocument :profile="candidate" :template="selectedTemplate" :accent="accent" :appearance="appearance" /></div>
    </main>

    <ProfileEditor
      :open="editorOpen"
      :profile="candidate"
      :completion="completionPercent"
      :appearance="appearance"
      :template="selectedTemplate"
      :requested-tab="editorTab"
      :accent="accent"
      @close="editorOpen = false"
      @update-field="updateProfileField"
      @update-item="updateProfileItem"
      @update-array="updateProfileArray"
      @add-item="addProfileItem"
      @remove-item="removeProfileItem"
      @move-item="moveProfileItem"
      @update-appearance="updateAppearance"
      @update-accent="updateAccent"
      @reset="resetCandidate"
    />
  </div>
</template>

<script>
import CvDocument from './components/CvDocument.vue'
import ProfileEditor from './components/ProfileEditor.vue'
import { candidate as defaultCandidate, templates } from './data/cv'
import { autoCompleteCv, candidateCompletionReport } from './data/auto-complete-cv'
import { safeImageSource, sanitizeProfileMedia } from './security/safe-media'

const STORAGE_KEY = 'cv-studio-profile-v1'
const STUDIO_KEY = 'cv-studio-settings-v1'
const SAMPLE_VERSION_KEY = 'cv-studio-sample-version'
const SAMPLE_VERSION = '360-v1'
const cloneCandidate = () => JSON.parse(JSON.stringify(defaultCandidate))
const ITEM_FACTORIES = {
  highlights: () => ({ value: '10+', label: 'Meaningful outcome' }),
  experience: () => ({ role: 'Role title', company: 'Company', period: '2026 — Present', location: '', bullets: ['Describe your scope and measurable impact.'] }),
  projects: () => ({ name: 'New project', type: 'Product · Design', impact: 'Key measurable impact', description: 'Describe the problem, your role, the solution and what changed as a result.', image: '' }),
  education: () => ({ title: 'Program or degree', place: 'Institution', period: '2026' }),
  certificates: () => ({ title: 'Professional certificate', issuer: 'Issuer', period: '2026', url: '' }),
}

const isLegacyDemoProfile = (saved) => (
  saved &&
  saved.name === 'Nguyễn Minh Anh' &&
  saved.email === 'hello@example.com' &&
  saved.website === 'portfolio.example.com'
)

const hydrateCandidate = (saved) => {
  const base = cloneCandidate()
  if (!saved || typeof saved !== 'object') return sanitizeProfileMedia(base)
  const hydrated = { ...base, ...saved }
  if (!Array.isArray(saved.sections) || !saved.sections.length) hydrated.sections = base.sections
  if (!Array.isArray(saved.certificates)) hydrated.certificates = base.certificates
  if (!Array.isArray(saved.education)) hydrated.education = base.education
  if (!Array.isArray(saved.projects)) hydrated.projects = base.projects
  hydrated.projects = hydrated.projects.map((project) => ({ image: '', ...project }))
  if (typeof hydrated.avatar !== 'string') hydrated.avatar = ''
  return sanitizeProfileMedia(hydrated)
}

export default {
  name: 'App',
  components: { CvDocument, ProfileEditor },
  data() {
    return {
      candidate: sanitizeProfileMedia(cloneCandidate()),
      templates,
      selectedId: templates[0].id,
      category: 'All',
      accent: templates[0].accent,
      zoom: 0.85,
      appearance: { font: 'sans', density: 'balanced', radius: 'soft', projectLayout: 'cards', textScale: 1, headingScale: 1, sectionSpacing: 'balanced', avatarShape: 'circle', avatarSize: 'medium', avatarX: 50, avatarY: 50, avatarZoom: 1, avatarRotate: 0 },
      editorOpen: false,
      editorTab: 'profile',
      rolePresets: [
        { id: 'recruiter', label: 'Recruiter', note: 'ATS first', templateId: 'ats-precision', accent: '#15803D', appearance: { font: 'sans', density: 'compact', radius: 'sharp', projectLayout: 'list', textScale: .95, headingScale: .95, sectionSpacing: 'compact' } },
        { id: 'uiux', label: 'Senior UI/UX', note: 'Portfolio led', templateId: 'soft-portfolio-pro', accent: '#8B5CF6', appearance: { font: 'sans', density: 'balanced', radius: 'soft', projectLayout: 'cards', textScale: 1, headingScale: 1.05, sectionSpacing: 'balanced', avatarSize: 'large' } },
        { id: 'engineer', label: 'Design Engineer', note: 'Code aware', templateId: 'code-aware', accent: '#2563EB', appearance: { font: 'mono', density: 'compact', radius: 'sharp', projectLayout: 'list', textScale: .95, headingScale: 1, sectionSpacing: 'compact' } },
        { id: 'lead', label: 'Leadership', note: 'Outcome led', templateId: 'executive-edge', accent: '#B58A3A', appearance: { font: 'serif', density: 'spacious', radius: 'soft', projectLayout: 'list', textScale: 1, headingScale: 1.05, sectionSpacing: 'airy' } },
      ],
      focusMode: false,
      autoCompleteResult: null,
      avatarError: '',
      avatarShapes: [
        { id: 'circle', label: 'Circle' },
        { id: 'rounded', label: 'Rounded' },
        { id: 'square', label: 'Square' },
      ],
      avatarSizes: [
        { id: 'small', label: 'S' },
        { id: 'medium', label: 'M' },
        { id: 'large', label: 'L' },
      ],
      avatarDragging: false,
      avatarDragStart: null,
      undoStack: [],
      redoStack: [],
      historyCoalesceActive: false,
      historyCoalesceTimer: null,
      historyRestoring: false,
    }
  },
  computed: {
    categories() { return ['All'].concat(Array.from(new Set(this.templates.map((item) => item.category)))) },
    filteredTemplates() { return this.category === 'All' ? this.templates : this.templates.filter((item) => item.category === this.category) },
    selectedTemplate() { return this.templates.find((item) => item.id === this.selectedId) || this.templates[0] },
    candidateInitials() {
      return String(this.candidate.name || 'CV').split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
    },
    avatarShape() {
      return ['circle', 'rounded', 'square'].includes(this.appearance.avatarShape) ? this.appearance.avatarShape : 'circle'
    },
    avatarSize() {
      return ['small', 'medium', 'large'].includes(this.appearance.avatarSize) ? this.appearance.avatarSize : 'medium'
    },
    avatarX() {
      return Number.isFinite(Number(this.appearance.avatarX)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarX))) : 50
    },
    avatarY() {
      return Number.isFinite(Number(this.appearance.avatarY)) ? Math.min(100, Math.max(0, Number(this.appearance.avatarY))) : 50
    },
    avatarZoom() {
      return Number.isFinite(Number(this.appearance.avatarZoom)) ? Math.min(2.5, Math.max(1, Number(this.appearance.avatarZoom))) : 1
    },
    avatarRotate() {
      return Number.isFinite(Number(this.appearance.avatarRotate)) ? Math.min(180, Math.max(-180, Number(this.appearance.avatarRotate))) : 0
    },
    avatarShapeClass() {
      return `avatar-shape-${this.avatarShape}`
    },
    avatarImageStyle() {
      return {
        objectPosition: `${this.avatarX}% ${this.avatarY}%`,
        transform: `scale(${this.avatarZoom}) rotate(${this.avatarRotate}deg)`,
      }
    },
    canUndo() { return this.undoStack.length > 0 },
    canRedo() { return this.redoStack.length > 0 },
    undoTitle() { return this.canUndo ? `Undo · ${this.undoStack[this.undoStack.length - 1].label}` : 'Nothing to undo' },
    redoTitle() { return this.canRedo ? `Redo · ${this.redoStack[this.redoStack.length - 1].label}` : 'Nothing to redo' },
    completionPercent() { return candidateCompletionReport(this.candidate).percent },
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
    selectedId: 'persistStudioSettings',
    accent: 'persistStudioSettings',
    zoom: 'persistStudioSettings',
    appearance: { deep: true, handler: 'persistStudioSettings' },
  },
  mounted() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      const sampleVersion = localStorage.getItem(SAMPLE_VERSION_KEY)
      const shouldUpgradeLegacyDemo = isLegacyDemoProfile(saved) && sampleVersion !== SAMPLE_VERSION
      this.candidate = hydrateCandidate(shouldUpgradeLegacyDemo ? null : saved)
      localStorage.setItem(SAMPLE_VERSION_KEY, SAMPLE_VERSION)
      const studioSettings = JSON.parse(localStorage.getItem(STUDIO_KEY) || '{}')
      if (this.templates.some((item) => item.id === studioSettings.selectedId)) this.selectedId = studioSettings.selectedId
      if (typeof studioSettings.accent === 'string') this.accent = studioSettings.accent
      if ([0.75, 0.85, 1].includes(studioSettings.zoom)) this.zoom = studioSettings.zoom
      if (studioSettings.appearance && typeof studioSettings.appearance === 'object') {
        this.appearance = { ...this.appearance, ...studioSettings.appearance }
      }
    } catch (error) { console.warn('Unable to restore saved CV Studio state.', error); this.candidate = sanitizeProfileMedia(cloneCandidate()) }
    window.addEventListener('keydown', this.handleShortcut)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleShortcut)
    window.clearTimeout(this.historyCoalesceTimer)
  },
  methods: {
    openEditor(tab = 'profile') {
      const allowed = ['profile', 'impact', 'experience', 'projects', 'education', 'skills', 'design', 'layout']
      this.editorTab = allowed.includes(tab) ? tab : 'profile'
      this.editorOpen = true
    },
    async uploadQuickAvatar(event) {
      const file = event.target.files?.[0]
      if (!file) return
      try {
        const image = await this.compressAvatar(file)
        this.checkpointHistory('Upload profile photo')
        this.candidate.avatar = safeImageSource(image)
        this.avatarError = ''
      } catch (error) {
        this.avatarError = error.message || 'Unable to process this image.'
      } finally {
        event.target.value = ''
      }
    },
    removeQuickAvatar() {
      this.checkpointHistory('Remove profile photo')
      this.candidate.avatar = ''
      this.avatarError = ''
    },
    updateAvatarAppearance(key, value) {
      if (!['avatarShape', 'avatarSize', 'avatarX', 'avatarY', 'avatarZoom', 'avatarRotate'].includes(key)) return
      this.checkpointHistory('Adjust profile photo', { coalesce: true })
      this.appearance = { ...this.appearance, [key]: value }
    },
    resetAvatarFraming() {
      this.checkpointHistory('Reset profile photo framing')
      this.appearance = { ...this.appearance, avatarShape: 'circle', avatarSize: 'medium', avatarX: 50, avatarY: 50, avatarZoom: 1, avatarRotate: 0 }
    },
    startAvatarDrag(event) {
      if (!this.candidate.avatar || event.button !== 0) return
      const target = event.currentTarget
      this.checkpointHistory('Move profile photo')
      const rect = target.getBoundingClientRect()
      this.avatarDragging = true
      this.avatarDragStart = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        x: this.avatarX,
        y: this.avatarY,
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      }
      target.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    },
    moveAvatarDrag(event) {
      if (!this.avatarDragging || !this.avatarDragStart || event.pointerId !== this.avatarDragStart.pointerId) return
      const dx = event.clientX - this.avatarDragStart.clientX
      const dy = event.clientY - this.avatarDragStart.clientY
      const nextX = Math.min(100, Math.max(0, this.avatarDragStart.x - (dx / this.avatarDragStart.width) * 100 / this.avatarZoom))
      const nextY = Math.min(100, Math.max(0, this.avatarDragStart.y - (dy / this.avatarDragStart.height) * 100 / this.avatarZoom))
      this.appearance = { ...this.appearance, avatarX: Math.round(nextX), avatarY: Math.round(nextY) }
    },
    endAvatarDrag(event) {
      if (!this.avatarDragging) return
      event.currentTarget?.releasePointerCapture?.(event.pointerId)
      this.avatarDragging = false
      this.avatarDragStart = null
    },
    compressAvatar(file) {
      if (!file.type.startsWith('image/')) return Promise.reject(new Error('Please choose an image file.'))
      if (file.size > 10 * 1024 * 1024) return Promise.reject(new Error('Image is too large. Please choose a file under 10 MB.'))

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Unable to read this image.'))
        reader.onload = () => {
          const image = new Image()
          image.onerror = () => reject(new Error('This image format could not be decoded.'))
          image.onload = () => {
            const maxDimension = 720
            const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
            const width = Math.max(1, Math.round(image.naturalWidth * scale))
            const height = Math.max(1, Math.round(image.naturalHeight * scale))
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const context = canvas.getContext('2d')
            if (!context) return reject(new Error('Image processing is not available in this browser.'))
            context.imageSmoothingEnabled = true
            context.imageSmoothingQuality = 'high'
            context.drawImage(image, 0, 0, width, height)
            resolve(canvas.toDataURL('image/webp', 0.82))
          }
          image.src = reader.result
        }
        reader.readAsDataURL(file)
      })
    },
    applyRolePreset(preset) {
      this.checkpointHistory(`Apply ${preset.label} preset`)
      const template = this.templates.find((item) => item.id === preset.templateId)
      if (template) this.selectedId = template.id
      if (typeof preset.accent === 'string') this.accent = preset.accent
      if (preset.appearance) this.appearance = { ...this.appearance, ...preset.appearance }
      this.category = 'All'
    },
    chooseTemplate(template, recordHistory = true) {
      if (recordHistory) this.checkpointHistory(`Choose ${template.name}`)
      this.selectedId = template.id
      this.accent = template.accent
    },
    cycleTemplate() {
      const currentIndex = this.templates.findIndex((item) => item.id === this.selectedId)
      const nextTemplate = this.templates[(currentIndex + 1) % this.templates.length]
      this.category = 'All'
      this.chooseTemplate(nextTemplate)
    },
    runAutoComplete() {
      this.checkpointHistory('Auto-complete CV')
      const result = autoCompleteCv(this.candidate, cloneCandidate())
      this.candidate = sanitizeProfileMedia(result.profile)
      this.autoCompleteResult = result.summary
      if (result.summary.changedFields) this.openEditor('profile')
    },
    handleShortcut(event) {
      const target = event.target
      const isTyping = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      const key = event.key.toLowerCase()
      if ((event.metaKey || event.ctrlKey) && !event.altKey && key === 'z' && !isTyping) {
        event.preventDefault()
        if (event.shiftKey) this.redo()
        else this.undo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && !event.altKey && key === 'y' && !isTyping) {
        event.preventDefault()
        this.redo()
        return
      }
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return
      if (key === 'e') this.openEditor('profile')
      else if (key === 'f') this.focusMode = !this.focusMode
      else if (key === 'n') this.cycleTemplate()
      else if (key === 'p') { event.preventDefault(); this.printCv() }
      else if (key === 'escape') { this.editorOpen = false; this.focusMode = false }
    },
    captureStudioState() {
      return {
        candidate: JSON.parse(JSON.stringify(this.candidate)),
        selectedId: this.selectedId,
        accent: this.accent,
        zoom: this.zoom,
        appearance: JSON.parse(JSON.stringify(this.appearance)),
      }
    },
    restoreStudioState(state) {
      if (!state) return
      this.historyRestoring = true
      this.candidate = sanitizeProfileMedia(JSON.parse(JSON.stringify(state.candidate)))
      if (this.templates.some((item) => item.id === state.selectedId)) this.selectedId = state.selectedId
      if (typeof state.accent === 'string') this.accent = state.accent
      if ([0.75, 0.85, 1].includes(state.zoom)) this.zoom = state.zoom
      if (state.appearance && typeof state.appearance === 'object') this.appearance = { ...this.appearance, ...JSON.parse(JSON.stringify(state.appearance)) }
      this.$nextTick(() => { this.historyRestoring = false })
    },
    checkpointHistory(label, { coalesce = false } = {}) {
      if (this.historyRestoring) return
      if (!coalesce || !this.historyCoalesceActive) {
        this.undoStack.push({ label, state: this.captureStudioState() })
        if (this.undoStack.length > 30) this.undoStack.shift()
        this.redoStack = []
      }
      window.clearTimeout(this.historyCoalesceTimer)
      if (coalesce) {
        this.historyCoalesceActive = true
        this.historyCoalesceTimer = window.setTimeout(() => { this.historyCoalesceActive = false }, 500)
      } else {
        this.historyCoalesceActive = false
      }
    },
    flushHistoryCoalesce() {
      window.clearTimeout(this.historyCoalesceTimer)
      this.historyCoalesceTimer = null
      this.historyCoalesceActive = false
    },
    undo() {
      if (!this.undoStack.length) return
      this.flushHistoryCoalesce()
      const entry = this.undoStack.pop()
      this.redoStack.push({ label: entry.label, state: this.captureStudioState() })
      if (this.redoStack.length > 30) this.redoStack.shift()
      this.restoreStudioState(entry.state)
    },
    redo() {
      if (!this.redoStack.length) return
      this.flushHistoryCoalesce()
      const entry = this.redoStack.pop()
      this.undoStack.push({ label: entry.label, state: this.captureStudioState() })
      if (this.undoStack.length > 30) this.undoStack.shift()
      this.restoreStudioState(entry.state)
    },
    setZoom(value) {
      if (![0.75, 0.85, 1].includes(value) || value === this.zoom) return
      this.checkpointHistory('Change preview zoom')
      this.zoom = value
    },
    updateAccent(value) {
      if (typeof value !== 'string' || value === this.accent) return
      this.checkpointHistory('Change accent color', { coalesce: true })
      this.accent = value
    },
    persistStudioSettings() {
      try {
        localStorage.setItem(STUDIO_KEY, JSON.stringify({
          selectedId: this.selectedId,
          accent: this.accent,
          zoom: this.zoom,
          appearance: this.appearance,
        }))
      } catch (error) {
        console.warn('Unable to persist CV Studio settings.', error)
      }
    },
    updateAppearance({ key, value }) {
      if (!['font', 'density', 'radius', 'projectLayout', 'textScale', 'headingScale', 'sectionSpacing', 'avatarShape', 'avatarSize', 'avatarX', 'avatarY', 'avatarZoom', 'avatarRotate'].includes(key)) return
      this.checkpointHistory('Change CV appearance', { coalesce: ['avatarX', 'avatarY', 'avatarZoom', 'avatarRotate'].includes(key) })
      this.appearance = { ...this.appearance, [key]: value }
    },
    updateProfileField({ key, value }) {
      if (!Object.prototype.hasOwnProperty.call(this.candidate, key)) return
      this.checkpointHistory(`Edit ${key}`, { coalesce: key !== 'avatar' })
      this.candidate[key] = key === 'avatar' ? safeImageSource(value) : value
    },
    updateProfileItem({ section, index, key, value }) {
      const collection = this.candidate[section]
      if (!Array.isArray(collection) || !collection[index] || typeof collection[index] !== 'object') return
      this.checkpointHistory(`Edit ${section}`, { coalesce: key !== 'image' })
      collection[index][key] = section === 'projects' && key === 'image' ? safeImageSource(value) : value
    },
    updateProfileArray({ key, value }) {
      if (!Array.isArray(this.candidate[key]) || !Array.isArray(value)) return
      this.checkpointHistory(`Edit ${key}`, { coalesce: true })
      this.candidate[key] = value
    },
    addProfileItem({ section }) {
      const factory = ITEM_FACTORIES[section]
      if (!factory || !Array.isArray(this.candidate[section])) return
      this.checkpointHistory(`Add ${section} item`)
      this.candidate[section].push(factory())
    },
    removeProfileItem({ section, index }) {
      if (!Array.isArray(this.candidate[section])) return
      this.checkpointHistory(`Remove ${section} item`)
      this.candidate[section].splice(index, 1)
    },
    moveProfileItem({ section, index, direction }) {
      const collection = this.candidate[section]
      if (!Array.isArray(collection)) return
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= collection.length) return
      this.checkpointHistory(`Reorder ${section}`)
      const [item] = collection.splice(index, 1)
      collection.splice(nextIndex, 0, item)
    },
    reorderSection({ source, target }) {
      if (!source || !target || source === target || !Array.isArray(this.candidate.sections)) return
      const sourceIndex = this.candidate.sections.findIndex((section) => section.id === source)
      const targetIndex = this.candidate.sections.findIndex((section) => section.id === target)
      if (sourceIndex < 0 || targetIndex < 0) return
      this.checkpointHistory('Reorder CV sections')
      const sections = [...this.candidate.sections]
      const [moved] = sections.splice(sourceIndex, 1)
      sections.splice(targetIndex, 0, moved)
      this.candidate.sections = sections
    },
    resetCandidate() {
      this.checkpointHistory('Reset CV')
      this.candidate = sanitizeProfileMedia(cloneCandidate())
      this.autoCompleteResult = null
      try {
        localStorage.setItem(SAMPLE_VERSION_KEY, SAMPLE_VERSION)
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) { console.warn('Unable to clear saved CV profile.', error) }
    },
    resetPrintFit() {
      const sheet = document.querySelector('.preview-stage .cv-sheet')
      if (!sheet) return
      sheet.style.removeProperty('--print-fit')
      sheet.style.removeProperty('--print-width')
      sheet.style.removeProperty('--print-min-height')
    },
    preparePrintFit() {
      const sheet = document.querySelector('.preview-stage .cv-sheet')
      if (!sheet) return 1
      this.resetPrintFit()
      const a4HeightPx = 1123
      const measuredHeight = Math.max(a4HeightPx, sheet.scrollHeight, sheet.offsetHeight)
      const fit = Math.max(0.68, Math.min(1, a4HeightPx / measuredHeight))
      sheet.style.setProperty('--print-fit', fit.toFixed(4))
      sheet.style.setProperty('--print-width', `${(210 / fit).toFixed(2)}mm`)
      sheet.style.setProperty('--print-min-height', `${(297 / fit).toFixed(2)}mm`)
      sheet.dataset.printFit = fit.toFixed(4)
      return fit
    },
    printCv() {
      this.preparePrintFit()
      window.print()
      window.setTimeout(() => this.resetPrintFit(), 0)
    },
  },
}
</script>
