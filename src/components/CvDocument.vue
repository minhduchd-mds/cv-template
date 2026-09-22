<template>
  <article
    class="cv-sheet"
    :class="[`cv-${template.variant}`, template.theme ? `theme-${template.theme}` : '', ...appearanceClasses]"
    :style="{ '--cv-accent': accent }"
  >
    <template v-if="template.variant === 'ats'">
      <header class="cv-header ats-header">
        <div>
          <p class="cv-kicker">{{ profile.role }}</p>
          <h1>{{ profile.name }}</h1>
        </div>
        <div class="contact-row">
          <span>{{ profile.location }}</span><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span>
        </div>
      </header>
      <div class="cv-section-stack">
        <section v-if="visible('summary')" class="ats-summary" :style="sectionStyle('summary')">
          <h2>Profile</h2><p>{{ profile.summary }}</p>
        </section>
        <section v-if="visible('highlights')" class="ats-highlight-section" :style="sectionStyle('highlights')">
          <h2>Impact</h2><div class="ats-highlights"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
        </section>
        <section v-if="visible('experience')" :style="sectionStyle('experience')">
          <h2>Experience</h2>
          <div v-for="job in profile.experience" :key="`${job.role}-${job.company}`" class="experience-item ats-experience">
            <div class="experience-head"><strong>{{ job.role }} · {{ job.company }}</strong><span>{{ job.period }}</span></div>
            <ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul>
          </div>
        </section>
        <section v-if="visible('projects')" :style="sectionStyle('projects')">
          <h2>Selected work</h2>
          <div class="ats-project-grid">
            <article v-for="project in profile.projects" :key="project.name">
              <div v-if="project.image" class="cv-project-cover ats-cover" :style="imageStyle(project.image)"></div>
              <strong>{{ project.name }}</strong><span>{{ project.type }} · {{ project.impact }}</span><p>{{ project.description }}</p>
            </article>
          </div>
        </section>
        <section v-if="visible('skills')" :style="sectionStyle('skills')"><h2>Core skills</h2><p class="inline-list">{{ profile.skills.join(' · ') }}</p></section>
        <section v-if="visible('education')" :style="sectionStyle('education')"><h2>Education</h2><p v-for="item in profile.education" :key="`${item.title}-${item.place}`"><strong>{{ item.title }}</strong><br />{{ item.place }} · {{ item.period }}</p></section>
        <section v-if="visible('certificates')" :style="sectionStyle('certificates')"><h2>Certificates</h2><div class="credential-list"><p v-for="item in profile.certificates" :key="`${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><br />{{ item.issuer }} · {{ item.period }}</p></div></section>
        <section v-if="visible('languages')" :style="sectionStyle('languages')"><h2>Languages</h2><p class="inline-list">{{ profile.languages.join(' · ') }}</p></section>
      </div>
    </template>

    <template v-else-if="template.variant === 'creative'">
      <header class="creative-header">
        <div class="creative-number">01</div>
        <div>
          <p class="cv-kicker">Portfolio résumé</p>
          <h1>{{ profile.name }}</h1>
          <h3>{{ profile.role }}</h3>
        </div>
        <div v-if="profile.avatar" class="cv-avatar creative-avatar" :style="imageStyle(profile.avatar)"></div>
        <div class="creative-contact"><span>{{ profile.email }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div>
      </header>
      <div class="creative-intro section-flow">
        <p v-if="visible('summary')" :style="sectionStyle('summary')">{{ profile.summary }}</p>
        <div v-if="visible('highlights')" class="highlight-strip" :style="sectionStyle('highlights')"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
      </div>
      <div class="creative-layout">
        <main class="section-flow">
          <section v-if="visible('experience')" :style="sectionStyle('experience')"><div class="label-row"><span>02</span><h2>Experience</h2></div>
            <article v-for="job in profile.experience" :key="`${job.role}-${job.company}`" class="experience-item creative-job">
              <div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><span>{{ job.period }}</span></div>
              <ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul>
            </article>
          </section>
          <section v-if="visible('projects')" :style="sectionStyle('projects')"><div class="label-row"><span>03</span><h2>Selected projects</h2></div>
            <div class="creative-projects"><article v-for="project in profile.projects" :key="project.name"><div v-if="project.image" class="cv-project-cover creative-cover" :style="imageStyle(project.image)"></div><span>{{ project.type }}</span><h3>{{ project.name }}</h3><strong>{{ project.impact }}</strong><p>{{ project.description }}</p></article></div>
          </section>
        </main>
        <aside class="creative-aside section-flow">
          <div v-if="visible('skills')" :style="sectionStyle('skills')"><span class="aside-label">Capabilities</span><ul class="skill-list"><li v-for="skill in profile.skills" :key="skill">{{ skill }}</li></ul></div>
          <div v-if="visible('education')" :style="sectionStyle('education')"><span class="aside-label">Education</span><article v-for="item in profile.education" :key="`${item.title}-${item.place}`"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></div>
          <div v-if="visible('certificates')" :style="sectionStyle('certificates')"><span class="aside-label">Certificates</span><article v-for="item in profile.certificates" :key="`${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><span>{{ item.issuer }}</span><small>{{ item.period }}</small></article></div>
          <div v-if="visible('languages')" :style="sectionStyle('languages')"><span class="aside-label">Languages</span><p v-for="language in profile.languages" :key="language">{{ language }}</p></div>
        </aside>
      </div>
    </template>

    <template v-else-if="template.variant === 'executive'">
      <header class="executive-header">
        <div class="executive-identity"><div v-if="profile.avatar" class="cv-avatar executive-avatar" :style="imageStyle(profile.avatar)"></div><div><p class="cv-kicker">Curriculum vitae</p><h1>{{ profile.name }}</h1><h3>{{ profile.role }}</h3></div></div>
        <div class="executive-contact"><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div>
      </header>
      <div class="executive-rule"></div>
      <div class="executive-layout">
        <main class="section-flow">
          <section v-if="visible('summary')" class="executive-summary" :style="sectionStyle('summary')"><span>Profile</span><p>{{ profile.summary }}</p></section>
          <section v-if="visible('highlights')" :style="sectionStyle('highlights')"><h2>Selected impact</h2><div class="executive-impact-grid"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div></section>
          <section v-if="visible('experience')" :style="sectionStyle('experience')"><h2>Professional experience</h2><article v-for="job in profile.experience" :key="`${job.role}-${job.company}`" class="experience-item executive-job"><div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }} · {{ job.location }}</span></div><span>{{ job.period }}</span></div><ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul></article></section>
          <section v-if="visible('projects')" :style="sectionStyle('projects')"><h2>Selected work</h2><article v-for="project in profile.projects" :key="project.name" class="executive-project"><div v-if="project.image" class="cv-project-cover executive-cover" :style="imageStyle(project.image)"></div><div><strong>{{ project.name }}</strong><span>{{ project.type }}</span></div><p>{{ project.description }}</p></article></section>
        </main>
        <aside class="section-flow">
          <section v-if="visible('skills')" :style="sectionStyle('skills')"><h2>Expertise</h2><ul class="executive-skills"><li v-for="skill in profile.skills" :key="skill">{{ skill }}</li></ul></section>
          <section v-if="visible('education')" :style="sectionStyle('education')"><h2>Education</h2><article v-for="item in profile.education" :key="`${item.title}-${item.place}`"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></section>
          <section v-if="visible('certificates')" :style="sectionStyle('certificates')"><h2>Certificates</h2><article v-for="item in profile.certificates" :key="`${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><span>{{ item.issuer }}</span><small>{{ item.period }}</small></article></section>
          <section v-if="visible('languages')" :style="sectionStyle('languages')"><h2>Languages</h2><p v-for="language in profile.languages" :key="language">{{ language }}</p></section>
        </aside>
      </div>
    </template>

    <template v-else>
      <aside class="product-sidebar section-flow">
        <div class="profile-monogram" :class="{ 'has-avatar': profile.avatar }" :style="profile.avatar ? imageStyle(profile.avatar) : {}"><span v-if="!profile.avatar">{{ monogram }}</span></div>
        <div><p class="cv-kicker">Senior profile</p><h1>{{ profile.name }}</h1><h3>{{ profile.role }}</h3></div>
        <p v-if="visible('summary')" class="product-summary" :style="sectionStyle('summary')">{{ profile.summary }}</p>
        <div class="product-contact"><span>{{ profile.location }}</span><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span></div>
        <section v-if="visible('skills')" :style="sectionStyle('skills')"><span class="aside-label">Core stack</span><ul class="product-skills"><li v-for="skill in profile.skills" :key="skill">{{ skill }}</li></ul></section>
        <section v-if="visible('education')" :style="sectionStyle('education')"><span class="aside-label">Education</span><article v-for="item in profile.education" :key="`${item.title}-${item.place}`"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></section>
        <section v-if="visible('certificates')" :style="sectionStyle('certificates')"><span class="aside-label">Certificates</span><article v-for="item in profile.certificates" :key="`${item.title}-${item.issuer}`"><strong>{{ item.title }}</strong><span>{{ item.issuer }}</span><small>{{ item.period }}</small></article></section>
        <section v-if="visible('languages')" :style="sectionStyle('languages')"><span class="aside-label">Languages</span><p v-for="language in profile.languages" :key="language">{{ language }}</p></section>
      </aside>
      <main class="product-main section-flow">
        <div v-if="visible('highlights')" class="product-topline" :style="sectionStyle('highlights')"><span>Selected impact</span><div class="product-highlights"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div></div>
        <section v-if="visible('experience')" :style="sectionStyle('experience')"><div class="product-section-head"><span>01</span><h2>Experience</h2></div><article v-for="job in profile.experience" :key="`${job.role}-${job.company}`" class="experience-item product-job"><div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><span>{{ job.period }}</span></div><ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul></article></section>
        <section v-if="visible('projects')" :style="sectionStyle('projects')"><div class="product-section-head"><span>02</span><h2>Selected work</h2></div><div class="product-projects"><article v-for="project in profile.projects" :key="project.name"><div v-if="project.image" class="cv-project-cover product-cover" :style="imageStyle(project.image)"></div><div><span>{{ project.type }}</span><strong>{{ project.name }}</strong></div><p>{{ project.description }}</p><small>{{ project.impact }}</small></article></div></section>
      </main>
    </template>
  </article>
