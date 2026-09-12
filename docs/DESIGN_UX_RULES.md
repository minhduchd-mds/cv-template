# CV Studio — Mandatory Design & UX Rules

## Visual system
1. Every page must have a named visual direction; generic SaaS styling is not accepted.
2. The default direction is **Editorial Product Workspace**: strong type, calm surfaces, asymmetrical composition, product UI as proof.
3. Do not use decorative gradients, glow, glass, icons, or cards unless they support hierarchy or interaction.
4. Do not create a repeated wall of equal cards. At least one surface per major section must establish clear visual priority.
5. Marketing claims must be verifiable. Sample-person metrics must be labelled as sample-profile data.

## Hero gate
The first desktop viewport must communicate:
- what CV Studio is,
- who it is for,
- why it is useful,
- one primary CTA,
- one secondary CTA,
- a visible product demonstration.

Abstract artwork alone cannot be the main hero proof.

## Typography
- Maximum two font families.
- Use a defined responsive scale, not arbitrary per-component font sizes.
- Body copy should normally stay within 62–72 characters per line.
- Headings must preserve semantic HTML hierarchy.

## Layout
- Desktop: 12-column mental model.
- Tablet: 8 columns.
- Mobile: 4 columns.
- Primary content max width: 1520px.
- Mobile must not depend on desktop transforms or horizontal scrolling.

## Motion
Allowed motion categories only:
- enter,
- state,
- feedback,
- story.

Prefer transform and opacity. Avoid large animated filters, shadows, width, height, top or left. Respect `prefers-reduced-motion`.

## UX rules
1. Five-second test: a first-time visitor can explain the product, audience and next action.
2. One dominant primary action per state.
3. Progressive disclosure in the Builder; advanced controls must not crowd primary editing.
4. No dead ends: every marketing section links to a meaningful next step.
5. User data controls must be explicit: local save, reset, import/export when implemented.
6. Every dynamic surface needs empty, error and fallback behavior.
7. Keyboard focus must always be visible.
8. Touch targets should be at least 44×44px on mobile.
9. Important images require meaningful alt text; decorative images use empty alt.
10. Print layouts prioritize recruiter scanability over visual novelty.

## Review gate
A design change cannot be considered complete until it passes:
- visual hierarchy,
- scanability,
- responsive layout,
- keyboard access,
- reduced-motion behavior,
- contrast,
- data truthfulness,
- CTA clarity.
