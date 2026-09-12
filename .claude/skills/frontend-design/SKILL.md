---
name: frontend-design
description: Create or refine CV Studio frontend UI with distinctive, production-grade design quality. Use for Vue components, landing sections, CV concepts, Builder UI, responsive behavior, typography, motion, layout and visual polish.
---

# CV Studio Frontend Design Skill

Use this skill for every frontend-facing change in this repository.

## 1. Establish the design intent before coding

Before changing markup or styles, write down mentally or in the plan:

- **Purpose** — what user task becomes easier?
- **Audience** — recruiter, designer, design engineer, or CV author?
- **Primary action** — what is the one action the surface should make obvious?
- **Aesthetic direction** — default to **Editorial Product Workspace × Apple restraint** unless the concept intentionally has another named direction.
- **Proof** — what real product/content evidence should be visible instead of decoration?

Do not start by adding cards, gradients, icons or effects.

## 2. Avoid generic AI frontend defaults

Do not ship:

- generic purple-gradient SaaS sections;
- repetitive equal-size card grids without hierarchy;
- decorative blur/glow on every surface;
- arbitrary icon badges;
- filler metrics, fake logos or fake social proof;
- oversized headings with weak body copy beneath them;
- motion that exists only to look animated;
- a new color/radius/shadow when an existing semantic token works.

Every screen needs a clear visual thesis and at least one intentional composition decision.

## 3. Text-frame system is mandatory

Treat copy as designed geometry, not loose text.

Use four text roles:

1. **Kicker** — short metadata or section label; compact, high-signal.
2. **Display** — one idea, controlled line length, strong optical hierarchy.
3. **Body** — readable measure, normally 52–72 characters per line.
4. **Meta** — supporting facts, never too faint to read.

Rules:

- Hero display max width: ~12–15 words per visual line.
- Section display max width: `18–24ch`.
- Body copy max width: `58–68ch`.
- Supporting copy should usually sit in a visible text frame or aligned column, not float unpredictably.
- Text frame padding follows the 8pt rhythm: 16 / 24 / 32 / 48.
- Text frames use whitespace first; border/background only when they communicate grouping or state.
- Never put long paragraphs inside tiny cards.
- Do not center long-form body copy.
- Keep `text-wrap: balance` for short display text and `text-wrap: pretty` for paragraphs where supported.

## 4. Typography

Use the existing system stack and semantic tokens. Do not add font files.

- Display weight: 680–720.
- Body weight: 400–500.
- UI label: 560–650.
- Tight display tracking is allowed; body tracking stays neutral.
- Minimum body size on product UI: 14px desktop, 15px preferred for important explanatory copy.
- Tiny text is reserved for true metadata inside previews, never primary UI.

## 5. Layout and hierarchy

- Prefer asymmetry, editorial composition and deliberate negative space over uniform dashboards.
- One section = one dominant message.
- Use 12-column desktop thinking, 8-column tablet, 4-column mobile.
- Break a grid only with purpose: hero product preview, featured template, case-study media, or editorial statement.
- Reduce decoration before reducing content legibility.

## 6. Apple-inspired restraint

Follow `docs/APPLE_UI_RULES.md`.

- Accent blue is primarily for action, selection and focus.
- Glass belongs to navigation, toolbar, sheet and transient surfaces.
- Large content cards are usually solid.
- Radius hierarchy must remain visible; do not turn everything into pills.
- Depth communicates elevation, not decoration.

## 7. Motion

Motion must communicate one of: **enter, state, feedback, continuity**.

- Controls: 120–180ms.
- Cards/panels: 180–300ms.
- Large entrance: max ~520ms.
- Avoid infinite motion unless ambient and visually negligible.
- Always preserve `prefers-reduced-motion` behavior.

## 8. Builder UI

- Labels are persistent; placeholders are examples only.
- Group related inputs into calm sections with strong text framing.
- Helper text belongs directly below its field and must remain readable.
- Error/success states must not rely on color alone.
- Auto-complete must never silently replace user-authored content.
- Reorder/destructive actions must stay visually secondary to editing.

## 9. Responsive rules

Do not scale desktop down proportionally.

- At tablet widths, collapse secondary columns before shrinking typography.
- At mobile widths, preserve primary CTA, title, body and current state first.
- Interactive targets should be ~44px on compact/mobile.
- Long labels must wrap without clipping.
- Respect safe-area insets.

## 10. Accessibility and production gates

A frontend change is not done until:

- keyboard focus is visible;
- accessible names survive responsive hiding;
- contrast remains WCAG-compliant;
- reduced motion works;
- no horizontal overflow appears at desktop/tablet/mobile test widths;
- security lint passes;
- production build passes;
- bundle budget passes;
- Playwright responsive tests pass;
- Lighthouse quality gates pass.

## 11. Gotchas

- Do not use `font-size: 7–10px` for real app copy just because a visual mockup looks compact.
- Do not stack glass on glass.
- Do not add a card merely to create separation; try spacing/divider/typography first.
- Do not use hover movement on touch-first layouts.
- Do not let a decorative preview become more visually dominant than the actual product message.
- Do not create a second styling system beside the semantic Apple tokens.
- Do not copy Apple marketing pages or proprietary UI pixel-for-pixel; apply principles, not assets.

## 12. Definition of visual quality

The finished surface should feel authored rather than generated: clear point of view, restrained palette, deliberate type scale, strong text geometry, purposeful asymmetry, readable copy, polished states and no unexplained decorative element.
