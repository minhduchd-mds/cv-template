# CV Studio

A production-minded portfolio and resume system built with **Vue 3.5.42 + Vite 8.3.0**. One structured career profile can drive multiple A4 CV directions, five full-screen web identities and a marketing landing page without duplicating content.

## Production

**GitHub Pages:** https://minhduchd-mds.github.io/cv-template/

GitHub Pages is the canonical and supported production deployment for this repository.

## Current stack

- Vue **3.5.42**
- Vite **8.3.0**
- `@vitejs/plugin-vue` **6.0.8**
- Sass **1.104.0**
- Playwright **1.63.0**
- Lighthouse **13.4.1**
- Node **22.23.2 LTS** in CI and Pages (`>=22.19.0` required by the project)
- npm lockfile v3 + deterministic `npm ci` installs in CI and Pages

## Product surfaces

| Surface | Route | Purpose |
| --- | --- | --- |
| Marketing landing | `/` | Explain the product, workflow, templates, sample cases and privacy model |
| CV Builder | `#studio` | Edit one structured profile, preview templates and export A4/PDF |
| Interview Studio | `#interview-studio` (legacy `#interview`) | Independent interview practice workspace with CV claim defense, JD context, story bank and source-aware questions |
| Apple Editorial | `#concept-apple` | Typography-first portfolio CV |
| Bento Product | `#concept-bento` | Metrics, modular proof and product storytelling |
| Design Engineer | `#concept-engineer` | Design × engineering positioning |
| Case Study Resume | `#concept-case-study` | Problem → Solution → Impact storytelling |
| Executive Dark Glass | `#concept-executive` | Senior/leadership presentation |

## Current features

- **20 A4 CV templates**, covering design, technical, ATS, product, leadership, business and specialist roles.
- **5 full-screen web identities** with different information architecture and visual language.
- **Independent Interview Studio** maps all 20 templates to a shared role/industry/seniority catalogue, sourced Vietnam and international question banks, claim defense, mock interview branching and practice reports.
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

The full quality gate includes frontend security linting, deterministic interview domain tests, Vite and compiled Interview Studio fallback builds, bundle budgets, responsive Playwright E2E, Lighthouse budgets and CodeQL. As of October 2026, CI runs on pushes and PRs; Pages deploys the validated `dist/` build on pushes to `master`. CodeQL scans changed application code and runs weekly.

Application-level security includes safe image-source normalization and CI rejection of risky frontend patterns such as `eval`, `new Function`, `document.write`, direct `innerHTML`, `v-html` and remote script injection.

GitHub Pages does not support repository-defined custom response headers such as CSP, HSTS or Permissions-Policy. Security controls that require origin response headers therefore need a custom edge/CDN layer if they are required in a future deployment architecture.

## Run locally

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

## Deployment

- GitHub Pages is the single production target.
- Automatic Vercel Git deployments are disabled in `vercel.json` so the legacy Vercel integration cannot create misleading blocked deployment checks.
- The custom Pages workflow builds Vite `dist` with Node 22.23.2 and `npm ci`.
- The build separately bundles the independent Interview Studio fallback into `dist/interview-studio/app.js` so its source imports resolve without exposing `src/` paths in production.
- Canonical URL, Open Graph metadata, structured data, `robots.txt` and `sitemap.xml` all point to the GitHub Pages production URL.
