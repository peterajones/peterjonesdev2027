# CSS Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the global Sass partial system with plain CSS — semantic tokens, a small layered global stylesheet, Astro scoped styles and CSS Modules — with pixel-identical output and no dark-mode flash.

**Architecture:** A Playwright visual-regression suite is built first against the unchanged site and gates every later task at zero pixel diff. Sass is converted to plain CSS in place, then the theme moves to `<html data-theme>`, dark-mode rules collapse into tokens, globals move into cascade layers, and finally each component takes ownership of its own styles one commit at a time.

**Tech Stack:** Astro 7 (Node adapter, standalone), React 19 islands, plain CSS (native nesting, `@layer`, custom properties), CSS Modules via Vite, `@playwright/test` (Chromium).

**Spec:** `docs/superpowers/specs/2026-09-18-css-architecture-design.md`

## Global Constraints

- Branch: `refactor/css-architecture`. Never commit to `main`. **Never push, open a PR, or merge** — each needs Peter's separate explicit approval.
- Every commit message ends with a blank line then `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- No Sass anywhere in the end state; no `.scss` files; `sass` dependency removed (Task 20).
- **Pixel-identical:** after every task, the Verification Gate (below) passes with zero diff. No tolerance thresholds.
- Deviations from pixel identity are allowed only as entries in `docs/css-refactor-exceptions.md` (format below), each with its baseline update in its own commit.
- Theme attribute: `data-theme` on `<html>`, values `"light"` / `"dark"`; storage key `theme`. Rewritten dark rules use `[data-theme="dark"]` (no `:root`) so specificity equals the old `.dark` class. `tokens.css` uses `:root[data-theme="dark"]`.
- Tokens: colours that **vary by theme** are tokens in `tokens.css` (they need the theme hook). Colours that are theme-invariant and used by one component stay local to that component as literals.
- `.astro` components: styles in the component's `<style>` block. Anything rendered by `<Content />`, `set:html`, or a child component must be reached via `:global()` under a local class, e.g. `.post-body :global(h2)`.
- React components: one CSS Module per widget folder, named `<Widget>.module.css` (e.g. `src/components/projects/pizza-pie/PizzaPie.module.css`), imported as `styles` by any component in that folder. Class names in module source are camelCase; accessed as `styles.camelName`. No Vite config changes.
- Class names that other code depends on as strings (`code`, `is-open`, `is-closed`, `inline` from the shared CodeBlocks panels) stay global in `code.css`.
- Out of scope (spec Follow-ups): merging `CodeBlocks.tsx`, `ProjectShell`, `color-scheme`/`light-dark()`, OS preference, colour consolidation, mobile layout fixes. Do not start them.
- Dev-server quirk (CLAUDE.md): all verification uses the production build via Playwright's `webServer`, never `astro dev`.

### Verification Gate (run at the end of every task from Task 3 on)

```bash
npx astro check
npx playwright test tests/visual
```

Expected: `astro check` reports 0 errors; Playwright reports `80 passed` and `2 skipped` (20 routes; the repo has 6 news feeds) (the opt-in CSS-size spec, once per project). If `astro check` reports errors on the untouched branch before your change, record that baseline count in the audit and gate on "no new errors" instead. On any screenshot failure:

1. `npx playwright show-report` and inspect the diff.
2. If unintended: fix the CSS and re-run. Do not update baselines.
3. If intended or unavoidable (e.g. a fixed missing wrapper): add an exceptions-log entry, then update only that test's baseline with `npx playwright test tests/visual -g "<exact test title>" --update-snapshots`, and commit the log entry in a separate commit whose message starts `Exception E<n>:`.

### Exceptions log entry format (`docs/css-refactor-exceptions.md`)

```markdown
## E<n>: <short title>

- **Where:** `/projects/pizza-pie` — dark — 390px
- **What changed:** <one or two sentences>
- **Why:** <cause; why keeping the old rendering is wrong or impossible>
- **What to look for:** <what Peter should compare between the live site and the local build>
- **Commit:** <sha>
- **Approval:** pending
```

## File Structure

```
playwright.config.ts                     NEW  two projects (desktop 1280, mobile 390), prod webServer
tests/visual/routes.ts                   NEW  every route + per-route masks
tests/visual/stabilize.ts                NEW  fixed clock, seeded Math.random, theme preset, HAR replay, settle()
tests/visual/visual.spec.ts              NEW  route × theme screenshots
tests/visual/css-size.spec.ts            NEW  per-route CSS bytes (opt-in via CSS_SIZE_OUT)
tests/theme.spec.ts                      NEW  theme mechanism behaviour (Task 4)
docs/css-refactor-audit.md               NEW  audit output consumed by Tasks 3–19
docs/css-refactor-exceptions.md          NEW  exceptions log
docs/css-refactor-size.md                NEW  before/after CSS bytes (Task 20)
src/styles/global.css                    NEW  replaces globals.scss; layer order + imports
src/styles/tokens.css                    NEW  semantic tokens, light + dark
src/styles/reset.css | base.css | layout.css | code.css   NEW (Task 6)
src/styles/partials/*.scss               DELETED progressively
src/styles/News.module.scss              MOVED → src/components/NewsFeed.module.css
src/layouts/BaseLayout.astro             MOD  global.css import, font <link>s, inline theme script
src/components/*.astro                   MOD  gain <style> blocks
src/components/**/*.tsx                  MOD  className → styles.x
src/components/projects/*/<Widget>.module.css   NEW
README.md                                MOD  CSS architecture section (Task 20)
package.json / .gitignore                MOD
```

Untracked by design (gitignored): screenshot baselines, HAR recordings, Playwright reports. Baselines are Claude's safety net, regenerable from `main`; HARs contain API keys in request URLs and must never be committed.

---

### Task 1: Visual regression harness and baselines

**Files:**
- Create: `playwright.config.ts`, `tests/visual/routes.ts`, `tests/visual/stabilize.ts`, `tests/visual/visual.spec.ts`, `tests/visual/css-size.spec.ts`
- Modify: `package.json` (devDependency, scripts), `.gitignore`

**Interfaces:**
- Produces: `routes: VisualRoute[]` (`{ name: string; path: string; mask?: string[] }`), `stabilize(page, { theme, harPath })`, `settle(page)`, test titles of the form `"<route name> [<theme>]"` in projects `desktop` and `mobile`. Every later task relies on `npx playwright test tests/visual`.

- [ ] **Step 1: Confirm clean start on the branch**

Run: `git branch --show-current && git status --short`
Expected: `refactor/css-architecture` and no changes. Confirm `.env` exists (`test -f .env && echo ok`) — the build and API recording need it.

- [ ] **Step 2: Install Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

Add to `package.json` `scripts`:

```json
"test:visual": "playwright test tests/visual",
"test:theme": "playwright test tests/theme.spec.ts"
```

- [ ] **Step 3: Gitignore generated artefacts**

Append to `.gitignore`:

```
# Playwright
test-results/
playwright-report/
tests/visual/__screenshots__/
tests/visual/.har/
tests/visual/.size/
```

- [ ] **Step 4: Write `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

const PORT = 4399;

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled', caret: 'hide', scale: 'css' },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
    deviceScaleFactor: 1,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    // Theme behaviour tests (Task 4) are width-independent; run them once.
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } }, testIgnore: ['**/theme.spec.ts'] },
  ],
  webServer: {
    command: 'npm run build && node --env-file=.env ./dist/server/entry.mjs',
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT), HOST: 'localhost' },
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
```

- [ ] **Step 5: Write `tests/visual/routes.ts`**

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { feeds } from '../../src/config/news';

export interface VisualRoute {
  name: string;
  path: string;
  mask?: string[];
}

const blogDir = fileURLToPath(new URL('../../src/content/blog/', import.meta.url));

const blogPosts: VisualRoute[] = readdirSync(blogDir)
  .filter((f) => f.endsWith('.md'))
  .filter((f) => !/^draft:\s*true\s*$/m.test(readFileSync(blogDir + f, 'utf8')))
  .map((f) => f.replace(/\.md$/, ''))
  .map((slug) => ({ name: `blog-${slug}`, path: `/blog/${slug}` }));

const projects = [
  'checkbox-styling',
  'currency-converter',
  'js-clock',
  'pagination',
  'pizza-pie',
  'random-password-generator',
  'rollup-counter',
  'weather-app',
];

const masks: Record<string, string[]> = {
  'project-pagination': ['.map'],
};

export const routes: VisualRoute[] = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  ...blogPosts,
  { name: 'projects', path: '/projects' },
  ...projects.map((p) => ({ name: `project-${p}`, path: `/projects/${p}` })),
  { name: 'news', path: '/news' },
  ...feeds.map((f) => ({ name: `news-${f.slug}`, path: `/news/${f.slug}` })),
  { name: 'contact', path: '/contact' },
].map((r) => ({ ...r, mask: masks[r.name] }));
```

