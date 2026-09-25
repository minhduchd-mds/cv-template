<template>
  <main class="interview-page">
    <header class="interview-nav">
      <a class="interview-brand" href="./" @click.prevent="goHome">
        <span class="interview-brand__mark">CV</span>
        <span><strong>CV Studio</strong><small>Interview Prep</small></span>
      </a>
      <div class="interview-nav__actions">
        <a class="interview-link" href="#studio">Mở CV Studio</a>
        <a class="interview-primary" href="./" @click.prevent="goHome">← Trang chủ</a>
      </div>
    </header>

    <section class="interview-hero">
      <div class="interview-hero__copy">
        <span class="interview-kicker">INTERVIEW PREP · ROLE-AWARE</span>
        <h1>Các câu hỏi phỏng vấn thường gặp, <em>được điều chỉnh theo CV đang dùng.</em></h1>
        <p>
          Không học thuộc câu trả lời mẫu. Hệ thống giúp anh hiểu nhà tuyển dụng đang kiểm tra điều gì,
          chọn framework phù hợp và chuẩn bị bằng chứng mà mình có thể bảo vệ.
        </p>
      </div>
      <aside class="interview-context" aria-label="Current interview context">
        <span>CV đang chọn</span>
        <strong>{{ selectedTemplate?.name || 'CV Studio' }}</strong>
        <p>{{ activePack.label }} · {{ seniority }} · {{ activeStageLabel }}</p>
        <div class="interview-context__status">
          <b>{{ activeSources.length }}</b>
          <span>nguồn Internet tham khảo</span>
        </div>
      </aside>
    </section>

    <section class="interview-signal">
      <span>CV SIGNAL</span>
      <div>
        <strong>{{ activePack.signal }}</strong>
        <p>Nhà tuyển dụng có khả năng đào sâu: {{ activePack.probe }}</p>
      </div>
    </section>

    <section class="interview-workspace">
      <aside class="interview-rail">
        <div class="interview-control-group">
          <span class="interview-control-label">Ngữ cảnh CV</span>
          <label>
            <span>Mẫu CV</span>
            <select v-model="selectedTemplateId">
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </label>
          <label>
            <span>Role pack</span>
            <select v-model="rolePackId">
              <option v-for="pack in interviewPacks" :key="pack.id" :value="pack.id">
                {{ pack.label }}
              </option>
            </select>
          </label>
          <label>
            <span>Seniority</span>
            <select v-model="seniority">
              <option v-for="level in seniorityLevels" :key="level" :value="level">{{ level }}</option>
            </select>
          </label>
          <label>
            <span>Vòng phỏng vấn</span>
            <select v-model="stageId">
              <option v-for="stage in interviewStages" :key="stage.id" :value="stage.id">
                {{ stage.label }}
              </option>
            </select>
          </label>
        </div>

        <div class="interview-control-group">
          <span class="interview-control-label">Nhóm câu hỏi</span>
          <div class="interview-category-list" role="list">
            <button
              v-for="category in questionCategories"
              :key="category.id"
              type="button"
              :class="{ active: categoryId === category.id }"
              @click="categoryId = category.id"
            >
              <span>{{ category.label }}</span>
              <b>{{ categoryCount(category.id) }}</b>
            </button>
          </div>
        </div>
      </aside>

      <section class="interview-main">
        <article class="interview-pitch">
          <div>
            <span class="interview-kicker">30–60 SECOND POSITIONING</span>
            <h2>Present role → Scope → Evidence → Target role</h2>
          </div>
          <p>{{ pitchText }}</p>
          <small>Không thêm số liệu hoặc claim nếu anh không chắc nguồn và phạm vi contribution.</small>
        </article>

        <div class="interview-question-toolbar">
          <div>
            <span class="interview-kicker">{{ filteredQuestions.length }} QUESTIONS</span>
            <h2>{{ categoryLabel }}</h2>
          </div>
          <label class="interview-search">
            <span class="sr-only">Tìm câu hỏi</span>
            <input v-model.trim="query" type="search" placeholder="Tìm: stakeholder, metric, failure..." />
          </label>
        </div>

        <div class="interview-question-list">
          <details
            v-for="(item, index) in filteredQuestions"
            :key="item.id"
            class="interview-question"
            :open="index === 0"
          >
            <summary>
              <span class="interview-question__index">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <small>{{ categoryName(item.category) }}</small>
                <strong>{{ item.question }}</strong>
              </div>
              <b class="interview-question__toggle" aria-hidden="true">+</b>
            </summary>
            <div class="interview-question__body">
              <section>
                <span>Họ muốn kiểm tra gì?</span>
                <p>{{ item.why }}</p>
              </section>
              <section>
                <span>Khung trả lời</span>
                <ol>
                  <li v-for="step in item.framework" :key="step">{{ step }}</li>
                </ol>
              </section>
              <section class="interview-question__example">
                <span>Cách trả lời mẫu</span>
                <p>“{{ item.example }}”</p>
              </section>
              <section>
                <span>Có thể bị hỏi tiếp</span>
                <ul>
                  <li v-for="followUp in item.followUps" :key="followUp">{{ followUp }}</li>
                </ul>
              </section>
              <section class="interview-question__avoid">
                <span>Tránh</span>
                <ul>
                  <li v-for="risk in item.avoid" :key="risk">{{ risk }}</li>
                </ul>
              </section>
            </div>
          </details>

          <div v-if="!filteredQuestions.length" class="interview-empty">
            Không tìm thấy câu hỏi phù hợp. Thử bỏ từ khóa hoặc chuyển nhóm câu hỏi.
          </div>
        </div>
      </section>

      <aside class="interview-coach">
        <section>
          <span class="interview-control-label">Answer Coach</span>
          <h3>Trước khi trả lời</h3>
          <ul class="interview-checklist">
            <li><b>01</b><span>Nêu rõ phần mình trực tiếp sở hữu.</span></li>
            <li><b>02</b><span>Dùng evidence có thể bảo vệ.</span></li>
            <li><b>03</b><span>Nói trade-off, không chỉ kể success.</span></li>
            <li><b>04</b><span>Kết thúc bằng result hoặc learning.</span></li>
          </ul>
        </section>

        <section>
          <span class="interview-control-label">Framework nhanh</span>
          <dl class="interview-frameworks">
            <div><dt>Behavioral</dt><dd>STAR + Learning</dd></div>
            <div><dt>Project</dt><dd>Problem → Decision → Role → Trade-off → Result</dd></div>
            <div><dt>Failure</dt><dd>Own → What changed → New control</dd></div>
            <div><dt>Metrics</dt><dd>Baseline → Action → Signal → Evidence</dd></div>
          </dl>
        </section>

        <section class="interview-source-panel">
          <div class="interview-source-panel__heading">
            <span class="interview-control-label">Nguồn Internet</span>
            <small>Đối chiếu, không copy nguyên văn</small>
          </div>
          <a
            v-for="source in activeSources"
            :key="source.id"
            :href="source.url"
            target="_blank"
            rel="noreferrer noopener"
            class="interview-source"
          >
            <span><strong>{{ source.name }}</strong><small>{{ source.label }}</small></span>
            <b aria-hidden="true">↗</b>
            <p>{{ source.note }}</p>
          </a>
        </section>
      </aside>
    </section>
  </main>
