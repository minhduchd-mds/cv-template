# Security Policy

## Supported versions

The active development line is **CV Studio 1.1.x**, as declared in `package.json`.
Older releases and archived deployments are not maintained as separate security branches.

## Reporting a vulnerability

Please do **not** put exploits, CVs, resumes, API keys, personal information, or
reproduction files containing sensitive data into a public GitHub issue.
Use the repository's **Security → Report a vulnerability** private reporting
workflow if enabled; otherwise contact the repository maintainer privately
through an independently verified channel before publishing details.

Report the affected route, commit, reproduction steps, impact and suggested
mitigation. Do not include anyone else's real CV or hiring data.

## Scope and user data

CV Studio and Interview Studio run on GitHub Pages without a private application
backend. Profiles, JD text, evidence notes, practice sessions and application
data are stored in the browser using localStorage and, for some attachments,
IndexedDB. This is **local-first, not encrypted-at-rest application storage**.
Other scripts running under the *same origin* could access Web Storage, and
anyone with browser/device access may see locally stored content.

- No AI provider keys or privileged service credentials belong in client bundles.
- Avoid sensitive identifiers and confidential employer materials in demo profiles.
- Backups are unencrypted by default: store downloaded backups securely.
- Clearing the site's browser storage removes locally stored data; export first
  if you need a backup.
- Files under `public/` are publicly downloadable after deployment. Only ship
  documents there when the owner explicitly intends them to be public.

This project does not promise HIPAA/GDPR compliance, encrypted private storage,
automated leak detection or enterprise isolation.

## Security testing and deployment

`npm run security:lint` rejects common dangerous frontend patterns. CI uses
pinned action revisions, locked dependencies, responsive browser tests, and a
weekly/on-change CodeQL workflow. These checks reduce risk but are not a full
penetration test. Any user-authored HTML/URL sink still requires review.

GitHub Pages does not provide repository-configurable response headers such as
CSP, HSTS and Permissions-Policy. Strong origin policies require an appropriate
edge/hosting layer; do not claim the static app enforces those headers.

## Remediation

Prioritize exploitability and possible exposure of personal data over cosmetic
bugs. When a dependency advisory is found, verify the dependency graph, update
the lockfile with the publisher's integrity and run `npm ci`, the domain unit
suite, E2E tests and security scans before deployment.
