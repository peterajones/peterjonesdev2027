# CSS Architecture Refactor — Design

- **Date:** 2026-09-18
- **Branch:** `refactor/css-architecture`
- **Status:** Implemented on refactor/css-architecture; pending exception review

## Problem

The styling system dates from 2019 and has outgrown its structure:

- ~3,100 lines of SCSS in 27 partials, all compiled into one global stylesheet (`src/styles/globals.scss`) that every page loads. "Scoping" is by naming convention only.
- Dark mode is implemented rule-by-rule: `.dark` appears ~110 times across the partials.
- ~68 distinct hard-coded hex values against 16 CSS custom properties, including duplicates (`--light-gray` / `--light-grey`).
- ID selectors styled directly (`#switches`, `#checkboxes`, `#forecastOutput`, …) in older project demos.
- Leftovers from the Next.js era (`_signin.scss`, `_nprogress.scss`, an empty `src/components/projects/password-generator/`).
- Sass `@import` is deprecated; the partials use `@import`/`@use` 33 times.
- React project widgets return bare fragments with inconsistent root elements; at least one is missing a wrapper.
- The theme toggle runs as a deferred module script and sets `dark` on `<body>`, so dark-mode visitors see a flash of the light theme on every page load.

## Goals

1. Web-standards CSS only — **no Sass**.
2. Styles live with the component they style; a small, explicit global layer holds the rest.
3. Dark mode expressed once, through semantic tokens.
4. **Pixel-identical** output, verified mechanically — any deviation is a logged, approved exception.
5. Fix the dark-mode flash.

## Non-goals

- Visual redesign or colour consolidation beyond merging identical values.
- Fixing known mobile layout issues (baseline captures them as they are).
- JavaScript refactors of the widgets beyond the markup the CSS needs (see Follow-ups).
- Changing the default theme or honouring OS preference (see Follow-ups).

## Decisions

| Topic | Decision |
|---|---|
| Styling approach | Astro scoped `<style>` in `.astro` components; `*.module.css` for React components |
| Preprocessor | None. Plain CSS with native nesting; `sass` dependency removed |
| Fidelity | Pixel-identical; exceptions logged and approved individually |
| Widget markup | Only what the CSS needs: one consistent root element per widget, missing wrappers added |
| Colour tokens | Only colours used by more than one component become global tokens; single-use colours stay in their component |
| Theme mechanism | `data-theme="dark"` on `<html>`, set by an inline head script |

## Architecture

### File layout

```
src/styles/
  global.css   entry point; imported once by BaseLayout; declares layer order
  tokens.css   :root semantic tokens + :root[data-theme="dark"] overrides
  reset.css
  base.css     element typography (h1–h6, p, a, lists), body
  layout.css   shared layout classes (.content, .backBtn, .btnSpacer, …)
  code.css     code-panel styles (from _code.scss)
```

Everything else is colocated:

- `.astro` components and pages (Navbar, Footer, Banner, ProjectCard, pages) — `<style>` block, scoped by Astro.
- React components (8 project widgets, ContactForm, NewsFeed) — `Component.module.css` beside the component.

### Cascade layers

`global.css` declares:

```css
@layer reset, base, layout, code;
```

Global files are imported into their layer. Component styles are unlayered, so they beat all global styles regardless of specificity. This is the change most likely to move pixels (where a global rule currently out-specifies a component rule); each such case is fixed or logged as an exception.

### Naming

- Module class names are camelCase (`styles.pubDate`), matching existing React usage.
- `.astro` class names are left as they are unless a rename is required.

## Theme and tokens

### Theme mechanism

- `BaseLayout.astro` gets a `<script is:inline>` at the top of `<head>` that reads `localStorage.theme` and, when it is `'dark'`, sets `document.documentElement.dataset.theme = 'dark'`. It runs before first paint, eliminating the flash.
- Same storage key (`theme`), so existing visitors keep their choice.
- Wrapped in `try/catch`; on failure the page falls back to light.
- The Navbar toggle (`src/components/Navbar.astro`) flips `document.documentElement.dataset.theme` and persists the choice.
- **Behaviour change:** the page no longer writes `'light'` to storage on first visit; only an explicit toggle writes. Invisible today; keeps the OS-preference follow-up possible for existing visitors.

### Tokens

