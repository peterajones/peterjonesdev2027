# CSS follow-ups

Deliberately left out of the September 2026 CSS refactor, which was scoped to
"same pixels, better structure". Each item here is a change that would alter
output, behaviour, or JavaScript, so each wants its own branch, its own
before/after evidence, and — where it changes what a visitor sees — its own
entry in `docs/css-refactor-exceptions.md`.

Sources: the spec's original Follow-ups list, the audit's Plan impacts, and the
final whole-branch review.

## Performance

1. ~~**Load fonts per page.**~~ Done 2026-10-02 — see "Done since".
2. ~~**Stop shipping `code.css` everywhere.**~~ Done 2026-10-02 — see "Done
   since".

## Theming

3. ~~**`color-scheme` and `light-dark()`.**~~ Done 2026-10-02 — see "Done since".
4. ~~**Honour the OS preference.**~~ Done 2026-10-02 — see "Done since".
5. ~~**Consolidate colours.**~~ Done 2026-10-02 — see "Done since".
6. ~~**Revisit the escapes.**~~ Done 2026-10-02 — see "Done since".

## Structure

7. ~~**Merge the eight `CodeBlocks.tsx` copies.**~~ Done 2026-10-02 — see
   "Done since".
8. ~~**Shared `ProjectShell` component.**~~ Done 2026-10-02 — see "Done
   since".
9. ~~**Tidy the IDs.**~~ Done 2026-10-02 — see "Done since".

## Test harness

10. ~~**Verify the news thumbnails.**~~ Done 2026-10-02 — see "Done since".
11. ~~**Revisit `workers: 2`.**~~ Done 2026-10-02 — see "Done since".
12. ~~**Guard the layer order.**~~ Done 2026-10-02 — see "Done since".

## Layout

13. ~~**The header logo is squashed, and the header is a fixed 60px.**~~
    Done 2026-10-02 — see "Done since" and exception E8. The bar is still
    60px tall at every width; with the logo now centred in it, that was left
    as it is.

14. ~~**Consolidate the breakpoints.**~~ Done 2026-10-02 — see "Done since".

16. ~~**Replace the clipboard button's painted overhang.**~~ Done 2026-10-02 —
    see "Done since".

## Known, out of scope

15. **Remaining mobile layout issues.** Peter flagged these before the refactor
    started and they were deliberately excluded, so the 390px baselines captured
    them as they were. The header was fixed afterwards (see below); the rest are
    still open, and fixing each means updating its baselines in the same commit.

    **No route scrolls sideways at 320px or 390px any more.** Fixed, worst
    first: `/projects/random-password-generator` (29px at 390px, 67px at
    320px), `/projects/pizza-pie` (5px / 40px), `/contact` (20px at 320px
    only), and `/blog`, `/projects` and `/news` (3px each at 320px, one shared
    cause). All six are guarded by `tests/overflow.spec.ts`; see "Done since"
    for each cause.

    Left alone because it falls outside the 320–390px band: at 280px
    `/projects` still overflows 15px, because `.card` in `ProjectCard.astro`
    is a fixed 290px — no phone is that narrow (320px is the floor in
    practice).

## Done since

- **Copy button laid out, not painted** (2026-10-02). The Password
  Generator's copy button sat inside the dark field and was drawn 50px to
  the right of its own layout box (`position: relative; left: 50px`). The
  result row is now a flex row of two siblings, the dark field
  (`.pwgResult`, `flex: 1 1 auto`, max 270px) and the button
  (`margin-left: auto`), and the magic number is gone. Measured with a
  generated password at 1280/390/320/280px. On desktop the field and button
  occupy exactly the pixels they did: the button used to cover the field's
  last 4px, so the visible field already ended where the new one does. That
  "4px narrower" cost recorded here earlier never reached the screen. What
  changes: the button is inside the panel at every width (before, 2px out at
  390px and 40px out at 320px, with 1px to spare before the viewport edge),
  and the password now ends 10px from the field's edge instead of 50px short
  of it, where the button's invisible layout box used to be. Only the 2
  phone-width password-generator baselines moved, in the button's 46×50
  area. Exception E14.