- [ ] **Step 6: Write `tests/visual/stabilize.ts`**

```ts
import type { Page } from '@playwright/test';

export type Theme = 'light' | 'dark';

// Replay everything except the site's own pages/assets: external hosts
// (fonts, APIs, maps) and the site's /api/ proxy routes.
const RECORDABLE = /^(?!http:\/\/localhost:\d+\/(?!api\/))/;

const RECORD = process.env.VISUAL_RECORD_HAR === '1';

export async function stabilize(page: Page, opts: { theme: Theme; harPath: string }) {
  await page.clock.setFixedTime(new Date('2026-09-18T12:00:00-04:00'));
  await page.addInitScript((theme) => {
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* storage blocked — page falls back to light */
    }
    // Deterministic Math.random (mulberry32) so random widgets render identically.
    let s = 0x2f6b;
    Math.random = () => {
      s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, opts.theme);
  await page.routeFromHAR(opts.harPath, {
    url: RECORDABLE,
    update: RECORD,
    updateContent: 'embed',
    notFound: 'abort',
  });
}

export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}
```

- [ ] **Step 7: Write `tests/visual/visual.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import { routes } from './routes';
import { stabilize, settle, type Theme } from './stabilize';

const themes: Theme[] = ['light', 'dark'];

for (const theme of themes) {
  for (const route of routes) {
    test(`${route.name} [${theme}]`, async ({ page }, testInfo) => {
      const harPath = `tests/visual/.har/${testInfo.project.name}/${route.name}-${theme}.har`;
      await stabilize(page, { theme, harPath });
      await page.goto(route.path);
      await settle(page);
      await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
        fullPage: true,
        mask: (route.mask ?? []).map((sel) => page.locator(sel)),
      });
    });
  }
}
```

- [ ] **Step 8: Write `tests/visual/css-size.spec.ts`**

```ts
import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { routes } from './routes';

test('CSS bytes per route', async ({ page }, testInfo) => {
  const out = process.env.CSS_SIZE_OUT;
  test.skip(!out, 'set CSS_SIZE_OUT=<path> to measure');
  test.skip(testInfo.project.name !== 'desktop', 'measured once, on desktop');

  const results: { route: string; stylesheetBytes: number; inlineStyleBytes: number }[] = [];
  for (const route of routes) {
    const bodies: Promise<number>[] = [];
    const onResponse = (resp: import('@playwright/test').Response) => {
      if (resp.request().resourceType() === 'stylesheet' && resp.url().startsWith('http://localhost')) {
        bodies.push(resp.body().then((b) => b.length));
      }
    };
    page.on('response', onResponse);
    await page.goto(route.path);
    await page.waitForLoadState('networkidle');
    page.off('response', onResponse);
    const stylesheetBytes = (await Promise.all(bodies)).reduce((a, b) => a + b, 0);
    const inlineStyleBytes = await page.evaluate(() =>
      [...document.querySelectorAll('style')].reduce((n, s) => n + (s.textContent?.length ?? 0), 0),
    );
    results.push({ route: route.path, stylesheetBytes, inlineStyleBytes });
  }
  mkdirSync(dirname(out!), { recursive: true });
  writeFileSync(out!, JSON.stringify(results, null, 2));
});
```

The spec lives under `tests/visual` but skips itself unless `CSS_SIZE_OUT` is set, so the gate is unaffected.

- [ ] **Step 9: Record HARs and capture baselines**

```bash
VISUAL_RECORD_HAR=1 npx playwright test tests/visual --update-snapshots
```

Expected: 84 tests pass (21 routes × 2 themes × 2 projects), `tests/visual/.har/` and `tests/visual/__screenshots__/` populated. Also run `npx astro check` once now and note the error count (expected 0) — Task 2 records it as the gate's baseline. Confirm the route count: `ls tests/visual/__screenshots__/desktop | wc -l` → `42`.

