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

3. **`color-scheme` and `light-dark()`.** The modern way to express the same
   thing the tokens do. Deferred because setting `color-scheme` changes how
   native controls and scrollbars render, which would have broken pixel
   identity. Pair it with item 4.
4. **Honour the OS preference.** Today a first visit is always light, and
   nothing is written to storage until the visitor toggles (that groundwork was
   done deliberately). Defaulting to `prefers-color-scheme`, optionally with a
   light/dark/system control, is the remaining step.
5. **Consolidate colours.** 39 tokens still include near-duplicates the refactor
   had to preserve exactly — `#ffa804` next to `#faa804`, several greys. Also
   rename `--color-text-inherit`, which is named for its mechanism
   (`currentColor` in light, a fixed value in dark) rather than its role.
6. **Revisit the escapes.** 13 rules still need a `:global([data-theme="dark"])`
   selector (audit §C). A few could become tokens if their light value can be
   expressed — e.g. the contact email field, the `#ddl` select and the checkbox
   input could take CSS system colours (`Field` / `FieldText`), which is a
   behaviour change, not a pure refactor.

## Structure

7. **Merge the eight `CodeBlocks.tsx` copies** (~2,100 lines) into one component
   fed each project's samples. They already share the same markup and the same
   global class names.
8. ~~**Shared `ProjectShell` component.**~~ Done 2026-10-02 — see "Done
   since".
9. ~~**Tidy the IDs.**~~ Done 2026-10-02 — see "Done since".

## Test harness

10. **Verify the news thumbnails.** `i.cbc.ca` fails at the network level in the
    suite, so the images are aborted and the feed-item image box renders
    unloaded in every baseline. Its CSS is only verified where the box is sized.
11. **Revisit `workers: 2`** in `playwright.config.ts`. It's there for a real
    1px whole-page height race that only appeared under parallel load. Worth
    retesting if the suite gets slow.
12. **Guard the layer order.** Cascade order currently relies on `@layer`'s first
    appearance, because the minifier drops the statement. `global.css` carries a
    comment warning never to use `@layer` in a component; a lint rule would make
    that mechanical.

## Layout

13. ~~**The header logo is squashed, and the header is a fixed 60px.**~~
    Done 2026-10-02 — see "Done since" and exception E8. The bar is still
    60px tall at every width; with the logo now centred in it, that was left
    as it is.

14. **Consolidate the breakpoints.** 15 media queries across 13 files with no
    shared scale: 1200, 1024, 1000, 724, 667, 600, 400 all appear. Worse, some
    use `min-device-width`/`max-device-width` with `orientation` (the old
    iPhone-targeting style), which keys off the physical device rather than the
    window — so they don't fire when a desktop browser is resized, and almost
    certainly never fire in the Playwright suite, which sets a viewport. Those
    blocks are effectively untested. Pick a scale, convert everything to
    `max-width`, and re-verify.

16. **Replace the clipboard button's painted overhang.** The Password Generator's
    copy button sits inside the password field but is drawn outside it, via
    `position: relative; left: 50px`. That works at every width down to 280px
    because the field shrinks with the panel, but the clearance at 320px is 1px,
    so it is one layout tweak away from pushing the page sideways again. The
    structural fix is to make the button a sibling of the field in a flex row and
    push it right with `margin-left: auto`, deleting the magic number. Measured
    cost: the dark field narrows by 4px on desktop (270px → 266px) and more on
    phones, so it needs desktop baselines and its own before/after. Deferred as
    out of proportion to the bug it would prevent — the overflow itself is fixed
    (see below).

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
  and currency conversion still work. Still open, and not an ID matter: the
  currency converter's amount inputs have no label at all.

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
