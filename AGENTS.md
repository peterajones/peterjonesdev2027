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
  `:global([data-theme="dark"]) .thing` — 13 exist, all listed in
  `docs/css-refactor-audit.md` §C.
- **Global CSS is four layers** (`reset, base, layout, code`) imported by
  `src/styles/global.css`. Only genuinely site-wide rules belong there. **Never
  use `@layer` in a component** — component styles are unlayered on purpose, so
  they always win.
- **Component styles live with the component:** a `<style>` block in `.astro`
  files (use `:global()` to reach rendered Markdown), a co-located
  `<Widget>.module.css` for React widgets. A bare element selector inside a
  `.module.css` is global and leaks site-wide — always hang it off a module class.

### Before and after any CSS change

```
npx astro check                                       # expect 0 errors/warnings/hints
npx playwright test tests/theme.spec.ts tests/visual   # expect 84 passed, 2 skipped
```

The visual suite screenshots every route in both themes at 390px and 1280px and
compares pixel-for-pixel with **zero** tolerance. Baselines and HARs are
gitignored, so a fresh clone has none: capture them on a known-good commit
*before* editing CSS (README has the command), never mid-change.

The suite only captures each page at rest — no hover, no open panels or modals,
no typed input. Those states need a computed-style check or a browser pass;
`docs/css-refactor-exceptions.md` has an interaction walkthrough listing them.
Google Maps only renders on **port 4321** (the API key is referrer-restricted)
and is blocked entirely in the suite.

Deliberate visual changes get an entry in `docs/css-refactor-exceptions.md`
rather than a quietly updated baseline.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
