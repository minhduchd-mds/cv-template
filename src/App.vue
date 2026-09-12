<template>
  <div class="studio-shell">
    <header class="topbar studio-only">
      <a class="brand" href="#top" aria-label="CV Studio home">
        <span class="brand-mark">CV</span>
        <span>
          <strong>CV Studio</strong>
          <small>Resume system for product & tech</small>
        </span>
      </a>
      <div class="topbar-actions">
        <a class="ghost-button" href="#templates">Templates</a>
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
            Pick a template, tune the accent and export an A4-ready CV.
          </p>
          <div class="hero-meta">
            <div><strong>4</strong><span>starter templates</span></div>
            <div><strong>A4</strong><span>print-ready layout</span></div>
            <div><strong>1</strong><span>shared data source</span></div>
          </div>
        </div>
        <div class="hero-orbit" aria-hidden="true">
          <div class="orbit-card orbit-card-a"><span>01</span><b>ATS Clean</b></div>
          <div class="orbit-card orbit-card-b"><span>02</span><b>Product</b></div>
          <div class="orbit-card orbit-card-c"><span>03</span><b>Creative</b></div>
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
              <div class="template-thumb" :class="`thumb-${template.variant}`" :style="{ '--thumb-accent': template.accent }">
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
            <label class="color-control">
              <span>Accent</span>
              <input v-model="accent" type="color" aria-label="Change CV accent color" />
            </label>
          </div>
          <div class="preview-stage">
            <CvDocument :profile="candidate" :template="selectedTemplate" :accent="accent" />
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
          <article><span>DATA</span><h3>Content separated from layout</h3><p>Edit one profile object and every template updates consistently.</p></article>
          <article><span>UX</span><h3>Readable before decorative</h3><p>Clear hierarchy, restrained density and strong recruiter scanning patterns.</p></article>
          <article><span>CODE</span><h3>Template variants, not duplicated pages</h3><p>Shared renderer and reusable tokens keep future CV styles easy to maintain.</p></article>
          <article><span>OUTPUT</span><h3>A4 and browser PDF ready</h3><p>Print rules remove the studio UI and preserve the selected CV document.</p></article>
        </div>
      </section>

      <footer class="site-footer studio-only">
        <span>CV Studio · Vue 2.6.14</span>
        <span>Responsive · Shared data · Print ready</span>
      </footer>

      <div class="print-only print-document">
        <CvDocument :profile="candidate" :template="selectedTemplate" :accent="accent" />
      </div>
    </main>
  </div>
</template>

<script>
import CvDocument from './components/CvDocument.vue'
import { candidate, templates } from './data/cv'

export default {
  name: 'App',
  components: {
    CvDocument,
  },
  data() {
    return {
      candidate,
      templates,
      selectedId: templates[0].id,
      category: 'All',
      accent: templates[0].accent,
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
  methods: {
    chooseTemplate(template) {
      this.selectedId = template.id
      this.accent = template.accent
    },
    printCv() {
      window.print()
    },
  },
}
</script>