- [ ] **Step 10: Determinism gate — three clean replays**

```bash
for i in 1 2 3; do npx playwright test tests/visual || break; done
```

Expected: three consecutive full passes. If any test fails: open `npx playwright show-report`, identify the varying region, and either fix it in `stabilize.ts` (preferred: e.g. an animation that needs waiting for) or add its selector to `masks` in `routes.ts`. Then re-run Step 9 for that test only (`-g "<title>"`) and repeat this step. Record every mask added and why — Task 2 copies them into the audit.

- [ ] **Step 11: Record "before" CSS sizes**

```bash
CSS_SIZE_OUT=tests/visual/.size/before.json npx playwright test tests/visual/css-size.spec.ts --project=desktop
```

Expected: 1 passed; `tests/visual/.size/before.json` has 21 entries. Then `cp tests/visual/.size/before.json docs/css-refactor-size-before.json` — this copy is committed, because the "before" numbers cannot be regenerated once the CSS changes.

- [ ] **Step 12: Commit**

```bash
git add playwright.config.ts tests/ package.json package-lock.json .gitignore docs/css-refactor-size-before.json
git status --short   # confirm no .har or .png files are staged
git commit -m "Add Playwright visual regression harness for the CSS refactor

84 full-page screenshots (every route × light/dark × 390/1280) against
the production build, with HAR replay, fixed clock and seeded
Math.random for determinism. Baselines and HARs are gitignored.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: CSS audit and exceptions log

Read-only analysis of the current styles. Produces the document that Tasks 3–19 consume. No source changes.

**Files:**
- Create: `docs/css-refactor-audit.md`, `docs/css-refactor-exceptions.md`

**Interfaces:**
- Consumes: masks and determinism notes from Task 1.
- Produces: audit sections A–H with the exact headings below. Later tasks cite them as "Audit §A" etc.

- [ ] **Step 1: Create the audit skeleton**

```markdown
# CSS Refactor Audit

Generated in Task 2 from `main` @ <sha>. Tasks 3–19 consume this.

## A. Partials
| Partial | Lines | Status (alive/dead) | Evidence | Destination |

## B. Shared selectors (used by more than one component)
| Selector | Defined in | Used by (files) | Destination |

## C. Dark-mode rules
| Partial | Selector | Property | Light value (source) | Dark value | Resolution (token name / escape) |

## D. Token inventory
| Token | Light | Dark | Replaces |

## E. Web fonts
| `@import url(...)` | Partial | Requested by current build? | Action |

## F. Screenshot masks
| Route | Selector | Reason |

## G. Widget roots
| Widget | Root component | Current root element | Missing wrapper? | Planned root |

## H. ID selectors
| Selector | Partial | Element (file:line) | Used by JS? | Replacement class |
```

- [ ] **Step 2: Fill §A — partials, dead or alive**

For every file in `src/styles/partials/` and `src/styles/News.module.scss`, list each top-level class/ID selector and search for it outside `src/styles`:

```bash
for f in src/styles/partials/*.scss; do
  echo "== $f"
  grep -oE '[.#][a-zA-Z][a-zA-Z0-9_-]*' "$f" | sort -u | while read sel; do
    n=$(grep -rlF -- "${sel:1}" src/components src/pages src/layouts | wc -l | tr -d ' ')
    echo "$sel $n"
  done
done
```

A partial is **dead** only if none of its selectors appear in markup (count 0) — expected for `_signin.scss` and `_nprogress.scss`. Record the evidence (command output summary) in the Evidence column. Destination is one of: `reset.css`, `base.css`, `layout.css`, `code.css`, `tokens.css`, a named `.astro` component, a named `<Widget>.module.css`, or `delete`.

- [ ] **Step 3: Fill §B — shared selectors**

Selectors defined in more than one partial or used by more than one component (known: `.stage`, `.section-*`, `.form-container`, `.btn-submit`, `.cards`, `.email-address`, `.website-url`, `.updates-container*`, `.icon-*`):

```bash
grep -hoE '^\s*[.#][a-zA-Z][a-zA-Z0-9_-]*' src/styles/partials/*.scss | sed 's/^[[:space:]]*//' | sort | uniq -c | sort -rn | awk '$1>1'
```

For each, record every consuming file (`grep -rn -- "<name>" src/components src/pages src/layouts`) and pick a destination: a global layer if genuinely shared, otherwise the one owning component.

- [ ] **Step 4: Fill §C and §D — dark-mode inventory and tokens**

```bash
grep -n -A6 '\.dark' src/styles/partials/*.scss src/components/Navbar.astro
```

For every dark rule, find the matching light declaration for the same element and property. Resolution rules:
- Light and dark values both exist → a token (`--color-<role>`) in §D; identical value pairs share one token.
- Dark sets a property that light leaves inherited/initial → **escape** (stays as a `[data-theme="dark"]` rule in the owning component). Exception: for `color`, the light value may be `currentColor`, which behaves as inherit — use a token then.
- Theme-varying colours used only by one widget still become tokens (Global Constraints).

§D must include the existing `_colors.scss` custom properties (`--white`, `--light-gray`/`--light-grey`, …) mapped to their new names.

- [ ] **Step 5: Fill §E — web fonts actually loaded today**

Eight partials contain `@import url('https://fonts.googleapis.com/...')`. A CSS `@import` after any rule is ignored by browsers, so some may not load today. Check what the production build actually requests:

```bash
npm run build
grep -o '@import[^;]*;' dist/client/_astro/*.css
node -e "
const { chromium } = require('@playwright/test');
(async () => {
  const { spawn } = require('node:child_process');
  const srv = spawn('node', ['--env-file=.env', './dist/server/entry.mjs'], { env: { ...process.env, PORT: '4398' } });
  await new Promise(r => setTimeout(r, 3000));
  const b = await chromium.launch(); const p = await b.newPage();
  const urls = new Set();
  p.on('request', q => { if (q.url().includes('fonts.googleapis.com')) urls.add(q.url()); });
  await p.goto('http://localhost:4398/'); await p.waitForLoadState('networkidle');
  console.log([...urls].join('\n')); await b.close(); srv.kill();
})();
"
```

Record each `@import` URL with yes/no. Action: `<link>` in BaseLayout (if requested today) or `drop` (if not — it has no effect today).

- [ ] **Step 6: Fill §F, §G, §H**

- §F: copy the masks from `tests/visual/routes.ts` with the reasons from Task 1 Step 10.
- §G: for each of the 8 widgets, open `*Widget.tsx` and its child components; record the outermost element(s) returned. Identify the widget(s) missing a wrapper compared with the others. Planned root: `<div className={styles.root}>` wrapping the fragment's children.
- §H: `grep -nE '^\s*#[a-zA-Z]' src/styles/partials/*.scss`; for each, find the element (`grep -rn 'id="<name>"\|id=\"<name>\"\|id={' src/components`) and whether JS reads it (`getElementById('<name>')`).

- [ ] **Step 7: Create the exceptions log**

```markdown
# CSS Refactor — Exceptions Log

Every intentional or unavoidable visual change from the pixel-identical baseline.

**How to review:** run the branch build (`npm run build && node --env-file=.env ./dist/server/entry.mjs`, then open http://localhost:4321) and compare each entry against the same path on the live site, which still runs `main`. Set the theme with the navbar toggle and the width with devtools' responsive mode.

Nothing merges while any entry is `pending`.
```

- [ ] **Step 8: Commit**

```bash
git add docs/css-refactor-audit.md docs/css-refactor-exceptions.md
git commit -m "Add CSS refactor audit and exceptions log

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Sass to plain CSS, structure unchanged

**Audit rulings (binding, from Task 2):** Audit §E / P3: all 6 unique font URLs load today — every one becomes a `<link>` in §E order; none is dropped. Also delete the stray `/*# sourceMappingURL=Navbar.module.css.map */` line in navbar.css.

**Files:**
- Rename: every `src/styles/partials/_<name>.scss` → `src/styles/partials/<name>.css`; `src/styles/globals.scss` → `src/styles/global.css`; `src/styles/News.module.scss` → `src/styles/News.module.css`
- Modify: `src/layouts/BaseLayout.astro`, `src/components/NewsFeed.tsx:3`

**Interfaces:**
- Consumes: Audit §E.
- Produces: `src/styles/global.css` as the single global entry imported by BaseLayout; partials as `.css` files with the same names minus underscore.

- [ ] **Step 1: Rename files, keeping history**

```bash
cd src/styles/partials
for f in _*.scss; do n="${f#_}"; git mv "$f" "${n%.scss}.css"; done
cd ../../..
git mv src/styles/globals.scss src/styles/global.css
git mv src/styles/News.module.scss src/styles/News.module.css
```

- [ ] **Step 2: Convert `//` line comments (invalid in CSS — each would silently break the next rule)**