- `tokens.css` defines light values on `:root` and overrides only what differs under `:root[data-theme="dark"]`. This is the only place dark mode is named.
- Role-based names: `--color-text`, `--color-text-muted`, `--color-bg`, `--color-surface`, `--color-border`, `--color-link`, `--color-link-hover`, `--color-accent`, `--color-button`, … The final set comes from the audit's usage inventory.
- Tokens merge only values that are already identical. No value changes.
- Colours that vary by theme are tokens in `tokens.css`, even if only one component uses them — they need the theme hook. Theme-invariant single-use colours stay in their component's CSS as literals.
- Rewritten dark-mode rules use `[data-theme="dark"]` (without `:root`), which has the same specificity as the old `.dark` class.
- Where a component needs a dark-only rule no token can express, it uses `:global([data-theme="dark"]) .thing` (keeps the old `.dark` class's specificity). Each occurrence is noted in the audit as a candidate token.
- The Prism atom-dark theme was inert before the refactor — `react-syntax-highlighter` applies its theme inline, so the CSS never took effect — and was deleted rather than migrated (audit P8).

## Verification: visual regression

### Setup

- `@playwright/test` as a dev dependency, Chromium only; config and specs in `tests/visual/`.
- Playwright `webServer` builds and runs the production server (`npm run build && node --env-file=.env ./dist/server/entry.mjs`) — never the dev server (see CLAUDE.md's stale-Vite quirk).
- Matrix: every route × light/dark × 390px/1280px, full-page screenshots.
  - Routes: `/`, `/blog`, each blog post (enumerated from the content collection), `/projects`, the 8 project pages, `/news` and its feed pages, `/contact`.
- Theme set via `localStorage.theme` in an init script before navigation, so the real head script is exercised.
- Animations and transitions disabled; fonts awaited.
- Determinism by fixing inputs rather than hiding regions, so dynamic widgets' CSS is still verified: external requests (fonts, APIs, the site's `/api/` proxies) recorded once to local HAR files and replayed; clock fixed; `Math.random` seeded. Masking is the fallback for anything that stays non-deterministic (Google Maps at minimum). The suite must pass three consecutive runs before baselines are trusted.

### Workflow

1. Baselines are captured on this branch against the **unchanged** CSS before any CSS change. Baselines and HAR recordings are **gitignored**: the screenshots are Claude's safety net (Peter reviews in the browser), they are regenerable from `main`, and HARs contain API keys in request URLs.
2. After every migration step, `npx playwright test` must pass with **zero diff** — no tolerance threshold.
3. An intended difference gets an exceptions-log entry committed on its own, and its local baseline is updated.

### Exceptions log

`docs/css-refactor-exceptions.md`. Written for review in a browser, not via screenshots. Each entry:

- URL path, theme, and width to check
- what changed and why
- what to look for
- commit
- approval: pending / approved

The "before" is the live production site (still on `main`), compared against the branch's local production build at the same path. Nothing merges while any entry is pending. `npx playwright show-report` is available to view diffs in the browser if wanted.

The suite stays in the repo afterwards as a CSS regression harness.

### Size measurement

Record per-page CSS bytes (shipped stylesheets + inlined `<style>`) before and after; report in the wrap-up. No further optimisation work is planned — per-page bundling replaces the site-wide stylesheet. Astro's default `build.inlineStylesheets: 'auto'` is retained.

## Migration order

Each step is one commit (or a small group), and the visual suite passes before the next step.

0. **Safety net.** Add Playwright; capture and commit baselines against current CSS.
1. **Audit, then Sass → plain CSS in place.** The audit produces `docs/css-refactor-audit.md`: per-partial destination and dead/alive status, `.dark` rule inventory, token inventory, masking list. Then convert each `.scss` to `.css` with native nesting, replacing Sass-only features (watch `&-suffix` concatenation, which native nesting does not support). Structure unchanged.
2. **Tokens and theme.** Add `tokens.css`; move theme to `<html data-theme>`; add inline head script; update the Navbar toggle; convert `.dark` rules to token overrides.
3. **Global layer.** Split `reset`, `base`, `layout`, `code` into layered files behind `global.css`.
4. **Components, one per commit.** Navbar, Footer, Banner, ProjectCard → pages (home, blog, news, contact, projects index) → 8 project widgets (add consistent root; fix missing wrapper) → ContactForm, NewsFeed (`.module.scss` → `.module.css`). Delete each partial once empty.
5. **Dead code**, own commit: `_signin`, `_nprogress`, empty `password-generator/`, plus anything else the audit confirms unused.
6. **Wrap-up.** Remove `sass`; record per-page CSS sizes; update the CSS-scoping notes in `README.md` (added in `2f7b70b`); finalise the exceptions log for browser walkthrough.

No push, PR, or merge without explicit approval.

## Success criteria

- No `.scss` files and no `sass` dependency.
- `.dark` / dark-mode selectors appear only in `tokens.css`, plus any logged `:global(...)` escapes.
- Visual suite passes with zero diff, except approved exceptions.
- No flash of light theme for dark-mode visitors (verified in browser with a throttled load).
- Every page ships only the CSS it uses; before/after sizes recorded.

## Follow-ups (separate tasks)

1. **Consolidate `CodeBlocks.tsx`** — 8 near-duplicate copies (~2,100 lines) into one shared component fed each project's samples.
2. **Shared `ProjectShell` component** — the back button / spacer / heading repeated in the 8 project pages.
3. **`color-scheme` and `light-dark()`** — deferred because `color-scheme` changes native control and scrollbar rendering, breaking pixel identity.
4. **Honour OS preference** — default to `prefers-color-scheme`; optionally a light/dark/system control.
5. **Colour consolidation** — collapse near-duplicate colours into a small palette.
6. **Known mobile layout issues** — out of scope here; will require baseline updates.
