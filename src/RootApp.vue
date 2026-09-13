<template>
  <div>
    <ConceptExperience v-if="isConceptRoute" :concept-id="conceptId" @back="goStudio" />
    <template v-else-if="isStudioRoute">
      <StudioView />
      <nav class="studio-route-dock" aria-label="Studio routes">
        <a class="studio-home-launch" href="./" aria-label="Back to CV Studio landing page" @click.prevent="goLanding">← Home</a>
        <a class="concept-launch" href="#concept-apple" aria-label="Open five full-screen CV web concepts">
          <span class="concept-launch-dot"></span>
          <span><strong>5 Web Concepts</strong><small>Full-screen landing ideas</small></span>
          <b>→</b>
        </a>
      </nav>
    </template>
    <MarketingLanding v-else />
  </div>
</template>

<script>
import StudioView from './App.vue'
import MarketingLanding from './landing/MarketingLanding.vue'
import ConceptExperience from './concepts/ConceptExperience.vue'

const IDS = ['apple', 'bento', 'engineer', 'case-study', 'executive']
const STUDIO_INTERNAL_HASHES = new Set(['#top', '#templates'])
const initialMode = (hash) => hash === '#studio' ? 'studio' : hash.startsWith('#concept-') ? 'concept' : 'landing'
const META = {
  landing: {
    title: 'CV Studio · Portfolio & Resume System',
    description: 'Build one structured career profile, explore distinct CV and portfolio directions, and export an A4-ready resume locally in your browser.',
  },
  studio: {
    title: 'CV Builder · CV Studio',
    description: 'Edit, preview and export modern CV templates for UI/UX, Product Design and technology roles.',
  },
  apple: {
    title: 'Apple Editorial CV · CV Studio',
    description: 'Typography-first editorial CV concept for senior UI/UX and product design roles.',
  },
  bento: {
    title: 'Bento Product CV · CV Studio',
    description: 'Impact-driven bento CV concept with metrics, skills and selected product work.',
  },
  engineer: {
    title: 'Design Engineer CV · CV Studio',
    description: 'Design and engineering hybrid CV concept for code-aware product designers and UX engineers.',
  },
  'case-study': {
    title: 'Case Study Resume · CV Studio',
    description: 'Project-first resume concept built around problem, role, solution and measurable impact.',
  },
  executive: {
    title: 'Executive Dark Glass CV · CV Studio',
    description: 'Premium dark leadership CV concept for design leads, product leads and senior roles.',
  },
}

export default {
  name: 'RootApp',
  components: { StudioView, MarketingLanding, ConceptExperience },
  data() {
    const routeHash = window.location.hash
    return { routeHash, routeMode: initialMode(routeHash) }
  },
  computed: {
    isConceptRoute() {
      return this.routeMode === 'concept'
    },
    isStudioRoute() {
      return this.routeMode === 'studio'
    },
    conceptId() {
      const id = this.routeHash.replace('#concept-', '')
      return IDS.includes(id) ? id : 'apple'
    },
  },
  mounted() {
    window.addEventListener('hashchange', this.syncRoute)
    this.updateMeta()
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.syncRoute)
  },
  methods: {
    syncRoute() {
      const previousMode = this.routeMode
      const nextHash = window.location.hash
      this.routeHash = nextHash

      if (nextHash.startsWith('#concept-')) this.routeMode = 'concept'
      else if (nextHash === '#studio') this.routeMode = 'studio'
      else if (previousMode === 'studio' && STUDIO_INTERNAL_HASHES.has(nextHash)) this.routeMode = 'studio'
      else this.routeMode = 'landing'

      this.updateMeta()
      if (previousMode !== this.routeMode && (previousMode !== 'landing' || this.routeMode !== 'landing')) {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    },
    goStudio() {
      window.location.hash = 'studio'
    },
    goLanding() {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}`)
      this.routeHash = ''
      this.routeMode = 'landing'
      this.updateMeta()
      window.scrollTo({ top: 0, behavior: 'instant' })
    },
    updateMeta() {
      const key = this.isConceptRoute ? this.conceptId : this.isStudioRoute ? 'studio' : 'landing'
      const meta = META[key] || META.landing
      document.title = meta.title
      let description = document.querySelector('meta[name="description"]')
      if (!description) {
        description = document.createElement('meta')
        description.setAttribute('name', 'description')
        document.head.appendChild(description)
      }
      description.setAttribute('content', meta.description)
    },
  },
}
</script>
