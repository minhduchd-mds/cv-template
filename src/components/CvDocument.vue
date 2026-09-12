<template>
  <article class="cv-sheet" :class="`cv-${template.variant}`" :style="{ '--cv-accent': accent }">
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
      <section class="ats-summary">
        <h2>Profile</h2>
        <p>{{ profile.summary }}</p>
      </section>
      <section>
        <h2>Experience</h2>
        <div v-for="job in profile.experience" :key="job.role" class="experience-item ats-experience">
          <div class="experience-head"><strong>{{ job.role }} · {{ job.company }}</strong><span>{{ job.period }}</span></div>
          <ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul>
        </div>
      </section>
      <section>
        <h2>Selected work</h2>
        <div class="ats-project-grid">
          <article v-for="project in profile.projects" :key="project.name">
            <strong>{{ project.name }}</strong><span>{{ project.type }} · {{ project.impact }}</span><p>{{ project.description }}</p>
          </article>
        </div>
      </section>
      <section class="ats-bottom-grid">
        <div><h2>Core skills</h2><p class="inline-list">{{ profile.skills.join(' · ') }}</p></div>
        <div><h2>Education</h2><p v-for="item in profile.education" :key="item.title"><strong>{{ item.title }}</strong><br />{{ item.place }} · {{ item.period }}</p></div>
      </section>
    </template>

    <template v-else-if="template.variant === 'creative'">
      <header class="creative-header">
        <div class="creative-number">01</div>
        <div>
          <p class="cv-kicker">Portfolio résumé</p>
          <h1>{{ profile.name }}</h1>
          <h3>{{ profile.role }}</h3>
        </div>
        <div class="creative-contact"><span>{{ profile.email }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div>
      </header>
      <section class="creative-intro">
        <p>{{ profile.summary }}</p>
        <div class="highlight-strip"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div>
      </section>
      <div class="creative-layout">
        <main>
          <section><div class="label-row"><span>02</span><h2>Experience</h2></div>
            <article v-for="job in profile.experience" :key="job.role" class="experience-item creative-job">
              <div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><span>{{ job.period }}</span></div>
              <ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul>
            </article>
          </section>
          <section><div class="label-row"><span>03</span><h2>Selected projects</h2></div>
            <div class="creative-projects"><article v-for="project in profile.projects" :key="project.name"><span>{{ project.type }}</span><h3>{{ project.name }}</h3><strong>{{ project.impact }}</strong><p>{{ project.description }}</p></article></div>
          </section>
        </main>
        <aside class="creative-aside">
          <div><span class="aside-label">Capabilities</span><ul class="skill-list"><li v-for="skill in profile.skills" :key="skill">{{ skill }}</li></ul></div>
          <div><span class="aside-label">Education</span><article v-for="item in profile.education" :key="item.title"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></div>
        </aside>
      </div>
    </template>

    <template v-else-if="template.variant === 'executive'">
      <header class="executive-header">
        <div><p class="cv-kicker">Curriculum vitae</p><h1>{{ profile.name }}</h1><h3>{{ profile.role }}</h3></div>
        <div class="executive-contact"><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span><span>{{ profile.location }}</span></div>
      </header>
      <div class="executive-rule"></div>
      <section class="executive-summary"><span>Profile</span><p>{{ profile.summary }}</p></section>
      <div class="executive-layout">
        <main>
          <section><h2>Professional experience</h2><article v-for="job in profile.experience" :key="job.role" class="experience-item executive-job"><div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }} · {{ job.location }}</span></div><span>{{ job.period }}</span></div><ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul></article></section>
          <section><h2>Selected work</h2><article v-for="project in profile.projects" :key="project.name" class="executive-project"><div><strong>{{ project.name }}</strong><span>{{ project.type }}</span></div><p>{{ project.description }}</p></article></section>
        </main>
        <aside>
          <section><h2>Expertise</h2><ul class="executive-skills"><li v-for="skill in profile.skills" :key="skill">{{ skill }}</li></ul></section>
          <section><h2>Education</h2><article v-for="item in profile.education" :key="item.title"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></section>
          <section><h2>Languages</h2><p v-for="language in profile.languages" :key="language">{{ language }}</p></section>
        </aside>
      </div>
    </template>

    <template v-else>
      <aside class="product-sidebar">
        <div class="profile-monogram">{{ monogram }}</div>
        <div><p class="cv-kicker">Senior profile</p><h1>{{ profile.name }}</h1><h3>{{ profile.role }}</h3></div>
        <p class="product-summary">{{ profile.summary }}</p>
        <div class="product-contact"><span>{{ profile.location }}</span><span>{{ profile.email }}</span><span>{{ profile.phone }}</span><span>{{ profile.website }}</span></div>
        <section><span class="aside-label">Core stack</span><ul class="product-skills"><li v-for="skill in profile.skills" :key="skill">{{ skill }}</li></ul></section>
        <section><span class="aside-label">Education</span><article v-for="item in profile.education" :key="item.title"><strong>{{ item.title }}</strong><span>{{ item.place }}</span><small>{{ item.period }}</small></article></section>
      </aside>
      <main class="product-main">
        <div class="product-topline"><span>Selected impact</span><div class="product-highlights"><div v-for="item in profile.highlights" :key="item.label"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></div></div></div>
        <section><div class="product-section-head"><span>01</span><h2>Experience</h2></div><article v-for="job in profile.experience" :key="job.role" class="experience-item product-job"><div class="experience-head"><div><strong>{{ job.role }}</strong><span>{{ job.company }}</span></div><span>{{ job.period }}</span></div><ul><li v-for="bullet in job.bullets" :key="bullet">{{ bullet }}</li></ul></article></section>
        <section><div class="product-section-head"><span>02</span><h2>Selected work</h2></div><div class="product-projects"><article v-for="project in profile.projects" :key="project.name"><div><span>{{ project.type }}</span><strong>{{ project.name }}</strong></div><p>{{ project.description }}</p><small>{{ project.impact }}</small></article></div></section>
      </main>
    </template>
  </article>
</template>

<script>
export default {
  name: 'CvDocument',
  props: {
    profile: {
      type: Object,
      required: true,
    },
    template: {
      type: Object,
      required: true,
    },
    accent: {
      type: String,
      required: true,
    },
  },
  computed: {
    monogram() {
      return this.profile.name
        .split(' ')
        .slice(-2)
        .map((word) => word.charAt(0))
        .join('')
    },
  },
}
</script>
