<template>
  <main class="landing-page">
    <header class="landing-nav" aria-label="Primary navigation">
      <a class="landing-brand" href="#top" aria-label="CV Studio home">
        <span class="landing-brand__mark">CV</span>
        <span><strong>CV Studio</strong><small>Portfolio & resume system</small></span>
      </a>
      <nav class="landing-nav__links" aria-label="Landing sections">
        <a href="#templates">Templates</a>
        <a href="#workflow">Workflow</a>
        <a href="#cases">Case studies</a>
        <a href="#capabilities">Features</a>
      </nav>
      <div class="landing-nav__actions">
        <a class="landing-link-button" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer noopener">GitHub ↗</a>
        <a class="landing-primary-button" href="#studio">Build your CV <span aria-hidden="true">→</span></a>
      </div>
    </header>

    <section id="top" class="landing-hero">
      <div class="landing-hero__copy">
        <div class="landing-eyebrow"><span>CV Studio · 2026</span><b>Local-first</b><b>Open source</b></div>
        <h1>Turn one career story into a <em>portfolio that feels unmistakably yours.</em></h1>
        <p>Build a structured senior-level CV, switch between distinct visual directions, edit the same profile once and export an A4-ready result without sending your data to a server.</p>
        <div class="landing-hero__actions">
          <a class="landing-primary-button landing-primary-button--large" href="#studio">Start building <span aria-hidden="true">→</span></a>
          <a class="landing-secondary-button" href="#templates">Explore templates</a>
        </div>
        <div class="landing-hero__facts" aria-label="Product facts">
          <span><b>{{ templates.length }}</b> CV templates</span>
          <span><b>5</b> web identities</span>
          <span><b>A4</b> print ready</span>
          <span><b>0</b> required accounts</span>
        </div>
      </div>

      <div class="landing-product" aria-label="CV Studio product preview">
        <div class="landing-product__chrome"><i></i><i></i><i></i><span>CV Studio / Builder</span><b>100%</b></div>
        <div class="landing-product__body">
          <aside class="landing-product__rail" aria-hidden="true">
            <span class="is-active">Profile</span><span>Impact</span><span>Experience</span><span>Projects</span><span>Skills</span><span>Layout</span>
          </aside>
          <section class="landing-product__canvas">
            <div class="landing-product__toolbar"><span>Senior Product Designer</span><div><i></i><i></i><i></i></div></div>
            <article class="landing-resume-preview">
              <div class="landing-resume-preview__aside">
                <img :src="profile.identity.avatar" :alt="`Sample portrait of ${profile.identity.name}`" @error="hideBrokenImage" />
                <small>PRODUCT DESIGNER</small>
                <h2>{{ profile.identity.name }}</h2>
                <p>{{ profile.identity.role }}</p>
                <div class="landing-resume-preview__contact"><span>{{ profile.identity.location }}</span><span>{{ profile.identity.email }}</span><span>{{ profile.identity.website }}</span></div>
                <div class="landing-resume-preview__skills"><span v-for="skill in profile.capabilities.product.slice(0, 5)" :key="skill">{{ skill }}</span></div>
              </div>
              <div class="landing-resume-preview__main">
                <div class="landing-resume-preview__metrics">
                  <div><b>{{ profile.proof.years }}</b><span>years</span></div><div><b>{{ profile.proof.shippedProducts }}</b><span>products</span></div><div><b>{{ profile.proof.designSystemCoverage }}</b><span>system coverage</span></div>
                </div>
                <section><small>PROFILE</small><p>{{ profile.positioning.shortBio }}</p></section>
                <section><small>SELECTED EXPERIENCE</small><article v-for="job in profile.experience.slice(0, 2)" :key="job.company"><div><b>{{ job.role }}</b><span>{{ job.period }}</span></div><p>{{ job.summary }}</p></article></section>
                <section><small>SELECTED WORK</small><div class="landing-resume-preview__projects"><article v-for="project in profile.projects.slice(0, 2)" :key="project.id"><b>{{ project.name }}</b><span>{{ project.impact }}</span></article></div></section>
              </div>
            </article>
          </section>
          <aside class="landing-product__inspector" aria-hidden="true"><small>DESIGN</small><label>Accent<span class="landing-color-dot"></span></label><label>Layout<b>Editorial</b></label><label>Spacing<b>Comfortable</b></label><label>Output<b>A4 / Web</b></label><div class="landing-product__export">Export PDF ↗</div></aside>
        </div>
      </div>
    </section>

    <section class="landing-proof" aria-label="Product capabilities">
      <div><span>01</span><b>One source of truth</b><p>Shared structured profile data feeds every CV direction.</p></div>
      <div><span>02</span><b>Local-first editing</b><p>Your working profile stays in the browser by default.</p></div>
      <div><span>03</span><b>Design-system built</b><p>Reusable variants, tokens and print rules instead of duplicated pages.</p></div>
      <div><span>04</span><b>Code-aware output</b><p>Built for designers who care about the implementation as much as the mockup.</p></div>
    </section>

    <section id="templates" class="landing-section landing-templates">
      <div class="landing-section__heading"><div><span>01 · DIRECTIONS</span><h2>Choose a visual language.<br />Keep the career story intact.</h2></div><p>Each template reads the same compact A4 profile. Layout changes; facts do not.</p></div>
      <div class="landing-template-showcase">
        <a class="landing-template-feature" href="#studio">
          <div class="landing-template-feature__visual"><span>FEATURED</span><div class="landing-template-feature__paper"><i></i><h3>{{ templates[0].name }}</h3><p>{{ profile.positioning.shortBio }}</p><div><b>{{ profile.proof.years }}</b><b>{{ profile.proof.shippedProducts }}</b><b>{{ profile.proof.handoffImprovement }}</b></div></div></div>
          <div class="landing-template-feature__copy"><small>{{ templates[0].category }}</small><h3>{{ templates[0].name }}</h3><p>{{ templates[0].description }}</p><span>Open in Builder →</span></div>
        </a>
        <div class="landing-template-list">
          <a v-for="template in templates.slice(1)" :key="template.id" class="landing-template-row" href="#studio">
            <span class="landing-template-row__index">0{{ templates.indexOf(template) + 1 }}</span>
            <div class="landing-template-row__thumb" :class="`is-${template.variant}`"><i></i><i></i><i></i><i></i></div>
            <div><small>{{ template.category }}</small><b>{{ template.name }}</b><p>{{ template.description }}</p></div><span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>

    <section class="landing-identity-hero">
      <div class="landing-identity-hero__copy"><span>02 · ONE PROFILE / FIVE IDENTITIES</span><h2>The same experience can speak in <em>five different voices.</em></h2><p>Editorial, product, technical, case-study or executive. The content remains structured while the presentation adapts to the role you are targeting.</p><a href="#concept-apple">Explore the five identities <b>→</b></a></div>
      <div class="landing-identity-stack" aria-label="Five CV web identities">
        <a v-for="(concept, index) in concepts" :key="concept.id" :href="`#concept-${concept.id}`" :class="`landing-identity-card is-${concept.id}`"><small>0{{ index + 1 }}</small><span>{{ concept.label }}</span><b>{{ concept.title }}</b><p>{{ concept.note }}</p></a>
      </div>
    </section>

    <section id="workflow" class="landing-section landing-workflow">
      <div class="landing-section__heading"><div><span>03 · WORKFLOW</span><h2>From raw career data<br />to a polished story.</h2></div><p>The system separates content from presentation so iteration becomes faster and safer.</p></div>
      <ol class="landing-workflow__steps">
        <li v-for="step in workflow" :key="step.number"><span>{{ step.number }}</span><div><small>{{ step.kicker }}</small><h3>{{ step.title }}</h3><p>{{ step.body }}</p></div></li>
      </ol>
    </section>

    <section id="cases" class="landing-section landing-cases">
      <div class="landing-section__heading"><div><span>04 · SAMPLE 360 PROFILE</span><h2>Enough depth for a portfolio.<br />Enough restraint for a CV.</h2></div><p>Alex Chen is a fictional sample persona used to demonstrate structured career data. Metrics below belong only to this sample profile.</p></div>
      <div class="landing-case-lead">
        <div class="landing-case-lead__portrait"><img :src="profile.identity.avatar" :alt="`Sample profile portrait of ${profile.identity.name}`" @error="hideBrokenImage" /><span>SAMPLE PROFILE</span></div>
        <div><small>{{ profile.identity.role }}</small><h3>{{ profile.identity.name }}</h3><p>{{ profile.positioning.longBio }}</p><div class="landing-case-lead__proof"><span><b>{{ profile.proof.years }}</b> years</span><span><b>{{ profile.proof.auditedModules }}</b> audited modules</span><span><b>{{ profile.proof.designSystemCoverage }}</b> design-system coverage</span><span><b>{{ profile.proof.handoffImprovement }}</b> handoff improvement</span></div></div>
      </div>
      <div class="landing-case-grid">
        <article v-for="project in profile.projects.slice(0, 3)" :key="project.id" class="landing-case">
          <div class="landing-case__media"><img :src="project.image" :alt="`${project.name} sample project cover`" loading="lazy" @error="hideBrokenImage" /><span>{{ project.type }}</span></div>
          <div class="landing-case__body"><div><small>{{ project.period }}</small><h3>{{ project.name }}</h3><p>{{ project.description }}</p></div><dl><div><dt>Problem</dt><dd>{{ project.problem }}</dd></div><div><dt>Solution</dt><dd>{{ project.solution }}</dd></div><div class="is-impact"><dt>Result</dt><dd>{{ project.impact }}</dd></div></dl></div>
        </article>
      </div>
    </section>

    <section id="capabilities" class="landing-section landing-capabilities">
      <div class="landing-section__heading"><div><span>05 · SYSTEM</span><h2>Designed for the whole<br />career-story workflow.</h2></div><p>Not just a collection of pretty templates: data, editing, rendering, print and web identities share one system.</p></div>
      <div class="landing-capabilities__matrix">
        <div class="landing-capabilities__statement"><small>PRODUCT PRINCIPLE</small><blockquote>“Clarity before decoration. Systems before one-off screens.”</blockquote><p>{{ profile.positioning.headline || profile.identity.headline }}</p></div>
        <div class="landing-capabilities__groups">
          <article v-for="group in capabilityGroups" :key="group.label"><span>{{ group.index }}</span><div><small>{{ group.label }}</small><b>{{ group.title }}</b><p>{{ group.items.join(' · ') }}</p></div></article>
        </div>
      </div>
    </section>

    <section class="landing-testimonial">
      <div><span>06 · SAMPLE TESTIMONIAL</span><blockquote>“{{ profile.testimonials[0].quote }}”</blockquote><p>{{ profile.testimonials[0].author }} · {{ profile.testimonials[0].role }}</p></div>
      <aside><small>WHY 360° DATA?</small><p>A strong portfolio needs more than a job title and a few bullets. The rich profile stores context, proof, principles, case-study structure and social proof while the CV projection remains concise.</p></aside>
    </section>

    <section class="landing-section landing-faq">
      <div class="landing-section__heading"><div><span>07 · FAQ</span><h2>Built to stay understandable.</h2></div><p>Important product and privacy questions should never be hidden behind marketing language.</p></div>
      <div class="landing-faq__list"><details v-for="(item, index) in faq" :key="item.question" :open="index === 0"><summary><span>0{{ index + 1 }}</span>{{ item.question }}<b>+</b></summary><p>{{ item.answer }}</p></details></div>
    </section>

    <section class="landing-final-cta">
      <div><small>YOUR NEXT VERSION STARTS HERE</small><h2>Build one profile.<br />Shape it for every opportunity.</h2></div>
      <div><p>No account required. Edit locally, choose a direction and export when the story feels right.</p><a class="landing-primary-button landing-primary-button--light" href="#studio">Open CV Studio <span>→</span></a></div>
    </section>

    <footer class="landing-footer"><a class="landing-brand" href="#top"><span class="landing-brand__mark">CV</span><span><strong>CV Studio</strong><small>Vue · Vite · SCSS</small></span></a><div><a href="#templates">Templates</a><a href="#studio">Builder</a><a href="#concept-apple">Concepts</a><a href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer noopener">GitHub</a></div><span>Local-first · Motion-aware · Print-ready</span></footer>
  </main>
