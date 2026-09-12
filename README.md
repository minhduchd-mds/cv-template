# CV Studio

A modern CV template studio rebuilt on **Vue 2.6.14** with a shared profile data model and multiple A4-ready visual directions.

## What changed

- Upgraded the Vue 2.6 line to **2.6.14**.
- Upgraded build tooling to **Vue CLI 5.0.9**.
- Replaced the old single hard-coded CV screen with a reusable template system.
- Added 4 starter CV directions: Senior Product Designer, ATS Clean, Creative Portfolio, and Executive Minimal.
- Added live template switching and accent color customization.
- Added browser print/PDF styling for A4 output.
- Separated CV content from presentation in `src/data/cv.js`.
- Removed Firebase initialization from the app entry point.
- Removed generated dependencies/build output from source control in the redesign branch.

## Run locally

```bash
npm install
npm run serve
```

Production build:

```bash
npm run build
```

## Project structure

```text
src/
  App.vue                    # CV Studio shell and template picker
  main.js                    # Vue 2.6 entry
  styles.css                 # UI, CV variants, responsive + print rules
  components/
    CvDocument.vue           # shared CV renderer
  data/
    cv.js                    # profile content + template definitions
```

## Add a new CV template

1. Add template metadata in `src/data/cv.js`.
2. Add a renderer variant in `CvDocument.vue`.
3. Add the matching scoped visual rules in `src/styles.css`.
4. Check desktop preview, mobile scaling, and A4 print output.

> Vue 2 is end-of-life upstream. This repository intentionally stays on the final Vue 2.6 patch for compatibility with the existing project requirement.
