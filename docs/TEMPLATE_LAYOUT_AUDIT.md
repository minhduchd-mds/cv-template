# Template Layout Audit

This document is the layout contract for the 20 static CV Studio templates. It exists to prevent a generic Layout control from breaking a template-specific composition.

## Rules

- **Fixed**: visibility can change only for supported sections; hierarchy remains locked.
- **Guided**: recruiter-first structure is locked, while supported section visibility remains editable.
- **Flexible**: main-column sections can reorder with each other; side-column sections can reorder with each other. Cross-column moves are blocked.
- Item limits are intentional composition rules, not data loss. Source data stays saved.
- PDF Preflight remains the authority for one-page vs multi-page export.

| Template | Mode | Summary | Experience | Projects | Skills | Languages | Project limit |
| --- | --- | --- | --- | --- | --- | --- | ---: |
| Executive Edge | Fixed | Yes | Yes | Yes | No | No | 4 |
| Soft Portfolio | Fixed | Yes | Yes | Yes | Yes | No | 3 |
| Product Operator | Fixed | Yes | Yes | Yes | Yes | No | — |
| Code Aware | Fixed | Yes | Yes | Yes | Yes | No | — |
| ATS Precision | Guided | Yes | Yes | Yes | Yes | No | 2 |
| Insight Grid | Fixed | Yes | Yes | Yes | Yes | No | — |
| Brand Motion | Fixed | Yes | Yes | Yes | Yes | Yes | 3 |
| Revenue Driver | Fixed | Yes | Yes | No | Yes | No | 0 |
| People First | Fixed | Yes | Yes | No | Yes | Yes | 0 |
| Next Start | Fixed | No | Yes | Yes | Yes | No | 2 |
| Bento Resume | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Executive Navy | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| ATS Clean | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Mono Grid | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Creator Cards | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Strategy Brief | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Clinical Clean | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Finance Ledger | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Studio Director | Flexible | Yes | Yes | Yes | Yes | Yes | — |
| Research Scholar | Flexible | Yes | Yes | Yes | Yes | Yes | — |

## Automated QA

Run:

```bash
npm run test:templates
```

The suite checks all 20 templates on desktop, tablet and mobile for:

- horizontal overflow inside the A4 paper;
- descendants protruding outside the paper bounds;
- correct Layout Master mode;
- project limits and unsupported sections;
- false drag handles on fixed/guided templates;
- drag ordering only within Main or Side groups;
- Layout Master overflow;
- document-level viewport overflow;
- browser runtime errors.

Desktop runs also capture one screenshot per template into the Playwright test output directory.
