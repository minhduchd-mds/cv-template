# CV Studio — Original Directions UI/UX Audit

Date: 2026-09-13
Scope: Direction Lab, Signal Field, Threadscape, Focus Lens, Relay, Visual Hero, and five Visual Hero scenarios.

## Executive assessment

The project has moved beyond a conventional CV-template gallery. The strongest product idea is now a **portfolio storytelling system**: the same career data can be explored through different information models rather than decorative themes.

Current score after five implementation rounds: **8.8/10 UI** and **8.5/10 UX**.

The main remaining gap is not visual polish. It is proof density and production data binding: the strongest worlds should eventually consume one shared profile model instead of keeping demo copy inside each static experience.

## Round 1 — Interaction quality and accessibility

Changes shipped:
- Respect `prefers-reduced-motion`.
- Disable pointer tilt for touch input.
- Add IntersectionObserver fallback.
- Add Escape navigation back to Direction Lab.
- Keep motion decorative rather than required for comprehension.

UI score: 8.2/10
UX score: 8.4/10

Why it improved: motion now supports hierarchy without becoming a usability dependency.

## Round 2 — Visual Hero

Changes shipped:
- Added a visual-first CV world.
- Created original SVG artwork for portrait, system, workflow, data and code evidence.
- No stock imagery, copied product chrome or brand-dependent layout.
- Hero prioritizes imagery while proof and case detail arrive below the fold.

UI score: 9.1/10
UX score: 8.3/10

Strength: strongest first-impression direction in the collection.
Risk: image-first experiences need strict alt text, contrast and content ordering to avoid becoming portfolio theatre.

## Round 3 — Signature Collection

Changes shipped:
- Direction Lab expanded to 11 directions.
- Five completed experiences are marked as `FULL WORLD`.
- Added Visual Hero as a first-class direction.
- Added keyboard navigation between direction cards.
- Replaced story-step HTML injection with DOM construction.
- Added reduced-motion handling to the main stage.

UI score: 8.7/10
UX score: 8.9/10

Strength: the chooser now communicates product maturity instead of looking like a theme marketplace.

## Round 4 — Five image-first hero scenarios

1. **Mosaic Core** — identity anchors a surrounding project field.
2. **Poster Stack** — career becomes three visual acts: identity, systems and impact.
3. **Project Filmstrip** — flagship projects appear before biography.
4. **Portrait Split** — human presence and systems thinking carry equal visual weight.
5. **Evidence Wall** — the viewport becomes a proof wall with minimal biography.

Recommendation order:
1. Mosaic Core — best default for a Senior Product Designer.
2. Portrait Split — best for Product Designer / Design Engineer positioning.
3. Project Filmstrip — best when case-study imagery is unusually strong.
4. Evidence Wall — best experimental signature version.
5. Poster Stack — useful editorial option, but should remain secondary.

## Round 5 — Reliability and production readiness

Changes shipped:
- Added Playwright route coverage for Direction Lab and all completed worlds.
- Added local asset failure detection for `/directions/` routes.
- Added accessibility checks for image alternative text.
- Added an assertion that exactly five worlds are currently marked complete.

## UI review by dimension

| Dimension | Score | Assessment |
|---|---:|---|
| Visual distinctiveness | 9.4 | Strong original geometry and narrative models; no dependency on a recognizable external product aesthetic. |
| Hierarchy | 8.9 | Strong hero/stage hierarchy. Some worlds can reduce secondary labels further. |
| Typography | 8.7 | Good scale contrast; large display type should be watched on 1366×768 and smaller laptops. |
| Motion | 8.6 | Purposeful and now accessibility-aware. Keep motion subtle in recruiter-facing routes. |
| Responsive behavior | 8.4 | Solid CSS breakpoints; needs screenshot regression coverage for all worlds. |
| Accessibility | 8.2 | Improved reduced motion and alt text; next step is contrast/focus audit with automated tooling. |
| Recruiter scan speed | 8.8 | Signal Field and Visual Hero communicate value fastest. |
| Case-study depth | 8.4 | Focus Lens is strongest. Other worlds should progressively reveal deeper project evidence. |
| Product coherence | 8.9 | Direction Lab now acts as a coherent selector instead of a loose template grid. |
| Originality | 9.5 | Visual language is generated from career narrative, evidence and geometry rather than borrowed branded patterns. |

## UX issues still worth fixing

1. **Static copy duplication** — completed worlds currently contain demo content directly in HTML. Move toward one shared JSON/profile model.
2. **No persistent direction preference** — a user who picks a world should be able to return to the same direction.
3. **Proof is not yet interactive** — metrics should reveal the case, method and artifact that support them.
4. **No recruiter mode** — a 60-second scan mode would improve practical hiring use.
5. **No visual regression baseline for every world** — routes are now smoke-tested, but screenshot assertions should be added selectively.

# Proposal — next build cycle

## P0 — One profile, many worlds

Create one normalized profile source for identity, projects, impact, skills and evidence. Every world consumes the same model. This is the highest-value architecture improvement because it turns the experiment into a reusable product.

## P0 — Recruiter 60s mode

Add a global toggle that collapses any world into:
- Role and positioning.
- Three strongest outcomes.
- Three strongest projects.
- Core capabilities.
- Contact / CV export.

This makes the experimental visual system practical for real hiring workflows.

## P1 — Evidence drawer

Every metric becomes selectable. Opening it shows:
- Project source.
- Baseline.
- Method.
- Result.
- Artifact or screenshot.

This prevents ungrounded portfolio metrics and gives senior-level credibility.

## P1 — Adaptive direction recommendation

Ask three lightweight questions:
- Who is viewing? Recruiter / Design Lead / Product / Engineering.
- What role is being targeted?
- Scan or deep dive?

Then recommend Signal Field, Focus Lens, Relay, Visual Hero or another world. Keep the choice reversible.

## P1 — Visual Hero production upgrade

Use the five hero scenarios as composition modes over the same data and image assets rather than separate duplicated pages. Recommended default: **Mosaic Core**.

## P2 — Screenshot regression matrix

Capture desktop, 1366×768, tablet and mobile for each completed world. Track only structural regions to avoid brittle tests from ambient animation.

## Product direction recommendation

Do not market this as “11 CV templates.” Position it as:

> **One career story. Multiple ways to understand it.**

The differentiator is not the number of layouts. It is that each direction changes the reader’s mental model of the same professional evidence.
