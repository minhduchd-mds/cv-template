# CV Studio — Mandatory Frontend Security Rules

## Client code
- Never place secrets, private API keys, service credentials or privileged tokens in frontend code.
- `eval`, `new Function`, `document.write`, executable string injection and remote-script injection are forbidden.
- Untrusted HTML must never be written with `innerHTML` unless it has a documented sanitizer and review.
- Prefer text bindings and framework escaping for user content.
- Source maps stay disabled in production unless explicitly required for a private monitoring workflow.

## Dependencies and supply chain
- Dependencies must be intentional and pinned to explicit versions in `package.json`.
- GitHub Actions must use full commit SHAs.
- Dependency additions require a reason and a build check.
- A lockfile is required once the dependency graph is regenerated from a trusted environment; CI should then move to `npm ci`.
- No install-time shell scripts may be added without security review.

## Browser policy
Production hosting should send:
- Content-Security-Policy,
- X-Content-Type-Options: nosniff,
- Referrer-Policy,
- Permissions-Policy,
- frame protection,
- HSTS on HTTPS hosting.

CSP must keep scripts self-hosted. Images may use self, data/blob URLs and the explicitly approved demo-image host. Remote executable JavaScript is not allowed.

## External content
- Prefer self-hosted assets for production product UI.
- Demo image URLs are data only; they must never introduce executable content.
- External links opened in a new tab require `rel="noreferrer noopener"` or an equivalent safe policy.

## Local data
- CV profile data is stored locally in the browser unless a future backend is explicitly introduced.
- The app must not silently upload profile content or images.
- Reset and migration logic must preserve customized user data.

## CI security gate
- Production build must pass.
- CodeQL/local static analysis must pass.
- Deployment configuration must not introduce remote executable scripts.
- Security-header changes must be reviewed with the same care as application code.

## JavaScript protection policy
Minification is a performance/deployment concern, not a security boundary. Obfuscation may only be used for a small proprietary client algorithm after review; it must never be described as protection for secrets. Security must come from architecture, CSP, dependency hygiene and the absence of privileged client credentials.
