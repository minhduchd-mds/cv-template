# CV Studio

A modern CV template studio built on **Vue 3.5.42 + Vite 8.3.0** with one shared profile data model, reusable renderers, A4-ready CV directions and five full-screen portfolio/CV web concepts for product, UI/UX and technology roles.

## Current stack

- Vue **3.5.42**
- Vite **8.3.0**
- `@vitejs/plugin-vue` **6.0.8**
- Node **20.19+ or 22.12+**
- Plain Vue SFC + CSS architecture, intentionally dependency-light

## 5 full-screen CV web concepts

The repository now includes five distinct landing-page directions. Open them from the **5 Web Concepts** launcher in CV Studio or navigate directly with the hash routes below.

| Concept | Route | Direction |
| --- | --- | --- |
| Apple Editorial | `#concept-apple` | Typography-first, calm, premium and recruiter-friendly |
| Bento Product | `#concept-bento` | Impact metrics, modular product cards and dashboard energy |
| Design Engineer | `#concept-engineer` | Design × engineering positioning for code-aware designers |
| Case Study Resume | `#concept-case-study` | Project storytelling through Problem → Solution → Impact |
| Executive Dark Glass | `#concept-executive` | Premium dark leadership direction for Senior/Lead profiles |

Each concept includes a direct link back to this GitHub repository, a CTA into the editable CV Studio, responsive behavior, motion details and `prefers-reduced-motion` support.

## Current features

- **6 A4 CV directions**: Senior Product Designer, ATS Clean, Creative Portfolio, Executive Minimal, Design System Lead and Design Engineer.
- **5 full-screen CV website concepts** with independent information architecture and visual direction.
- Category-based template gallery with live A4 preview.
- Shared Profile Editor for name, role, location, email, phone, website and professional summary.
- Local browser persistence so profile edits survive reloads.
- CV Quality Score with realtime feedback.
- Accent color customization and 75% / 85% / 100% preview zoom.
- Focus mode, keyboard shortcuts and motion-aware interactions.
- Browser print/PDF styling that removes Studio UI and prints only the selected CV.
- Shared `variant + theme` architecture so new visual directions do not require duplicated CV pages.

## What changed from the legacy repository

- Migrated Vue 2 / Vue CLI to **Vue 3 + Vite**.
- Replaced the old hard-coded CV screen with a reusable CV Studio.
- Added a lightweight hash-based concept experience layer without adding router dependencies.
- Separated CV content from presentation in `src/data/cv.js`.
- Removed Firebase bootstrapping from the application entry point.
- Removed obsolete Vue CLI, Babel, Jest, Cypress and legacy deployment configuration.
- Removed tracked `node_modules`, `dist` and IDE metadata from source control.

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
  RootApp.vue                # Lightweight Studio / concept route shell
  App.vue                    # CV Studio, gallery, persistence and preview controls
  main.js                    # Vue 3 application bootstrap
  styles.css                 # Core Studio + CV layout styles
  enhancements.css           # CV template themes and preview controls
  editor.css                 # Profile editor UI
  motion.css                 # Studio motion system
  quality.css                # CV quality score UI
  concepts/
    ConceptExperience.vue    # Five full-screen CV website concepts
    concepts.css             # Independent visual systems + responsive motion
  components/
    CvDocument.vue           # Shared A4 CV renderer
    ProfileEditor.vue        # Shared profile editing drawer
  data/
    cv.js                    # Profile content + template definitions
```

## Template architecture

Each A4 template in `src/data/cv.js` has a `variant` and optional `theme`.

- `variant` chooses the structural renderer: `product`, `ats`, `creative`, or `executive`.
- `theme` changes the visual direction without duplicating the document renderer.
- All templates render the same profile object, keeping content consistent across formats.

The web concepts reuse the same profile data but deliberately change the landing-page hierarchy, interaction model and visual composition so they can be evaluated as genuinely different portfolio directions.

## Next product steps

The architecture is ready for section-level editing of experience/projects/skills, drag-and-drop section ordering, Vietnamese/English content variants, multiple saved profiles, automated PDF export and turning a selected web concept into a publishable personal portfolio route.
