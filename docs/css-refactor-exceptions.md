# CSS Refactor — Exceptions Log

**7 exceptions, all approved by Peter on 2026-09-19. Merged to `main` at `b295587`.**

This is now a record, not a gate: every intentional visual change the refactor made, so a later reader can tell a deliberate change from a regression. The interaction walkthrough below is still the checklist for any future CSS work, since the screenshot suite never captures those states.

**How to re-check an entry:** run the build (`npm run build && node --env-file=.env ./dist/server/entry.mjs`) and open http://localhost:4321. Set the theme with the navbar toggle and the width with devtools' responsive mode. The "before" side was the deployed site while it still ran the pre-refactor CSS; once this work is pushed, production shows the "after" state, and the before/after values recorded in each entry are the reference.

Use port **4321** specifically. The Google Maps API key is referrer-restricted, so the pagination widget's maps only render on that port; on any other port — and in the Playwright suite, which blocks Maps outright — the map area stays empty.

### Interaction walkthrough

The visual suite only screenshots each route at rest — closed panels, no hover, no typed input. It never captured the states below, so check them by hand against the live site:

- Each project's code panel open (E1–E4's widgets plus the other four: js-clock, pizza-pie, rollup-counter, checkbox-styling)
- Navbar "Latest Updates" modal open
- Currency converter: add-currency list open, and the base-currency select open
- Pizza pie: choose slices, then "Start Over" (hover, dark theme)
- Password generator: Generate, Copy, and toggle the settings
- Pagination: page 2, and hover over the page numbers
- Checkbox styling: toggle each checkbox
- Rollup counter: increment, reset
- Weather app: search a valid city, search an invalid city, hover the credit link (autocomplete suggestions can't be verified locally)
- Contact form: focus each field
- Theme toggle on several pages, then a throttled (Slow 3G) reload in dark mode — confirm no flash of the wrong theme

(Before the merge, this log gated it: nothing merged while an entry was `pending`.)

## Entry format

Each entry is `E<n>` and records:

- **Where:** URL path, theme (light/dark) and width to check
- **What changed and why**
- **What to look for**
- **Commit:** the commit that introduced the change
- **Approval:** `pending` / `approved`

## Entries

### E1: Currency Converter — code panel warning text darkens in light mode

- **Where:** `/projects/currency-converter`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule.
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (At the time it carried a legacy `red-msg` class that no CSS ever styled; that class was removed later, in commit 8e635de.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Verified with a Playwright computed-style check against commit `262c40a` (module move, before this fix) vs the working tree (after), light theme, desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 9fe70ac
- **Approval:** approved (Peter, 2026-09-19 — browser review)

### E2: Pagination — code panel warning text darkens in light mode

- **Where:** `/projects/pagination`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule. Same fix, same class of change as E1 (Currency Converter).
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (At the time it carried a legacy `red-msg` class that no CSS ever styled; that class was removed later, in commit 8e635de.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Dark theme is unaffected: computed `color` stays `rgb(244, 244, 244)` (`#f4f4f4`) before and after. Verified with a Playwright computed-style check against commit `8cd0332` (module move, before this fix) vs the working tree (after), desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 116cfbe
- **Approval:** approved (Peter, 2026-09-19 — browser review)

### E3: Random Password Generator — code panel warning text darkens in light mode

- **Where:** `/projects/random-password-generator`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule. Same fix, same class of change as E1 (Currency Converter) and E2 (Pagination).
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (At the time it carried a legacy `red-msg` class that no CSS ever styled; that class was removed later, in commit 8e635de.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Dark theme is unaffected: computed `color` stays `rgb(244, 244, 244)` (`#f4f4f4`) before and after — both `--color-text` and `--color-text-muted` resolve to that value in dark mode. Verified with a Playwright computed-style check against commit `6fce4e1` (base, before the module move) vs the working tree (after both this task's commits), desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 0e889be
- **Approval:** approved (Peter, 2026-09-19 — browser review)

### E4: Weather App — code panel warning text darkens in light mode

- **Where:** `/projects/weather-app`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule. Same fix, same class of change as E1 (Currency Converter), E2 (Pagination) and E3 (Random Password Generator).
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (At the time it carried a legacy `red-msg` class that no CSS ever styled; that class was removed later, in commit 8e635de.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Dark theme is unaffected: computed `color` stays `rgb(244, 244, 244)` (`#f4f4f4`) before and after. Verified with a scratch Playwright script comparing commit `bec3cb8` (module move, before this fix) vs commit `5fb02c7` (working tree, after), light and dark theme, desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 5fb02c7
- **Approval:** approved (Peter, 2026-09-19 — browser review)

### E5: "Get it on GitHub" link — hover colour now works in dark mode

- **Where:** any project page's code panel, e.g. `/projects/js-clock`, dark theme, any width. Open the code panel and hover the "Get it on GitHub" link. Hover is invisible to the screenshots, so the gate shows zero diff.
- **What changed and why:** Peter noticed the link's hover colour did nothing in dark mode. It behaved that way before the refactor too, so this is a fix, not a regression: `main` had `.dark .github-link span { color: #f4f4f4 }`, which pinned the text white and stopped the link's `a:hover` colour reaching the `<span>` inside it. The refactor carried that behaviour over faithfully via `--color-text-inherit` (`currentColor` in light, so hover works; `#f4f4f4` in dark, so it does not). This adds one rule in `src/styles/code.css` restoring parity.
- **What to look for:** in dark mode, hovering the link turns its text the link-hover colour (`var(--color-link-hover)`, which is `#e43af4` in dark) instead of staying white. Light mode is unchanged (it already worked). The link's resting colour is unchanged in both themes.
- **Commit:** see `git log --oneline -- src/styles/code.css`
- **Approval:** approved (Peter, 2026-09-19 — browser review; Maps and the dark hover both confirmed working)

### E6: Latest Updates modal — entry text at normal weight

- **Where:** any page, open the navbar bell ("Latest Updates") modal, either theme. The modal is closed in every screenshot, so the gate shows zero diff.
- **What changed and why:** Peter asked for it during the browser review. Each entry's Markdown body is a `<p>`, which inherited `font-weight: 300` from base.css's element rule and read too light in the modal. `.update-details :global(p)` now also sets `font-weight: 400`. Not a refactor artefact — a deliberate style change, scoped to the modal.
- **What to look for:** entry text in the modal is slightly heavier than before; everything else, including the dates, is unchanged.
- **Commit:** see `git log --oneline -- src/components/Navbar.astro`
- **Approval:** approved (Peter, 2026-09-19 — he requested it)

### E7: Latest Updates modal — black panel in dark mode

- **Where:** any page, open the navbar bell modal, dark theme. Closed in every screenshot, so the gate shows zero diff.
- **What changed and why:** Peter asked for it during the browser review. The panel took its background from `--color-bg`, which is `#333333` in dark — the same grey as the page behind it. The modal's own dark rule now sets `background-color: #000000`. Set on the modal rather than on the token, so the page background and other surfaces keep `#333333`.
- **What to look for:** in dark mode the modal panel is black against the grey page; light mode is unchanged (white). Verified in Chromium: dark modal `rgb(0, 0, 0)` with page `rgb(51, 51, 51)`; light modal `rgb(255, 255, 255)`.
- **Commit:** see `git log --oneline -- src/components/Navbar.astro`
- **Approval:** approved (Peter, 2026-09-19 — he requested it)
