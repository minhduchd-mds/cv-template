# Interview Prep — Script & Information Architecture

Status: **content script first**.  
This document defines the content and interaction model before any new landing-page route is wired.

## 1. Product intent

Add a new entry next to **CV Studio** on the landing page:

- Label: **Interview Prep**
- Vietnamese page title: **Các câu hỏi phỏng vấn thường gặp**
- Purpose: turn the selected CV/template into a role-aware interview preparation pack.
- Source of context: the current canonical workspace when available (`cv-studio-workspace-v3`), especially `studio.selectedId`, profile role, experience, projects and skills.
- Fallback: the user can manually choose a role pack.

This page must not pretend there is one correct interview answer. It should help the candidate build concise, evidence-backed answers using only facts they can defend.

---

## 2. Proposed page flow

### A. Context header

**Your interview pack**

Show:

- Current CV template
- Detected role family
- Seniority selector: Entry / Mid / Senior / Lead / Director
- Interview type: HR / Hiring Manager / Technical / Portfolio / Case / Final
- Button: **Change role**

Microcopy:

> We use the selected CV only to choose relevant question themes. Examples are answer structures, not claims you should copy as facts.

### B. 30-second positioning

Before question cards, help the user prepare a compact opening answer.

Formula:

**Present role → Scope → strongest evidence → target role**

Example skeleton:

> “I’m a [current role] with experience across [scope/domain]. My strongest work has been around [1–2 relevant strengths], where I contributed to [defensible result/evidence]. I’m now looking for a role where I can apply that experience to [target responsibility/problem].”

Checks:

- 35–60 seconds
- no life story
- no unsupported metrics
- end with relevance to the role being interviewed for

### C. Question deck

Tabs:

1. **Core**
2. **Experience**
3. **Role-specific**
4. **Projects / Case**
5. **Behavioral**
6. **Challenge / Failure**
7. **Questions to ask back**

Every question card contains:

- **Question**
- **Why they ask**
- **Answer structure**
- **Strong answer example**
- **Likely follow-up**
- **Avoid**

### D. Practice mode — later phase

Not part of the first UI implementation, but preserve room for:

- hide answer
- 60 / 90 / 120 second timer
- personal notes
- “I answered this well” marker
- mock interview sequence
- local-only saved practice history

---

## 3. Universal answer frameworks

### 3.1 30-second introduction — PRESENT

**P**resent role  
**R**esponsibility scope  
**E**vidence  
**S**pecialism  
**E**xpectation for next role  
**N/T** tie it to the target opportunity

Do not repeat every line of the CV.

### 3.2 Behavioral — STAR + Learning

**Situation → Task → Action → Result → Learning**

Important: Action should explain what **you** did, not only what “we” did.

### 3.3 Project / portfolio — PDRTL

**Problem → Decision → Role → Trade-off → Learning/result**

For design/product/technical interviews, this is often stronger than a chronological project retelling.

### 3.4 Failure / difficult situation — OWN

**O**wn the issue  
**W**hat changed  
**N**ew control/process afterwards

Avoid fake failures such as “I care too much about quality.”

### 3.5 Metrics — BASE

**B**aseline  
**A**ction  
**S**ignal / measurement  
**E**vidence confidence

If the exact number is confidential or uncertain, say that instead of inventing precision.

---

## 4. Core questions used across all CV types

### Q1. “Hãy giới thiệu về bản thân.”

**Why:** checks relevance, communication and self-positioning.

**Structure:** Present role → 2 strongest areas → proof → why this role now.

**Example:**

> “Hiện tại tôi tập trung vào [role/domain], với kinh nghiệm chính ở [area 1] và [area 2]. Trong các dự án gần đây tôi phụ trách [scope], phối hợp với [stakeholders] và có bằng chứng rõ nhất ở [result/project]. Tôi đang tìm vị trí tiếp theo nơi tôi có thể chịu trách nhiệm sâu hơn về [target scope].”

**Follow-up:** “What is your strongest skill?”  
**Avoid:** reciting education-to-present chronology.

### Q2. “Tại sao bạn muốn chuyển việc / ứng tuyển vị trí này?”

**Structure:** Pull factor, not complaint.

