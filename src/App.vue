<template>
  <div class="studio-shell" :class="{ 'focus-mode': focusMode }">
    <header class="topbar studio-only">
      <a class="brand" href="#top" aria-label="CV Studio home">
        <span class="brand-mark">CV</span>
        <span>
          <strong>CV Studio</strong>
          <small>Resume system for product & tech</small>
        </span>
      </a>
      <div class="topbar-actions">
        <span class="shortcut-hint" aria-label="Keyboard shortcuts">
          <kbd>E</kbd> Edit
          <kbd>F</kbd> Focus
          <kbd>N</kbd> Next
        </span>
        <a class="ghost-button" href="#templates">Templates</a>
        <button class="editor-trigger" type="button" @click="editorOpen = true">Edit profile</button>
        <button class="primary-button" type="button" @click="printCv">
          <span>Export / Print PDF</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </header>

    <main id="top">
      <section class="hero studio-only">
        <div class="hero-copy">
          <div class="eyebrow"><span></span> CV system · 2026 edition</div>
          <h1>One profile.<br /><em>Multiple CV directions.</em></h1>
          <p>
            A modern, code-aware resume studio built for Senior UI/UX, Product Design and technology roles.
            Pick a template, edit your profile, tune the accent and export an A4-ready CV.
          </p>
          <div class="hero-meta">
            <div><strong>6</strong><span>starter templates</span></div>
            <div><strong>A4</strong><span>print-ready layout</span></div>
            <div><strong>1</strong><span>shared editable profile</span></div>
          </div>
        </div>
        <div class="hero-orbit" aria-hidden="true">
          <div class="orbit-card orbit-card-a"><span>01</span><b>ATS Clean</b></div>
          <div class="orbit-card orbit-card-b"><span>02</span><b>Product</b></div>
          <div class="orbit-card orbit-card-c"><span>03</span><b>Design Engineer</b></div>
          <div class="hero-badge">A4<br /><small>PDF</small></div>
        </div>
      </section>

      <section id="templates" class="workspace studio-only">
        <aside class="template-panel">
          <div class="section-heading">
            <div>
              <span class="section-index">01</span>
              <h2>Choose a direction</h2>
            </div>
            <p>Each template uses the same structured profile data, so content stays consistent.</p>
          </div>

          <div class="category-tabs" role="tablist" aria-label="CV template categories">
            <button
              v-for="item in categories"
              :key="item"
              type="button"
              :class="['category-tab', { active: category === item }]"
              @click="category = item"
            >
              {{ item }}
            </button>
          </div>

          <div class="template-grid">
            <button
              v-for="template in filteredTemplates"
              :key="template.id"
              type="button"
              :class="['template-card', { active: selectedId === template.id }]"
              @click="chooseTemplate(template)"
            >
              <div
                class="template-thumb"
                :class="[`thumb-${template.variant}`, template.theme ? `thumb-theme-${template.theme}` : '']"
                :style="{ '--thumb-accent': template.accent }"
              >
                <span class="thumb-sidebar"></span>
                <span class="thumb-head"></span>
                <span class="thumb-line line-a"></span>
                <span class="thumb-line line-b"></span>
                <span class="thumb-line line-c"></span>
              </div>
              <span class="template-info">
                <span class="template-kicker">{{ template.category }}</span>
                <strong>{{ template.name }}</strong>
                <span>{{ template.description }}</span>
              </span>
              <span class="template-check" aria-hidden="true">✓</span>
            </button>
          </div>
        </aside>

        <div class="preview-panel">
          <div class="preview-toolbar">
            <div>
              <span class="section-index">02</span>
              <div>
                <strong>Live preview</strong>
                <small>{{ selectedTemplate.name }} · A4</small>
              </div>
            </div>
            <div class="preview-actions">
              <button class="cycle-control" type="button" title="Next template (N)" @click="cycleTemplate">
                Next style ↻
              </button>
              <button
                class="focus-control"
                :class="{ active: focusMode }"
                type="button"
                :aria-pressed="focusMode"
                title="Toggle focus preview (F)"
                @click="focusMode = !focusMode"
              >
                {{ focusMode ? 'Exit focus' : 'Focus' }}
              </button>
              <label class="zoom-control">
                <span>Zoom</span>
                <select v-model.number="zoom" aria-label="CV preview zoom">
                  <option :value="0.75">75%</option>
                  <option :value="0.85">85%</option>
                  <option :value="1">100%</option>
                </select>
              </label>
              <label class="color-control">
                <span>Accent</span>
                <input v-model="accent" type="color" aria-label="Change CV accent color" />
              </label>
            </div>
          </div>
          <div class="preview-stage">
            <div class="preview-zoom" :style="{ '--preview-zoom': zoom }">
              <CvDocument
                :key="selectedTemplate.id"
                :profile="candidate"
                :template="selectedTemplate"
                :accent="accent"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="principles studio-only">
        <div class="section-heading compact">
          <div>
            <span class="section-index">03</span>
            <h2>Built as a design system</h2>
          </div>
        </div>
        <div class="principle-grid">
          <article><span>DATA</span><h3>Content separated from layout</h3><p>Edit one profile and every template updates consistently.</p></article>
          <article><span>UX</span><h3>Readable before decorative</h3><p>Clear hierarchy, restrained density and strong recruiter scanning patterns.</p></article>
          <article><span>CODE</span><h3>Template variants, not duplicated pages</h3><p>Shared renderer and reusable tokens keep future CV styles easy to maintain.</p></article>
          <article><span>OUTPUT</span><h3>A4 and browser PDF ready</h3><p>Print rules remove the studio UI and preserve the selected CV document.</p></article>
        </div>
      </section>

      <footer class="site-footer studio-only">
        <span>CV Studio · Vue 3.5.42 · Vite 8.3.0</span>
        <span>Editable · Responsive · Motion-aware · Print ready</span>
      </footer>

      <div class="print-only print-document">
        <CvDocument :profile="candidate" :template="selectedTemplate" :accent="accent" />
      </div>
    </main>

    <ProfileEditor
      :open="editorOpen"
      :profile="candidate"
      @close="editorOpen = false"
      @update-field="updateProfileField"
      @reset="resetCandidate"
    />
  </div>
