<template>
  <main class="concept-app" :class="`concept-${activeId}`" :style="pointerStyle" @pointermove="handlePointerMove" @pointerleave="resetPointer">
    <div class="concept-progress" aria-hidden="true"><span :style="{ width: `${scrollProgress}%` }"></span></div>

    <nav class="concept-nav">
      <button class="concept-brand" type="button" aria-label="Back to CV Studio" @click="$emit('back')"><span>CV</span><b>Studio</b></button>
      <div class="concept-tabs" aria-label="CV web concepts">
        <a v-for="(item, index) in concepts" :key="item.id" :href="`#concept-${item.id}`" :class="{ active: activeId === item.id }" :aria-current="activeId === item.id ? 'page' : undefined"><span>0{{ index + 1 }}</span>{{ item.short }}</a>
      </div>
      <div class="concept-nav-actions"><span class="concept-key-hint">1–5 to switch</span><a class="repo-link" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">GitHub ↗</a></div>
    </nav>

    <section v-if="activeId === 'apple'" class="concept-page apple-page">
      <div class="apple-copy reveal-copy">
        <span class="concept-eyebrow">01 · APPLE EDITORIAL</span>
        <h1>Một CV đẹp<br />mở ra <em>cơ hội mới.</em></h1>
        <p>Typography-first, nhiều khoảng thở và tập trung tuyệt đối vào câu chuyện nghề nghiệp. Dành cho Senior UI/UX, Product Designer và Design Lead.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">Xem source</a></div>
        <div class="apple-metrics"><div><b>05</b><span>Concepts</span></div><div><b>A4</b><span>Print ready</span></div><div><b>100%</b><span>Editable</span></div></div>
      </div>
      <div class="apple-stage concept-parallax">
        <div class="paper-stack paper-back"></div><div class="paper-stack paper-mid"></div>
        <article class="resume-paper editorial-paper">
          <header><div><span>PRODUCT DESIGNER</span><h2>{{ profile.name }}</h2><p>{{ profile.role }}</p></div><div class="portrait-shape"></div></header>
          <div class="editorial-rule"></div>
          <div class="editorial-grid"><section><small>EXPERIENCE</small><div v-for="job in profile.experience.slice(0,2)" :key="job.company" class="mini-job"><b>{{ job.role }}</b><span>{{ job.company }} · {{ job.period }}</span></div></section><aside><small>ABOUT</small><p>{{ shortSummary }}</p><small>SKILLS</small><p>{{ profile.skills.slice(0,6).join(' · ') }}</p></aside></div>
        </article>
        <div class="floating-note">Your story<br /><b>matters.</b></div>
      </div>
    </section>

    <section v-else-if="activeId === 'bento'" class="concept-page bento-page">
      <div class="bento-copy reveal-copy">
        <span class="concept-pill">02 · BENTO PRODUCT</span>
        <h1>Biến kinh nghiệm<br />thành <em>impact.</em></h1>
        <p>Dashboard-inspired CV landing page nhấn mạnh thành tựu, số liệu và breadth of work. Phù hợp Product Designer và Product-minded UI/UX.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary dark" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">GitHub repo</a></div>
      </div>
      <div class="bento-board concept-parallax">
        <div class="bento-card bento-profile"><div><small>PROFILE</small><h2>{{ profile.name }}</h2><p>{{ profile.role }}</p></div><div class="avatar-orb"></div></div>
        <div v-for="metric in profile.highlights.slice(0,3)" :key="metric.label" class="bento-card metric"><b>{{ metric.value }}</b><span>{{ metric.label }}</span></div>
        <div class="bento-card bento-experience"><small>EXPERIENCE</small><div v-for="job in profile.experience.slice(0,2)" :key="job.company"><b>{{ job.role }}</b><span>{{ job.company }}</span></div></div>
        <div class="bento-card bento-skills"><small>STACK</small><span v-for="skill in profile.skills.slice(0,8)" :key="skill">{{ skill }}</span></div>
        <div class="bento-card bento-project"><small>SELECTED WORK</small><div class="project-visual" :class="{ 'has-cover': !!firstProject.image }" :style="projectCoverStyle(firstProject.image)"></div><b>{{ firstProject.name }}</b><span>{{ firstProject.impact }}</span></div>
      </div>
      <div class="bento-glow"></div>
    </section>

    <section v-else-if="activeId === 'engineer'" class="concept-page engineer-page">
      <div class="engineer-copy reveal-copy">
        <span class="terminal-label">&lt;/&gt; 03 · DESIGN ENGINEER</span>
        <h1>Kết nối thiết kế<br />và <span>công nghệ.</span></h1>
        <p>Concept dành cho người vừa làm sản phẩm vừa hiểu implementation. Nội dung được chia rõ Design ↔ Engineering để recruiter đọc trong vài giây.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Build my CV <span>→</span></a><a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">View repo</a></div>
        <div class="engineer-tools"><span v-for="skill in profile.skills.slice(0,5)" :key="skill">{{ skill }}</span></div>
      </div>
      <div class="engineer-console concept-parallax">
        <div class="console-sidebar"><div class="avatar-code">MD</div><b>{{ profile.name }}</b><span>Design × Code</span><div class="console-links"><span>● {{ profile.location }}</span><span>● Product</span><span>● Frontend-aware</span></div><blockquote>“Good design ships faster.”</blockquote></div>
        <div class="console-main"><div class="console-window"><i></i><i></i><i></i><span>profile.ts</span></div><div class="dual-column"><section><small>DESIGN</small><h3>{{ profile.skills[0] || 'Product Thinking' }}</h3><p>Flows, systems, research and interface craft.</p><h3>{{ profile.skills[2] || 'Design Systems' }}</h3><p>Tokens, components and documentation.</p></section><section><small>ENGINEERING</small><h3>Frontend Stack</h3><p>{{ profile.skills.slice(6,10).join(', ') || 'Vue, React, TypeScript and UI architecture.' }}</p><h3>AI Workflow</h3><p>Audit, generation and design QA automation.</p></section></div><div class="code-strip"><span>const</span> impact = design + code + iteration;</div></div>
      </div>
    </section>

    <section v-else-if="activeId === 'case-study'" class="concept-page case-page">
      <div class="case-copy reveal-copy">
        <span class="concept-pill light">04 · CASE STUDY RESUME</span>
        <h1>Những dự án<br />tạo nên <em>giá trị.</em></h1>
        <p>Thay vì liệt kê nhiệm vụ, concept kể câu chuyện theo cấu trúc Problem → Role → Solution → Impact. Tối ưu cho Senior Product Designer.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">Repo giới thiệu</a></div>
        <div class="case-stats"><span><b>{{ String(profile.projects.length).padStart(2, '0') }}</b> flagship cases</span><span><b>4-step</b> story</span><span><b>PDF</b> ready</span></div>
      </div>
      <div class="case-board concept-parallax">
        <header><div class="case-avatar"></div><div><b>{{ profile.name }}</b><span>{{ profile.role }}</span></div><nav>Work · Experience · Skills</nav></header>
        <article v-for="(project, index) in profile.projects.slice(0,3)" :key="`${project.name}-${index}`" class="case-row">
          <div class="case-number">0{{ index + 1 }}</div><div class="case-art" :class="[`art-${index}`, { 'has-cover': !!project.image }]" :style="projectCoverStyle(project.image)"></div><div class="case-title"><b>{{ project.name }}</b><span>{{ project.type }}</span></div><div><small>PROBLEM</small><p>Complex workflow with fragmented information.</p></div><div><small>SOLUTION</small><p>{{ compact(project.description, 72) }}</p></div><div class="impact"><small>IMPACT</small><b>{{ impactNumber(index) }}</b><span>{{ project.impact }}</span></div>
        </article>
      </div>
    </section>

    <section v-else class="concept-page executive-page">
      <div class="executive-aurora aurora-a"></div><div class="executive-aurora aurora-b"></div>
      <div class="executive-copy reveal-copy">
        <span class="gold-label">PREMIUM · 05</span>
        <h1>Nâng tầm sự nghiệp<br />với một CV <em>xứng tầm.</em></h1>
        <p>Dark glass direction dành cho Senior, Lead và management track. Tập trung leadership, impact và độ tin cậy.</p>
        <div class="concept-actions gold-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary dark" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">View source</a></div>
        <div class="exec-metrics"><div v-for="metric in profile.highlights.slice(0,3)" :key="metric.label"><b>{{ metric.value }}</b><span>{{ metric.label }}</span></div></div>
      </div>
      <div class="executive-glass concept-parallax">
        <div class="exec-profile"><div class="exec-portrait"></div><div><small>DESIGN LEAD</small><h2>{{ profile.name }}</h2><p>{{ profile.role }}</p></div></div>
        <div class="exec-highlights"><div v-for="(project, index) in profile.projects.slice(0,3)" :key="project.name"><span>0{{ index + 1 }}</span><b>{{ project.name }}</b><small>{{ project.impact }}</small></div></div>
        <div class="exec-timeline"><small>EXPERIENCE</small><div v-for="job in profile.experience.slice(0,3)" :key="job.company"><i></i><b>{{ job.role }}</b><span>{{ job.company }}</span><time>{{ job.period }}</time></div></div>
      </div>
    </section>

    <section class="concept-story" aria-labelledby="concept-story-title">
      <div class="story-heading"><span>DESIGN DIRECTION</span><h2 id="concept-story-title">{{ activeConcept.name }}</h2><p>{{ activeConcept.story }}</p></div>
      <div class="story-grid"><article v-for="(principle, index) in activeConcept.principles" :key="principle.title"><span>0{{ index + 1 }}</span><h3>{{ principle.title }}</h3><p>{{ principle.body }}</p></article></div>
      <div class="motion-note"><div><span>MOTION</span><strong>{{ activeConcept.motion }}</strong></div><div><span>BEST FOR</span><strong>{{ activeConcept.audience }}</strong></div><div><span>UX INTENT</span><strong>{{ activeConcept.intent }}</strong></div></div>
      <div class="concept-end-cta"><div><small>READY TO CUSTOMIZE?</small><h2>Dùng concept này với hồ sơ của bạn.</h2></div><div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Mở CV Studio <span>→</span></a><a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">GitHub repo ↗</a></div></div>
    </section>

    <footer class="concept-footer"><span>CV Studio · Vue 3.5 · Vite 8.3</span><span>{{ activeConcept.name }} · full-screen concept</span></footer>
    <div class="concept-index" aria-label="Quick concept switcher"><a v-for="(item, index) in concepts" :key="item.id" :href="`#concept-${item.id}`" :class="{ active: activeId === item.id }" :title="`${index + 1}: ${item.name}`">0{{ index + 1 }}</a></div>
  </main>
