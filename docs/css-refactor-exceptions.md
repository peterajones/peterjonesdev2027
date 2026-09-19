# CSS Refactor — Exceptions Log

Every intentional or unavoidable visual change from the pixel-identical baseline.

**How to review:** run the branch build (`npm run build && node --env-file=.env ./dist/server/entry.mjs`, then open http://localhost:4321) and compare each entry against the same path on the live site, which still runs `main`. Set the theme with the navbar toggle and the width with devtools' responsive mode.

Nothing merges while any entry is `pending`.

## Entry format

Each entry is `E<n>` and records:

- **Where:** URL path, theme (light/dark) and width to check
- **What changed and why**
- **What to look for**
- **Commit:** the commit that introduced the change
- **Approval:** `pending` / `approved`

## Entries

None yet.
