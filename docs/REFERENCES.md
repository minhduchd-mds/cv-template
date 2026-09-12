# CV Studio — Reference Sources

CV Studio V2 uses these sources as quality references. They are benchmarks and engineering guidance, not assets to clone.

## Product & visual design

### Claude Frontend Design — Anthropic
https://claude.com/plugins/frontend-design

Used for:
- defining purpose, audience and aesthetic direction before implementation,
- avoiding generic AI/SaaS visual patterns,
- using deliberate typography, composition, motion and visual depth,
- treating “production-grade” as part of visual quality.

### Webflow Technology Website Templates
https://webflow.com/templates/category/technology-websites

Used for:
- technology/SaaS information architecture,
- product demonstrations,
- trust and conversion flow,
- content depth and section rhythm.

### Webflow Template Submission Guidelines
https://templates.webflow.com/submission-guidelines

Used as a quality benchmark for:
- design-system consistency,
- accessibility,
- interactions,
- assets,
- layout/content quality,
- forms/conversion design,
- production readiness.

## SCSS architecture

### Sass `@use`
https://sass-lang.com/documentation/at-rules/use/

### Sass `@forward`
https://sass-lang.com/documentation/at-rules/forward/

The V2 style layer uses Dart Sass modules. New code should not introduce legacy Sass `@import`.

## Build system

### Vite build options
https://vite.dev/config/build-options.html

Used for production output, minification, explicit source-map policy and predictable bundle naming.

## Browser security

### OWASP Content Security Policy Cheat Sheet
https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html

### OWASP DOM Based XSS Prevention Cheat Sheet
https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html

Used for CSP policy, executable sink restrictions and safe handling of user-controlled content.

## Supply-chain / CI hardening

### GitHub — Security hardening for GitHub Actions
https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions

Used for least-privilege workflow permissions and pinning third-party/official actions to full commit SHAs.

## Interpretation rule

When guidance conflicts, CV Studio follows this order:
1. user safety, security and accessibility,
2. product usability and truthful data,
3. maintainability and performance,
4. visual novelty.

A reference is never a justification for copying a proprietary page or making unverified product claims.