- **The theme follows the OS; tokens use `color-scheme` and `light-dark()`**
  (2026-10-02). Three commits, decisions by Peter:
  - `color-scheme: light` on `:root`, `dark` under `[data-theme="dark"]`, so
    native controls and scrollbars are dark in dark mode (E12). Measured
    first: light mode didn't move at all; dark changed only unstyled native
    controls on 5 pages. Two fixes came with it. The contact email field
    dropped its forced white, so the form is consistent. The weather search
    input keeps `color-scheme: light`, as part of the widget's fixed light
    design, and its dark-only white placeholder rule is gone: the field had
    always been white, so in dark mode the hint was invisible (1:1); it is
    now the browser's grey in both themes (4.6:1).
  - `tokens.css` is one block of 39 `light-dark(light, dark)` declarations
    instead of two blocks. Proved identical: every token resolved to the same
    colour, as `color` and as `background-color`, in both themes, before and
    after (156 comparisons, zero differences), and the exact visual suite
    passed.
  - A first visit follows `prefers-color-scheme`, decided before first paint
    and without writing storage; with no stored choice the site follows live
    OS changes. The toggle stays two-state but stores a choice only when it
    differs from the OS, clearing it otherwise so the site follows the OS
    again. Blocked storage now follows the OS instead of falling back to
    light. `tests/theme.spec.ts` grew from 4 tests to 8 (OS light and dark
    first visits, stored choice beats the OS, self-clearing in both
    directions, live OS changes, blocked storage); mutation-tested by making
    the toggle always store (both self-clearing tests fail) and by removing
    the live listener (its test fails). E13.

- **Breakpoints on one scale** (2026-10-02). 18 width queries used 11
  different widths, five of them `device-width` + `orientation`. Now every
  query is `max-width` on **320 / 400 / 600 / 1024 / 1460** (Peter kept 320
  as its own tier), and phones held sideways are
  `(orientation: landscape) and (max-height: 500px)`. Mapping: 1200 → 1024
  (and then deleted: the Latest Updates `top: 10vh` it set was already the
  base value), 640 → 600 (pagination cards stack), 411 → 600 (weather
  widget), 724 deleted (it repeated the 1460 block's `.github-link` rule),
  device-width portrait → 600 (Navbar modal, checkbox margins), device-width
  landscape → the short-landscape query (with `max-width: 667px` added to the
  smaller-phone modal block, to keep its distinction).

  The item's premise was half wrong: the portrait `device-width` blocks did
  fire in the suite's 390×844 run (Playwright sets the emulated screen to the
  viewport). What they missed was a narrowed desktop browser, whose
  device-width is the monitor's. No baseline moved at 390 or 1280 (exact
  comparison). Checked computed styles against `main` across a device matrix
  — identical for phones in portrait, small phones in landscape, 412px
  Android, 1100, 1280 and both iPad orientations. What changes, all intended
  and approved: a narrowed desktop browser now gets the phone modal and
  checkbox margins; at 601–640px the pagination cards stay side by side; at
  412–600px the weather widget loses its 20px top and bottom margin (as
  narrower phones already did; Peter chose this over keeping 411); and in
  Chrome's landscape emulation the checkbox margin now applies, as it
  already did on real iPhones (iOS reports the portrait width as
  device-width). Exception E11.

- **Near-duplicate colours merged, and the suite made truly exact**
  (2026-10-02). Four merges, chosen by Peter, each under 8/255 per channel:
  `#faa804` → `#ffa804` (pagination page-number hover, light; contact icons,
  dark), `#fafafa` → `#f4f4f4` (card titles, dark), `#fff` → `#f4f4f4`
  (code-panel description list text, dark) and `#4a4a4a` → `#464646` (card
  background, dark). Three tokens then duplicated others in both themes and
  were removed: `--color-contact-icon-alt` (now `--color-contact-icon`),
  `--color-card-title` and `--color-list-text` (now `--color-text`).
  `--color-text-inherit` is renamed `--color-text-ambient`, for its role:
  text that takes its surroundings' colour in light and is pinned in dark.
  Exception E10.

  The merges exposed a gap in the visual suite: every screenshot still
  "matched", though `#4a4a4a` → `#464646` alone moved 915,000 pixels.
  `maxDiffPixels: 0` counts only pixels past Playwright's per-pixel
  `threshold`, which defaults to 0.2. With `threshold: 0` set temporarily,
  exactly the 6 expected dark screenshots failed (`/blog`, `/projects`,
  `/projects/pagination`, both widths), and every changed pixel was one of
  the four merges or its anti-aliased edge (max 7/255). `threshold: 0` is now
  permanent: 15 consecutive full runs at it were clean. Earlier "no baseline
  moved" claims were made at 0.2: they hold for layout, and the
  colour-sensitive items (2 and 6) were also checked with computed styles.

