<template>
  <main class="concept-app" :class="`concept-${activeId}`">
    <nav class="concept-nav">
      <button class="concept-brand" type="button" @click="$emit('back')">
        <span>CV</span><b>Studio</b>
      </button>
      <div class="concept-tabs" aria-label="CV web concepts">
        <a v-for="(item, index) in concepts" :key="item.id" :href="`#concept-${item.id}`" :class="{ active: activeId === item.id }">
          <span>0{{ index + 1 }}</span>{{ item.short }}
        </a>
      </div>
      <a class="repo-link" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">GitHub ↗</a>
    </nav>

    <!-- 01 Apple Editorial -->
    <section v-if="activeId === 'apple'" class="concept-page apple-page">
      <div class="apple-copy reveal-copy">
        <span class="concept-eyebrow">01 · APPLE EDITORIAL</span>
        <h1>Một CV đẹp<br />mở ra <em>cơ hội mới.</em></h1>
        <p>Typography-first, nhiều khoảng thở và tập trung tuyệt đối vào câu chuyện nghề nghiệp. Dành cho Senior UI/UX, Product Designer và Design Lead.</p>
        <div class="concept-actions">
          <a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a>
          <a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">Xem source</a>
        </div>
        <div class="apple-metrics"><div><b>05</b><span>Concepts</span></div><div><b>A4</b><span>Print ready</span></div><div><b>100%</b><span>Editable</span></div></div>
      </div>
      <div class="apple-stage">
        <div class="paper-stack paper-back"></div><div class="paper-stack paper-mid"></div>
        <article class="resume-paper editorial-paper">
          <header><div><span>PRODUCT DESIGNER</span><h2>{{ profile.name }}</h2><p>{{ profile.role }}</p></div><div class="portrait-shape"></div></header>
          <div class="editorial-rule"></div>
          <div class="editorial-grid"><section><small>EXPERIENCE</small><div v-for="job in profile.experience.slice(0,2)" :key="job.company" class="mini-job"><b>{{ job.role }}</b><span>{{ job.company }} · {{ job.period }}</span></div></section><aside><small>ABOUT</small><p>{{ profile.summary.slice(0, 160) }}…</p><small>SKILLS</small><p>{{ profile.skills.slice(0,6).join(' · ') }}</p></aside></div>
        </article>
        <div class="floating-note">Your story<br /><b>matters.</b></div>
      </div>
    </section>

    <!-- 02 Bento -->
    <section v-else-if="activeId === 'bento'" class="concept-page bento-page">
      <div class="bento-copy reveal-copy">
        <span class="concept-pill">02 · BENTO PRODUCT</span>
        <h1>Biến kinh nghiệm<br />thành <em>impact.</em></h1>
        <p>Dashboard-inspired CV landing page nhấn mạnh thành tựu, số liệu và breadth of work. Phù hợp Product Designer và Product-minded UI/UX.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary dark" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">GitHub repo</a></div>
      </div>
      <div class="bento-board">
        <div class="bento-card bento-profile"><div><small>PROFILE</small><h2>{{ profile.name }}</h2><p>{{ profile.role }}</p></div><div class="avatar-orb"></div></div>
        <div class="bento-card metric"><b>6+</b><span>Years</span></div><div class="bento-card metric"><b>15+</b><span>Projects</span></div><div class="bento-card metric"><b>40%</b><span>Faster handoff</span></div>
        <div class="bento-card bento-experience"><small>EXPERIENCE</small><div v-for="job in profile.experience.slice(0,2)" :key="job.company"><b>{{ job.role }}</b><span>{{ job.company }}</span></div></div>
        <div class="bento-card bento-skills"><small>STACK</small><span v-for="skill in profile.skills.slice(0,8)" :key="skill">{{ skill }}</span></div>
        <div class="bento-card bento-project"><small>SELECTED WORK</small><div class="project-visual"></div><b>{{ profile.projects[0].name }}</b><span>{{ profile.projects[0].impact }}</span></div>
      </div>
      <div class="bento-glow"></div>
    </section>

    <!-- 03 Engineer -->
    <section v-else-if="activeId === 'engineer'" class="concept-page engineer-page">
      <div class="engineer-copy reveal-copy">
        <span class="terminal-label">&lt;/&gt; 03 · DESIGN ENGINEER</span>
        <h1>Kết nối thiết kế<br />và <span>công nghệ.</span></h1>
        <p>Concept dành cho người vừa làm sản phẩm vừa hiểu implementation. Nội dung được chia rõ Design ↔ Engineering để recruiter đọc trong vài giây.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Build my CV <span>→</span></a><a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">View repo</a></div>
        <div class="engineer-tools"><span>Figma</span><span>Vue</span><span>React</span><span>TypeScript</span><span>AI</span></div>
      </div>
      <div class="engineer-console">
        <div class="console-sidebar"><div class="avatar-code">MD</div><b>{{ profile.name }}</b><span>Design × Code</span><div class="console-links"><span>● Hanoi</span><span>● Product</span><span>● Frontend-aware</span></div><blockquote>“Good design ships faster.”</blockquote></div>
        <div class="console-main"><div class="console-window"><i></i><i></i><i></i><span>profile.ts</span></div><div class="dual-column"><section><small>DESIGN</small><h3>Product Thinking</h3><p>Flows, systems, research and interface craft.</p><h3>Design Systems</h3><p>Tokens, components and documentation.</p></section><section><small>ENGINEERING</small><h3>Frontend Stack</h3><p>Vue, React, TypeScript, CSS and UI architecture.</p><h3>AI Workflow</h3><p>Audit, generation and design QA automation.</p></section></div><div class="code-strip"><span>const</span> impact = design + code + iteration;</div></div>
      </div>
    </section>

    <!-- 04 Case Study -->
    <section v-else-if="activeId === 'case-study'" class="concept-page case-page">
      <div class="case-copy reveal-copy">
        <span class="concept-pill light">04 · CASE STUDY RESUME</span>
        <h1>Những dự án<br />tạo nên <em>giá trị.</em></h1>
        <p>Thay vì liệt kê nhiệm vụ, concept kể câu chuyện theo cấu trúc Problem → Role → Solution → Impact. Tối ưu cho Senior Product Designer.</p>
        <div class="concept-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">Repo giới thiệu</a></div>
        <div class="case-stats"><span><b>03</b> flagship cases</span><span><b>4-step</b> story</span><span><b>PDF</b> ready</span></div>
      </div>
      <div class="case-board">
        <header><div class="case-avatar"></div><div><b>{{ profile.name }}</b><span>{{ profile.role }}</span></div><nav>Work · Experience · Skills</nav></header>
        <article v-for="(project, index) in profile.projects.slice(0,3)" :key="project.name" class="case-row">
          <div class="case-number">0{{ index + 1 }}</div><div class="case-art" :class="`art-${index}`"></div><div class="case-title"><b>{{ project.name }}</b><span>{{ project.type }}</span></div><div><small>PROBLEM</small><p>Complex workflow with fragmented information.</p></div><div><small>SOLUTION</small><p>{{ project.description.slice(0,72) }}…</p></div><div class="impact"><small>IMPACT</small><b>{{ index === 0 ? '+40%' : index === 1 ? '+60%' : '+120%' }}</b><span>{{ project.impact }}</span></div>
        </article>
      </div>
    </section>

    <!-- 05 Executive -->
    <section v-else class="concept-page executive-page">
      <div class="executive-aurora aurora-a"></div><div class="executive-aurora aurora-b"></div>
      <div class="executive-copy reveal-copy">
        <span class="gold-label">PREMIUM · 05</span>
        <h1>Nâng tầm sự nghiệp<br />với một CV <em>xứng tầm.</em></h1>
        <p>Dark glass direction dành cho Senior, Lead và management track. Tập trung leadership, impact và độ tin cậy.</p>
        <div class="concept-actions gold-actions"><a href="#studio" @click.prevent="$emit('back')">Tạo CV ngay <span>→</span></a><a class="secondary dark" href="https://github.com/minhduchd-mds/cv-template" target="_blank" rel="noreferrer">View source</a></div>
        <div class="exec-metrics"><div><b>10+</b><span>Years craft</span></div><div><b>50+</b><span>Projects</span></div><div><b>100%</b><span>Impact-led</span></div></div>
      </div>
      <div class="executive-glass">
        <div class="exec-profile"><div class="exec-portrait"></div><div><small>DESIGN LEAD</small><h2>{{ profile.name }}</h2><p>{{ profile.role }}</p></div></div>
        <div class="exec-highlights"><div><span>01</span><b>Design System</b><small>Scale & consistency</small></div><div><span>02</span><b>AI Product</b><small>Automation & QA</small></div><div><span>03</span><b>Team Lead</b><small>Mentoring & delivery</small></div></div>
        <div class="exec-timeline"><small>EXPERIENCE</small><div v-for="job in profile.experience.slice(0,3)" :key="job.company"><i></i><b>{{ job.role }}</b><span>{{ job.company }}</span><time>{{ job.period }}</time></div></div>
      </div>
    </section>

    <div class="concept-index">
      <a v-for="(item, index) in concepts" :key="item.id" :href="`#concept-${item.id}`" :class="{ active: activeId === item.id }" :title="item.name">0{{ index + 1 }}</a>
    </div>
  </main>
</template>

<script>
import { candidate } from '../data/cv'

export default {
  name: 'ConceptExperience',
  props: { conceptId: { type: String, default: 'apple' } },
  emits: ['back'],
  data() {
    return {
      profile: candidate,
      concepts: [
        { id: 'apple', short: 'Editorial', name: 'Apple Editorial' },
        { id: 'bento', short: 'Bento', name: 'Bento Product' },
        { id: 'engineer', short: 'Engineer', name: 'Design Engineer' },
        { id: 'case-study', short: 'Case Study', name: 'Case Study Resume' },
        { id: 'executive', short: 'Executive', name: 'Executive Dark Glass' },
      ],
    }
  },
  computed: {
    activeId() {
      return this.concepts.some((item) => item.id === this.conceptId) ? this.conceptId : 'apple'
    },
  },
}
</script>