> “Điểm thu hút tôi là [specific scope/problem]. Kinh nghiệm của tôi ở [relevant evidence] khá gần với phần này, nhưng tôi muốn mở rộng trách nhiệm sang [new scope]. Vì vậy đây là bước đi có logic hơn là chỉ thay đổi môi trường.”

Avoid attacking the current employer.

### Q3. “Điểm mạnh lớn nhất của bạn?”

Use one strength + one example + one boundary.

> “Điểm mạnh nhất của tôi là [strength]. Ví dụ, ở [context], tôi đã [action], giúp [result]. Tôi thấy nó hữu ích nhất khi bài toán có [condition].”

### Q4. “Điểm yếu / điều đang cải thiện?”

Choose a real, manageable gap that does not destroy role fit.

> “Tôi từng [specific behavior]. Tôi nhận ra điều đó khi [signal]. Hiện tôi dùng [control/process] để cải thiện và theo dõi bằng [evidence].”

### Q5. “Một thành tựu bạn tự hào nhất?”

Use STAR + why it mattered to the business/user/team.

### Q6. “Kể về một lần bất đồng với stakeholder.”

Focus on disagreement method, evidence and decision quality; do not turn it into blame.

### Q7. “Một lần bạn thất bại?”

Own the decision, explain correction and the new safeguard.

### Q8. “Bạn ưu tiên công việc thế nào khi có nhiều task?”

Explain prioritization criteria: impact, urgency, dependency, risk, effort, commitment.

### Q9. “Bạn làm việc với feedback ra sao?”

Show separation of ego from evidence, but also ability to challenge feedback constructively.

### Q10. “Tại sao chúng tôi nên chọn bạn?”

Do not say “because I work hard.”

Use:

> role requirement → relevant proof → working style → first contribution.

### Q11. “Mức lương kỳ vọng?”

Give a range only when appropriate and ground it in scope, total package and market. Do not negotiate against yourself before understanding responsibility.

### Q12. “Bạn có câu hỏi gì cho chúng tôi?”

Always prepare questions about:

- success in the first 90 days
- decision ownership
- team interfaces
- biggest current problem
- how quality/performance is measured

---

# 5. Template → interview pack mapping

| CV template | Primary interview pack | Secondary emphasis |
| --- | --- | --- |
| Executive Edge | Executive / Leadership | Transformation, operating model |
| Soft Portfolio | UI/UX & Product Design | Portfolio critique, design systems |
| Product Operator | Product Management / Product Ops | Prioritization, roadmap, metrics |
| Code Aware | Design Engineer / Frontend | implementation, accessibility, architecture |
| ATS Precision | Software / Technical | execution, debugging, system thinking |
| Insight Grid | Data / BI | analytics, SQL/metrics, stakeholder insight |
| Brand Motion | Marketing / Communications | campaign strategy, brand, measurement |
| Revenue Driver | Sales / Business Development | pipeline, quota, negotiation |
| People First | HR / Talent / People Ops | hiring, employee lifecycle, policy |
| Next Start | Graduate / Entry Level | potential, projects, learning |
| Bento Resume | UI/UX / Creative Product | project storytelling, craft |
| Executive Navy | Executive / Leadership | governance, corporate stakeholders |
| ATS Clean | General professional | broad competency / hiring manager |
| Mono Grid | Design Engineer / Technical | systems, implementation |
| Creator Cards | Creative / Portfolio | concept, craft, client feedback |
| Strategy Brief | Consulting / Strategy | case, synthesis, recommendation |
| Clinical Clean | Healthcare / Clinical | safety, protocol, communication |
| Finance Ledger | Finance / Banking / Investment | analysis, controls, commercial judgment |
| Studio Director | Creative Director / Brand Leadership | direction, team, creative quality |
| Research Scholar | Research / Academic | methodology, rigor, publication |

---

# 6. Role pack scripts

## 6.1 Executive / Leadership

Templates: **Executive Edge, Executive Navy**

### Q1. “What changed because of your leadership?”

**Why:** tests leadership outcome rather than title.

**Answer:**
Context → operating problem → leadership decision → people/process change → measurable signal.

