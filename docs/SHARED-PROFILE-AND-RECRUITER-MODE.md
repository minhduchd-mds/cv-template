# Shared Profile + Recruiter 60s Mode

## Product rule

CV Studio uses **one normalized career profile** across many visual worlds. A visual direction may change layout, motion and storytelling logic, but recruiter-facing facts should come from the same source.

Shared source:

`public/directions/data/profile.json`

## What the shared model owns

- Identity and role positioning.
- Short professional summary.
- Proof / outcome metrics.
- Project evidence.
- Capability groups.
- Recruiter 60s curation rules.

The model intentionally contains public portfolio sample data only. Do not place secrets, access tokens, private client material or sensitive personal information in this file.

## Runtime behavior

`public/directions/worlds/shared.js` loads the shared profile for every completed world that uses the shared runtime. It creates:

1. **Profile Dock** — confirms which profile is currently active.
2. **Recruiter 60s Mode** — a fast reading surface with role, positioning, three outcomes, three projects, core capabilities and contact links.
3. `window.CV_PROFILE` — a read-only-by-convention runtime reference for future world-specific progressive enhancement.
4. `data-profile-model="ready"` on `<html>` when the profile has loaded successfully.

`public/directions/lab-profile.js` gives Direction Lab the same model and stores the most recently selected direction in local storage.

## Recruiter 60s curation

The `recruiter60` object defines what appears in the fast scan:

- `outcomeIds` selects entries from `proof`.
- `projectIds` selects projects by stable ID.
- `capabilityGroups` controls which capability groups are surfaced.

This keeps the fast scan deliberate instead of blindly dumping the full CV.

## Accessibility behavior

- The recruiter surface is a labelled modal dialog.
- Opening it moves focus to the close control.
- Escape closes the dialog before performing any world-level navigation.
- Closing restores focus to the trigger.
- Focus-visible states are explicit.
- Motion remains non-essential to understanding the profile.

## Editing a profile

For a new portfolio candidate:

1. Update `identity`.
2. Replace proof metrics with evidence-backed outcomes.
3. Replace projects and preserve stable project IDs.
4. Update capabilities.
5. Curate `recruiter60` instead of showing every item.
6. Run the full CI suite before publishing.

## Next architecture step

Move the remaining world-specific demo copy into declarative bindings so the visual worlds are composition engines over the same profile rather than static HTML experiences. The current shared runtime establishes the data contract and recruiter-facing surface for that migration.
