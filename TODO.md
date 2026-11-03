# TODO

_Single source of truth for unfinished work in this project. Tick an item when it is done; the review harness records it and removes the line._

## Next
- [ ] Cut peterjones.dev over from Netlify to the Coolify deployment in late Dec 2026 / early Jan 2027, moving DNS to Hover: checklist in ~/Projects/deployment-notes.md (from: README.md)
- [x] Add a Playwright test that requests a prerendered page, a public file and a dynamic route from server.mjs and asserts the CSP, HSTS and nosniff headers are present on each. (from: review harness)
- [x] Verify the CSP and HSTS headers on the Coolify deployment before the cutover, and add a note to the private deployment checklist to confirm HSTS before moving DNS to Hover. (from: review harness)
- [x] Dropped: Replace 'unsafe-inline' in the script-src CSP with hashes or nonces for the theme script and Astro's bundled inline scripts, or record in the docs why it has to stay. (from: review harness)
- [x] Dropped: Add a short note to the docs (e.g. next to the CSP section) explaining why 'unsafe-inline' stays in script-src and what would be needed to remove it (hashes or nonces for the theme script and Astro's inline scripts). (from: review harness)

## Later
- [ ] Run a keyboard/accessibility audit in late Nov / early Dec 2026, starting with the pagination page-number `<li>`s (from: Claude memory accessibility-audit-planned.md)

## Undecided