</template>

<script>
import { templates } from '../data/cv'
import { readCanonicalWorkspace } from '../data/workspace-store'
import {
  coreQuestions,
  interviewPacks,
  interviewSources,
  interviewStages,
  questionCategories,
  seniorityLevels,
  templateInterviewPack,
} from '../data/interview-prep'

export default {
  name: 'InterviewPrep',
  emits: ['back'],
  data() {
    return {
      templates,
      interviewPacks,
      interviewStages,
      questionCategories,
      seniorityLevels,
      interviewSources,
      workspace: null,
      selectedTemplateId: templates[0]?.id || '',
      rolePackId: 'general',
      seniority: 'Senior',
      stageId: 'hiring-manager',
      categoryId: 'all',
      query: '',
    }
  },
  computed: {
    selectedTemplate() {
      return this.templates.find((template) => template.id === this.selectedTemplateId) || this.templates[0]
    },
    activePack() {
      return this.interviewPacks.find((pack) => pack.id === this.rolePackId)
        || this.interviewPacks.find((pack) => pack.id === 'general')
        || this.interviewPacks[0]
    },
    activeStageLabel() {
      return this.interviewStages.find((stage) => stage.id === this.stageId)?.label || 'Hiring Manager'
    },
    categoryLabel() {
      return this.questionCategories.find((category) => category.id === this.categoryId)?.label || 'Tất cả'
    },
    questionDeck() {
      const merged = [...coreQuestions, ...this.activePack.questions]
      return [...merged].sort((a, b) => this.stageWeight(a) - this.stageWeight(b))
    },
    filteredQuestions() {
      const keyword = this.query.toLocaleLowerCase('vi')
      return this.questionDeck.filter((item) => {
        const categoryMatch = this.categoryId === 'all' || item.category === this.categoryId
        if (!categoryMatch) return false
        if (!keyword) return true
        return [
          item.question,
          item.why,
          item.example,
          ...item.framework,
          ...item.followUps,
          ...item.avoid,
        ].join(' ').toLocaleLowerCase('vi').includes(keyword)
      })
    },
    activeSources() {
      const preferred = this.interviewSources.filter((source) =>
        source.packs.includes(this.rolePackId) || source.packs.includes('general')
      )
      const seen = new Set()
      return preferred.filter((source) => {
        if (seen.has(source.id)) return false
        seen.add(source.id)
        return true
      }).slice(0, 6)
    },
    pitchText() {
      const profile = this.workspace?.profile || {}
      const role = profile?.personal?.role
        || profile?.identity?.role
        || profile?.role
        || this.selectedTemplate?.role
        || this.activePack.label
      return `Hiện tại tôi tập trung vào [${role} / phạm vi thực tế]. Thế mạnh liên quan nhất của tôi là [A] và [B], thể hiện qua [dự án hoặc kết quả có thể kiểm chứng]. Tôi đang tìm bước tiếp theo nơi mình có thể chịu trách nhiệm sâu hơn về [scope mục tiêu] và tạo giá trị ở [problem của vị trí].`
    },
  },
  watch: {
    selectedTemplateId(nextId) {
      const mapped = templateInterviewPack[nextId]
      if (mapped) this.rolePackId = mapped
    },
  },
  mounted() {
    this.workspace = readCanonicalWorkspace()
    const storedId = this.workspace?.studio?.selectedId
    if (storedId && this.templates.some((template) => template.id === storedId)) {
      this.selectedTemplateId = storedId
    } else {
      this.rolePackId = templateInterviewPack[this.selectedTemplateId] || 'general'
    }
  },
  methods: {
    goHome() {
      this.$emit('back')
    },
    categoryName(id) {
      return this.questionCategories.find((category) => category.id === id)?.label || 'Role-specific'
    },
    categoryCount(id) {
      if (id === 'all') return this.questionDeck.length
      return this.questionDeck.filter((item) => item.category === id).length
    },
    stageWeight(item) {
      const maps = {
        hr: { core: 1, behavioral: 2, challenge: 3, role: 4, case: 5, askback: 6 },
        'hiring-manager': { role: 1, core: 2, case: 3, behavioral: 4, challenge: 5, askback: 6 },
        technical: { role: 1, case: 2, challenge: 3, core: 4, behavioral: 5, askback: 6 },
        portfolio: { case: 1, role: 2, core: 3, behavioral: 4, challenge: 5, askback: 6 },
        final: { behavioral: 1, challenge: 2, role: 3, core: 4, case: 5, askback: 6 },
      }
      return maps[this.stageId]?.[item.category] || 9
    },
  },
}
</script>

