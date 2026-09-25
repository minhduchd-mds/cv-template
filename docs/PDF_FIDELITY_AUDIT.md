# PDF Fidelity Audit

The PDF audit validates the real browser-generated file, not only the on-screen preview.

## Scope

`npm run test:pdf-fidelity` checks all 20 live templates through the Vue export path:

1. select the template;
2. open PDF Preflight;
3. apply the same one-page or multi-page mode the UI selects;
4. generate an actual Chromium PDF;
5. inspect A4 dimensions and page count with `pdfinfo`;
6. extract the real PDF text layer with `pdftotext -layout`;
7. compare critical headings/contact text and a larger sample of source lines;
8. save each PDF plus `pdf-fidelity-matrix.json` as test artifacts.

The suite also includes a long-content stress case that forces a multi-page export and verifies a marker in the final experience item survives in the extracted text.

## Requirements

The browser test uses Poppler command-line tools:

- `pdfinfo`
- `pdftotext`

On macOS: `brew install poppler`.
On Debian/Ubuntu: install the `poppler-utils` package.

The audit intentionally fails early when these tools are unavailable rather than silently skipping text-layer verification.

## Acceptance thresholds

- A4 page size: approximately 595 × 842 pt.
- One-page preflight must result in exactly one PDF page.
- Preflight fit must never go below 68%.
- Critical semantic anchors: at least 90% retained.
- Broader source-line sample: at least 72% retained.
- Multi-page stress output must preserve the final evidence marker.

This does not claim compatibility with every third-party ATS vendor. It verifies browser PDF integrity and machine-readable text before the file is passed to the separate ATS PDF verifier.


## Page-break policy

Each template now has an explicit multi-page print policy:

- `preserve-flow`: the renderer can paginate without changing its primary composition.
- `stack-safe`: one-page output keeps the designed columns, while multi-page export reflows high-risk two-column containers into a safe document flow.

For multi-page exports, large sections such as Experience and Projects may fragment between items. Individual jobs, project cards, education records, certificates, metrics, contact blocks and list bullets use keep-together rules to avoid being split across a page boundary.

The policy is synchronized between the Vue renderer and static Studio. `npm run layout:check` fails when their policy maps diverge.