> “Khi tôi nhận trách nhiệm ở [scope], vấn đề chính là [problem]. Tôi thay đổi [decision/process], thống nhất [stakeholders] và thiết lập [cadence/control]. Kết quả quan trọng nhất là [defensible outcome], nhưng điều tôi coi là bền vững hơn là [system/capability created].”

### Q2. “Tell me about a decision with incomplete information.”

Explain assumptions, downside, reversibility and monitoring.

### Q3. “How do you handle an underperforming team or function?”

Do not jump immediately to replacing people. Diagnose clarity, capability, capacity and accountability first.

### Q4. “How do you balance short-term delivery and long-term capability?”

Use a concrete portfolio/resource trade-off.

### Q5. “What would your first 90 days look like?”

30 days: learn / map.  
60 days: focus / align.  
90 days: commit / ship / establish operating rhythm.

**Questions to ask back:**

- “Which decision would this role own that is currently hardest to make?”
- “What would make you say after six months that this hire was clearly successful?”

---

## 6.2 UI/UX & Product Design

Templates: **Soft Portfolio, Bento Resume**

### Q1. “Walk me through one project.”

Use: Problem → Users → Your role → Key decision → Trade-off → Result → Learning.

Do not start with UI screens.

### Q2. “Why did you choose this solution?”

> “Tôi không chọn phương án này vì nó đẹp hơn. Constraint chính là [constraint]. Chúng tôi so [options], và tín hiệu quyết định là [research/data/business/technical evidence]. Tôi chọn [solution] vì [reason], chấp nhận trade-off [trade-off].”

### Q3. “How do you know the design worked?”

Mention before/after signal, usability, adoption, operational reduction, task success or qualitative evidence.

### Q4. “Tell me about disagreement with Product/Engineering.”

Show evidence + constraint negotiation + final shared decision.

### Q5. “How do you work with a Design System?”

Explain contribution model, governance, adoption, exceptions and measurement—not just component creation.

**Likely portfolio follow-ups:**

- What part did you personally own?
- What would you change now?
- What failed?
- What did engineering push back on?
- Which metric was actually attributable to design?

---

## 6.3 Product Management / Product Ops

Template: **Product Operator**

### Q1. “How do you prioritize?”

Answer with a real decision. Inputs may include impact, user need, strategic fit, risk, dependency and effort.

### Q2. “Tell me about a feature you decided not to build.”

Strong PM answer demonstrates ability to say no.

### Q3. “Which metric would you choose for this product?”

Define behavior first, then metric, then guardrail.

### Q4. “How do you align Design, Engineering and Business?”

Explain artifact + cadence + decision rights, not “I communicate a lot.”

### Q5. “Tell me about a roadmap change.”

Explain signal that invalidated the original plan and how commitments were renegotiated.

---

## 6.4 Design Engineer / Frontend / Technical Product

Templates: **Code Aware, Mono Grid**

### Q1. “Where do you draw the line between design and engineering?”

Answer as a collaboration boundary, not identity politics.

### Q2. “How do you turn a design into a maintainable component?”

Discuss tokens, states, API/props, responsive behavior, accessibility, testing and documentation.

### Q3. “Tell me about a UI performance or rendering problem you solved.”

Use symptom → measurement → root cause → fix → regression protection.

### Q4. “How do you handle a pixel-perfect request that conflicts with implementation constraints?”

Preserve intent, identify non-negotiables, propose equivalent implementation.

### Q5. “How do you test UI quality?”

Mention visual regression, responsive matrices, keyboard/accessibility, browser behavior and edge content.

---

## 6.5 Software / Technical

Templates: **ATS Precision**  
Fallback technical pack for **ATS Clean**

### Q1. “Describe a technically difficult problem.”

Use constraints, hypothesis, debugging path and validation.

### Q2. “How do you debug an issue you cannot reproduce?”

Logs → environment differences → observability → narrowing → controlled reproduction.

### Q3. “What trade-off did you make in architecture?”

Never answer “best practice”; explain why it fit the constraints.

### Q4. “How do you prevent regressions?”

Tests, monitoring, rollout, review, feature flags where appropriate.

### Q5. “Tell me about technical debt you chose not to fix.”

Shows judgment and prioritization.

---

## 6.6 Data / BI

Template: **Insight Grid**

### Q1. “A KPI suddenly drops. What do you do?”

