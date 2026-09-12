# Apple-inspired UI Rules

These rules translate current Apple Human Interface Guidelines principles into a reusable web UI system for CV Studio. They are implementation rules, not a visual clone of Apple products. Do not use Apple logos, copyrighted marketing artwork, proprietary screenshots, or copy Apple product interfaces pixel-for-pixel.

## 1. Content first

- UI must help the CV content dominate the page.
- Branding and decoration stay secondary to name, role, experience, projects, outcomes and actions.
- Avoid decorative containers when spacing, typography or hierarchy can communicate structure.
- Use accent color mainly for primary action, selection and status.

## 2. Typography

Primary stack:

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Segoe UI", sans-serif;
```

Rules:
- Display: 680–720 weight, tight tracking, balanced wrapping.
- Body: 400–500, line-height 1.5–1.7.
- Labels: 560–650, smaller but never low-contrast.
- Avoid all-caps except tiny metadata/kickers; use restrained tracking.
- Never ship Apple font files. Use system fonts when available.

## 3. Color

Core semantic tokens:

| Token | Value | Usage |
| --- | --- | --- |
| `--apple-bg` | `#f5f5f7` | Page background |
| `--apple-label` | `#1d1d1f` | Primary text |
| `--apple-secondary` | `#6e6e73` | Supporting text |
| `--apple-tertiary` | `#8e8e93` | Metadata |
| `--apple-blue` | `#0071e3` | Primary action / selection |
| `--apple-separator` | `rgba(60,60,67,.14)` | Borders and separators |
| `--apple-fill` | `rgba(118,118,128,.12)` | Secondary controls |

Rules:
- Accent should not flood the interface.
- Do not use pure black for large light-theme surfaces; use semantic label colors.
- Keep text/background contrast accessible.
- Dark concepts keep their own identity but share the same hierarchy and interaction model.

## 4. Spacing

Use an 8pt-oriented rhythm with optical adjustments:
- 4: micro gap.
- 8: related control spacing.
- 12: compact component padding.
- 16: standard control/card gap.
- 20/24: card padding.
- 32: component group gap.
- 48/64: major layout gap.
- 80+: section breathing room.

Never compress content merely to keep a desktop grid. Stack earlier on smaller widths.

## 5. Corners

- Inputs/buttons: 10–12px.
- Compact cards: 16–20px.
- Large panels: 24–28px.
- Hero/material panels: up to 32px.
- Pills only for filters/status/chips, not for every button.

Consistent corner hierarchy is more important than maximizing roundness.

## 6. Materials / Liquid Glass

Use translucent material only where it improves layering:
- Sticky navigation.
- Toolbars.
- Modal/side sheets.
- Temporary status surfaces.

Recommended web material:

```css
background: rgba(250,250,252,.78);
backdrop-filter: saturate(180%) blur(22px);
border: 1px solid rgba(60,60,67,.14);
```

Rules:
- Do not blur every card.
- Content cards are usually solid or lightly translucent.
- Maintain readable contrast over dynamic backgrounds.
- Avoid excessive nested glass surfaces.

## 7. Depth

Shadows communicate elevation, not decoration.

- Level 0: no shadow.
- Level 1: subtle card hover / selected surface.
- Level 2: floating panel / preview.
- Level 3: modal, sheet or hero object.

Avoid large dark drop shadows on every component.

## 8. Controls

- Minimum interactive height: 40px desktop, 44px compact/mobile.
- Primary action: filled accent color.
- Secondary action: neutral fill.
- Tertiary action: plain/text where possible.
- Destructive action should use destructive semantic styling only when needed.
- Hover should be subtle; press uses a short `scale(.975–.98)` response.
- Never rely on hover to reveal essential actions.

## 9. Motion

Motion must explain response, hierarchy or continuity.

Tokens:
- Fast: 160ms.
- Medium: 280ms.
- Slow entrance: 520ms.
- Main ease: `cubic-bezier(.22, 1, .36, 1)`.

Rules:
- Buttons: 120–180ms.
- Cards/panels: 180–300ms.
- Page/hero entrance: max ~520ms.
- Avoid continuous decorative motion unless very subtle.
- Support `prefers-reduced-motion` globally.

## 10. Navigation

- Keep top navigation stable and predictable.
- Current state must be visually obvious.
- Use familiar symbols/labels.
- Do not hide primary navigation behind novelty interactions.
- On narrow screens, allow horizontal tab scrolling or convert layout rather than shrink text excessively.

## 11. Forms / Builder

- Labels remain visible; placeholders are examples, not labels.
- Inputs use neutral material, semantic focus ring and 42px minimum height.
- Group related fields in calm cards; avoid heavy borders.
- Destructive actions need clear separation from reorder/edit actions.
- Editing state must persist and never silently overwrite user-authored data.

## 12. Accessibility

Required:
- Visible `:focus-visible` ring.
- 44px mobile touch targets where possible.
- Accessible names remain present even if visible labels are hidden responsively.
- Respect `prefers-reduced-motion`.
- Support increased contrast.
- Layout must tolerate larger text and longer localized labels.
- Use semantic controls (`button`, `a`, `input`, `nav`, headings) rather than clickable divs.

## 13. Responsive behavior

Desktop layouts must adapt instead of scaling down proportionally.

- At ~1100px: multi-column builder/workspace may stack.
- At ~760px: compact navigation, larger touch targets, single-column hero, flexible toolbar.
- At ~480px: reduce decorative complexity and preserve primary content/actions.
- Respect safe areas with `env(safe-area-inset-*)`.

## 14. CV-specific rules

- Printed CV remains paper-first and should not inherit glass effects.
- A4 output must prioritize recruiter scanability over app decoration.
- Use accent color sparingly in CV templates.
- Metrics should be concrete and readable.
- Project imagery is optional and must not displace essential text.
- Print mode removes Studio controls and shadows.

## 15. Definition of done

A UI change is complete only when:

1. It uses system tokens instead of arbitrary new colors/radii/shadows.
2. Desktop, tablet and mobile remain usable.
3. Keyboard focus works.
4. Essential labels have accessible names.
5. Reduced motion is respected.
6. Production build passes.
7. Responsive E2E tests pass.
8. Lighthouse accessibility and best-practice budgets remain green.
9. The change improves hierarchy rather than merely adding decoration.
