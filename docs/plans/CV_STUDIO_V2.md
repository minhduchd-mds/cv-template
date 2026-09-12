# CV Studio V2 — ECC implementation plan

## Outcome
Turn CV Studio from a functional resume builder into a production-quality portfolio/CV product with a clear marketing story, a richer 360° sample profile, a distinctive editorial-product aesthetic, and stronger frontend security.

## Product route
- `/` — marketing landing page.
- `#studio` — CV Builder and A4 preview.
- `#concept-apple`, `#concept-bento`, `#concept-engineer`, `#concept-case-study`, `#concept-executive` — full-screen concept experiences.

## Design direction
**Editorial Product Workspace**

The product must feel deliberate rather than generic SaaS: strong typography, asymmetrical editorial rhythm, real product UI in the hero, large proof surfaces, restrained motion, and no fabricated social proof.

## V2 information architecture
1. Product-first hero with an actual CV Builder preview.
2. Capability proof strip.
3. Template showcase.
4. Secondary immersive hero: “One profile. Five identities.”
5. Four-step workflow.
6. 360° sample case studies.
7. Capability matrix.
8. Testimonial / trust section using clearly labelled sample data.
9. FAQ and privacy explanation.
10. Final CTA.

## Data contract
- `sampleProfile360` is the rich website/portfolio source.
- `candidate` is the compact A4 projection.
- Existing local user profile data must never be overwritten unless it is the known legacy demo profile.
- Demo metrics must always be presented as sample-profile metrics, never as CV Studio business claims.

## Engineering gates
### PLAN
Define IA, component boundaries, data sources, visual rules, accessibility requirements, security headers, and browser targets before implementation.

### TEST
Acceptance criteria for each section:
- Purpose is understandable without decorative copy.
- Primary action is obvious.
- Keyboard navigation works.
- Mobile does not require horizontal scrolling.
- Reduced-motion users receive a stable layout.
- Images have alt text and graceful fallback.

### IMPLEMENT
Small, reversible changes. New styles are SCSS modules. No new global one-off CSS files.

### REVIEW
Review visual hierarchy, information density, responsive behavior, naming, duplicate rules, dynamic content safety, and dependency changes.

### VERIFY
Production build, CodeQL, Pages deployment, responsive smoke-check, security headers, and bundle output.

### REMEMBER
Stable rules live in this document and the dedicated Design/UX/Security rulebooks.

### IMPROVE
Any issue fixed twice should become a reusable token, component, lint rule, test, or CI check.

## Definition of done
- Root landing page tells the product story in under five seconds.
- Hero includes a real product preview, not an abstract illustration.
- 360° sample data is visible in case studies and proof sections.
- All new styling is SCSS-based and production-minified by Vite.
- No secrets or executable remote scripts exist in client code.
- Production security headers are present on Vercel.
- Existing Studio, print flow, local persistence and five concepts remain functional.