</template>

<script>
import { sampleProfile360 } from '../data/sample-profile-360'
import { templates } from '../data/cv'

export default {
  name: 'MarketingLanding',
  data() {
    return {
      profile: sampleProfile360,
      templates,
      concepts: [
        { id: 'apple', label: 'EDITORIAL', title: 'Quiet confidence', note: 'Typography-led and calm.' },
        { id: 'bento', label: 'PRODUCT', title: 'Impact at a glance', note: 'Metrics and modular proof.' },
        { id: 'engineer', label: 'DESIGN ENGINEER', title: 'Design × code', note: 'Implementation-aware positioning.' },
        { id: 'case-study', label: 'CASE STUDY', title: 'Problem to result', note: 'Project storytelling first.' },
        { id: 'executive', label: 'EXECUTIVE', title: 'Leadership signal', note: 'Premium and outcome-led.' },
      ],
      workflow: [
        { number: '01', kicker: 'STRUCTURE', title: 'Build the profile', body: 'Capture identity, impact, experience, projects, skills, education and proof as structured data.' },
        { number: '02', kicker: 'DIRECTION', title: 'Pick a visual voice', body: 'Switch between recruiter-friendly, product, editorial, technical and leadership-oriented layouts.' },
        { number: '03', kicker: 'REFINE', title: 'Tune the story', body: 'Edit once, reorder sections, adjust emphasis and keep content consistent across outputs.' },
        { number: '04', kicker: 'SHIP', title: 'Export or publish', body: 'Use the A4 print view for applications or a web concept for a richer portfolio presentation.' },
      ],
      capabilityGroups: [
        { index: '01', label: 'CONTENT', title: 'Structured profile', items: ['Impact', 'Experience', 'Projects', 'Skills', 'Education', 'Certificates'] },
        { index: '02', label: 'DESIGN', title: 'Distinct directions', items: ['Editorial', 'Bento', 'ATS', 'Design Engineer', 'Executive'] },
        { index: '03', label: 'OUTPUT', title: 'Multiple surfaces', items: ['A4', 'Browser PDF', 'Web profile', 'Case-study story'] },
        { index: '04', label: 'QUALITY', title: 'Production-minded', items: ['Responsive', 'Keyboard', 'Reduced motion', 'CodeQL', 'Security headers'] },
      ],
      faq: [
        { question: 'Does CV Studio require an account?', answer: 'No. The current builder is local-first and works without a sign-in flow.' },
        { question: 'Where is my CV data stored?', answer: 'The current profile is persisted in your browser localStorage. The app does not silently upload the profile to a backend.' },
        { question: 'Are the sample metrics real business claims?', answer: 'No. Alex Chen is a fictional demonstration persona. His metrics exist only to show how rich career data can drive CV and portfolio layouts.' },
        { question: 'Can I use a simpler ATS layout?', answer: 'Yes. The same structured profile can render into a deliberately minimal ATS direction as well as more expressive portfolio layouts.' },
        { question: 'Can the same content power a portfolio website?', answer: 'Yes. The 360° data layer keeps deeper project context, proof and testimonials that do not need to appear in a compact A4 resume.' },
      ],
    }
  },
  methods: {
    hideBrokenImage(event) {
      const image = event.currentTarget
      image.style.display = 'none'
      image.parentElement?.classList.add('has-image-fallback')
    },
  },
}
</script>