Validate definition → data freshness → segmentation → pipeline → product/business change → communicate confidence.

### Q2. “How do you know a dashboard is useful?”

Decision supported, user, frequency, action, trust—not number of charts.

### Q3. “Tell me about a misleading analysis.”

Own assumptions and show how validation changed the conclusion.

### Q4. “How do you explain data to non-technical stakeholders?”

Decision-first, confidence range, caveat, next action.

### Q5. “Correlation or causation?”

Explain what evidence is available and what experiment/design would improve confidence.

---

## 6.7 Marketing / Communications

Template: **Brand Motion**

### Q1. “Walk me through a campaign from objective to result.”

Business objective → audience → insight → proposition → channels → measurement → learning.

### Q2. “How do you separate brand metrics from business impact?”

Describe leading vs lagging indicators.

### Q3. “A campaign performs badly in week one. What do you change?”

Diagnose audience, message, creative, channel, landing/conversion path before random iteration.

### Q4. “How do you protect brand consistency while moving fast?”

System, approval thresholds and modular assets.

### Q5. “What campaign are you most proud of—and what did you personally own?”

Be explicit about ownership.

---

## 6.8 Sales / Business Development

Template: **Revenue Driver**

### Q1. “Tell me about your quota / target performance.”

Use period, target, actual result, mix and what drove it. Never invent numbers.

### Q2. “Walk me through a complex deal.”

Account context → pain → stakeholders → objections → commercial structure → close → expansion/learning.

### Q3. “What do you do when pipeline coverage is weak?”

Show prospecting system, qualification, prioritization and forecast hygiene.

### Q4. “Tell me about a deal you lost.”

Strong answer explains why it was lost and what changed in qualification/playbook afterwards.

### Q5. “How do you negotiate price pressure?”

Value, alternatives, scope, term, risk and give/get—not immediate discounting.

**Likely follow-up:** “What exactly was your contribution versus presales/product/leadership?”

---

## 6.9 HR / Talent / People Ops

Template: **People First**

### Q1. “How do you measure recruiting quality?”

Time-to-fill alone is insufficient. Add quality, retention, hiring-manager signal and funnel health where data exists.

### Q2. “Tell me about a difficult employee case.”

Protect confidentiality. Explain policy, fact-finding, fairness, documentation and escalation.

### Q3. “How do you improve employee experience?”

Use journey/problem signal, not activities for their own sake.

### Q4. “A hiring manager rejects every candidate. What do you do?”

Recalibrate success profile with evidence.

### Q5. “How do you balance employee advocacy and company policy?”

Explain consistency, legal/policy constraints and transparent communication.

---

## 6.10 Graduate / Entry Level

Template: **Next Start**

### Q1. “You do not have much experience. Why should we hire you?”

Do not apologize for being junior.

> “Tôi chưa có nhiều năm kinh nghiệm, nhưng tôi có bằng chứng về cách mình học và làm việc qua [project/internship/activity]. Ở đó tôi đã [specific action] và học được [relevant skill]. Tôi nghĩ giá trị tôi có thể mang vào sớm là [strength], đồng thời tôi chủ động cần coaching ở [honest growth area].”

### Q2. “Which project best represents you?”

Focus on personal contribution and learning.

### Q3. “Tell me about a time you learned something quickly.”

Show learning method.

### Q4. “What do you do when you do not know the answer?”

Clarify → attempt → ask with context → document learning.

### Q5. “Why this field?”

Use exposure + evidence + future direction; avoid vague passion-only answers.

---

## 6.11 Creative / Portfolio

Template: **Creator Cards**

### Q1. “Where did the idea come from?”

Brief → insight → concept alternatives → selection rationale.

### Q2. “How do you react when a client dislikes your preferred direction?”

Separate objective from taste.

### Q3. “Show work that did not make the final cut.”

Demonstrates breadth and judgment.

### Q4. “How do you maintain originality under a brand system?”

Constraints can be creative input; show where variation is allowed.

### Q5. “How do you defend craft without slowing delivery?”

Explain quality threshold and decision hierarchy.

---

## 6.12 Consulting / Strategy

Template: **Strategy Brief**

### Q1. “How would you structure this ambiguous problem?”

