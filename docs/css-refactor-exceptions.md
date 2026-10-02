# CSS Refactor — Exceptions Log

**7 exceptions from the refactor, all approved by Peter on 2026-09-19 and merged to `main` at `b295587`; later deliberate changes follow as E8 onwards.**

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

### E8: Header logo — in proportion at every width, and shrinks to fit on phones

- **Where:** every page, both themes, any width; the header is in every screenshot, so all 80 baselines were updated in the same commit. Clearest at 1280px (wider logo) and at 320–412px (logo sized to the room left by the links).
- **What changed and why:** the logo PNG is 224×60, but the CSS capped only its width (158px, then 120px below 600px and 88px below 400px) while the `height="60"` attribute held it at 60px, so it was squeezed sideways at every width — aspect 2.63 on desktop and 1.47 at 320px against the image's 3.73. `.logo img` now sets `height: auto`, and its caps are `min(224px, 100%)` on desktop, `min(140px, 100%)` at 600px and below, and `min(120px, 100%)` at 400px and below (the phone sizes are Peter's). The percentage lets the logo narrow when the links need the room instead of pushing them off the right edge, which fixed caps did at 401–409px and below 347px. `.navContent` gains a 12px `column-gap`, so the logo never touches the links, and `height: 100%`, so the now-shorter row is centred in the 60px bar.
- **What to look for:** desktop: the full 224×60 logo, no longer narrow. Phones: a smaller, correctly proportioned logo, vertically centred, with all four links and both icons on screen — measured at 140×38 (600px), 118×32 (412px), 120×32 (390px), 113×30 (360px) and 73×19 (320px). The bar stays 60px tall. Below the header nothing moves: in 78 of the 80 screenshots every changed pixel is within the top 60 rows, and in the other two (`/projects/pizza-pie`, desktop, both themes) exactly two pixels on the pie's edge change by at most 6/255 — anti-aliasing, the same two pixels on every run. `tests/overflow.spec.ts` now also asserts the nav fits and the logo keeps its ratio at 600/412/401/390/360/320px.
- **Commit:** see `git log --oneline -- src/components/Navbar.astro`
- **Approval:** approved (Peter, 2026-10-02 — he set the phone sizes and agreed the shrink-to-fit approach)

### E9: News thumbnails no longer squashed on phones

- **Where:** any CBC feed (`/news/cbc-world-news`, `/news/cbc-top-stories`, `/news/cbc-toronto-news`, `/news/cbc-technology-news`), either theme, below about 660px wide (where the 620px thumbnail starts to narrow). The 8 phone-width CBC baselines were updated in the same commit.
- **What changed and why:** each feed item's thumbnail arrives as `<img width="620" height="349">`. reset.css caps images at `max-width: 100%`, so on a phone the width narrowed to the column, but nothing set `height: auto`, so the 349px height held and the picture was squashed: 350×349 at 390px, aspect 1.00 against the image's 1.78. `img, picture { height: auto; }` in `reset.css` fixes it for every image (Peter's call: fix it at the root). `Banner.astro` now sets `height: 400px` explicitly, since the banners' uniform 400px came only from their `height="400"` attribute and they would otherwise have followed each photo's shape. This only came to light once the suite rendered the thumbnails at all (follow-ups item 10).
- **What to look for:** on a phone, thumbnails keep their shape (350×197 at 390px) and each feed item is correspondingly shorter. Desktop is unchanged (620×349): every desktop screenshot passed untouched.
- **Commit:** see `git log --oneline -- src/components/NewsFeed.module.css`
- **Approval:** approved (Peter, 2026-10-02)