</template>

<script>
export default {
  name: 'CvDocument',
  props: {
    profile: { type: Object, required: true },
    template: { type: Object, required: true },
    accent: { type: String, required: true },
    appearance: {
      type: Object,
      default: () => ({ font: 'sans', density: 'balanced', radius: 'soft' }),
    },
  },
  computed: {
    appearanceClasses() {
      const font = ['sans', 'serif', 'mono'].includes(this.appearance?.font) ? this.appearance.font : 'sans'
      const density = ['compact', 'balanced', 'spacious'].includes(this.appearance?.density) ? this.appearance.density : 'balanced'
      const radius = ['sharp', 'soft', 'round'].includes(this.appearance?.radius) ? this.appearance.radius : 'soft'
      return [`cv-font-${font}`, `cv-density-${density}`, `cv-radius-${radius}`]
    },
    monogram() {
      return String(this.profile.name || 'CV').split(' ').filter(Boolean).slice(-2).map((word) => word.charAt(0)).join('')
    },
  },
  methods: {
    sectionConfig(id) {
      return (this.profile.sections || []).find((section) => section.id === id)
    },
    visible(id) {
      const config = this.sectionConfig(id)
      return config ? config.enabled !== false : true
    },
    sectionStyle(id) {
      const index = (this.profile.sections || []).findIndex((section) => section.id === id)
      return { order: index === -1 ? 99 : index }
    },
    imageStyle(url) {
      if (!url) return {}
      return { backgroundImage: `url("${String(url).replace(/"/g, '%22')}")` }
    },
  },
}
</script>
