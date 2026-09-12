# CV Studio

A modern CV template studio built on **Vue 3.5.42 + Vite 8.2.2** with one shared profile data model, reusable renderers and A4-ready visual directions for product, UI/UX and technology roles.

## Current stack

- Vue **3.5.42**
- Vite **8.2.2**
- `@vitejs/plugin-vue` **6.0.8**
- Node **20.19+ or 22.12+**
- Plain Vue SFC + CSS architecture, intentionally dependency-light

## What changed

- Migrated the legacy Vue 2 / Vue CLI project to Vue 3 + Vite.
- Replaced the old single hard-coded CV screen with a reusable CV Studio.
- Added **6 starter CV directions**:
  - Senior Product Designer
  - ATS Clean
  - Creative Portfolio
  - Executive Minimal
  - Design System Lead
  - Design Engineer
- Added category filtering, live template switching and accent customization.
- Added preview zoom controls for easier A4 inspection.
- Added template-level themes so multiple visual directions can reuse one renderer.
- Added browser print/PDF styling for A4 output.
- Separated CV content from presentation in `src/data/cv.js`.
- Removed legacy Firebase bootstrapping and obsolete Vue CLI, Babel, Jest, Cypress and deployment configuration.
- Removed tracked `node_modules`, `dist` and IDE metadata from the redesign branch.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Project structure

```text
index.html                   # Vite application entry
vite.config.js               # Vite + Vue configuration
src/
  App.vue                    # CV Studio shell, gallery and preview controls
  main.js                    # Vue 3 application bootstrap
  styles.css                 # Core Studio + CV layout styles
  enhancements.css           # New template themes and preview controls
  components/
    CvDocument.vue           # Shared CV renderer
  data/
    cv.js                    # Profile content + template definitions
```

## Template architecture

Each template in `src/data/cv.js` has a `variant` and optional `theme`.

- `variant` chooses the structural renderer: `product`, `ats`, `creative`, or `executive`.
- `theme` changes the visual direction without duplicating the document renderer.
- All templates render the same profile object, keeping content consistent across formats.

## Add a new CV template

1. Add template metadata in `src/data/cv.js`.
2. Reuse an existing `variant` when the information architecture is the same.
3. Add a new `theme-*` style when only visual treatment changes.
4. Create a new renderer branch in `CvDocument.vue` only when the document structure truly changes.
5. Check desktop preview, responsive behavior and A4 print/PDF output.

## Product direction

Next useful improvements are an editable profile form, section visibility/reordering, language variants, saved profiles, and true PDF export automation. The current architecture is intentionally prepared for those additions without duplicating CV pages.