</template>

<script>
import { candidate } from '../data/cv'

const STORAGE_KEY = 'cv-studio-profile-v1'
const clone = (value) => JSON.parse(JSON.stringify(value))

export default {
  name: 'ConceptExperience',
  props: { conceptId: { type: String, default: 'apple' } },
  emits: ['back'],
  data() {
    return {
      profile: clone(candidate), scrollProgress: 0, pointerX: 0, pointerY: 0,
      concepts: [
        { id:'apple',short:'Editorial',name:'Apple Editorial',story:'A typography-led portfolio CV where whitespace, rhythm and editorial hierarchy make senior experience feel calm and confident.',audience:'Senior UI/UX · Product Designer · Design Lead',motion:'Paper float, restrained parallax, soft reveal and underline transitions.',intent:'Make the recruiter slow down and read the story.',principles:[{title:'Typography first',body:'Large editorial type creates hierarchy before cards, icons or decoration.'},{title:'Calm density',body:'Long-form experience remains readable through whitespace and strong column rhythm.'},{title:'Premium restraint',body:'Minimal accent color keeps attention on career narrative and selected work.'}]},
        { id:'bento',short:'Bento',name:'Bento Product',story:'A product-minded CV that packages role, metrics, skills and selected work into fast-scanning blocks inspired by modern dashboards.',audience:'Product Designer · Product UI/UX · Design Systems',motion:'Card lift, ambient glow, depth shift and responsive grid reflow.',intent:'Communicate breadth and measurable impact in seconds.',principles:[{title:'Impact before detail',body:'Metrics and outcomes are surfaced before deeper career history.'},{title:'Modular storytelling',body:'Bento blocks let each information type keep its own visual priority.'},{title:'Fast scanning',body:'Recruiters can understand seniority, scope and skill coverage without reading linearly.'}]},
        { id:'engineer',short:'Engineer',name:'Design Engineer',story:'A hybrid portfolio CV for designers who understand implementation, systems and frontend delivery—not only visual design.',audience:'Design Engineer · Code-aware Product Designer · UX Engineer',motion:'Console entrance, code shimmer, precise hover states and subtle pointer depth.',intent:'Prove that design decisions can survive implementation.',principles:[{title:'Design × code',body:'Design capability and engineering fluency receive equal visual weight.'},{title:'System thinking',body:'Tools, design systems and architecture sit alongside UX craft.'},{title:'Implementation signal',body:'Technical details help engineering-heavy teams assess fit immediately.'}]},
        { id:'case-study',short:'Case Study',name:'Case Study Resume',story:'A project-first CV that turns selected work into concise mini case studies built around problem, role, solution and impact.',audience:'Senior Product Designer · UX Lead · Portfolio-heavy roles',motion:'Scroll reveal, row focus, impact emphasis and progressive storytelling.',intent:'Show how the candidate thinks, not only where they worked.',principles:[{title:'Projects lead',body:'Flagship work appears before the conventional employment timeline.'},{title:'Problem to impact',body:'Every case follows a repeatable narrative recruiters already understand.'},{title:'Evidence based',body:'Outcomes and metrics become visual anchors instead of footnotes.'}]},
        { id:'executive',short:'Executive',name:'Executive Dark Glass',story:'A premium leadership CV with cinematic dark glass, restrained highlights and executive-level emphasis on scale and ownership.',audience:'Design Lead · Product Lead · Head of Design · Senior leadership',motion:'Ambient aurora, glass depth, low-amplitude parallax and luminous focus states.',intent:'Create authority without looking like a generic corporate resume.',principles:[{title:'Authority first',body:'The opening frame establishes seniority, scale and leadership before granular detail.'},{title:'Controlled contrast',body:'Dark surfaces and warm highlights create premium hierarchy without visual noise.'},{title:'Leadership proof',body:'Systems, AI product work and team ownership become key evidence blocks.'}]},
      ],
    }
  },
  computed: {
    activeId() { return this.concepts.some((item) => item.id === this.conceptId) ? this.conceptId : 'apple' },
    activeConcept() { return this.concepts.find((item) => item.id === this.activeId) || this.concepts[0] },
    pointerStyle() { return { '--pointer-x': `${this.pointerX}px`, '--pointer-y': `${this.pointerY}px` } },
    shortSummary() { return this.compact(this.profile.summary, 160) },
    firstProject() { return this.profile.projects?.[0] || { name: 'Selected project', impact: 'Product impact', image: '' } },
  },
  watch: { activeId() { this.resetPointer(); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' })) } },
  mounted() { this.restoreProfile(); this.updateScrollProgress(); window.addEventListener('scroll', this.updateScrollProgress, { passive: true }); window.addEventListener('keydown', this.handleKeydown); window.addEventListener('storage', this.handleStorage) },
  beforeUnmount() { window.removeEventListener('scroll', this.updateScrollProgress); window.removeEventListener('keydown', this.handleKeydown); window.removeEventListener('storage', this.handleStorage) },
  methods: {
    restoreProfile() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (saved && typeof saved === 'object') this.profile = { ...clone(candidate), ...saved } } catch (error) { console.warn('Unable to restore CV profile for concept pages.', error) } },
    handleStorage(event) { if (event.key === STORAGE_KEY) this.restoreProfile() },
    compact(value, max = 100) { const text = String(value || '').trim(); return text.length <= max ? text : `${text.slice(0, max).trim()}…` },
    impactNumber(index) { return this.profile.highlights?.[index]?.value || ['+40%', '+60%', '+120%'][index] || '+40%' },
    projectCoverStyle(url) { if (!url) return {}; const safe = String(url).replace(/"/g, '%22'); return { backgroundImage: `linear-gradient(rgba(8,15,30,.06), rgba(8,15,30,.06)), url("${safe}")`, backgroundSize: 'cover', backgroundPosition: 'center' } },
    updateScrollProgress() { const root = document.documentElement; const total = Math.max(root.scrollHeight - window.innerHeight, 1); this.scrollProgress = Math.min(100, Math.max(0, (window.scrollY / total) * 100)) },
    handlePointerMove(event) { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; this.pointerX = ((event.clientX / window.innerWidth) - 0.5) * 12; this.pointerY = ((event.clientY / window.innerHeight) - 0.5) * 12 },
    resetPointer() { this.pointerX = 0; this.pointerY = 0 },
    handleKeydown(event) { const target = event.target; if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return; const numeric = Number(event.key); if (numeric >= 1 && numeric <= 5) { window.location.hash = `concept-${this.concepts[numeric - 1].id}`; return } const current = this.concepts.findIndex((item) => item.id === this.activeId); if (event.key === 'ArrowRight') window.location.hash = `concept-${this.concepts[(current + 1) % this.concepts.length].id}`; else if (event.key === 'ArrowLeft') window.location.hash = `concept-${this.concepts[(current - 1 + this.concepts.length) % this.concepts.length].id}`; else if (event.key === 'Escape') this.$emit('back') },
  },
}
</script>