Clarify objective → mutually exclusive issue tree → prioritize hypotheses → data → recommendation.

### Q2. “Tell me about a recommendation leadership did not accept.”

Show influence without authority and willingness to revise.

### Q3. “How do you move from analysis to action?”

Recommendation → owner → sequencing → risk → measurable milestone.

### Q4. “What do you do when data is incomplete?”

Assumptions, ranges, proxies and sensitivity analysis.

### Q5. “Give me the executive summary in 60 seconds.”

Answer: recommendation first, then 2–3 reasons, then next step.

---

## 6.13 Healthcare / Clinical

Template: **Clinical Clean**

### Q1. “Tell me about a difficult patient/client situation.”

Safety, empathy, protocol, escalation, documentation.

### Q2. “What do you do when you see a possible safety issue?”

Immediate risk control → escalation → documentation → follow-up.

### Q3. “How do you manage competing priorities?”

Clinical risk and urgency first, then dependency/capacity.

### Q4. “How do you communicate complex information clearly?”

Confirm understanding, avoid jargon, use teach-back where appropriate.

### Q5. “Tell me about a mistake or near miss.”

Do not hide it. Focus on safety response and process learning.

---

## 6.14 Finance / Banking / Investment

Template: **Finance Ledger**

### Q1. “Walk me through an analysis that changed a decision.”

Question → assumptions → model/analysis → sensitivity → recommendation → actual decision.

### Q2. “How do you validate a financial model?”

Source checks, consistency, reconciliation, assumptions, scenario/sensitivity, independent review.

### Q3. “Tell me about a control or reporting issue you found.”

Materiality, root cause, correction, preventive control.

### Q4. “How do you present bad news to management?”

Early, quantified, contextualized, with options.

### Q5. “Which metric matters most here?”

Explain business model before selecting the metric.

---

## 6.15 Creative Director / Brand Leadership

Template: **Studio Director**

### Q1. “How do you set creative direction without designing everything yourself?”

Principles, quality bar, critique system, ownership boundaries.

### Q2. “How do you improve a weak creative team?”

Diagnose brief quality, capability, process, feedback and standards.

### Q3. “Tell me about a concept you killed.”

Shows judgment and ego control.

### Q4. “How do you handle executive feedback that is subjective?”

Translate preference into objective/brand/customer constraint where possible.

### Q5. “How do you measure creative quality?”

Craft + brand signal + audience response + business context; avoid pretending one metric captures everything.

---

## 6.16 Research / Academic

Template: **Research Scholar**

### Q1. “Why this research question?”

Gap → importance → tractability → contribution.

### Q2. “Defend your methodology.”

Fit to question, alternatives considered, validity limitations.

### Q3. “What would falsify your conclusion?”

A strong researcher can describe disconfirming evidence.

### Q4. “Tell me about a result that contradicted your hypothesis.”

Explain response without forcing the original narrative.

### Q5. “How do you communicate uncertainty?”

Separate evidence, interpretation and speculation.

---

## 6.17 General professional fallback

Template: **ATS Clean** when no specialist pack is detected.

Priority themes:

1. Introduction / positioning
2. strongest achievement
3. difficult stakeholder
4. prioritization
5. mistake / learning
6. role motivation
7. collaboration
8. questions to ask back

The UI should encourage switching to a specialist pack when the target role is known.

---

# 7. Template-specific emphasis

The same role pack can change emphasis depending on template.

Examples:

- **Soft Portfolio:** portfolio walkthrough first.
- **Bento Resume:** impact + project signal first.
- **Executive Edge:** enterprise outcome + leadership system.
- **Executive Navy:** governance + corporate stakeholder alignment.
- **Code Aware:** design-to-code decisions.
- **Mono Grid:** technical/system clarity.
- **ATS Precision:** execution clarity and evidence.
- **ATS Clean:** broad recruiter scan.
- **Brand Motion:** campaign outcome.
- **Studio Director:** creative direction + team leadership.

The interview page should show this as a small line:

> **CV signal:** This template emphasizes [X]. Expect interviewers to probe [Y].

---

# 8. Answer card data model

Suggested future data shape:

