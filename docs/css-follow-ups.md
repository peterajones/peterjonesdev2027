# CSS follow-ups

Deliberately left out of the September 2026 CSS refactor, which was scoped to
"same pixels, better structure". Each item here is a change that would alter
output, behaviour, or JavaScript, so each wants its own branch, its own
before/after evidence, and — where it changes what a visitor sees — its own
entry in `docs/css-refactor-exceptions.md`.

Sources: the spec's original Follow-ups list, the audit's Plan impacts, and the
final whole-branch review.

## Performance

1. **Load fonts per page.** `BaseLayout.astro` loads six render-blocking Google
   Font stylesheets on all 20 routes. Four are used by exactly one project
   widget each (Roboto Mono, Montserrat, Muli, Open Sans) and **Source Sans Pro
   is used nowhere** outside CodeBlocks sample text. Moving each to the page
   that needs it — and dropping the unused one — is pixel-neutral everywhere
   else. The refactor preserved the existing behaviour deliberately (audit P3).
2. **Stop shipping `code.css` everywhere.** The `code` layer (~3 KB minified) is
   the project widgets' code-panel chrome, but it loads on all 12 non-project
   routes too. It's the one remaining gap against "every page ships only the CSS
   it uses". Fixing it means moving those rules to a component or a per-page
   import.

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
8. **Shared `ProjectShell` component** for the back button, spacer and heading
   repeated across the eight project pages.
9. **Tidy the IDs.** ID handling ended up inconsistent: pizza-pie dropped its
   unread `#ddl`/`#eaten`, while checkbox-styling, password-generator and
   rollup-counter kept theirs. Harmless, but worth one pass. In the same sweep,
   the currency converter renders a duplicated `id="currency-input"` per list
   item, which is invalid HTML (pre-existing, and now unstyled).

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

14. **Consolidate the breakpoints.** 15 media queries across 13 files with no
    shared scale: 1200, 1024, 1000, 724, 667, 600, 400 all appear. Worse, some
    use `min-device-width`/`max-device-width` with `orientation` (the old
    iPhone-targeting style), which keys off the physical device rather than the
    window — so they don't fire when a desktop browser is resized, and almost
    certainly never fire in the Playwright suite, which sets a viewport. Those
    blocks are effectively untested. Pick a scale, convert everything to
    `max-width`, and re-verify.

## Known, out of scope

15. **Remaining mobile layout issues.** Peter flagged these before the refactor
    started and they were deliberately excluded, so the 390px baselines captured
    them as they were. The header was fixed afterwards (see below); the rest are
    still open, and fixing each means updating its baselines in the same commit.

## Done since

- **Responsive header** (2026-09-19). The nav had no width rules and no media
  queries of its own: at 390px the logo was clipped 11px off the left edge and
  the last links sat 114px past the viewport (170px at 320px), unreachable
  because the page doesn't scroll sideways. Now a flex row with gaps, a
  `min(80vw, 1200px)` container, and breakpoints at 600px and 400px. Measured
  clean at 1280/900/600/390/320.

- **Current-page indicator and focus styles** (2026-09-20). `aria-current="page"`
  derived from `Astro.url.pathname`, styled bold in light and with a glow in
  dark (colour only below 400px, where bold costs up to 20px on the longest
  label). Site-wide `:focus-visible` ring in `base.css`. Still open in the
  header: the fixed 60px height on phones.

Found while measuring, not yet fixed: **`/projects/random-password-generator`
overflows its viewport** — 29px at 390px, 67px at 320px — from the widget's
clipboard button and the `span.token` elements in its code sample, not from the
nav. One of the mobile issues in item 15.
