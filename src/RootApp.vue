<template>
  <div>
    <ConceptExperience v-if="isConceptRoute" :concept-id="conceptId" @back="goStudio" />
    <template v-else>
      <StudioView />
      <a class="concept-launch" href="#concept-apple" aria-label="Open five full-screen CV web concepts">
        <span class="concept-launch-dot"></span>
        <span><strong>5 Web Concepts</strong><small>Full-screen landing ideas</small></span>
        <b>→</b>
      </a>
    </template>
  </div>
</template>

<script>
import StudioView from './App.vue'
import ConceptExperience from './concepts/ConceptExperience.vue'

const IDS = ['apple', 'bento', 'engineer', 'case-study', 'executive']

export default {
  name: 'RootApp',
  components: { StudioView, ConceptExperience },
  data() {
    return { routeHash: window.location.hash }
  },
  computed: {
    isConceptRoute() {
      return this.routeHash.startsWith('#concept-')
    },
    conceptId() {
      const id = this.routeHash.replace('#concept-', '')
      return IDS.includes(id) ? id : 'apple'
    },
  },
  mounted() {
    window.addEventListener('hashchange', this.syncRoute)
  },
  beforeUnmount() {
    window.removeEventListener('hashchange', this.syncRoute)
  },
  methods: {
    syncRoute() {
      this.routeHash = window.location.hash
      window.scrollTo({ top: 0, behavior: 'instant' })
    },
    goStudio() {
      history.pushState(null, '', window.location.pathname + window.location.search)
      this.routeHash = ''
      window.scrollTo({ top: 0, behavior: 'instant' })
    },
  },
}
</script>