</template>

<script>
import CvDocument from './components/CvDocument.vue'
import ProfileEditor from './components/ProfileEditor.vue'
import { candidate as defaultCandidate, templates } from './data/cv'

const STORAGE_KEY = 'cv-studio-profile-v1'
const cloneCandidate = () => JSON.parse(JSON.stringify(defaultCandidate))

export default {
  name: 'App',
  components: {
    CvDocument,
    ProfileEditor,
  },
  data() {
    return {
      candidate: cloneCandidate(),
      templates,
      selectedId: templates[0].id,
      category: 'All',
      accent: templates[0].accent,
      zoom: 0.85,
      editorOpen: false,
      focusMode: false,
    }
  },
  computed: {
    categories() {
      return ['All'].concat(Array.from(new Set(this.templates.map((item) => item.category))))
    },
    filteredTemplates() {
      if (this.category === 'All') return this.templates
      return this.templates.filter((item) => item.category === this.category)
    },
    selectedTemplate() {
      return this.templates.find((item) => item.id === this.selectedId) || this.templates[0]
    },
  },
  watch: {
    candidate: {
      deep: true,
      handler(value) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
        } catch (error) {
          console.warn('Unable to persist CV profile locally.', error)
        }
      },
    },
  },
  mounted() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.candidate = { ...cloneCandidate(), ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Unable to restore saved CV profile.', error)
    }
    window.addEventListener('keydown', this.handleShortcut)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleShortcut)
  },
  methods: {
    chooseTemplate(template) {
      this.selectedId = template.id
      this.accent = template.accent
    },
    cycleTemplate() {
      const currentIndex = this.templates.findIndex((item) => item.id === this.selectedId)
      const nextTemplate = this.templates[(currentIndex + 1) % this.templates.length]
      this.category = 'All'
      this.chooseTemplate(nextTemplate)
    },
    handleShortcut(event) {
      const target = event.target
      const isTyping = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      )
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.toLowerCase()
      if (key === 'e') {
        this.editorOpen = true
      } else if (key === 'f') {
        this.focusMode = !this.focusMode
      } else if (key === 'n') {
        this.cycleTemplate()
      } else if (key === 'p') {
        event.preventDefault()
        this.printCv()
      } else if (key === 'escape') {
        this.editorOpen = false
        this.focusMode = false
      }
    },
    updateProfileField({ key, value }) {
      if (Object.prototype.hasOwnProperty.call(this.candidate, key)) {
        this.candidate[key] = value
      }
    },
    resetCandidate() {
      this.candidate = cloneCandidate()
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.warn('Unable to clear saved CV profile.', error)
      }
    },
    printCv() {
      window.print()
    },
  },
}
</script>