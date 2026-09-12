# CV Studio

A modern CV template studio built on **Vue 3.5.42 + Vite 8.3.0** with one shared profile data model, reusable renderers and A4-ready visual directions for product, UI/UX and technology roles.

## Current stack

- Vue **3.5.42**
- Vite **8.3.0**
- `@vitejs/plugin-vue` **6.0.8**
- Node **20.19+ or 22.12+**
- Plain Vue SFC + CSS architecture, intentionally dependency-light

## Current features

- **6 CV directions**: Senior Product Designer, ATS Clean, Creative Portfolio, Executive Minimal, Design System Lead and Design Engineer.
- Category-based template gallery with live A4 preview.
- Shared Profile Editor for name, role, location, email, phone, website and professional summary.
- Local browser persistence so profile edits survive reloads.
- Accent color customization and 75% / 85% / 100% preview zoom.
- Browser print/PDF styling that removes Studio UI and prints only the selected CV.
- Shared `variant + theme` architecture so new visual directions do not require duplicated CV pages.

## What changed from the legacy repository

- Migrated Vue 2 / Vue CLI to **Vue 3 + Vite**.
- Replaced the old hard-coded CV screen with a reusable CV Studio.
- Separated CV content from presentation in `src/data/cv.js`.
- Removed Firebase bootstrapping from the application entry point.
- Removed obsolete Vue CLI, Babel, Jest, Cypress and legacy deployment configuration.
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
  App.vue                    # CV Studio shell, gallery, persistence and preview controls
  main.js                    # Vue 3 application bootstrap
  styles.css                 # Core Studio + CV layout styles
  enhancements.css           # New CV template themes and preview controls
  editor.css                 # Profile editor UI
  components/
    CvDocument.vue           # Shared CV renderer
    ProfileEditor.vue        # Shared profile editing drawer
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
3. Add a new `theme-*` style when only the visual treatment changes.
4. Create a new renderer branch in `CvDocument.vue` only when the document structure truly changes.
5. Check desktop preview, responsive behavior and A4 print/PDF output.

## Next product steps

The architecture is ready for section-level editing of experience/projects/skills, drag-and-drop section ordering, Vietnamese/English content variants, multiple saved profiles and automated PDF export.
