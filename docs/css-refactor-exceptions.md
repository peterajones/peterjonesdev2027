# CSS Refactor — Exceptions Log

**4 exceptions, all pending Peter's browser review.**

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

### E1: Currency Converter — code panel warning text darkens in light mode

- **Where:** `/projects/currency-converter`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule.
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (It carries a legacy `red-msg` class, but nothing in the CSS actually colours it red — the audit confirms `.red-msg` has no colour rule.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Verified with a Playwright computed-style check against commit `262c40a` (module move, before this fix) vs the working tree (after), light theme, desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 9fe70ac
- **Approval:** pending

### E2: Pagination — code panel warning text darkens in light mode

- **Where:** `/projects/pagination`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule. Same fix, same class of change as E1 (Currency Converter).
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (It carries a legacy `red-msg` class, but nothing in the CSS actually colours it red.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Dark theme is unaffected: computed `color` stays `rgb(244, 244, 244)` (`#f4f4f4`) before and after. Verified with a Playwright computed-style check against commit `8cd0332` (module move, before this fix) vs the working tree (after), desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 116cfbe
- **Approval:** pending

### E3: Random Password Generator — code panel warning text darkens in light mode

- **Where:** `/projects/random-password-generator`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule. Same fix, same class of change as E1 (Currency Converter) and E2 (Pagination).
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (It carries a legacy `red-msg` class, but nothing in the CSS actually colours it red.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Dark theme is unaffected: computed `color` stays `rgb(244, 244, 244)` (`#f4f4f4`) before and after — both `--color-text` and `--color-text-muted` resolve to that value in dark mode. Verified with a Playwright computed-style check against commit `6fce4e1` (base, before the module move) vs the working tree (after both this task's commits), desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 0e889be
- **Approval:** pending

### E4: Weather App — code panel warning text darkens in light mode

- **Where:** `/projects/weather-app`, light theme, any width. Open the code panel: click "Read more..." to reveal the description, then click "Show me the code" at the bottom of it. The change is only visible while the code panel is open — the visual-suite screenshots capture it closed, so the gate shows zero diff.
- **What changed and why:** Audit P9 found this widget rendered `<CodeBlocks>` as a sibling of `.code-content` instead of inside it, unlike the other four widgets that render a code panel (JS Clock, Pizza Pie, Rollup Counter, Checkbox Styling already had it inside). Moving `<CodeBlocks>` inside `.code-content` (this task's second commit) fixes that inconsistency, but it means the code panel's first paragraph — "The code displayed below is from my original iteration in HTML, CSS and JS." — now matches the `.code-content p` rule instead of the bare global `p` rule. Same fix, same class of change as E1 (Currency Converter), E2 (Pagination) and E3 (Random Password Generator).
- **What to look for:** With the code panel open in light mode, find the first paragraph of the code panel — "The code displayed below is from my original iteration in HTML, CSS and JS." It darkens from grey to black. (It carries a legacy `red-msg` class, but nothing in the CSS actually colours it red — the audit confirms `.red-msg` has no colour rule.) Computed `color` on that paragraph: **before** `rgb(88, 88, 88)` (`#585858`), **after** `rgb(0, 0, 0)` (`#000000`). Dark theme is unaffected: computed `color` stays `rgb(244, 244, 244)` (`#f4f4f4`) before and after. Verified with a scratch Playwright script comparing commit `bec3cb8` (module move, before this fix) vs commit `5fb02c7` (working tree, after), light and dark theme, desktop viewport — confirmed via `getComputedStyle` directly, not a screenshot.
- **Commit:** 5fb02c7
- **Approval:** pending