```bash
sed -E -i '' 's#^([[:space:]]*)//[[:space:]]?(.*)$#\1/* \2 */#' src/styles/partials/*.css src/styles/*.css
grep -n '//' src/styles/partials/*.css src/styles/*.css | grep -v 'https\?://'
```

Expected: the grep prints nothing. (Audit found 28 full-line `//` comments in contactForm, navbar, latest-updates, homepage.)

- [ ] **Step 3: Rewrite `global.css` imports**

Replace every `@import 'partials/_<name>.scss';` line with `@import './partials/<name>.css';`, keeping the order exactly:

```bash
sed -E -i '' "s#@import 'partials/_([a-zA-Z-]+)\.scss';#@import './partials/\1.css';#" src/styles/global.css
cat src/styles/global.css
```

Expected: 25 `@import './partials/….css';` lines in the original order.

- [ ] **Step 4: Move web fonts to `<link>` tags**

Delete the `@import url('https://fonts.googleapis.com/…');` line from each partial (typography, checkbox-styling, code, js-clock, rollup-counter, password-generator, pizza-pie, currency-converter). For each URL that Audit §E marks "requested today", add a `<link>` in `src/layouts/BaseLayout.astro` `<head>` after the `<title>`, in the order they appeared in the old compiled CSS:

```astro
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap" />
```

(Only the URLs §E marks as requested, one `<link rel="stylesheet">` each; identical duplicates such as Roboto Mono get one tag.) URLs §E marks as not requested are dropped — they have no effect today; note that in §E.

- [ ] **Step 5: Update imports**

`src/layouts/BaseLayout.astro` line 2: `import '../styles/globals.scss';` → `import '../styles/global.css';`
`src/components/NewsFeed.tsx` line 3: `import styles from '../styles/News.module.scss';` → `import styles from '../styles/News.module.css';`

- [ ] **Step 6: Check nothing still refers to Sass**

```bash
grep -rn 'scss' src astro.config.mjs
grep -nE '@mixin|@include|@extend|@use|\$[a-zA-Z-]+\s*:' src/styles -r
```

Expected: both print nothing. Nested rules (`&:hover`, `&.class`, `&::-webkit-scrollbar`, nested descendant selectors in `currency-converter.css`) are valid native CSS nesting and stay as they are.

- [ ] **Step 7: Run the Verification Gate**

Expected: zero diff. If fonts differ, re-check Step 4 ordering against §E.

- [ ] **Step 8: Commit**

