## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

### Known quirk: stale Vite dependency cache after repeated restarts

Editing `astro.config.mjs` (or otherwise forcing several `astro dev stop` /
`astro dev --background` cycles in one session) can leave Vite's dependency
pre-bundle in a state where a React island's hydration fails in the browser
console with `Failed to fetch dynamically imported module` — reproducible on
every page, not specific to whatever you were actually testing. A plain
`fetch()` of the same URL succeeds; only the module-graph `import()` used by
hydration fails, and it doesn't self-heal on reload.

Also seen with **Content Collections** (`src/content.config.ts`): creating
that file for the first time, or adding new entries to an already-loaded
collection's directory, can leave `getCollection()` silently returning
fewer entries (or none) in an already-running dev server — no error, the
page just renders with missing content. Same fix, same non-self-healing
behavior.

This is a dev-server-only artifact, unrelated to application code. Don't
chase it in the app — either:
- `astro dev stop && rm -rf node_modules/.vite .astro && astro dev --background --force`, or
- test against the real production build instead (what actually matters for
  a deploy question anyway): `npm run build && node --env-file=.env ./dist/server/entry.mjs`,
  which has no Vite dev-time module graph at all.

## Styling

The CSS was rebuilt in September 2026 (README's "Styling architecture" has the
full picture; `docs/superpowers/specs/2026-09-18-css-architecture-design.md` has
the reasoning). The short version, and the rules that keep it intact:

- **Plain CSS only. No Sass** — the `sass` dependency is gone, and there are no
  `.scss` files. Native nesting is fine.
- **Colours are tokens.** `src/styles/tokens.css` defines `--color-*` on `:root`
  with dark overrides under `:root[data-theme="dark"]`. Write
  `color: var(--color-text)`, never a hex literal for anything theme-varying.
- **Dark mode is one attribute:** `data-theme` on `<html>`. Never reintroduce a
  `.dark` class or a per-rule dark selector. A component that genuinely needs a
  dark-only rule (a different image, say) writes
  `:global([data-theme="dark"]) .thing` — 11 remain, each with the reason it
  can't be a token, in `docs/css-follow-ups.md` ("Dark-only rules trimmed").
- **Global CSS is four layers** (`reset, base, layout, code`), all declared in
  `src/styles/global.css` (`npm run lint:layers` fails on any other `@layer`).
  The first three are imported there and are the only place for genuinely
  site-wide rules. `code` (the project widgets' code-panel
  chrome) is imported by each project widget via `src/styles/code-layer.css`,
  so other routes don't ship it; keep it inside `layer(code)` if you move it,
  never as a plain import. **Never
  use `@layer` in a component** — component styles are unlayered on purpose, so
  they always win.
- **Component styles live with the component:** a `<style>` block in `.astro`
  files (use `:global()` to reach rendered Markdown), a co-located
  `<Widget>.module.css` for React widgets. A bare element selector inside a
  `.module.css` is global and leaks site-wide — always hang it off a module class.

### Before and after any CSS change

```
npx astro check                                       # expect 0 errors/warnings/hints
npm run lint:layers                                   # expect "Layer order check passed"
npx playwright test tests/theme.spec.ts tests/visual   # expect 84 passed, 2 skipped
npx playwright test tests/overflow.spec.ts             # expect 18 passed, 18 skipped
```

The visual suite screenshots every route in both themes at 390px and 1280px and
compares pixel-for-pixel with **zero** tolerance: `maxDiffPixels: 0` *and*
`threshold: 0`. The second was only added on 2026-10-02; before that,
Playwright's default per-pixel threshold (0.2) let colour shifts of up to
~20% pass, so older "no baseline moved" claims cover layout but not subtle
colour changes. Baselines and HARs are
gitignored, so a fresh clone has none: capture them on a known-good commit
*before* editing CSS (README has the command), never mid-change.

The visual suite is blind to horizontal overflow: it screenshots `fullPage`, so
a page wider than the viewport just produces a wider screenshot that still
matches its own baseline. `tests/overflow.spec.ts` is the gate for that,
asserting `scrollWidth === clientWidth` at 390px and 320px. It covers the six
routes that used to overflow (`docs/css-follow-ups.md` item 15); add a route
whenever a fix touches its width. The fixed header can't widen the document,
so that check can't see it; the same file measures the nav's own links and
icons, and the logo's aspect ratio, at six phone widths.

The suite only captures each page at rest — no hover, no open panels or modals,
no typed input. Those states need a computed-style check or a browser pass;
`docs/css-refactor-exceptions.md` has an interaction walkthrough listing them.
Google Maps only renders on **port 4321** (the API key is referrer-restricted)
and is blocked entirely in the suite.

Deliberate visual changes get an entry in `docs/css-refactor-exceptions.md`
rather than a quietly updated baseline. When a change is *meant* to alter the
layout (responsive work, say), update the baselines in the same commit and say
so in the message — the diff is the evidence, so it should be deliberate.

Breakpoints use one scale, all `max-width`: **320, 400, 600, 1024, 1460**
(narrow phone, phone, large phone/small tablet, tablet, wide). Phones held
sideways are `(orientation: landscape) and (max-height: 500px)`. Pick from
the scale rather than adding a width; the one exception is the Latest
Updates modal's small-landscape-phone block, which adds `max-width: 667px`.
Never use `device-width`: it keys off the screen rather than the window, so
a narrowed desktop browser never sees phone rules (and iOS reports the
portrait width even in landscape).

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