```js
{
  id: 'sales-complex-deal',
  pack: 'sales-bd',
  stages: ['hiring-manager', 'final'],
  question: 'Walk me through a complex deal.',
  why: 'Checks qualification, stakeholder management, negotiation and ownership.',
  framework: ['Context', 'Pain', 'Stakeholders', 'Action', 'Commercial decision', 'Result', 'Learning'],
  example: '...',
  followUps: [
    'Who was the economic buyer?',
    'Why did the customer choose you?',
    'What did you personally own?'
  ],
  avoid: [
    'Giving only the final revenue number',
    'Claiming team work as individual ownership'
  ]
}
```

Keep examples as editable scaffolds rather than hardcoded personal claims.

---

# 9. Proposed first UI version

First release should stay focused:

### Header
- Back to CV Studio
- Interview Prep
- selected CV + role pack

### Left rail
- role/template selector
- interview stage selector
- question categories

### Main
- 30-second pitch
- question cards
- expand answer
- “Use my CV evidence” later, only when safely grounded in stored profile data

### Right compact panel
- Answer checklist
- STAR / Project framework
- Questions to ask interviewer

Do **not** add AI scoring in V1. First make the content reliable and easy to practice.

---

# 10. V1 acceptance criteria

- Every one of the 20 templates maps to a relevant interview pack.
- Each pack has at least five role-specific questions.
- Every answer card contains Why / Framework / Example / Follow-up / Avoid.
- No answer example invents personal metrics.
- The current selected CV can choose the default pack.
- The user can override role and seniority.
- Content works without login and can remain local-first.
- Mobile layout remains usable.
- The new link sits next to the primary CV Studio action without weakening the main builder CTA.


---

# 11. Vietnam-first research layer

The Interview Prep surface now defaults to **Việt Nam · ưu tiên** and keeps provenance on every curated Vietnam question.

Vietnam source policy:

- Prefer established recruitment platforms, staffing firms and IT career publishers.
- Keep a source URL on every curated question group.
- Paraphrase question themes and write original answer frameworks; do not copy source answers verbatim.
- Separate **question-bank evidence** from **job-description signals**.
- Avoid anonymous forum posts, unverified social posts and fabricated recruiter quotes.
- Keep international references available as a separate filter.

Current Vietnam source set includes **TopCV, CareerViet, VietnamWorks InTECH, Glints Vietnam, Manpower Vietnam and ITviec**.

Curated Vietnam packs currently add source-backed questions for:

- General / HR screening
- UI/UX & Product Design
- Design Engineer / Frontend
- Software / Technical
- Product / BA
- HR / People
- Sales
- Graduate / Intern

The UI supports **Việt Nam · ưu tiên / Việt Nam + Quốc tế / Quốc tế**.

---

# 12. Internet research sources used by V1

V1 now keeps an explicit source library in `src/data/interview-prep.js`. Sources are used to validate themes and preparation patterns; the product does not copy source answers verbatim.

- **Microsoft Careers — Interview tips:** role-specific formats, thinking out loud, clarifying assumptions, STAR(R), portfolio/work samples where relevant.
- **Amazon Jobs — Behavioral / Product / Data / Front-end / Marketing prep:** past-behavior evidence, role competencies, data where relevant, successes, failures and growth.
- **Indeed Career Guide — Behavioral interview preparation:** STAR structure and preparing concrete workplace examples.
- **Nielsen Norman Group — UX portfolio interviews:** portfolio as both hiring evidence and an interview conversation aid.
- **Coursera — Product Manager interview questions:** product judgment, redesign, data, customers and preparation.
- **HubSpot — Sales interview questions:** quota, prospecting, objections, technical acumen and situational selling.
- **SHRM — Interview question competencies:** behavioral and situational questions mapped to job competencies and KSAs.
- **Nature Careers — Science interview questions:** research and academic interview themes informed by research leaders.

Implementation status as of 2026-09-25:

- `#interview` route: implemented.
- Landing-page Interview Prep entry point: implemented.
- Current CV → role-pack mapping: implemented for all 20 templates.
- Seniority, interview-stage and category filters: implemented.
- Searchable question deck: implemented.
- Why / Framework / Example / Follow-up / Avoid cards: implemented.
- Internet source panel: implemented.
- AI scoring: intentionally deferred.
