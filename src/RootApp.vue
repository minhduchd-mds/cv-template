<template>
  <div>
    <ConceptExperience v-if="isConceptRoute" :concept-id="conceptId" @back="goStudio" />
    <template v-else-if="isStudioRoute">
      <StudioView />
      <a class="concept-launch" href="#concept-apple" aria-label="Open five full-screen CV web concepts">
        <span class="concept-launch-dot"></span>
        <span><strong>5 Web Concepts</strong><small>Full-screen landing ideas</small></span>
        <b>→</b>
      </a>
    </template>
    <MarketingLanding v-else />
  </div>
</template>

<script>
import StudioView from './App.vue'
import MarketingLanding from './landing/MarketingLanding.vue'
import ConceptExperience from './concepts/ConceptExperience.vue'

const IDS = ['apple', 'bento', 'engineer', 'case-study', 'executive']
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
    return { routeHash: window.location.hash }
  },
  computed: {
    isConceptRoute() {
      return this.routeHash.startsWith('#concept-')
    },
    isStudioRoute() {
      return this.routeHash === '#studio'
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
      const previousWasAppRoute = this.isConceptRoute || this.isStudioRoute
      this.routeHash = window.location.hash
      this.updateMeta()
      const nextIsAppRoute = this.isConceptRoute || this.isStudioRoute
      if (previousWasAppRoute || nextIsAppRoute) window.scrollTo({ top: 0, behavior: 'instant' })
    },
    goStudio() {
      window.location.hash = 'studio'
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
