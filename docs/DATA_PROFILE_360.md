# CV Studio · 360° Sample Profile Contract

## Purpose

CV Studio keeps one rich profile source for website storytelling and derives a smaller resume snapshot for A4 templates.

This avoids two common failures:

1. Marketing pages feel empty because the resume schema is too small.
2. A4 resumes overflow because every portfolio detail is rendered into the document.

## Source of truth

`src/data/sample-profile-360.js`

The sample persona is intentionally fictional and exists only to demonstrate realistic content density.

### 360° profile groups

- `identity` — name, role, headline, location, contact, links, availability and avatar.
- `positioning` — short bio, long bio, value proposition and design principles.
- `proof` — measurable outcome signals for product storytelling.
- `experience` — full role history with summaries, bullets and tags.
- `projects` — portfolio case studies with problem, solution, result, role, period, tags and cover image.
- `capabilities` — product, systems, technical and AI capability groups.
- `tools` — practical tools and delivery stack.
- `education` — formal education.
- `certificates` — structured credentials.
- `recognition` — awards and internal recognition.
- `testimonials` — proof from collaborators.
- `interests` — optional human context.
- `languages` — language proficiency.

## Resume projection

`resumeCandidateFrom360()` converts the rich source into the existing `candidate` contract used by:

- A4 CV templates
- Profile Editor
- five web concepts
- local persistence

The projection intentionally limits experience and highlights while preserving richer project metadata for web concepts.

## Content rules

1. Sample metrics must be visibly attributable to the fictional sample persona. Do not present sample values as real CV Studio business metrics.
2. Product claims such as total users, ATS pass rate or conversion rate must not be invented.
3. Project case studies should follow `problem → role → solution → result` when space allows.
4. A4 templates prioritize scanability; website pages may use long-form data.
5. Images are optional. Every visual component needs a no-image fallback.
6. User-entered data must override sample data without being overwritten by future sample migrations.
7. Legacy untouched demo data may be upgraded automatically to the latest sample profile.

## Image policy

Current sample images are remote demo assets so the repository can remain text-only through the connected GitHub workflow. Production hardening should self-host approved assets under `/public/media/` or a controlled image pipeline.

When remote images are enabled:

- allow-list the exact hosts in CSP,
- never embed credentials or signed private URLs,
- keep responsive fallbacks,
- use lazy loading for below-the-fold media,
- set fixed aspect ratios to avoid layout shift.

## Future landing V2 usage

The 360° profile is designed to support:

- product-first hero proof,
- profile snapshot,
- metric strip,
- project gallery,
- full case-study sections,
- design + engineering capability split,
- recognition/testimonial proof,
- final CTA with role availability.