<style scoped lang="scss">
.interview-page {
  --page-bg: var(--apple-bg, #f5f5f7);
  --label: var(--apple-label, #1d1d1f);
  --secondary: var(--apple-secondary, #6e6e73);
  --tertiary: var(--apple-tertiary, #8e8e93);
  --blue: var(--apple-blue, #0071e3);
  --separator: var(--apple-separator, rgba(60, 60, 67, .14));
  --fill: var(--apple-fill, rgba(118, 118, 128, .12));
  min-height: 100vh;
  color: var(--label);
  background: var(--page-bg);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Segoe UI", sans-serif;
}

.interview-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  min-height: 72px;
  padding: 12px clamp(20px, 4vw, 64px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: rgba(250, 250, 252, .82);
  backdrop-filter: saturate(180%) blur(22px);
  border-bottom: 1px solid var(--separator);
}

.interview-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;

  strong, small { display: block; }
  strong { font-size: 15px; font-weight: 700; }
  small { margin-top: 2px; color: var(--secondary); font-size: 12px; }
}

.interview-brand__mark {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--label);
  color: white;
  font-weight: 760;
  letter-spacing: -.04em;
}

.interview-nav__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.interview-link,
.interview-primary {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  padding: 0 16px;
  border-radius: 11px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 650;
  transition: transform 160ms ease, background 160ms ease;
}

.interview-link {
  color: var(--label);
  background: var(--fill);
}

.interview-primary {
  color: #fff;
  background: var(--blue);
}

.interview-link:active,
.interview-primary:active { transform: scale(.98); }

.interview-hero {
  max-width: 1440px;
  margin: 0 auto;
  padding: clamp(64px, 8vw, 116px) clamp(20px, 5vw, 80px) 56px;
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, .7fr);
  gap: clamp(48px, 8vw, 120px);
  align-items: end;
}

.interview-hero__copy {
  max-width: 850px;

  h1 {
    margin: 18px 0 24px;
    max-width: 17ch;
    font-size: clamp(42px, 6.1vw, 82px);
    line-height: .98;
    letter-spacing: -.055em;
    font-weight: 710;
    text-wrap: balance;
  }

  h1 em {
    color: var(--secondary);
    font-style: normal;
    font-weight: 540;
  }

  p {
    max-width: 65ch;
    margin: 0;
    color: var(--secondary);
    font-size: clamp(16px, 1.5vw, 20px);
    line-height: 1.62;
    text-wrap: pretty;
  }
}

.interview-kicker,
.interview-control-label {
  color: var(--tertiary);
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: .12em;
  font-weight: 720;
  text-transform: uppercase;
}

.interview-context {
  padding: 24px;
  border-top: 1px solid var(--label);
  border-bottom: 1px solid var(--separator);

  > span { color: var(--tertiary); font-size: 12px; }
  > strong { display: block; margin: 10px 0 4px; font-size: 24px; letter-spacing: -.03em; }
  > p { margin: 0; color: var(--secondary); font-size: 14px; line-height: 1.5; }
}

.interview-context__status {
  margin-top: 28px;
  padding-top: 20px;
  display: flex;
  align-items: baseline;
  gap: 8px;
  border-top: 1px solid var(--separator);

  b { font-size: 30px; letter-spacing: -.04em; }
  span { color: var(--secondary); font-size: 13px; }
}

.interview-signal {
  max-width: 1440px;
  margin: 0 auto 32px;
  padding: 24px clamp(20px, 5vw, 80px);
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 24px;
  border-top: 1px solid var(--separator);
  border-bottom: 1px solid var(--separator);

  > span {
    color: var(--blue);
    font-size: 11px;
    font-weight: 760;
    letter-spacing: .12em;
  }

  strong { display: block; max-width: 70ch; font-size: 17px; line-height: 1.45; }
  p { max-width: 75ch; margin: 8px 0 0; color: var(--secondary); line-height: 1.55; }
}

.interview-workspace {
  max-width: 1540px;
  margin: 0 auto;
  padding: 24px clamp(20px, 3.5vw, 56px) 96px;
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr) 292px;
  gap: 28px;
  align-items: start;
}

.interview-rail,
.interview-coach {
  position: sticky;
  top: 96px;
}

.interview-control-group + .interview-control-group,
.interview-coach section + section {
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid var(--separator);
}

.interview-control-group label {
  display: block;
  margin-top: 16px;

  > span {
    display: block;
    margin-bottom: 7px;
    color: var(--secondary);
    font-size: 12px;
    font-weight: 620;
  }
}

.interview-control-group select,
.interview-search input {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--separator);
  border-radius: 11px;
  background: rgba(255, 255, 255, .84);
  color: var(--label);
  padding: 0 12px;
  font: inherit;
  font-size: 14px;
}

