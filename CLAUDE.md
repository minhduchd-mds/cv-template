# CV Studio · Claude Code Rules

## Frontend UI changes

For any task that changes visual UI, layout, typography, motion, responsive behavior, Builder controls, landing sections, CV concepts or frontend interaction:

1. Read and apply `.claude/skills/frontend-design/SKILL.md` before editing code.
2. Read `docs/APPLE_UI_RULES.md` for the shared Apple-inspired system.
3. Preserve the selected aesthetic direction: **Editorial Product Workspace × Apple restraint** unless a named concept intentionally overrides it.
4. Use existing semantic tokens before inventing new colors, radii, shadows or spacing.
5. Treat copy as layout geometry. Follow the text-frame hierarchy and readable line-length rules.
6. Do not create generic AI/SaaS UI patterns or decorative cards without a content purpose.
7. Do not silently replace user-authored CV data.
8. Do not weaken accessibility, reduced-motion behavior, security lint or responsive behavior to achieve a visual effect.

## Required verification after frontend changes

Run or verify the repository gates equivalent to:

- security lint;
- production build;
- bundle budget;
- desktop/tablet/mobile Playwright E2E;
- Lighthouse performance/accessibility/best-practices/SEO.

A UI change is not complete if these gates regress.