- **Dark-only rules trimmed** (2026-10-02). There were 16 dark-only rules
  (`[data-theme="dark"] …`), not the 13 counted in September: the nav work
  added some. Five became tokens. Their light values had been left to the
  browser, so the new tokens' light values are the system colours the
  browser's own stylesheet uses, and light rendering is unchanged:
  `--color-field-bg`/`--color-field-text` (`Field`/`FieldText`; the contact
  email field), `--color-control-text` (`FieldText`; the checkbox-styling
  inputs and the pizza-pie select), `--color-button-rest-bg`/`-text`
  (`ButtonFace`/`ButtonText`; pizza-pie's Order Now button). The GitHub
  link's hover rule dropped its dark scope, since it already used
  `--color-link-hover` and that is the colour light mode inherits anyway.
  (The item expected system colours to be a behaviour change; they aren't
  while no `color-scheme` is set — see items 3–4.) Verified: computed colour,
  background, border, accent and caret of all five in both themes, at rest
  and hovered, identical before and after (28 elements); no baseline moved.

  The 11 that remain, and why each stays dark-only:
  - Not colours: `.logo-light`/`.logo-dark` and `.icon-sun`/`.icon-moon`
    (display swaps, Navbar), `.github-logo` (a different image, code.css).
  - Different design per theme, not a colour swap: the nav's `box-shadow`
    (different offsets), the current-page glow (`font-weight` +
    `text-shadow`), the icons' `transition` (0.25s vs 0.35s), and the Latest
    Updates panel (border width and style, and its black background, E7).
  - Light value unreachable from CSS: the weather search `::placeholder`
    (the browser's own grey, which no keyword names and which differs
    between browsers; later deleted, see items 3–4, so 10 remain), and
    pagination's `.info span` (light inherits, and a
    light rule there would also restyle the text Google Maps injects, which
    the suite can't see).

- **News thumbnails in the suite — and a squash bug they exposed**
  (2026-10-02). The harness aborted every `i.cbc.ca` request, so all 16 CBC
  feed screenshots showed empty image boxes. It now answers each one with
  `tests/visual/fixtures/news-thumbnail.jpg`, a 620×349 image (the size
  every CBC thumbnail declares) with a grid and a circle, so distortion is
  obvious. `i.cbc.ca` itself answers fine today (a live request returns the
  JPEG), so visitors do see these images. Only the 16 CBC screenshots changed
  (the CNBC and Euronews feeds carry no images); those baselines were
  updated.

  The first real look showed every thumbnail squashed square on phones:
  350×349 at 390px, ratio 1.00 against the image's 1.78. reset.css caps
  images at `max-width: 100%`, but their `height="349"` attribute held the
  height — the same bug the header logo had. Fixed at the root, as Peter
  suggested: `img, picture { height: auto; }` in reset.css, so no image's
  height attribute can squash it again. (A rule in the lowest layer still
  beats a height attribute: presentational hints rank below all author
  styles.) That would also have let every page banner follow its photo's
  shape instead of the uniform 400px their `height="400"` gave them, so
  `Banner.astro` now states `height: 400px`; banners are unchanged. Whether
  banners should go fluid (280–500px, which their CSS already allows) is a
  separate decision. Now 350×197 on phones, ratio 1.78; desktop unchanged at
  620×349, and exactly the 8 phone-width CBC screenshots moved. Exception E9.

- **Playwright back to half the cores** (2026-10-02). `workers: 2` was there
  for a 1px whole-page height race on `home [dark]` under parallel load.
  Retested now that the CSS rebuild has changed that page: 20 consecutive
  visual runs at 6 workers (the default on this 12-core machine; 1,600
  zero-tolerance comparisons) were all clean, against 5 clean runs at 2. A
  run takes ~19s instead of ~46s. The config now says `workers: '50%'` — the
  default, stated — with the history and the fallback in its comment: if the
  race returns, set it back to 2 rather than raising `expect.timeout`.

- **Layer order guarded** (2026-10-02). `npm run lint:layers`
  (`scripts/check-layers.mjs`, no dependencies) scans every `.css` and
  `.astro` file under `src/` and fails if `@layer` or `layer(` appears
  anywhere but `src/styles/global.css` and `src/styles/code-layer.css`, if
  either names a layer other than `reset`, `base`, `layout` or `code`, or if
  `global.css` stops declaring exactly that order. A plain script rather than
  a Playwright spec, because every Playwright run starts with a full build.
  Mutation-tested: an `@layer` block in a CSS Module, an `@layer` in an Astro
  `<style>`, a misspelt `layer(Code)`, a reordered declaration and a layered
  `@import` in a component are each caught, with the right file and line.
  Added to the before-and-after checks in `AGENTS.md`. (The item's premise
  was also out of date: the minifier doesn't drop the order statement, it
  folds it into the layer blocks and keeps `@layer code;` explicit; the
  `global.css` comment now says so.)

- **Add Currency list works from the keyboard** (2026-10-02). Each item was a
  click-only `<li>`. Each `<li>` now holds a `<button type="button">` that
  takes over the item's flex layout and padding and inherits its cursor; the
  UA border, background and margin are cleared and its colour inherited, so a
  disabled one doesn't grey its text. Already-added currencies are `disabled`,
  so Tab skips them. Three things came with it:
  - The list is only slid out of view when closed, so its buttons were
    reachable with Tab while invisible; the `<ul>` is now `inert` while
    closed.
  - Adding a currency closes the list (it always did) and disables the
    focused button, which dropped focus to the top of the page. Focus now
    returns to the "Add Currency" toggle, so Enter reopens the list.
  - The toggle had `outline: none`, which overrode the site focus ring;
    removed, so keyboard focus on it is visible. (`:focus-visible` doesn't
    fire on mouse clicks, so nothing changes for mouse users.)

  No pixel changed. Measured the open list — 33 items' boxes, colours,
  opacity and cursor, plus the hover background, in both themes at 1280 and
  390px — identical to before. Keyboard, checked twice round: Tab skips the
  closed list; the toggle shows its ring; Enter opens it; Tab lands on the
  first currency not yet added; Enter adds it and focus returns to the
  toggle. Mouse: adding each of the 29 available currencies in turn behaves
  identically to `main`. (Note for anyone testing this: Playwright scrolls a
  clipped container to reach an element, which a visitor can't, so on
  `main` it can "click" the closed, hidden list. Reopen the list before each
  click, as a visitor must.)

- **Currency converter accessibility** (2026-10-02). Three fixes, no pixel
  changed:
  - Each row's amount input had no label, so a screen reader announced every
    one as a bare "edit text". Each now carries
    `aria-label={`${currency.name} amount`}` ("US Dollar amount", …), which
    contains the row's visible currency name. Checked: names unique, a
    currency added from the list gets one too, and typing into an input found
    by its name still converts the others.
  - The × that removes a row was a clickable `<span>`, unreachable by
    keyboard. It's now a `<button type="button">` named "Remove <currency>",
    with the UA border, background and margin cleared (reset.css already
    gives buttons `font: inherit`). Its box, colour and hover colour were
    measured identical to the old span in both themes at 1280 and 390px; Tab
    reaches it from the row's input, it shows the site focus ring, and Enter
    removes the row.
  - The flags (rows and the Add Currency list, 36 in all) had `alt="flag"`,
    read out beside every currency name. Now `alt=""`: the name is right next
    to each one.

  The Add Currency list's click-only `<li>`s were fixed next (below).

- **One `CodeBlocks` component** (2026-10-02). The eight per-project
  `CodeBlocks.tsx` copies (2,100 lines) differed only in data: which files
  each shows, in what order, under what header, in what language. Now
  `src/components/projects/CodeBlocks.tsx` (47 lines) renders the panel from a
  `files` prop, and each project has a `codeFiles.ts` with its sample strings
  and file list (1,910 lines in all; nearly all of it is the samples
  themselves). The strings were moved by script, not retyped, and checked
  against `main`: all 23 byte-identical, and every project's file order,
  labels and languages unchanged. Dropped one quirk: js-clock alone passed
  `className=" html"` to its first highlighter, which rendered
  `<pre class=" html">` and was read by nothing.

  Server-rendered HTML of all eight pages is identical to `main` apart from
  that class, the islands' JS bundle hashes, and, on `/projects/pagination`
  only, the two halves of its one inline `<style>` block swapping places
  (each half byte-identical; a layered block's position can't change the
  cascade). Because the panels are rendered client-side and their bundle
  changed, the deciding check was a computed-style comparison against a
  `main` build: 8 pages, both themes, 1280 and 390px, at rest, description
  open, code panel open and button hovered — 248,848 element-states, zero
  differences. No baseline moved.

- **`ProjectShell` component** (2026-10-02). The eight project pages each
  repeated the same block — `<div class="content">`, the "Back to Projects"
  link, the `btnSpacer`, and the `<h1>` — around their widget, and
  `PortPending.astro` had a ninth copy. That block is now
  `src/components/ProjectShell.astro` (`heading` prop, widget in the default
  slot); pages keep `BaseLayout`, their per-page font `<link slot="head">` and
  `GoogleMapsScript` exactly where they were. Verified byte for byte: the
  server-rendered HTML of all eight project pages and `/projects` is identical
  before and after (each page was first confirmed stable between two requests,
  so no normalising was needed). No baseline moved.

- **Widget IDs tidied** (2026-10-02). One rule now: an element keeps an `id`
  only if something reads it. 29 removed across six widgets (rollup-counter,
  checkbox-styling, currency-converter, password-generator, pizza-pie,
  pagination) — none was referenced by any CSS, script, label or test. Five
  stay: `forecastOutput` (the weather app's `getElementById`), the three
  `htmlFor`-linked styled checkboxes in checkbox-styling, and the password
  generator's slider, which gained its reader: its "Password length" `<label>`
  was orphaned (no `htmlFor`, not wrapping the input), so the slider's only
  name was `aria-label="range slider"`. The label now points at it and the
  `aria-label` is gone. The currency converter's per-row
  `id="currency-input"` duplicate is gone, so no route has a duplicated `id`
  (checked on all 20). No pixel changed; checked in a browser that the slider
  is named "Password length" and focuses from its label, and that generating,
  the settings, the counter, all six checkboxes, the pizza select, pagination
  and currency conversion still work. The currency converter's amount inputs
  had no label at all, which wasn't an ID matter; fixed separately (below).

- **`code.css` loads only on project pages** (2026-10-02). The `code` layer —
  the project widgets' code-panel chrome — was imported by `global.css`, so all
  20 routes shipped it. Now each of the eight `*Widget.tsx` files (and the
  unused `PortPending.astro`, which also uses `code.inline`) imports
  `src/styles/code-layer.css`, which is just
  `@import './code.css' layer(code);`. `global.css` still declares `code` in
  its `@layer` order; with no rules for it there, the build emits an explicit
  `@layer code;` after the other three, and that keeps `code` last on project
  pages even though its rules now arrive in a later stylesheet. Checked in the
  browser: layer order `reset < base < layout < code` on every page.
  Measured with `tests/visual/css-size.spec.ts`: the 12 non-project routes
  each ship **3,065 bytes less CSS** (about 20%); the 8 project pages ship 13
  bytes more (the `@layer code{}` wrapper). Pixel-identical (no baseline
  moved), and — since the suite never opens the code panels — a computed-style
  comparison against a `main` build over all 8 project pages, both themes, at
  1280 and 390px, with the description open, the code panel open and a widget
  button hovered: 248,848 element-states, **zero differences**.

- **Header logo in proportion, and shrinks to fit** (2026-10-02). The logo was
  squeezed sideways at every width: its width was capped but the
  `height="60"` attribute held it at 60px. Now `height: auto`, with caps of
  `min(224px, 100%)` on desktop, `min(140px, 100%)` at 600px and below and
  `min(120px, 100%)` at 400px and below. The percentage is what lets the logo
  narrow when the links need the room; fixed caps pushed the icons off the
  right edge at 401–409px and below 347px. Measured at 24 widths from 1440 to
  280px in both themes: nothing off-screen, nothing clipped, ratio 3.73
  throughout. A note for whoever touches this next: `min-width: 0` on `.logo`
  is **not** needed and was removed — an image with a percentage `max-width`
  already counts as shrinkable in flex layout, and a mutation run proved the
  rule did nothing. The fixed header was also invisible to the page-overflow
  check (it never widens the document), so `tests/overflow.spec.ts` gained a
  nav-fit test, mutation-tested against both failure modes. Deliberate visual
  change: exception E8, all baselines updated.

- **Fonts load per page** (2026-10-02). `BaseLayout.astro` loaded six
  render-blocking Google Font stylesheets on every route. Now it loads only
  Roboto, which `base.css` uses site-wide, and exposes a `head` slot; the four
  widget fonts each moved to the one page that uses them (Roboto Mono →
  `/projects/js-clock`, Montserrat → `/projects/currency-converter`, Muli →
  `/projects/random-password-generator`, Open Sans →
  `/projects/rollup-counter`). Source Sans Pro was dropped: it appears only
  inside sample code shown in the checkbox-styling code panel, never as a
  style. Every other route now makes one font request instead of six.
  Verified in a browser that each widget page still loads its font
  (`document.fonts`) and that `/` and `/projects` request only Roboto; **no
  baseline moved**.

- **Contact form fields shrink below a 380px viewport** (2026-10-02). The
  name, email and message fields each had `min-width: 300px`, but the page
  nests two `.content` wrappers, each with 20px side padding, so the form gets
  the viewport minus 80px: 310px at 390px, only 240px at 320px. The fields
  kept their 300px floor anyway and all three ended at x=340, 20px past a
  320px viewport. Now `min(300px, 100%)` — the same pattern as the card grid
  below — which only engages once the form is narrower than 300px. At 390px
  and 1280px the fields are still exactly 300px, so **no baseline moved**.
  The doubled `.content` padding is the reason the form is so narrow on
  phones, but removing it would change the layout at every width, so it was
  left alone.

- **Pizza pie's rotated slices contained** (2026-09-21). Each slice is a 200px
  square rotated ~45°, so its bounding box is 283px and reached 41px past the
  200px `.piechart` on both sides. Nothing painted there — the clip rect and
  the circle's `border-radius` keep the wedge inside — but an unpainted
  bounding box still counts as scrollable overflow, so the page grew sideways
  (5px at 390px, 40px at 320px). `overflow: hidden` on `.piechart` says what
  was always true: nothing renders outside the circle. Two wrong hypotheses
  first, recorded so nobody retries them — the slice's
  `clip: rect(0, 101px, 300px, 0)` declares a 300px bottom on a 200px box and
  looks exactly like the 100px `clientWidth`/`scrollWidth` gap, but correcting
  it to 200px, and swapping it for the `clip-path` equivalent, each changed
  nothing at any width.

- **Card grid stops forcing 325px** (2026-09-21). `li.item` had
  `min-width: 325px`, a hard floor wider than the 20px-guttered column below a
  365px viewport, so `/blog`, `/projects` and `/news` each scrolled 3px at
  320px — one cause, three routes. Now `min(325px, 100%)`, which only engages
  below ~365px: at 390px and 1280px the card is still exactly 325px and the
  per-row counts are unchanged, so **no baseline moved** — the whole visual
  suite passed untouched at its zero tolerance.

  A note for anyone measuring this grid: `li.item` carries
  `transition: all 0.25s`, and a transition in flight outranks even an inline
  `!important`. Injecting CSS and reading `getBoundingClientRect` straight
  after returns the *old* width, which made a correct fix look like it did
  nothing and a desktop-breaking one look clean. Wait out the transition
  before believing any number from this page.

- **Responsive header** (2026-09-19). The nav had no width rules and no media
  queries of its own: at 390px the logo was clipped 11px off the left edge and
  the last links sat 114px past the viewport (170px at 320px), unreachable
  because the page doesn't scroll sideways. Now a flex row with gaps, a
  `min(80vw, 1200px)` container, and breakpoints at 600px and 400px. Measured
  clean at 1280/900/600/390/320.

- **Current-page indicator and focus styles** (2026-09-20). `aria-current="page"`
  derived from `Astro.url.pathname`, styled bold in light and with a glow in
  dark (colour only below 400px, where bold costs up to 20px on the longest
  label). Site-wide `:focus-visible` ring in `base.css`. The header's
  logo distortion was item 13, now done.

- **Password Generator viewport overflow** (2026-09-21). The page scrolled 29px
  past a 390px viewport and 67px past 320px. Cause was a single rule: a
  `@media (max-width: 400px)` override giving the clipboard button
  `left: 118px`, inherited from the legacy site in the original scaffold
  (`f1311a4`) and never re-measured. Because the button is only relatively
  offset, its painted box escaped the panel and set the document's width — at
  390px the button's right edge *was* the 419px scrollWidth. Deleting the
  override drops it back to the base `left: 50px`, which tracks the panel and
  stays inside the viewport at 1280/600/390/360/320/280. Desktop is untouched:
  every desktop baseline passed unchanged, and the button's geometry at 1280px
  is identical before and after. The 390px baselines shrank from 419px to 390px
  wide, which is the fix in evidence.

  An earlier note here blamed "the clipboard button and the `span.token`
  elements in its code sample". The `span.token` runs were a red herring — they
  sit inside an `overflow`-clipped ancestor, so they can't widen the document.
  The button was the whole cause.

  Guarded by `tests/overflow.spec.ts`, which asserts `scrollWidth ===
  clientWidth` at 390px and 320px and names the widest unclipped element when it
  fails. The visual suite cannot catch this class of bug: it screenshots
  `fullPage`, so an overflowing page expands the screenshot and still matches its
  own baseline. Extend that spec's route list as the item 15 routes are fixed.