.interview-control-group select:focus-visible,
.interview-search input:focus-visible,
.interview-category-list button:focus-visible,
.interview-question summary:focus-visible,
.interview-source:focus-visible,
.interview-link:focus-visible,
.interview-primary:focus-visible {
  outline: 3px solid rgba(0, 113, 227, .28);
  outline-offset: 2px;
}

.interview-category-list {
  margin-top: 12px;
  display: grid;
  gap: 3px;
}

.interview-category-list button {
  min-height: 42px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--secondary);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;

  b { color: var(--tertiary); font-size: 11px; }
}

.interview-category-list button:hover,
.interview-category-list button.active {
  background: var(--fill);
  color: var(--label);
}

.interview-category-list button.active b { color: var(--blue); }

.interview-main { min-width: 0; }

.interview-pitch {
  padding: clamp(24px, 4vw, 42px);
  background: #fff;
  border-radius: 24px;
  border: 1px solid var(--separator);

  h2 {
    margin: 8px 0 0;
    max-width: 26ch;
    font-size: clamp(24px, 3vw, 38px);
    letter-spacing: -.04em;
    line-height: 1.08;
  }

  > p {
    margin: 30px 0 14px;
    max-width: 68ch;
    color: var(--label);
    font-size: 16px;
    line-height: 1.7;
  }

  > small { color: var(--secondary); line-height: 1.5; }
}

.interview-question-toolbar {
  margin: 48px 0 16px;
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;

  h2 {
    margin: 8px 0 0;
    font-size: 30px;
    letter-spacing: -.035em;
  }
}

.interview-search { width: min(320px, 42%); }

.interview-question-list {
  display: grid;
  gap: 10px;
}

