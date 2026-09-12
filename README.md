# CV Studio

A production-minded portfolio and resume system built with **Vue 3.5.42 + Vite 8.3.0**. One structured career profile can drive multiple A4 CV directions, five full-screen web identities and a marketing landing page without duplicating content.

## Current stack

- Vue **3.5.42**
- Vite **8.3.0**
- `@vitejs/plugin-vue` **6.0.8**
- Sass **1.104.0**
- Playwright **1.63.0**
- Lighthouse **13.4.1**
- Node **22.23.2 LTS** in CI and Pages (`>=22.19.0` required by the project)
- npm lockfile v3 + deterministic `npm ci` installs in CI, Pages and Vercel

## Product surfaces

| Surface | Route | Purpose |
| --- | --- | --- |
| Marketing landing | `/` | Explain the product, workflow, templates, sample cases and privacy model |
| CV Builder | `#studio` | Edit one structured profile, preview templates and export A4/PDF |
| Apple Editorial | `#concept-apple` | Typography-first portfolio CV |
| Bento Product | `#concept-bento` | Metrics, modular proof and product storytelling |
| Design Engineer | `#concept-engineer` | Design × engineering positioning |
| Case Study Resume | `#concept-case-study` | Problem → Solution → Impact storytelling |
| Executive Dark Glass | `#concept-executive` | Senior/leadership presentation |

## Current features

- **6 A4 CV directions**: Senior Product Designer, ATS Clean, Creative Portfolio, Executive Minimal, Design System Lead and Design Engineer.
- **5 full-screen web identities** with different information architecture and visual language.
- Structured 360° sample profile projected into a concise CV data model.
- Builder editing for profile, impact, experience, projects, education, certificates, skills and languages.
- Section show/hide and ordering controls.
- Avatar and project image upload plus allowlisted external HTTPS image sources.
- Local-first persistence through browser `localStorage`; no account is required.
- CV Quality Score, accent customization, 75% / 85% / 100% zoom and Focus mode.
- Keyboard shortcuts: `E` edit, `F` focus, `N` next style, `P` print and `Esc` close/exit.
- A4 browser print/PDF rules that hide Studio chrome.
- Motion with `prefers-reduced-motion` support.
- Self-hosted sample SVG artwork so the demo does not depend on an image CDN.

> **Sample-data note:** Alex Chen and the accompanying metrics/testimonials are fictional demonstration content. They are not product or business claims.

## Quality and security gates

Every push to `master` is verified with:

1. Dangerous frontend API linting.
2. Production Vite build.
3. JS/CSS bundle budgets.
4. Chromium installation from the pinned Playwright dependency.
5. Responsive end-to-end tests at desktop, tablet and mobile viewports.
6. Visual QA captures for critical landing, Studio and concept surfaces.
7. Lighthouse performance, accessibility, best-practices and SEO budgets.
8. CodeQL JavaScript/TypeScript analysis in the separate security workflow.

The Lighthouse gate currently enforces:

- Performance ≥ **82**
- Accessibility ≥ **95**
- Best Practices ≥ **95**
- SEO ≥ **90**
- LCP ≤ **4,000 ms**
- TBT ≤ **400 ms**
- CLS ≤ **0.10**

The assertion script also prints scored non-perfect Accessibility / Best Practices / SEO audits so quality work can target specific findings instead of chasing a single aggregate score.

Security controls include a restrictive production CSP, `nosniff`, clickjacking protection, Permissions Policy, HSTS on Vercel, safe image-source normalization and CI rejection of risky frontend patterns such as `eval`, `new Function`, `document.write`, direct `innerHTML`, `v-html` and remote script injection.

## Run locally

Use the committed dependency graph:

```bash
npm ci
npm run dev
```

Full local verification:

```bash
npm run verify
npm run build
npx playwright install chromium
npm run test:e2e
```

Production preview:

```bash
npm run build
npm run preview
```

## Project structure

```text
index.html
vite.config.js
package-lock.json
playwright.config.js
scripts/
  security-lint.mjs
  check-bundle-budget.mjs
  assert-lighthouse.mjs
tests/e2e/
  studio.spec.js
  visual-qa.spec.js
public/sample/
  alex-profile.svg
  atlas-ops.svg
  signal-ai.svg
  northstar-system.svg
  pulse-dashboard.svg
src/
  RootApp.vue
  App.vue
  main.js                      # imports one SCSS entrypoint
  components/
    CvDocument.vue
    ProfileEditor.vue
  data/
    cv.js
    sample-profile-360.js
    sample-media.js
    initialize-sample-media.js
  security/
    safe-media.js
  landing/
    MarketingLanding.vue
  concepts/
    ConceptExperience.vue
    concepts.css
    concept-experience.css
    concept-polish.css
  styles/
    main.scss                   # single style entrypoint
    _tokens.scss
    _landing.scss
    _app-shell.scss
    _quality.scss
    _cv-sections.scss
    _enhancements.scss
    _builder-advanced.scss
```

Legacy CSS is being migrated incrementally behind `src/styles/main.scss`. The entrypoint deliberately preserves historical cascade order while migrated areas move into first-class Sass modules. Responsive E2E and Lighthouse gates protect the UI during that refactor.

## Template architecture

Each A4 template in `src/data/cv.js` has a structural `variant` and an optional visual `theme`.

- `variant`: `product`, `ats`, `creative`, or `executive`.
- `theme`: changes visual direction without duplicating the document renderer.
- Every A4 template reads the same candidate profile.
- Web concepts reuse the same underlying career story but intentionally change hierarchy and presentation for different hiring contexts.

## Deployment

- GitHub Pages builds the Vite `dist` output with Node 22.23.2 and `npm ci`.
- The custom Pages workflow waits until legacy Pages jobs on `master` are quiet before publishing Vite last, preventing older deploys from overwriting current assets.
- Vercel also uses the committed lockfile through `npm ci` and applies the production security headers declared in `vercel.json`.
