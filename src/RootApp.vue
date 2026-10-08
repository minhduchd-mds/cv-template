<template>
  <div>
    <InterviewStudio v-if="isInterviewRoute" @back="goLanding" />
    <ConceptExperience v-else-if="isConceptRoute" :concept-id="conceptId" @back="goStudio" />
    <template v-else-if="isStudioRoute">
      <StudioView @editor-open="onStudioEditorOpen" />
      <nav
        v-if="!studioEditorOpen"
        class="studio-route-dock"
        aria-label="Studio routes"
      >
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
import { defineAsyncComponent } from 'vue'
import MarketingLanding from './landing/MarketingLanding.vue'

const RELOAD_FLAG = 'cvstudio:chunk-reload'
const recoverStaticRoute = () => {
  const hash = window.location.hash
  const fallback = hash === '#studio'
    ? './studio/'
    : hash === '#interview' || hash === '#interview-studio'
      ? './interview-studio/'
      : './directions/'
  window.location.replace(new URL(fallback, window.location.href).href)
}
// When hashed route chunks disappear after a deploy, reload to pick up the
// newest index. If the chunk still fails, recover to the bundled static app.
const lazyView = (load) => defineAsyncComponent(() => load()
  .then((module) => {
    sessionStorage.removeItem(RELOAD_FLAG)
    return module
  })
  .catch((error) => {
    try {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1')
        window.location.reload()
      } else {
        sessionStorage.removeItem(RELOAD_FLAG)
        recoverStaticRoute()
      }
    } catch {
      recoverStaticRoute()
    }
    throw error
  }))
const loadStudio = () => import('./App.vue')
const StudioView = lazyView(loadStudio)
const ConceptExperience = lazyView(() => import('./concepts/ConceptExperience.vue'))
const InterviewStudio = lazyView(() => import('./interview/InterviewStudio.vue'))

const IDS = ['apple', 'bento', 'engineer', 'case-study', 'executive']
const STUDIO_INTERNAL_HASHES = new Set(['#top', '#templates'])
const CANONICAL_URL = 'https://minhduchd-mds.github.io/cv-template/'
const SOCIAL_IMAGE = `${CANONICAL_URL}og-card.svg`
const INDEX_ROBOTS = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
const INTERNAL_ROBOTS = 'noindex,follow'
const initialMode = (hash) => {
  if (hash === '#interview' || hash === '#interview-studio') return 'interview'
  if (hash === '#studio') return 'studio'
  if (hash.startsWith('#concept-')) return 'concept'
  return 'landing'
}
const META = {
  landing: {
    lang: 'en',
    robots: INDEX_ROBOTS,
    title: 'CV Studio · Portfolio & Resume System',
    description: 'Build one structured career profile, explore distinct CV and portfolio directions, and export an A4-ready resume locally in your browser.',
  },
  studio: {
    lang: 'en',
    robots: INTERNAL_ROBOTS,
    title: 'CV Builder · CV Studio',
    description: 'Edit, preview and export modern CV templates for UI/UX, Product Design and technology roles.',
  },
  interview: {
    lang: 'vi',
    robots: INTERNAL_ROBOTS,
    title: 'Interview Studio · Practice & Evidence Lab',
    description: 'Interview Studio connects CV claims, job context, sourced question banks, mock practice, evidence checks and interview reports.',
  },
  apple: {
    lang: 'vi',
    robots: INTERNAL_ROBOTS,
    title: 'Apple Editorial CV · CV Studio',
    description: 'Typography-first editorial CV concept for senior UI/UX and product design roles.',
  },
  bento: {
    lang: 'vi',
    robots: INTERNAL_ROBOTS,
    title: 'Bento Product CV · CV Studio',
    description: 'Impact-driven bento CV concept with metrics, skills and selected product work.',
  },
  engineer: {
    lang: 'vi',
    robots: INTERNAL_ROBOTS,
    title: 'Design Engineer CV · CV Studio',
    description: 'Design and engineering hybrid CV concept for code-aware product designers and UX engineers.',
  },
  'case-study': {
    lang: 'vi',
    robots: INTERNAL_ROBOTS,
    title: 'Case Study Resume · CV Studio',
    description: 'Project-first resume concept built around problem, role, solution and measurable impact.',
  },
  executive: {
    lang: 'vi',
    robots: INTERNAL_ROBOTS,
    title: 'Executive Dark Glass CV · CV Studio',
    description: 'Premium dark leadership CV concept for design leads, product leads and senior roles.',
  },
}

export default {
  name: 'RootApp',
  components: { StudioView, MarketingLanding, ConceptExperience, InterviewStudio },
  data() {
    const routeHash = window.location.hash
    return { routeHash, routeMode: initialMode(routeHash), studioEditorOpen: false }
  },
  computed: {
    isInterviewRoute() {
      return this.routeMode === 'interview'
    },
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
  watch: {
    isStudioRoute(value) {
      if (!value) this.studioEditorOpen = false
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

      if (nextHash === '#interview' || nextHash === '#interview-studio') this.routeMode = 'interview'
      else if (nextHash.startsWith('#concept-')) this.routeMode = 'concept'
      else if (nextHash === '#studio') this.routeMode = 'studio'
      else if (previousMode === 'studio' && STUDIO_INTERNAL_HASHES.has(nextHash)) this.routeMode = 'studio'
      else this.routeMode = 'landing'

      this.updateMeta()
      if (previousMode !== this.routeMode && (previousMode !== 'landing' || this.routeMode !== 'landing')) {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    },
    onStudioEditorOpen(open) {
      const next = Boolean(open)
      if (next && this.$el) {
        const dock = this.$el.querySelector('.studio-route-dock')
        if (dock && dock.contains(document.activeElement) && typeof document.activeElement.blur === 'function') {
          document.activeElement.blur()
        }
      }
      this.studioEditorOpen = next
      if (next) {
        this.$nextTick(() => {
          const close = this.$el && this.$el.querySelector('.editor-close')
          if (close && typeof close.focus === 'function') close.focus()
        })
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
    upsertMeta(attribute, key, value) {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }
      element.setAttribute('content', value)
    },
    updateMeta() {
      const key = this.isInterviewRoute ? 'interview' : this.isConceptRoute ? this.conceptId : this.isStudioRoute ? 'studio' : 'landing'
      const meta = META[key] || META.landing

      document.documentElement.lang = meta.lang
      document.title = meta.title

      this.upsertMeta('name', 'description', meta.description)
      this.upsertMeta('name', 'robots', meta.robots)
      this.upsertMeta('property', 'og:title', meta.title)
      this.upsertMeta('property', 'og:description', meta.description)
      this.upsertMeta('property', 'og:url', CANONICAL_URL)
      this.upsertMeta('property', 'og:locale', meta.lang === 'vi' ? 'vi_VN' : 'en_US')
      this.upsertMeta('property', 'og:image', SOCIAL_IMAGE)
      this.upsertMeta('name', 'twitter:title', meta.title)
      this.upsertMeta('name', 'twitter:description', meta.description)
      this.upsertMeta('name', 'twitter:image', SOCIAL_IMAGE)

      const canonical = document.head.querySelector('link[rel="canonical"]')
      if (canonical) canonical.setAttribute('href', CANONICAL_URL)
    },
  },
}
</script>