.interview-question {
  overflow: hidden;
  background: #fff;
  border: 1px solid var(--separator);
  border-radius: 18px;
}

.interview-question summary {
  min-height: 86px;
  padding: 18px 20px;
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 28px;
  gap: 14px;
  align-items: center;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker { display: none; }

  small {
    display: block;
    margin-bottom: 5px;
    color: var(--tertiary);
    font-size: 10px;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  strong {
    display: block;
    font-size: 16px;
    line-height: 1.45;
  }
}

.interview-question__index {
  color: var(--tertiary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.interview-question__toggle {
  color: var(--blue);
  font-size: 20px;
  font-weight: 500;
  transition: transform 180ms ease;
}

.interview-question[open] .interview-question__toggle { transform: rotate(45deg); }

.interview-question__body {
  padding: 0 20px 24px 70px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px 32px;

  section {
    padding-top: 18px;
    border-top: 1px solid var(--separator);
  }

  section > span {
    display: block;
    margin-bottom: 8px;
    color: var(--tertiary);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  p, li { color: var(--secondary); font-size: 14px; line-height: 1.62; }
  p { margin: 0; }
  ol, ul { margin: 0; padding-left: 18px; }
}

.interview-question__example {
  grid-column: 1 / -1;

  p {
    max-width: 72ch;
    color: var(--label);
    font-size: 15px;
  }
}

.interview-question__avoid li::marker { color: #c9342f; }

.interview-empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--secondary);
  border: 1px dashed var(--separator);
  border-radius: 18px;
}

.interview-coach section > h3 {
  margin: 10px 0 18px;
  font-size: 20px;
  letter-spacing: -.025em;
}

.interview-checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;

  li { display: grid; grid-template-columns: 26px 1fr; gap: 10px; align-items: start; }
  b { color: var(--blue); font-size: 11px; line-height: 1.6; }
  span { color: var(--secondary); font-size: 13px; line-height: 1.55; }
}

.interview-frameworks {
  margin: 14px 0 0;

  div { padding: 12px 0; border-bottom: 1px solid var(--separator); }
  dt { color: var(--label); font-size: 12px; font-weight: 680; }
  dd { margin: 4px 0 0; color: var(--secondary); font-size: 12px; line-height: 1.5; }
}

.interview-source-panel__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;

  small { color: var(--tertiary); font-size: 10px; }
}

.interview-source {
  margin-top: 10px;
  padding: 13px 0;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 10px;
  color: inherit;
  text-decoration: none;
  border-bottom: 1px solid var(--separator);

  strong, small { display: block; }
  strong { font-size: 12px; }
  small { margin-top: 2px; color: var(--secondary); font-size: 11px; }
  > b { color: var(--blue); font-size: 12px; }
  p { grid-column: 1 / -1; margin: 5px 0 0; color: var(--secondary); font-size: 11px; line-height: 1.48; }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1180px) {
  .interview-workspace {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .interview-coach {
    position: static;
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 28px;
    padding-top: 28px;
    border-top: 1px solid var(--separator);
  }

  .interview-coach section + section {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
}

@media (max-width: 820px) {
  .interview-nav {
    padding-inline: 16px;
  }

  .interview-brand small,
  .interview-link { display: none; }

  .interview-hero {
    grid-template-columns: 1fr;
    gap: 36px;
    padding-top: 56px;
  }

  .interview-hero__copy h1 { font-size: clamp(40px, 11vw, 62px); }

  .interview-signal {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .interview-workspace {
    grid-template-columns: 1fr;
    padding-inline: 16px;
  }

  .interview-rail {
    position: static;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 20px;
  }

  .interview-control-group + .interview-control-group {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }

  .interview-coach {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 580px) {
  .interview-primary {
    min-height: 44px;
    padding-inline: 13px;
  }

  .interview-hero {
    padding-inline: 18px;
    padding-bottom: 40px;
  }

  .interview-hero__copy h1 {
    margin-top: 14px;
    font-size: 40px;
  }

  .interview-signal { padding-inline: 18px; }

  .interview-rail { grid-template-columns: 1fr; }

  .interview-question-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .interview-search { width: 100%; }

  .interview-question summary {
    min-height: 78px;
    padding: 16px;
    grid-template-columns: 28px minmax(0, 1fr) 22px;
    gap: 10px;
  }

  .interview-question__body {
    padding: 0 16px 20px;
    grid-template-columns: 1fr;
  }

  .interview-question__example { grid-column: auto; }
}

@media (prefers-reduced-motion: reduce) {
  .interview-link,
  .interview-primary,
  .interview-question__toggle {
    transition: none;
  }
}
</style>