```bash
git add -A src/styles src/layouts/BaseLayout.astro src/components/NewsFeed.tsx
git commit -m "Convert Sass partials to plain CSS in place

Renames every partial to .css, turns // comments into /* */, replaces
Sass @imports with CSS @imports in the same order, and moves Google Fonts
from mid-file @import url() into <link> tags. No structural change.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Theme on `<html data-theme>` with no flash

**Files:**
- Create: `tests/theme.spec.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/components/Navbar.astro:100-135` (script) and its `<style>` block, every CSS file containing `.dark`

**Interfaces:**
- Produces: `document.documentElement.dataset.theme` ∈ `"light" | "dark" | undefined`; CSS hook `[data-theme="dark"]`. Task 5 builds tokens on it.

- [ ] **Step 1: Write the failing behaviour tests**

`tests/theme.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('theme', () => {
  test('stored dark theme is applied before <body> exists (no flash)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      const order: string[] = [];
      (window as unknown as { __order: string[] }).__order = order;
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.type === 'attributes') order.push('theme');
          else r.addedNodes.forEach((n) => n.nodeName === 'BODY' && order.push('body'));
        }
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-theme'] });
    });
    await page.goto('/');
    const order = await page.evaluate(() => (window as unknown as { __order: string[] }).__order);
    expect(order).toContain('theme');
    expect(order.indexOf('theme')).toBeLessThan(order.indexOf('body'));
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('first visit: light, no attribute, nothing written to storage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
  });

  test('toggle flips theme and persists it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  });

  test('blocked storage falls back to light without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(errors).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx playwright test tests/theme.spec.ts`
Expected: tests 1, 3 fail (no `data-theme` on `<html>`), test 2 fails (`theme` is written as `'light'`), test 4 fails (page error from `localStorage`).

- [ ] **Step 3: Add the inline head script**

In `src/layouts/BaseLayout.astro`, as the **first** child of `<head>`:

```astro
    <script is:inline>
      try {
        const t = localStorage.getItem('theme');
        if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
      } catch {
        /* storage blocked — light */
      }
    </script>
```

- [ ] **Step 4: Update the Navbar toggle**

In `src/components/Navbar.astro`, replace `THEME_KEY`/`body`/`applyTheme`/`initTheme`/`toggleTheme` and the `initTheme();` call with:

```ts
  const THEME_KEY = 'theme';
  const root = document.documentElement;

  function toggleTheme() {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* storage blocked — theme lasts for this page only */
    }
  }
```

Leave `toggleUpdatesModal` and the two `addEventListener` lines unchanged (minus `initTheme();`).

- [ ] **Step 5: Rewrite every dark selector**

```bash
grep -rn 'dark' src/styles src/components/Navbar.astro | grep -v 'dark-\|--dark\|atom-dark'
```

Rewrite each occurrence, preserving specificity:
- `.dark X` → `[data-theme="dark"] X`
- `body.dark X` / `body.dark` → `[data-theme="dark"] body X` / `[data-theme="dark"] body`
- `.dark {` (rule on body itself) → `[data-theme="dark"] body {`
- Navbar `:global(body.dark) X` → `:global([data-theme="dark"]) X`

Then confirm none remain: `grep -rnE '(^|[^-a-z])\.dark\b|body\.dark' src` → nothing. Also `grep -rn "classList.*'dark'" src` → nothing.

- [ ] **Step 6: Run theme tests and the Verification Gate**

Run: `npx playwright test tests/theme.spec.ts` → 4 passed. Then the Gate → zero diff (the visual suite presets `theme` in storage, so it exercises the new head script).

- [ ] **Step 7: Commit**

```bash
git add tests/theme.spec.ts src/layouts/BaseLayout.astro src/components/Navbar.astro src/styles
git commit -m "Move theme to <html data-theme> set before first paint

An inline head script applies the stored theme before <body> exists,
fixing the flash of light theme for dark-mode visitors. First visits no
longer write 'light' to storage. Dark selectors use [data-theme=dark],
which keeps the old .dark specificity.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Semantic tokens replace dark-mode rules

**Audit rulings (binding, from Task 2):** Spec over audit on escapes: a §C row marked **escape** becomes a token whenever its light value can be written exactly — `background`/`background-color` light = `transparent`, `color`/`border-color` light = `currentColor`. Only rows whose light value truly cannot be expressed stay as `[data-theme="dark"]` escapes; list them in §C. P5: `var(--black)` (undefined) maps to `--color-text`. P4-H1: NewsFeed `.title` gets `color: var(--color-news-title)`. Verify dark-only results the screenshots cover via the gate; nothing else needed here.

**Files:**
- Create: `src/styles/tokens.css`
- Delete: `src/styles/partials/colors.css`
- Modify: `src/styles/global.css`, every partial with `[data-theme="dark"]` rules, `src/components/Navbar.astro` `<style>`

**Interfaces:**
- Consumes: Audit §C, §D.
- Produces: `--color-*` tokens (names exactly as in Audit §D). Later tasks use only these names.

- [ ] **Step 1: Create `tokens.css` from Audit §D**

```css
/* Semantic design tokens. The only place dark mode is defined. */
:root {
  --color-text: #000000;
  --color-link: rebeccapurple;
  --color-link-hover: #ff0000;
  /* …every §D token, light value… */
}

:root[data-theme="dark"] {
  --color-text: #f4f4f4;
  --color-link: #ffa804;
  --color-link-hover: #ff7272;
  /* …every §D token that differs in dark… */
}
```

The values shown are illustrative, following `_colors.scss` naming (`--dark-text`/`--light-text`, `--light-link`/`--dark-link`); confirm each pairing against §C before use. The complete list is Audit §D. Every value must be copied exactly from the current source — no normalising (`#fff` vs `#ffffff` is fine to keep as written; do not change `rebeccapurple` to hex).

- [ ] **Step 2: Swap imports**

In `global.css`: replace `@import './partials/colors.css';` with `@import './tokens.css';` moved to be the **first** `@import`. Then `git rm src/styles/partials/colors.css`, and replace every use of an old custom property with its §D token:

```bash
grep -rnoE 'var\(--[a-z-]+' src/styles src/components | sort | uniq -c
```

After replacement, no `var(--light-*)`, `var(--dark-*)`, `var(--white)`, etc. remain.

- [ ] **Step 3: Collapse dark rules, one partial at a time**

For each §C row resolved as a token: set the light rule's property to `var(--color-<role>)` and delete the property from the `[data-theme="dark"]` rule (delete the rule when empty). Rows resolved as **escape** stay as `[data-theme="dark"]` rules. After each partial, run `npx playwright test tests/visual` — this localises any diff to that partial.

- [ ] **Step 4: Confirm what's left**

```bash
grep -rn 'data-theme' src/styles src/components
```

Expected: only `tokens.css` plus the §C escapes. Update §C with the final escape list if it changed.

- [ ] **Step 5: Run the Verification Gate** — zero diff; `npx playwright test tests/theme.spec.ts` still 4 passed.

- [ ] **Step 6: Commit**

```bash
git add -A src/styles src/components/Navbar.astro docs/css-refactor-audit.md
git commit -m "Replace per-rule dark mode with semantic colour tokens

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Layered global stylesheet

**Audit rulings (binding, from Task 2):** Audit P8: do **not** append `atom-dark.css` to `code.css` — it is inert; leave it as an unlayered partial import for Task 19 to delete. P4-H3: `btnLink` and `backBtn` both go to `layout.css` in original order (btnLink first). P4-H1: add `.title:hover { color: var(--color-link-hover) }` beside NewsFeed's `.title` rule (still in `src/styles/News.module.css`). Hover is invisible to the gate: after the layer split, write a scratch Playwright script (in the task workspace, not committed) that hovers every `a` on `/`, `/news/cbc-world-news`, `/projects/weather-app`, and one CodeBlocks back link, in light and dark, and compares computed `color`/`background-color`/`border-color` against the same script run on commit `0101eb7` (checked out into a temporary `git worktree`, removed afterwards). Report both outputs; any difference is fixed or logged as an exception.

**Files:**
- Create: `src/styles/reset.css`, `src/styles/base.css`, `src/styles/layout.css`, `src/styles/code.css`
- Delete: `partials/reset.css`, `partials/typography.css`, `partials/layout.css`, `partials/code.css`, `partials/atom-dark.css` (plus any partial §A assigns to a global layer)
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: layers `reset, base, layout, code`. Component styles added later are unlayered and therefore win over all of them.

- [ ] **Step 1: Move content into layer files**

```bash
git mv src/styles/partials/reset.css src/styles/reset.css
git mv src/styles/partials/typography.css src/styles/base.css
git mv src/styles/partials/layout.css src/styles/layout.css
git mv src/styles/partials/code.css src/styles/code.css
cat src/styles/partials/atom-dark.css >> src/styles/code.css && git rm -q src/styles/partials/atom-dark.css
```

Append any other §A "global layer" destinations to the right file the same way.

- [ ] **Step 2: Rewrite the head of `global.css`**

```css
@layer reset, base, layout, code;

@import './tokens.css';
@import './reset.css' layer(reset);
@import './base.css' layer(base);
@import './layout.css' layer(layout);
@import './code.css' layer(code);

/* Not yet migrated to components — unlayered until their task moves them. */
@import './partials/nprogress.css';
/* …remaining partial imports, original order… */
```

The `@layer` statement must come before the `@import`s; that is valid CSS.

- [ ] **Step 3: Check the build kept the layers**

```bash
npm run build && grep -oE '@layer [a-z, ]+' dist/client/_astro/*.css | head
```

Expected: `@layer reset, base, layout, code` present and `@layer reset{`-style blocks in the output. If Vite inlined the imports without layers, wrap each file's contents in `@layer <name> { … }` instead and import them plainly.

- [ ] **Step 4: Run the Verification Gate**

This is the task most likely to diff: an unlayered partial now beats a layered global rule it previously lost to on specificity. For each diff, find the two competing rules, then fix by making the intended winner explicit in the unlayered rule (usually correct: component wins), or log an exception if the old rendering was a specificity accident Peter should judge. Note: `reset.css` has `!important` declarations inside `prefers-reduced-motion`; layered `!important` beats unlayered, which is the intended behaviour for reduced motion.

- [ ] **Step 5: Commit**

```bash
git add -A src/styles
git commit -m "Split global CSS into reset/base/layout/code cascade layers

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## Component migration procedures (used by Tasks 7–18)

Each task below names its component files and partials; these procedures define how the move is done. Each task ends with the Verification Gate and one commit.

**Procedure A — `.astro` component**
1. Read the task's Audit §A/§B rows. Collect every rule from the named partial(s) whose selectors target this component's markup.
2. Move them into the component's `<style>` block (create one at the end of the file if absent). Keep rule order.
3. Rules targeting `<Content />`, `set:html`, or child-component markup: prefix with a local class and wrap the rest in `:global()`, e.g. `.post-body :global(h2)`. Add the local class to the wrapping element if it has none.
4. §C escapes for this component: `:global([data-theme="dark"]) .thing`.
5. Remove the partial's `@import` from `global.css` and `git rm` the partial once empty. If some rules belong elsewhere (§B), leave them and note which task takes them.
6. Gate. Commit.

**Procedure B — React widget (CSS Module)**
1. Create `<Widget>.module.css` in the widget folder. Move the partial's rules in, keeping order; rename class selectors to camelCase (`.currency-item` → `.currencyItem`).
2. In every component of the folder that uses them: `import styles from './<Widget>.module.css';` and replace `className="x"` with `className={styles.x}`. Combined/conditional: ``className={`${styles.currencyItem} ${isBase ? styles.currencyBase : ''}`}``.
3. HTML built as strings (`innerHTML = \`…class="x"…\``): interpolate `${styles.x}` inside the template literal.
4. ID selectors (§H): add a class to the element and style the class; keep the `id` attribute if JS reads it.
5. Global classes stay strings: CodeBlocks' `code`, `is-open`, `is-closed`, and `inline` code are styled by `code.css`.
6. Root element (§G): wrap the widget's top-level fragment children in `<div className={styles.root}>`. An unstyled block wrapper is normally pixel-neutral; if it is not, log an exception.
7. §C escapes: `:global([data-theme="dark"]) .thing`.
8. Remove the partial import, `git rm` the partial. Gate. Commit.

---

### Task 7: Navbar and Latest Updates modal

**Files:** `src/components/Navbar.astro`; partials `navbar.css`, `latest-updates.css`

- [ ] **Step 1:** Procedure A with both partials. The modal renders `<Content />` inside `updates.map(...)` (Navbar.astro ~line 87–91): its Markdown rules need `.updates-container-inner :global(...)`.
- [ ] **Step 2:** Merge the moved rules with the existing `<style>` block (Navbar.astro ~line 144), which already holds the logo/icon theme rules.
- [ ] **Step 3:** Verification Gate; also `npx playwright test tests/theme.spec.ts` (the toggle lives here). Open the updates modal manually once in the branch build to eyeball it — the visual suite only captures it closed.
- [ ] **Step 4: Commit** — `git commit -m "Scope Navbar and Latest Updates styles to the component" ` (with Co-Authored-By line).

### Task 8: Footer, Banner, ProjectCard

**Files:** `src/components/Footer.astro` (`footer.css`), `src/components/Banner.astro` (`banner.css`), `src/components/ProjectCard.astro` (`items.css` per §A)

- [ ] **Step 1:** Procedure A for Footer. Gate. Commit `Scope Footer styles to the component`.
- [ ] **Step 2:** Procedure A for Banner. Gate. Commit `Scope Banner styles to the component`.
- [ ] **Step 3:** Procedure A for ProjectCard (`.card-title`, cards; check §B — `.cards` may belong to `pages/projects/index.astro`). Gate. Commit `Scope ProjectCard styles to the component`.

### Task 9: Pages

**Audit rulings (binding, from Task 2):** Audit P2: `article > p:nth-of-type(2)` from news.css belongs to `blog/[...slug].astro` as `article > :global(p:nth-of-type(2))`, not NewsFeed.

**Files:** `src/pages/index.astro` (`homepage.css`), `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro` (`blog.css`), `src/pages/news/index.astro` (`news.css` per §A), `src/pages/projects/index.astro` (per §A)

- [ ] **Step 1:** Procedure A for the home page (`.section-two` … `.section-five`, `.left`, `.right`). Gate. Commit `Scope home page styles to the page`.
- [ ] **Step 2:** Procedure A for the blog pages. The post body is `<Content />` (`[...slug].astro:28`) — wrap it in `<div class="post-body">` only if a wrapper doesn't already exist, and target Markdown elements as `.post-body :global(...)`. Gate. Commit `Scope blog styles to the blog pages`.
- [ ] **Step 3:** Procedure A for the news index. Gate. Commit `Scope news index styles to the page`.
- [ ] **Step 4:** Procedure A for the projects index. Gate. Commit `Scope projects index styles to the page`.

### Task 10: Checkbox Styling widget

**Audit rulings (binding, from Task 2):** Audit P6: add `:where(.root) input[type='checkbox'] { margin-right: 0; height: auto; min-width: auto; }` to `CheckboxStyling.module.css` so the password generator's global checkbox rule stops mattering once Task 15 scopes it.

**Files:** `src/components/projects/checkbox-styling/{CheckboxStylingWidget,Checkboxes}.tsx`; partial `checkbox-styling.css`; create `CheckboxStyling.module.css`

- [ ] **Step 1:** Procedure B. IDs `#checkboxes`, `#container`, `#switches` → classes per §H.
- [ ] **Step 2:** Gate. Commit `Move Checkbox Styling widget styles into a CSS Module`.

### Task 11: Currency Converter widget

**Audit rulings (binding, from Task 2):** Audit P9: this widget renders `<CodeBlocks>` outside `.code-content`. Do the module move first (commit 1, gate zero-diff). Then, as a **separate commit**, move `<CodeBlocks>` inside `.code-content` (the missing-wrapper fix) and add an exceptions-log entry (pending) describing the open-code-panel change (`.code-content p` `#000000` vs `p` `#585858` in light mode) — the gate won't show it because the panel is closed in screenshots.

**Files:** `src/components/projects/currency-converter/{CurrencyConverterWidget,CurrencyConverter}.tsx`; partial `currency-converter.css`; create `CurrencyConverter.module.css`

- [ ] **Step 1:** Procedure B. This partial carries most of the nesting (`&:hover`, `&.currency-base`, `&.disabled`, `&.open`, `&::-webkit-scrollbar`) — keep it nested; `&.currency-base` becomes `&.currencyBase`. Conditional classes at `CurrencyConverter.tsx:218` and `:244` follow the Procedure B step 2 pattern.
- [ ] **Step 2:** Gate. Commit `Move Currency Converter widget styles into a CSS Module`.

### Task 12: JS Clock widget

**Audit rulings (binding, from Task 2):** Audit P10: `.stage.clock` becomes `:global(.stage).clock` in the module to keep (0,2,0). `.clock` appears on two elements (§B).

**Files:** `src/components/projects/js-clock/{ClockWidget,Clock}.tsx`; partial `js-clock.css`; create `Clock.module.css`

- [ ] **Step 1:** Procedure B. `.stage` is shared (§B) — follow §B's destination.
- [ ] **Step 2:** Gate. Commit `Move JS Clock widget styles into a CSS Module`.

### Task 13: Pagination widget

**Audit rulings (binding, from Task 2):** Audit P9: this widget renders `<CodeBlocks>` outside `.code-content`. Do the module move first (commit 1, gate zero-diff). Then, as a **separate commit**, move `<CodeBlocks>` inside `.code-content` and add an exceptions-log entry (pending) for the open-code-panel colour change.

**Files:** `src/components/projects/pagination/{PaginationWidget,Data,PageInfo,Pages,Users,Maps,icons}.tsx`; partial `pagination.css`; create `Pagination.module.css`

- [ ] **Step 1:** Procedure B across all components in the folder (one module, imported by each that needs it). `.map` is the screenshot mask selector — when it becomes `styles.map`, update `masks['project-pagination']` in `tests/visual/routes.ts` to a stable hook: add `data-testid="map"` to that element and mask `[data-testid="map"]`.
- [ ] **Step 2:** Gate. Commit `Move Pagination widget styles into a CSS Module`.

### Task 14: Pizza Pie widget

**Audit rulings (binding, from Task 2):** Audit P10: `.stage.pizza-pie` becomes `:global(.stage).pizzaPie` in the module to keep (0,2,0).

**Files:** `src/components/projects/pizza-pie/{PizzaPieWidget,PizzaSlices}.tsx`; partial `pizza-pie.css`; create `PizzaPie.module.css`

- [ ] **Step 1:** Procedure B. IDs such as `#ddl`, `#eaten` per §H.
- [ ] **Step 2:** Gate. Commit `Move Pizza Pie widget styles into a CSS Module`.

### Task 15: Random Password Generator widget

**Audit rulings (binding, from Task 2):** Audit P9: this widget renders `<CodeBlocks>` outside `.code-content`. Do the module move first (commit 1, gate zero-diff). Then, as a **separate commit**, move `<CodeBlocks>` inside `.code-content` and add an exceptions-log entry (pending). Audit P6: its `input[type='checkbox']` rule is scoped into this module; Task 10 already neutralised the checkbox widget's dependence on it.

**Files:** `src/components/projects/random-password-generator/{PasswordGeneratorWidget,PasswordGenerator}.tsx`; partial `password-generator.css`; create `PasswordGenerator.module.css`

- [ ] **Step 1:** Procedure B. IDs `#upper`, `#lower`, `#numbers`, `#symbols`, `#increment`, `#reset`, `#forms-wrapper`, `#form2` per §H; `.stage` per §B.
- [ ] **Step 2:** Gate. Commit `Move Password Generator widget styles into a CSS Module`.

### Task 16: Rollup Counter widget

**Files:** `src/components/projects/rollup-counter/{RollupCounterWidget,Counter}.tsx`; partial `rollup-counter.css`; create `RollupCounter.module.css`

- [ ] **Step 1:** Procedure B. `Counter.tsx:65` builds classes via `classNameFor(s)` — map its returned strings to `styles[...]`.
- [ ] **Step 2:** Gate. Commit `Move Rollup Counter widget styles into a CSS Module`.

### Task 17: Weather App widget

**Audit rulings (binding, from Task 2):** Audit P7: `getElementsByClassName('weatherOutput')` (`WeatherApp.tsx:72,149,172`) must keep working — keep the literal `weatherOutput` class on that element alongside `styles.weatherOutput`. Audit P1: add the dark placeholder escape from signin.css (`.dark ::placeholder` → `:global([data-theme="dark"]) .weatherSearchInput::placeholder`, value from §C/§D) and remove that rule from signin.css. P4-H2: verify the credit link hover (`--color-weather-credit-hover`) with a computed-style check after a live search, light and dark. Audit P9: module move first (commit 1), then the `<CodeBlocks>`-inside-`.code-content` fix as a **separate commit** with a pending exceptions-log entry.

**Files:** `src/components/projects/weather-app/{WeatherAppWidget,WeatherApp}.tsx`; partial `weatherApp.css`; create `WeatherApp.module.css`

- [ ] **Step 1:** Procedure B. Most output is built as strings via `innerHTML` (`WeatherApp.tsx:151`, `:174`, `:223`, `:230`, `:246`) — every `class="…"` inside those template literals becomes `class="${styles.x}"`. `#forecastOutput` per §H.
- [ ] **Step 2:** Gate. The weather search result is not in the screenshots (initial state only): run the branch build, search a city, and compare with the live site. Note the check in the commit message.
- [ ] **Step 3:** Commit `Move Weather App widget styles into a CSS Module`.

### Task 18: ContactForm and NewsFeed

**Audit rulings (binding, from Task 2):** Audit P1: carry `padding: 0 10px; margin-bottom: 10px` from signin.css `input[name='email']` onto the email input's module rule (`.formContainer input.contactEmail`), and delete that rule from signin.css. P4-H1: confirm NewsFeed `.title` hover colour light and dark with a computed-style check.

**Files:** `src/components/ContactForm.tsx` (`contactForm.css` → create `src/components/ContactForm.module.css`); `src/components/NewsFeed.tsx` (`src/styles/News.module.css` → `git mv` to `src/components/NewsFeed.module.css`, plus `news.css` rules §A assigns to it)

- [ ] **Step 1:** Procedure B for ContactForm (`.form-container`, `.btn-submit` — check §B for other users). Gate. Commit `Move ContactForm styles into a CSS Module`.
- [ ] **Step 2:** `git mv src/styles/News.module.css src/components/NewsFeed.module.css`, update the import to `./NewsFeed.module.css`, merge in §A's news rules. Gate. Commit `Colocate NewsFeed CSS Module with its component`.

### Task 19: Remove dead code

**Audit rulings (binding, from Task 2):** Audit P1/P8 replace Step 1's substring criterion: `signin.css` is dead only after Tasks 17–18 moved its two live rules — confirm by grepping signin.css for `input[name='email']` and `::placeholder` (both gone) and citing audit §A runtime evidence for the rest. `nprogress.css` is dead per §A. `atom-dark.css` is inert per §A/P8 — delete it too. The gate proves all three deletions pixel-neutral.

**Files:** `src/styles/partials/signin.css`, `src/styles/partials/nprogress.css`, `src/components/projects/password-generator/` (empty), plus any §A `delete` rows

- [ ] **Step 1:** Re-confirm each is unused: rerun the Task 2 Step 2 loop on the file; every count must be 0. `ls -A src/components/projects/password-generator` → empty.
- [ ] **Step 2:** `git rm` the partials, remove their imports from `global.css`, `rmdir src/components/projects/password-generator`.
- [ ] **Step 3:** `ls src/styles/partials` → empty or absent; if files remain, they belong to a task that missed them — stop and report.
- [ ] **Step 4:** Gate. Commit `Remove unused sign-in and nprogress styles`.

### Task 20: Wrap-up

**Files:** `package.json`, `package-lock.json`, `README.md`, `docs/css-refactor-size.md`, `docs/css-refactor-exceptions.md`, spec status

- [ ] **Step 1: Remove Sass**

```bash
npm uninstall sass
grep -rn 'sass\|scss' package.json src astro.config.mjs
```

Expected: grep prints nothing.

- [ ] **Step 2: Success-criteria checks**

```bash
find src -name '*.scss'                              # nothing
grep -rn 'data-theme' src                            # tokens.css, BaseLayout script, Navbar script, §C escapes only
grep -rnE '(^|[^-a-z])\.dark\b|body\.dark' src       # nothing
```

Run the Verification Gate and `npx playwright test tests/theme.spec.ts`. Paste all outputs into the final report.

- [ ] **Step 3: Measure "after" CSS sizes**

```bash
CSS_SIZE_OUT=tests/visual/.size/after.json npx playwright test tests/visual/css-size.spec.ts --project=desktop
```

Write `docs/css-refactor-size.md` as a table: route, before (stylesheet + inline bytes, from `docs/css-refactor-size-before.json`), after, change. Then `git rm docs/css-refactor-size-before.json` (its numbers now live in the table).

- [ ] **Step 4: Update README**

Replace the global-partials section (README ~lines 50–73, "no per-component scoping…" through "…site-wide by design") with a short description of the new structure: `tokens.css` + layered globals imported by `global.css`; `<style>` in `.astro` components (with `:global()` for rendered Markdown); `<Widget>.module.css` for React; theme via `data-theme` on `<html>` set by the inline head script; the visual suite (`npm run test:visual`, baselines regenerated from `main` with `--update-snapshots` when missing).

- [ ] **Step 5: Finalise the exceptions log**

Every entry complete; a summary line at the top: `<n> exceptions, all pending Peter's browser review.`

- [ ] **Step 6: Mark the spec implemented** — set `**Status:**` in the spec to `Implemented on refactor/css-architecture; pending exception review`.

- [ ] **Step 7: Commit**

```bash
git add -A package.json package-lock.json README.md docs
git commit -m "Remove Sass and document the new CSS architecture

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 8: Report to Peter and stop.** Summarise commits, gate output, size table, and the exceptions awaiting review, plus the manual flash check he wanted (throttle the network in devtools to Slow 3G, set dark, reload several pages). Do not push, open a PR, or merge.
