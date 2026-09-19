# CSS Refactor Audit

Generated in Task 2 from `main` @ d9e2f63 (the branch base; `git diff --stat main HEAD -- src` is empty, so the styles are identical at `refactor/css-architecture` @ 2e86981). Tasks 3–19 consume this.

## How this was measured

- **Static usage.** Every class, ID and element selector in the partials was checked against the markup in `src/components`, `src/pages` and `src/layouts`: `class`/`className` attributes, `className={…}` expressions, template-literal classes (`count-${state}`, `slice_${n}_c`), and `class="…"` inside `innerHTML` strings in `WeatherApp.tsx`. In `CodeBlocks.tsx` only the rendered JSX counts. The large string constants above it are code samples displayed as text, and they are the main source of false hits in the plan's substring grep: `#container`, `.header`, `.card`, `.info`, `#switches` and others appear only there.
- **Runtime match.** The production build (`npm run build`, served on port 4398) was loaded in Chromium on all 20 visual-suite routes. On every route the harness added `dark` to `<body>` and ran `querySelectorAll` on every selector in the page's stylesheets, with `:hover`, `:focus`, `::before`, `::after` and `::placeholder` stripped. It did this before and after exercising the interactive states: opening the updates modal, "Read more…", "Show me the code", the currency add-list, pizza slices 1–8, a rollup increment, a password copy plus a checkbox toggle, and a live weather search. A selector part is "unmatched" when it matched nothing on any route in any of those states.
- **Removal tests.** Where a verdict mattered, the harness deleted the rule in the live page, with transitions disabled, and compared computed styles before and after. Each such check is cited as "verified" below.
- **Baseline gates.** `npx astro check` gives **0 errors, 0 warnings, 0 hints** across 67 files (re-run in Task 2). The visual suite is **20 routes × 2 themes × 2 widths = 80 tests** (Task 1).

## A. Partials

"Parts" means comma-separated selector parts in that partial's own compiled CSS; "matched" is the runtime count. A partial is dead only if none of its parts has an effect. Only `_nprogress` is dead. `_signin` is **alive** (see Plan impacts P1).

| Partial | Lines | Status (alive/dead) | Evidence | Destination |
|---|---|---|---|---|
| `_reset.scss` | 74 | alive | 13/23 parts matched; the unmatched ones are generic element resets (`figure`, `blockquote`, `dl`, `dd`, `ul[role=list]`, `picture`, `html:focus-within`) that are kept on principle | `reset.css` |
| `_nprogress.scss` | 86 | **dead** | 0/10 parts matched; nothing creates `#nprogress` (no nprogress dependency in `package.json`). `.spinner` and `.bar` get substring hits only (`className="spinner"` in `Users.tsx`, "navbar") and are never inside `#nprogress` | `delete` |
| `_navbar.scss` | 109 | alive | 23/26 parts matched on all 20 routes. Dead: `.toplinks`, `.avatar-link`, `.avatar`. Line 109 is a stray `/*# sourceMappingURL=Navbar.module.css.map */` (not present in the built CSS); drop it | `Navbar.astro`; dead rules and line 109 → `delete` |
| `_signin.scss` | 82 | **alive** (2 rules) | 3/12 parts matched. `input[name='email']` matches the contact form's email input; verified that removing it changes padding `0 10px`→`1px 2px` and margin-bottom `10px`→`0`, and these two are its only winning declarations. `.dark ::placeholder` matches the weather search input; verified that removing it changes the dark placeholder `#ffffff`→`rgb(117,117,117)`. `.dark input[name='email']` matches but has no effect (verified). The other 9 parts are unmatched | `padding: 0 10px; margin-bottom: 10px` on the email input → `ContactForm.module.css`; `.dark ::placeholder` → `WeatherApp.module.css` (escape on `.weatherSearchInput::placeholder`); rest → `delete` |
| `_banner.scss` | 18 | alive | `.banner`, `.banner img` matched on 5 routes. `section#hero-section` is unmatched | `Banner.astro`; `section#hero-section` → `delete` |
| `_colors.scss` | 25 | alive | Custom properties, used by 8 partials (§D) | `tokens.css` (renamed per §D) |
| `_layout.scss` | 69 | alive | 9/17 parts matched on all 20 routes. The 8 `svg.svg-inline--fa…` parts are unmatched (FontAwesome is gone) | `body`, `body.dark` → `base.css`; `.wrapper`, `.content`, `.dark .content` → `layout.css`; `.dark nav` → `Navbar.astro`; `footer`, `div.footer`, `.dark div.footer` → `Footer.astro`; fa-svg rules → `delete` |
| `_typography.scss` | 86 | alive | 15/18 parts matched. `li.users` ×2 are unmatched | `base.css` (`:root` font-family, h1–h4, p, a, `::selection`); `li.users` rules → `delete`; `@import url(Roboto)` → `<link>` (§E) |
| `_homepage.scss` | 138 | alive | 17/19 parts matched. `.logged-in-message` and `.section-divider` are unmatched | `.fade-in`, `.fade-in.visible` → `layout.css` (5 pages); `.section-*`, `.left`, `.right` and the 1024px media block → `src/pages/index.astro`; dead → `delete` |
| `_code.scss` | 375 | alive | 48/57 parts matched on the 8 project pages, `/blog` and `/projects`. Unmatched: `.snippets-intro`, `.code-container` ×2, `.code-top h1`, `.cards` ×5 | Split. `:root` (`--maxWidth`…`--lineClamp`), `.truncate`, `.truncate span`, `a .card-title`, `a .card-intro` → `layout.css`. `a.btnLink`, `a:hover.btnLink`, `a.backBtn`, `a:hover.backBtn`, `.btnSpacer` → `layout.css`, keeping `btnLink` **before** `backBtn` (Plan impacts P4, H3). `.card`, `.dark .card`, `.card-badges > img`, `a .card-image img` → `ProjectCard.astro`. Everything else (`.github-*`, `code.inline`, `.code-content*`, `.code-description-*`, `.stage*`, `section.code*`, `.code-header`, `.btn-widget-*`, `.btn-toggle-code-bottom`, `.code.is-*`, the 1460px and 724px media) → `code.css`. Dead → `delete` |
| `_atom-dark.scss` | 142 | alive (inert) | 1/37 parts matched: `code[class*="language-"]` on the 8 project pages. `.token.*` never matches, because react-syntax-highlighter (inline-style mode) strips every class that appears in its style object, so the SSR HTML carries only `class="token"` plus unknown types (`attr-equals`, `control-flow`…). The matching rule's 11 declarations are all repeated inline on each `<code>`. Verified: removing every `language-` rule changes no computed value | `code.css` (per plan); delete candidate (P8) |
| `_items.scss` | 39 | alive | 6/6 parts matched on `/blog`, `/projects`, `/news` | `layout.css` (shared by 3 index pages + `ProjectCard.astro`; §B) |
| `_weatherApp.scss` | 240 | alive | 38/46 parts matched after a live search. Four more are alive but state-dependent: `.autocompleteDropdownContainer`, `.suggestionItem`, `.suggestionItem:hover` (Places suggestions, `WeatherApp.tsx:271,275`) and `p.errorMsg` (error `innerHTML`, `:152`). Dead: `div#weatherOutput` (the element has the class, not the ID), `div.loading`, `.widgetLefMenu__links a:hover` (typo), `.dark p.error-msg` (the class is `errorMsg`) | `WeatherApp.module.css`; the 4 dead → `delete` |
| `_currency-converter.scss` | 341 | alive | 44/46 parts matched. Unmatched: the `i` members of `.cc .currency-add-btn i, …svg.arrow-left-icon` (normal and `.open`); there is no `<i>`. The only native-nesting partial | `CurrencyConverter.module.css`; drop the `i` list members |
| `_password-generator.scss` | 207 | alive | 33/36 parts matched. Dead: `.pwg-result-container #result` (the ID is `pwg-result`), `.pwg-result-container .btn`, `.pwg.result-container` (typo, 400px media). Global leaks: `*` (redundant with reset; verified), `.dark h4` (duplicate of typography; verified), `input[type='checkbox']` (**also styles the checkbox-styling widget**; §B, P6) | `PasswordGenerator.module.css`; `*` and `.dark h4` → `delete`; `input[type='checkbox']` → both widget modules (§B); dead → `delete` |
| `_pagination.scss` | 256 | alive | 50/51 parts matched. `.page-link` is unmatched | `Pagination.module.css`; `.page-link` → `delete` |
| `_checkbox-styling.scss` | 154 | alive | 21/22 parts matched. `#container` is unmatched (it appears only in the CodeBlocks sample text) | `CheckboxStyling.module.css`; `#container` → `delete` |
| `_pizza-pie.scss` | 198 | alive | 39/43 parts matched. `.btn-hide` is alive but transient (`PizzaSlices.tsx:103`, the 550 ms before "Order Now" shows). Dead: `.pizza-pie-container`, `.header`, `.dark .code-top h1` | `PizzaPie.module.css` (`.stage.pizza-pie` per §B); dead → `delete` |
| `_rollup-counter.scss` | 58 | alive | 12/13 parts matched (count-enter/exit captured mid-transition). `.comment` is unmatched | `RollupCounter.module.css`; `.comment` → `delete` |
| `_js-clock.scss` | 27 | alive | 3/3 parts matched | `Clock.module.css` (`.stage.clock` per §B) |
| `_news.scss` | 34 | alive | 6/6 parts matched. **`article > p:nth-of-type(2)` matches only on the blog post** (its second Markdown paragraph; verified padding-bottom `40px`→`10px` when removed). It matches nothing on any news feed, because NewsFeed articles have one direct `<p>` (P2) | `li.news.item*`, `.item-content`, `div.item-title` (+dark) → `src/pages/news/index.astro`; `article > p:nth-of-type(2)` → `src/pages/blog/[...slug].astro` as `article > :global(p:nth-of-type(2))` |
| `_blog.scss` | 21 | alive | 3/3 parts matched on the post page only | `src/pages/blog/[...slug].astro` |
| `_contactForm.scss` | 57 | alive | 8/8 parts matched on `/contact` only | `ContactForm.module.css` |
| `_latest-updates.scss` | 207 | alive | 16/23 parts matched (modal open and closed). Dead: `button[name='toggle updates']` ×4 (the button's name is `toggle updates modal`, and an attribute selector is an exact match), `body.modal-open` (the JS sets `style.overflow`, never the class), `span.update-date` (it is a `div`), `.footer-container li` | `Navbar.astro` (Markdown rules as `.update-details :global(p)`); dead → `delete` |
| `_footer.scss` | 3 | alive | `footer` matched on all routes. It also matches the weather widget's injected `footer.weatherFooter`, with no effect (verified: bounding box unchanged) | `Footer.astro` |
| `News.module.scss` | 23 | alive | Imported by `NewsFeed.tsx:3`; its hashed classes are rendered (`_title_eiupm_1` etc.) | `NewsFeed.module.css` (in `src/components/`) |
| `globals.scss` | 25 | alive (entry) | Imported by `BaseLayout.astro:2`; 25 partial imports | `global.css` (entry) |

Totals: 25 partials plus `News.module.scss` plus the entry. **1 dead** (`_nprogress`), **24 alive**, of which `_atom-dark` is alive but inert. Dead selector parts inside live partials: 56. This excludes `_nprogress`'s 10, the 8 kept generic resets, the 5 state-dependent live parts (weather ×4, `.btn-hide`) and `_atom-dark`'s 36 never-matching `pre` and `.token` parts. It includes 8 fa-svg parts, 9 in `_signin`, 9 in `_code` and 7 in `_latest-updates`.

Sass features in use (for Task 3): 28 full-line `//` comments (contactForm 9, navbar 9, homepage 6, latest-updates 4), 8 `@import url()` web fonts, 25 `@import` partials in `globals.scss`, native-compatible nesting in `_currency-converter.scss`, and one nested `@media` inside `.content` (`_layout.scss:23`). There is no `&-suffix`, `$var`, `#{}`, `@mixin`, `@extend` or `@use` (grep returned nothing). No nested rule has a comma-list parent, so native nesting's `:is()` wrapping keeps Sass's specificity.

## B. Shared selectors (used by more than one component)

Consumers come from the static usage index described above (CodeBlocks sample strings excluded). Classes that the plan's `uniq -c` flags only because one partial defines them several times (`.form-container`, `.btn-submit`, `.email-address`, `.website-url`, `.updates-container*`, `.icon-*`, `.section-*`, `.p-card`, `.info`, `.currency-*`) have a single consumer. They are listed once at the end and go to their owner.

| Selector | Defined in | Used by (files) | Destination |
|---|---|---|---|
| `.content` (+ `.dark .content`) | `_layout` | `NewsFeed.tsx`, `PortPending.astro`, `blog/[...slug]`, `blog/index`, `contact/index` (×2 nested), `index`, `news/index`, `projects/index`, 8 `projects/*/index.astro` | `layout.css` |
| `.wrapper` | `_layout` | `BaseLayout.astro` (every page) | `layout.css` |
| `.fade-in`, `.fade-in.visible` | `_homepage` | `index`, `blog/index`, `news/index`, `projects/index`, `contact/index` | `layout.css` |
| `a.backBtn`, `a:hover.backBtn` | `_code` | 8 `projects/*/index.astro`, `PortPending.astro`, 8 `CodeBlocks.tsx` (with `btnLink`) | `layout.css` |
| `a.btnLink`, `a:hover.btnLink` | `_code` | 8 `CodeBlocks.tsx` (same element as `backBtn`) | `layout.css`, placed **before** `a.backBtn` (P4, H3) |
| `.btnSpacer` | `_code` | 8 `projects/*/index.astro`, `PortPending.astro` | `layout.css` |
| `.page`, `ul.items-container`, `li.item`, `li.item:hover` | `_items` | `blog/index`, `news/index`, `projects/index`; `li.item` also `ProjectCard.astro` | `layout.css` |
| `.card-title` (+dark) / `a .card-title` (+dark) | `_items` / `_code` | `ProjectCard.astro`, `blog/index.astro` | `layout.css` (both rules, `_items` first, as today) |
| `a .card-intro`, `.truncate`, `.truncate span` (+dark), `:root` `--maxWidth`…`--lineClamp` | `_code` | `ProjectCard.astro`, `blog/index.astro` | `layout.css` |
| `.stage`, `.stage h1` (+dark), `.dark .stage`, 1460px `.stage` | `_code` | 7 `*Widget.tsx` + `PasswordGenerator.tsx` | `code.css` |
| `.stage.clock` | `_js-clock` | `ClockWidget.tsx:20` | `Clock.module.css` as `:global(.stage).clock` (keeps (0,2,0)) |
| `.stage.pizza-pie` | `_pizza-pie` | `PizzaPieWidget.tsx:19` | `PizzaPie.module.css` as `:global(.stage).pizzaPie` |
| `.clock` | `_js-clock` | `ClockWidget.tsx:20` (div) and `Clock.tsx:15` (span) | `Clock.module.css`; **both** elements need `styles.clock` (font-family applies to both) |
| `.code-content` (+`p`, +dark), `.code-description-open/-closed` (+`li`, +dark), `.btn-widget-description > button` (+hover/dark), `.github-link` (+span dark), `.github-logo` (+dark) | `_code` | all 8 `*Widget.tsx` | `code.css` |
| `.btn-widget-code` (`span.`, `> button`, hover, dark ×2), `.btn-toggle-code-bottom`, `.code-header` (+dark), `section.code`, `section.code pre`, `.code.is-open`, `.code.is-closed` | `_code` | all 8 `CodeBlocks.tsx` (`btn-widget-code` also the 8 Widgets) | `code.css` (the global `code`, `is-open`, `is-closed` strings stay) |
| `code.inline` | `_code` | `PortPending.astro`, `ClockWidget`, `PizzaPieWidget`, `RollupCounterWidget`, `WeatherAppWidget` | `code.css` |
| `code[class*="language-"]` etc. | `_atom-dark` | 8 `CodeBlocks.tsx` via react-syntax-highlighter | `code.css` (inert, P8) |
| `*` | `_reset`, `_password-generator` | everything | `reset.css` only. Delete the password-generator copy (verified no change on the pages that load both) |
| `h1`–`h4`, `p`, `a`, `a:hover`, `::selection` (+dark) | `_typography` (+`_reset` margins) | every component | `base.css` / `reset.css` (hazards H1 and H2: component classes that currently lose to `.dark a` or `a:hover`) |
| `.dark h4` | `_typography`, `_password-generator` | every `h4` (checkbox, currency, password, weather pages) | `base.css` only. Delete the password-generator copy (verified) |
| `input[type='checkbox']` | `_password-generator` | `PasswordGenerator.tsx` **and** `Checkboxes.tsx` (verified: removing it moves checkbox margin-right `0`→`3px` on `/projects/checkbox-styling`) | Both `PasswordGenerator.module.css` and `CheckboxStyling.module.css`, as `:where(.root) input[type='checkbox']` (keeps (0,1,1)) |
| `input#length:focus, input[type='checkbox']:focus` | `_password-generator` | pwg only in effect (the checkbox widget's inputs have `outline: none` at higher specificity, or are `display: none`) | `PasswordGenerator.module.css` |
| `.code-top h1`, `.dark .code-top h1` | `_code`, `_pizza-pie` | none | `delete` |
| `footer` | `_layout`, `_footer` | `Footer.astro`; also matches `footer.weatherFooter` from `WeatherApp.tsx:247` (no effect, verified) | `Footer.astro` |
| `.nav` / `.dark nav` | `_navbar` / `_layout` | `Navbar.astro` | `Navbar.astro` |
| `input[name='email']` | `_signin` | `ContactForm.tsx:66` | `ContactForm.module.css`: only `padding: 0 10px; margin-bottom: 10px` (everything else loses today; P1) |
| `.dark ::placeholder` | `_signin` | weather search input (`WeatherApp.tsx:264`); currency inputs have `placeholder=""` | `WeatherApp.module.css`: `:global([data-theme="dark"]) .weatherSearchInput::placeholder { color: #ffffff }` |
| `article > p:nth-of-type(2)` | `_news` | blog post only (`blog/[...slug].astro:25` + Markdown) | `blog/[...slug].astro` (P2) |
| `.icon-sun/-moon/-bell` | `_navbar` + `Navbar.astro <style>` | `Navbar.astro` | `Navbar.astro` (merge) |
| `.map` | `_pagination` | `Users.tsx:88` (+ visual mask `routes.ts`) | `Pagination.module.css` (+ `data-testid` mask per Task 13) |
| `.pwg` | `_password-generator` | `PasswordGenerator.tsx`, `PasswordGeneratorWidget.tsx` (`ol.pwg`) | `PasswordGenerator.module.css` |
| `.red-msg` | none (no CSS anywhere) | `ContactForm`, `PortPending`, 8 `CodeBlocks` | nothing to migrate |
| **Single consumer:** `.form-container`, `.btn-submit`, `.contact-email` | `_contactForm` | `ContactForm.tsx` | `ContactForm.module.css` |
| **Single consumer:** `.email-address`, `.website-url`, `.info`, `.p-card`, `.page-num*` … | `_pagination` | `Users.tsx`, `Pages.tsx`, `PageInfo.tsx`, `Data.tsx` (one folder) | `Pagination.module.css` |
| **Single consumer:** `.updates-*`, `.update-*`, `.modal-title`, `.icon-*`, `.faIcon`, `.navContent`, `.topNavLinks` | `_latest-updates`, `_navbar` | `Navbar.astro` | `Navbar.astro` |
| **Single consumer:** `.section-one`…`-five`, `.left`, `.right` | `_homepage` | `src/pages/index.astro` | `src/pages/index.astro` |
| **Single consumer:** `.card`, `.card-badges`, `.card-image` | `_code` | `ProjectCard.astro` | `ProjectCard.astro` |
| **Single consumer:** `li.news.item`, `.item-content`, `.item-title` | `_news` | `src/pages/news/index.astro` | `src/pages/news/index.astro` |
| **Dead despite substring hits:** `.cards`, `.header`, `#container`, `.snippets-intro`, `.button`, `.divider` | various | only CodeBlocks sample strings or prose | `delete` |

Count: 32 rows above the single-consumer block. Each is either defined in more than one partial or used by more than one file; same-folder multi-file uses (`.clock`, `.pwg`, `.map`) are included because they drive module wiring. Below that are 5 single-consumer groups and 1 dead-despite-substring-hits group.

## C. Dark-mode rules

Every `.dark` declaration in the partials, plus `Navbar.astro`'s four `:global(body.dark)` rules and the NewsFeed title, whose dark colour comes from `.dark a`. The inventory holds 110 `.dark` lines, 184 declaration rows grouped into the rows below. Resolutions:

- **token**: set the light rule to `var(--color-…)` (§D) and delete the dark declaration.
- **escape**: dark-only (the light value is inherited, initial or UA default, or it isn't a colour swap). Stays as `[data-theme="dark"] …`, or `:global([data-theme="dark"]) …` in components. Each escape is a token candidate where noted.
- **redundant**: the dark value equals what the light rules (after tokenisation) already produce; delete.
- **dead**: the selector matches nothing; delete with the rule.
- **no effect**: matches, but always loses; delete (verified).
- **literal**: replace with a theme-invariant literal on the light rule.

| Partial | Selector | Property | Light value (source) | Dark value | Resolution (token name / escape) |
|---|---|---|---|---|---|
| _typography | `.dark h1` | color | `var(--black)` — undefined, so inherits `#000` (h1 rule, `_typography:7`) | `var(--light-text)` | token `--color-text` (verified: setting `--black:#000000` changes no h1 on 15 routes × 2 themes) |
| _typography | `.dark h2`, `.dark h3`, `.dark h4` | color | `var(--dark-text)` (`h2`/`h3`/`h4`) | `var(--light-text)` | token `--color-text` |
| _typography | `.dark p` | color | `var(--light-grey)` (`p`) | `var(--light-text)` | token `--color-text-muted` |
| _typography | `.dark a` | color | `rebeccapurple` (`a`) | `#ffa804` | token `--color-accent` — **hazard H1**: NewsFeed `.title` must get `--color-news-title` |
| News.module | `.title` (no `.dark` rule of its own) | color | `#047fa5` (`.title`) | `#ffa804` — today `.dark a` (0,1,1) out-specifies `.title` (0,1,0) | token `--color-news-title` (**hazard H1**, verified: removing `.dark a` turns dark titles `#047fa5`) |
| _typography | `.dark a` | text-decoration, transition | same (`a`) | same | redundant |
| _typography | `.dark a:hover` | color | `#ffa804` (`a:hover`) | `#e43af4` | token `--color-link-hover` |
| _typography | `.dark a:hover` | text-decoration | `none` (`a:hover`) | `none` | redundant |
| _typography | `.dark li.users` | color | `var(--light-grey)` | `var(--white)` | dead (no `li.users` in markup) |
| _layout | `body.dark` | background-color | `var(--white)` (`body`) | `var(--dark-grey)` | token `--color-bg` |
| _layout | `.dark .content` | background-color | `var(--white)` (`.content`) | `var(--dark-grey)` | token `--color-bg` |
| _layout | `.dark svg.svg-inline--fa.fa-{moon,lock,unlock,bell}…` (4 selectors) | font-size, color, transition, width, height | `svg.svg-inline--fa…` (`_layout:30`) | `var(--dark-link)` etc. | dead (FontAwesome markup no longer exists) |
| _layout | `.dark nav` | background-color | `rgba(255, 255, 255, 0.95)` (`.nav`, `_navbar:6`) | `rgba(51, 51, 51, 0.95)` | token `--color-nav-bg` |
| _layout | `.dark nav` | box-shadow | `0 4px 8px -2px rgba(0, 0, 0, 0.85)` (`.nav`) | `0 -12px 26px 0px rgb(255 255 255 / 85%)` | escape (offsets differ, not a colour swap) |
| _layout | `.dark nav` | border-bottom | `1px solid rebeccapurple` (`.nav`) | `1px solid rgba(255, 235, 59, 0.35)` | token `--color-nav-border` |
| _layout | `.dark div.footer` | color | `var(--dark-text)` (`div.footer`) | `var(--light-text)` | token `--color-text` |
| _navbar | `.dark .icon-sun`, `.dark .icon-moon`, `.dark .icon-bell` | color | `rebeccapurple` (`.icon-*`) | `#ffa804` | token `--color-accent` |
| _navbar | `.dark .icon-sun`, `.dark .icon-moon`, `.dark .icon-bell` | transition | `color 0.35s ease-in` (`.icon-*`) | `color 0.25s ease-in` | escape (timing differs by theme; not in screenshots) |
| _navbar | `.dark .icon-sun`, `.dark .icon-moon`, `.dark .icon-bell` | width, height | `18px` (`.icon-*`) | `18px` | redundant |
| _navbar | `.dark .icon-{sun,moon,bell}:hover`, `:focus` (6 selectors) | color | `var(--red)` (`.icon-*:hover`) | `#ff7272` | token `--color-icon-hover` |
| Navbar.astro | `:global(body.dark) .logo-light`, `.logo-dark`, `.icon-sun`, `.icon-moon` | display | `none`/`inline` defaults in same `<style>` | swapped | escape (display toggles; Task 4 rewrites to `:global([data-theme="dark"])`) |
| _latest-updates | `.dark button[name='toggle updates']` (+ `:hover`) | color | `#fff` / `#ffa804` | `#ffa804` / `#ff7272` | dead (button is named `toggle updates modal`) |
| _latest-updates | `.dark .modal-title` | background-color | `rgb(144, 75, 213)` (`.modal-title`) | `rgba(201, 44, 44, 1)` | token `--color-modal-title-bg` |
| _latest-updates | `.dark .updates-container-inner` | background-color | `#fff` (`.updates-container-inner`) | `#333333` | token `--color-bg` |
| _latest-updates | `.dark .updates-container-inner` | color | inherited `#000000` (`.updates-container.open`) | `#f4f4f4` | escape (light inherits) |
| _latest-updates | `.dark .updates-container-inner` | border | `4px double #000` | `1px solid #f4f4f4` | escape (width and style change too) |
| _latest-updates | `.dark .update-content` | border-bottom | `1px solid rgba(63, 63, 63, 0.4)` | `1px solid rgba(244, 244, 244, 0.4)` | token `--color-update-divider` |
| _latest-updates | `.dark .update-content:last-child` | border-bottom | `none` | `none` | redundant |
| _blog | `.dark .post-meta` | color | `var(--light-grey)` (`.post-meta`) | `var(--light-text)` | token `--color-text-muted` |
| _news | `.dark div.item-title` | color | `var(--dark-text)` | `var(--light-text)` | token `--color-text` |
| _items | `.dark .card-title` | color | `#000` (`.card-title`) | `var(--light-text)` | token `--color-text` (always out-specified by `a .card-title`, kept for fidelity) |
| _code | `.dark .truncate span` | color | `#000000` | `#f4f4f4` | token `--color-text` |
| _code | `.dark .github-link span` | color | inherited from `a` (`rebeccapurple`, `#ffa804` on hover) | `#f4f4f4` | escape (a token would break light-mode hover inheritance) |
| _code | `.dark .github-logo` | background-image | `url(/images/code/github-logo.png)` | `url(/images/code/github-logo-dark.png)` | escape (not a colour; candidate `--image-github-logo`) |
| _code | `.dark .github-logo` | background-size, background-repeat, width, height, margin | same | same | redundant |
| _code | `.dark .code-container` | background-color | `#f6f6f6` | `#333333` | dead (no `.code-container` in markup) |
| _code | `.dark .code-content p` | color | `#000000` | `#f4f4f4` | token `--color-text` |
| _code | `.dark .code-description-open li` | color | `#000` | `#fff` | token `--color-list-text` |
| _code | `.dark .code-header` | background-color | `#fff` | `#464646` | token `--color-code-header-bg` |
| _code | `.dark .code-header` | color | inherited (`#000`) | `#f4f4f4` | escape (light inherits) |
| _code | `.dark .cards a`, `.dark .cards a:hover` | border, box-shadow | `rebeccapurple` / `rgba(0,0,0,.185)` shadow | `#ffba32` | dead (no `.cards` in markup) |
| _code | `.dark .card` | background-color | initial (transparent) | `#4a4a4a` | escape (light is initial) |
| _code | `.dark a .card-title` | color | `#000000` (`a .card-title`) | `#fafafa` | token `--color-card-title` |
| _code | `.dark .stage h1` | color | `#000000` (`.stage h1`) | `#f4f4f4` | token `--color-text` |
| _code | `.dark .stage` | background-color | initial (transparent) | `#464646` | escape (light is initial) |
| _code | `.dark .stage` | border | `1px solid #464646` | `1px solid #000000` | token `--color-stage-border` |
| _code | `.dark .btn-widget-description > button`, `.dark .btn-widget-code > button` (2 copies) | border | `1px solid #464646` | `1px solid #f4f4f4` | token `--color-widget-btn-border` |
| _code | (same) | background-color | `#464646` | `transparent` | token `--color-widget-btn-bg` |
| _code | (same) | color | `#f4f4f4` | `#f4f4f4` | redundant (the second `.dark .btn-widget-code > button` copy, `_code:314`, is wholly redundant) |
| _code | `.dark .btn-widget-description > button:hover`, `.dark .btn-widget-code > button:hover` | border | `1px solid rebeccapurple` | `1px solid #ffa804` | token `--color-accent` |
| _code | (same) | background-color | `transparent` | `#464646` | token `--color-widget-btn-hover-bg` |
| _code | (same) | color | `rebeccapurple` | `#ffa804` | token `--color-accent` |
| _contactForm | `.dark .form-container input.contact-email` | background-color | UA default (white) | `var(--white)` | escape (light is UA default) |
| _contactForm | `.dark .form-container input.contact-email` | color | UA default (black) | `var(--dark-gray)` | escape (light is UA default) |
| _signin | `.dark input[name='email']` | background-color, color, border | — | `var(--light-gray)` / `var(--white)` | no effect — all three lose to `_contactForm` rules (verified: computed values unchanged when removed); delete |
| _signin | `.dark ::placeholder` | color | UA default (`rgb(117, 117, 117)`) | `var(--white)` | escape — **live** on the weather search input; move to `WeatherApp.module.css` |
| _signin | `.dark .sign-in-container`, `.dark .button` | border, background-color, color | — | — | dead |
| _nprogress | `.dark #nprogress .bar`, `.dark #nprogress .spinner-icon` | background, animation | — | — | dead (no `#nprogress` element) |
| _pagination | `.dark .email-icon`, `.dark .address-icon` | color | `darkgreen` | `#ffa804` | token `--color-contact-icon` |
| _pagination | `.dark .phone-icon`, `.dark .website-icon`, `.dark .website-url a:hover` | color | `darkgreen` | `#faa804` (sic, not `#ffa804`) | token `--color-contact-icon-alt` |
| _pagination | `.dark .email-address a`, `.dark .website-url a` | color | `#000` / `#000000` | `#f4f4f4` | token `--color-text` |
| _pagination | `.dark .phone-number` | color | inherited | `#f4f4f4` | escape (light inherits) |
| _pagination | `.dark .info span` | color | inherited | `#fff` | escape (light inherits) |
| _pagination | `.dark li.page-num` | background-color | `#f4f4f4` | `#ffa804` | token `--color-page-num-bg` |
| _pagination | `.dark li.page-num` | transition | same | same | redundant |
| _pagination | `.dark li.page-num:hover` | background-color | `#faa804` | `#f4f4f4` | token `--color-page-num-hover-bg` |
| _pagination | `.dark li.page-num:hover` | color | `#fff` (from `li.page-num`) | `#333333` | token `--color-page-num-hover-text` (set on `li.page-num:hover`) |
| _pagination | `.dark li.page-num span` | color | `darkgreen` | `#333333` | token `--color-page-num-text` |
| _pagination | `.dark li.page-num.active:hover` | background-color | `#ffa804` | `#f4f4f4` | token `--color-page-num-active-hover-bg` |
| _pagination | `.dark li.page-num.active span`, `.dark li.page-num.active:hover span` | color | `#f4f4f4` / `#333333` | same | redundant (the light `.active` rules already out-specify `li.page-num span`) |
| _password-generator | `.dark .PasswordGeneratorContainer` | background-color | `#f6f6f6` | `#464646` | token `--color-surface` |
| _password-generator | `.dark ol.pwg` | color | inherited | `#f4f4f4` | escape (verified: changes the collapsed list items' colour) |
| _password-generator | `.dark h4` | color | — | `#f4f4f4` | redundant (duplicate of `_typography`'s `.dark h4`, same value; verified no change when either copy is removed) |
| _pizza-pie | `.dark .code-top h1` | color | — | `#f4f4f4` | dead (no `.code-top`) |
| _pizza-pie | `.dark #ddl` | border | `1px solid #333333` | `1px solid #aaaaaa` | token `--color-control-border` |
| _pizza-pie | `.dark #ddl` | color | UA default | `#f4f4f4` | escape (light is UA default) |
| _pizza-pie | `.dark #ddl` | background | `#ffffff` | `#333333` | token `--color-bg` |
| _pizza-pie | `.dark .slice_1_w` … `.dark .slice_8_w` (8) | background-color | `silver` | `dimgrey` | token `--color-slice` |
| _pizza-pie | `.dark #eaten` | color | inherited | `#f4f4f4` | escape (light inherits) |
| _pizza-pie | `.dark button.btn-start-over` | border | `1px solid #ccc` then `border-color: #333333` | `1px solid #aaaaaa` | token `--color-control-border` (on `border-color`) |
| _pizza-pie | `.dark button.btn-start-over` | color, background | UA default | `#f4f4f4` / `#333333` | escape (light is UA default) |
| _pizza-pie | `.dark button.btn-start-over` | transition | same | same | redundant |
| _pizza-pie | `.dark button.btn-start-over:hover` | border | `#333333` (inherited from base rule) | `1px solid #333333` | literal: add `border-color: #333333` to the light `:hover` rule (identical in both themes), then delete |
| _pizza-pie | `.dark button.btn-start-over:hover` | color | `#f4f4f4` | `#333333` | token `--color-button-text` |
| _pizza-pie | `.dark button.btn-start-over:hover` | background | `#333333` (`background-color`) | `#f4f4f4` | token `--color-button-bg` |
| _pizza-pie | `.dark button.btn-start-over:hover` | cursor | `pointer` | `pointer` | redundant |
| _rollup-counter | `.dark .count` | color | inherited | `#f4f4f4` | escape (light inherits) |
| _rollup-counter | `.dark #increment`, `.dark #reset` | background-color | `#333333` | `#f4f4f4` | token `--color-button-bg` |
| _rollup-counter | `.dark #increment`, `.dark #reset` | color | `#f4f4f4` | `#333333` | token `--color-button-text` |
| _rollup-counter | `.dark #increment`, `.dark #reset` | border-radius | `4px` | `4px` | redundant |
| _checkbox-styling | `.dark h4.checkbox-group` | color | `#000000` via `h4` | `#f4f4f4` | redundant (the `h4` token already gives this) |
| _checkbox-styling | `.dark .checkbox-input` | color | UA default | `#f4f4f4` | escape (verified computed change; native checkboxes probably don't paint it) |
| _checkbox-styling | `.dark #checkboxes`, `.dark #switches` | color | inherited (`#000`) | `#f4f4f4` | escape (light inherits; candidate `--color-text`) |
| _checkbox-styling | `.dark #switches label span`, `.dark #switches label input:checked + span` | border / border-color | `2px solid rgba(97, 96, 96, 0.6)` / `border-color: rgba(97, 96, 96, 0.6)` | `2px solid #f4f4f4` | token `--color-switch-border` |
| _weatherApp | `.dark .weatherOl` | color | `#000000` | `rgb(244, 244, 244)` | token `--color-text` |
| _weatherApp | `.dark .weatherContainer` | background-color | `rgba(19, 146, 180, 0.25)` | `rgba(0, 201, 255, 0.75)` | token `--color-weather-bg` |
| _weatherApp | `.dark .weatherContainer`, `.dark .dateTime`, `.dark .weatherOutput h2` | color | `rgba(56, 56, 57, 0.85)` (`.weatherOutput > h2` for the h2) | `#f4f4f4` | token `--color-weather-text` |
| _weatherApp | `.dark .weatherContainer h1` | color (`!important`) | `rgba(56, 56, 57, 0.85) !important` | `#f4f4f4 !important` | token `--color-weather-text` (keep `!important` on the light rule) |
| _weatherApp | `.dark span.weatherConditions` | color | `#484848` | `#f4f4f4` | token `--color-weather-conditions` |
| _weatherApp | `.dark .currentWeatherWrapper` | color | inherited `rgba(56, 56, 57, 0.85)` | `#f4f4f4` | escape (light inherits; candidate `--color-weather-text`) |
| _weatherApp | `.dark #forecastOutput h4` | color | `#000000` via `h4` | `#f4f4f4` | redundant (the `h4` token already gives this) |
| _weatherApp | `.dark .widgetLeftMenu__links span` | color | `#484848` | `#282828` | token `--color-weather-credit` |
| _weatherApp | `.dark .widgetLeftMenu__links span` | font-weight, opacity, font-size | same | same | redundant |
| _weatherApp | `.dark .widgetLeftMenu__links a` | color | `#484848` (`.widgetLeftMenu__link`) | `#282828` | token `--color-weather-credit` |
| _weatherApp | `.dark .widgetLeftMenu__links a:hover` | color | `#ffa804` (`a:hover` out-specifies `.widgetLeftMenu__link`) | `#4c0295` | token `--color-weather-credit-hover` — needs a new light rule `.widgetLeftMenu__links a:hover` (**hazard H2**) |
| _weatherApp | `.dark p.error-msg` | color | — | `#860202` | dead (the class is `errorMsg`) |

Counts: 106 rows. **57 token, 23 escape**, 15 redundant, 9 dead, 1 no-effect, 1 literal. The 23 escapes are the Task 5 end-state `[data-theme="dark"]` list; `grep -rn 'data-theme' src/styles src/components` should show only these plus `tokens.css`.

## D. Token inventory

Light values go on `:root`; dark values go under `:root[data-theme="dark"]`. Each token merges only colour pairs that are already identical: `#000` = `#000000`, `#fff` = `#ffffff` and `rgb(244, 244, 244)` = `#f4f4f4` render the same, and the source spellings are listed under "Replaces". All 36 tokens differ between themes.

| Token | Light | Dark | Replaces |
|---|---|---|---|
| `--color-text` | `#000000` | `#f4f4f4` | `h1` (`var(--black)`, undefined), `h2`–`h4` and `div.footer` (`var(--dark-text)`/`var(--light-text)`), `div.item-title`, `.card-title` (`#000`), `.truncate span`, `.code-content p`, `.stage h1`, `.email-address a` (`#000`), `.website-url a`, `.weatherOl` (dark `rgb(244, 244, 244)`) |
| `--color-text-muted` | `#585858` | `#f4f4f4` | `p`, `.post-meta` (`var(--light-grey)`/`var(--light-text)`) |
| `--color-bg` | `#ffffff` | `#333333` | `body`, `.content` (`var(--white)`/`var(--dark-grey)`), `.updates-container-inner` (`#fff`), `#ddl` `background` |
| `--color-accent` | `rebeccapurple` | `#ffa804` | `a`, `.icon-sun/-moon/-bell`, `.btn-widget-description > button:hover` and `.btn-widget-code > button:hover` (color + border colour) |
| `--color-link-hover` | `#ffa804` | `#e43af4` | `a:hover` |
| `--color-news-title` | `#047fa5` | `#ffa804` | NewsFeed `.title` (dark value is today produced by `.dark a`; H1) |
| `--color-icon-hover` | `#ff0000` | `#ff7272` | `.icon-*:hover/:focus` (`var(--red)`) |
| `--color-nav-bg` | `rgba(255, 255, 255, 0.95)` | `rgba(51, 51, 51, 0.95)` | `.nav` / `.dark nav` |
| `--color-nav-border` | `rebeccapurple` | `rgba(255, 235, 59, 0.35)` | `.nav` `border-bottom` colour |
| `--color-card-title` | `#000000` | `#fafafa` | `a .card-title` |
| `--color-list-text` | `#000` | `#fff` | `.code-description-open li` |
| `--color-code-header-bg` | `#fff` | `#464646` | `.code-header` |
| `--color-stage-border` | `#464646` | `#000000` | `.stage` border colour |
| `--color-widget-btn-bg` | `#464646` | `transparent` | `.btn-widget-description > button`, `.btn-widget-code > button` |
| `--color-widget-btn-border` | `#464646` | `#f4f4f4` | same two, border colour |
| `--color-widget-btn-hover-bg` | `transparent` | `#464646` | same two, `:hover` background |
| `--color-modal-title-bg` | `rgb(144, 75, 213)` | `rgba(201, 44, 44, 1)` | `.modal-title` |
| `--color-update-divider` | `rgba(63, 63, 63, 0.4)` | `rgba(244, 244, 244, 0.4)` | `.update-content` border-bottom colour |
| `--color-contact-icon` | `darkgreen` | `#ffa804` | `.email-icon`, `.address-icon` |
| `--color-contact-icon-alt` | `darkgreen` | `#faa804` | `.phone-icon`, `.website-icon`, `.website-url a:hover` |
| `--color-page-num-bg` | `#f4f4f4` | `#ffa804` | `li.page-num` |
| `--color-page-num-hover-bg` | `#faa804` | `#f4f4f4` | `li.page-num:hover` |
| `--color-page-num-hover-text` | `#fff` | `#333333` | `li.page-num:hover` color (add to the light hover rule) |
| `--color-page-num-text` | `darkgreen` | `#333333` | `li.page-num span` |
| `--color-page-num-active-hover-bg` | `#ffa804` | `#f4f4f4` | `li.page-num.active:hover` |
| `--color-surface` | `#f6f6f6` | `#464646` | `.PasswordGeneratorContainer` |
| `--color-control-border` | `#333333` | `#aaaaaa` | `#ddl` border colour, `button.btn-start-over` border-color |
| `--color-button-bg` | `#333333` | `#f4f4f4` | `#increment`, `#reset`, `button.btn-start-over:hover` background |
| `--color-button-text` | `#f4f4f4` | `#333333` | `#increment`, `#reset`, `button.btn-start-over:hover` color |
| `--color-slice` | `silver` | `dimgrey` | `.slice_1_w` … `.slice_8_w` |
| `--color-switch-border` | `rgba(97, 96, 96, 0.6)` | `#f4f4f4` | `#switches label span` border colour, `…input:checked + span` border-color |
| `--color-weather-bg` | `rgba(19, 146, 180, 0.25)` | `rgba(0, 201, 255, 0.75)` | `.weatherContainer` background |
| `--color-weather-text` | `rgba(56, 56, 57, 0.85)` | `#f4f4f4` | `.weatherContainer`, `.weatherContainer h1` (`!important`), `.weatherOutput > h2`, `.dateTime` |
| `--color-weather-conditions` | `#484848` | `#f4f4f4` | `span.weatherConditions` |
| `--color-weather-credit` | `#484848` | `#282828` | `.widgetLeftMenu__links span`, `.widgetLeftMenu__link` |
| `--color-weather-credit-hover` | `#ffa804` | `#4c0295` | new light rule `.widgetLeftMenu__links a:hover` (today the light value comes from `a:hover`; H2) |

### Existing `_colors.scss` custom properties

| Old | Value | New |
|---|---|---|
| `--white` | `#ffffff` | `--color-bg` (light) in `body`/`.content`; the `.dark .form-container input.contact-email` escape becomes the literal `#ffffff`; `_signin` uses are deleted |
| `--light-gray` | `#585858` | only `_signin` (deleted) → drop |
| `--light-grey` | `#585858` | `--color-text-muted` (light) |
| `--dark-gray` | `#333333` | contactForm dark escape → literal `#333333` |
| `--dark-grey` | `#333333` | `--color-bg` (dark) |
| `--red` | `#ff0000` | `--color-icon-hover` (light) |
| `--purple` | `rebeccapurple` | only dead uses (fa-svg, nprogress) → drop |
| `--orange` | `#ffa804` | only dead uses (nprogress) → drop |
| `--btn-blue` | `#4979ff` | unused → drop |
| `--light-text` | `#f4f4f4` | dark value of `--color-text` / `--color-text-muted` |
| `--dark-text` | `#000000` | `--color-text` (light) |
| `--light-link` | `rebeccapurple` | unused → drop (value lives on as `--color-accent` light) |
| `--light-link-hover` | `#ff0000` | unused → drop (note: the real link hover is `#ffa804`) |
| `--dark-link` | `#ffa804` | only dead use (fa-svg) → drop |
| `--dark-link-hover` | `#ff7272` | unused → drop (the real dark link hover is `#e43af4`) |
| `--black` *(never defined)* | — | used once, `h1` in `_typography:7` → `--color-text` (P5) |

`_code.scss`'s `:root` `--maxWidth`, `--fontSize`, `--lineHeight`, `--numLines` and `--lineClamp` are theme-invariant layout values, not tokens. They move with `.truncate` to `layout.css`.

## E. Web fonts

All 8 `@import url()` lines are requested today. Sass hoists every `@import url()` to the very top of the compiled CSS (byte offsets 0–492 of `dist/client/_astro/BaseLayout.CdXCx7CB.css`, before the first rule), so none is ignored. The production build was loaded on all 20 routes and each of the 6 distinct URLs was requested on **20/20** routes. The three Roboto Mono imports are the same URL.

| `@import url(...)` | Partial | Requested by current build? | Action |
|---|---|---|---|
| `https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap` | `_typography` | yes (20/20) | `<link>` in BaseLayout, 1st |
| `https://fonts.googleapis.com/css?family=Roboto+Mono` | `_code` | yes (20/20) | `<link>`, 2nd (one tag covers all three) |
| `https://fonts.googleapis.com/css?family=Montserrat` | `_currency-converter` | yes (20/20) | `<link>`, 3rd |
| `https://fonts.googleapis.com/css?family=Muli&display=swap` | `_password-generator` | yes (20/20) | `<link>`, 4th |
| `https://fonts.googleapis.com/css?family=Source+Sans+Pro` | `_checkbox-styling` | yes (20/20) | `<link>`, 5th |
| `https://fonts.googleapis.com/css?family=Roboto+Mono` | `_pizza-pie` | yes (same URL) | covered by the 2nd `<link>` |
| `https://fonts.googleapis.com/css?family=Open+Sans&display=swap` | `_rollup-counter` | yes (20/20) | `<link>`, 6th |
| `https://fonts.googleapis.com/css?family=Roboto+Mono` | `_js-clock` | yes (same URL) | covered by the 2nd `<link>` |

The order above is the compiled order. Nothing is dropped. Source Sans Pro is requested but no rule uses `font-family: 'Source Sans Pro'`, so its font files are never fetched; keep its `<link>` anyway for fidelity.

## F. Screenshot masks

| Route | Selector | Reason |
|---|---|---|
| `project-pagination` (`/projects/pagination`) | `.map` | Google Maps tiles and labels are inherently non-deterministic. Task 13 renames this to `[data-testid="map"]` when `.map` becomes `styles.map` |

These are determinism measures in `tests/visual/stabilize.ts`, not masks. They are recorded so later diffs aren't misread:

- `settle()` waits for DOM quiescence (MutationObserver, 150 ms quiet, 5 s cap) after `networkidle` and `fonts.ready`, because CurrencyConverter, WeatherApp and NewsFeed swap a `!mounted` or loading fallback after hydration.
- `https://i.cbc.ca/**` is aborted: CBC thumbnails fail with `ERR_HTTP2_PROTOCOL_ERROR`, and HAR replay of that failure hangs. The images never render in the baselines.
- `https://maps.(googleapis|gstatic).com/**` is aborted: half-replayed Maps chunks broke the Pagination island. The pagination and weather baselines show Maps never loaded, so there is no map and no Places autocomplete.
- `workers: 2`: parallel rendering jitter produced a 1px full-page height flip on `home [dark]`.

## G. Widget roots

Every `*Widget.tsx` returns a bare fragment. The "missing wrapper" is `<CodeBlocks>` sitting **outside** `.code-content` in 4 of the 8 widgets. In the other 4 it sits inside, together with the description. See Plan impacts P9 before "fixing" it.

| Widget | Root component | Current root element | Missing wrapper? | Planned root |
|---|---|---|---|---|
| Checkbox Styling | `CheckboxStylingWidget.tsx` | fragment: `p` · `div.stage.checkboxes` › `Checkboxes` (fragment: `h2`, `div#forms-wrapper`, `br`) · `div.code-content` › [description, `CodeBlocks` `section.code`] | no | `<div className={styles.root}>` around the three |
| Currency Converter | `CurrencyConverterWidget.tsx` | fragment: `p` · `div.stage` › `CurrencyConverter` (`div.cc`) · `div.code-content` › [description] · `CodeBlocks` (`section.code`) | **yes**: `CodeBlocks` is outside `.code-content` | `styles.root` around all four |
| JS Clock | `ClockWidget.tsx` | fragment: `p` · `div.stage.clock` › `Clock` (`h3`) · `div.code-content` › [description, `CodeBlocks`] | no | `styles.root` |
| Pagination | `PaginationWidget.tsx` | fragment: `p` · `div.stage` › `Data` (`div.PaginationContainer`) · `div.code-content` › [description] · `CodeBlocks` | **yes**: `CodeBlocks` is outside `.code-content` | `styles.root` |
| Pizza Pie | `PizzaPieWidget.tsx` | fragment: `p` · `div.stage.pizza-pie` › `PizzaSlices` (fragment: `h1`, `p#how_many`, `form#pizza-form`, `div.piechart`, `div#eaten`) · `div.code-content` › [description, `CodeBlocks`] | no | `styles.root` |
| Random Password Generator | `PasswordGeneratorWidget.tsx` | fragment: `p` · `PasswordGenerator` (its root **is** `div.stage`) · `div.code-content` › [description] · `CodeBlocks` | **yes**: `CodeBlocks` is outside `.code-content`. Also the only widget whose `.stage` lives in the child component rather than the widget | `styles.root` |
| Rollup Counter | `RollupCounterWidget.tsx` | fragment: `p` · `div.stage` › `Counter` (fragment: `h1`, `span.count`, `div.buttons`) · `div.code-content` › [description, `CodeBlocks`] | no | `styles.root` |
| Weather App | `WeatherAppWidget.tsx` | fragment: `p` · `div.stage` › `WeatherApp` (`div.weatherContainer`) · `div.code-content` › [description] · `CodeBlocks` | **yes**: `CodeBlocks` is outside `.code-content` | `styles.root` |

Adding `styles.root` is pixel-neutral: no rule uses a child combinator or structural pseudo-class on `.content`'s children. Moving `CodeBlocks` inside `.code-content` is **not** pixel-neutral (P9).

## H. ID selectors

"JS?" was checked with `grep -rn "getElementById\|querySelector\|getElementsBy" src/components src/pages src/layouts`, excluding the CodeBlocks sample text. The only ID that JS reads is `forecastOutput`. Labels with `htmlFor` reference `newsletter-2`, `notifications-2`, `alerts-2`, `name`, `email` and `message`; none of those is styled.

| Selector | Partial | Element (file:line) | Used by JS? | Replacement class |
|---|---|---|---|---|
| `section#hero-section` | `_banner` | none | no | — (`delete`) |
| `#container` | `_checkbox-styling` | none (CodeBlocks sample text only) | no | — (`delete`) |
| `#checkboxes` (+ `.checkbox-label`, `input.checkbox-input`, `:focus`, dark, media) | `_checkbox-styling` | `checkbox-styling/Checkboxes.tsx:17` | no | `.checkboxes`. The `.stage` div's literal `checkboxes` class (`CheckboxStylingWidget.tsx:19`) is unstyled; leave it |
| `#switches` (+ `label`, `label span`, `::after`, `:checked + span`, dark) | `_checkbox-styling` | `Checkboxes.tsx:53` | no | `.switches` |
| `#forms-wrapper` | `_checkbox-styling` | `Checkboxes.tsx:14` | no | `.formsWrapper` |
| `form#form1` | `_checkbox-styling` | `Checkboxes.tsx:15` | no | `.form1` |
| `form#form2`, `#form2 label input` | `_checkbox-styling` | `Checkboxes.tsx:51` | no | `.form2` |
| `input#currency-input` | `_currency-converter` | `currency-converter/CurrencyConverter.tsx:250` (repeated per list item) | no | `.currencyAmount`. Not `.currencyInput`, which is already the parent `p.currency-input`. The ID-bearing rule (1,4,3) currently beats the 600px media rule `.cc .currency-info .currency-input input` (0,3,1); the class version (0,5,3) still does, so the mobile font-size stays `1.5rem` |
| `#ddl` (+dark) | `_pizza-pie` | `pizza-pie/PizzaSlices.tsx:65` | no | `.ddl` |
| `#eaten` (+dark) | `_pizza-pie` | `PizzaSlices.tsx:99` | no | `.eaten` |
| `input[type='range']#length`, `input#length:focus` | `_password-generator` | `random-password-generator/PasswordGenerator.tsx:146` | no | `.lengthSlider` |
| `#upper`, `#lower`, `#numbers`, `#symbols` | `_password-generator` | `PasswordGenerator.tsx:161, 174, 187, 200` | no | `.settingCheckbox` (one class for all four) |
| `.pwg-result-container #result` | `_password-generator` | none (the element is `#pwg-result`) | no | — (`delete`) |
| `button#generate.pwg-btn:hover/:focus` | `_password-generator` | `PasswordGenerator.tsx:207` | no | `.generate` (with `.pwgBtn`) |
| `button#clipboard` (+hover/focus, 400px media) | `_password-generator` | `PasswordGenerator.tsx:120` | no | `.clipboard` |
| `span#length_disp`, `span#length_disp.pwg` | `_password-generator` | `PasswordGenerator.tsx:150` | no | `.lengthDisp` |
| `div#msg`, `div#msg.fade-out` | `_password-generator` | `PasswordGenerator.tsx:134` | no | `.msg` (+ `.fadeOut`) |
| `#nprogress …` (8 parts) | `_nprogress` | none | no | — (`delete` with the partial) |
| `#increment`, `#reset` (+dark) | `_rollup-counter` | `rollup-counter/Counter.tsx:74, 71` | no | `.counterBtn` |
| `div#weatherOutput` | `_weatherApp` | none (the class `weatherOutput` exists, the ID doesn't) | no | — (`delete`) |
| `#forecastOutput`, `#forecastOutput h4` (+dark) | `_weatherApp` | `weather-app/WeatherApp.tsx:294` | **yes**: `getElementById('forecastOutput')` at `:73`, `:155`, `:221` | `.forecastOutput`; **keep `id`** |

Specificity check for the swaps. Each ID→class swap drops one ID column. The competing rules for these elements are either in the same partial, and so drop the same column, or are element-only globals (reset `button`/`select`/`input`, typography `h4`) that a class still beats. Swapping uniformly keeps the relative order in all cases above except where noted: `input#currency-input` is handled in its row, and `:where(.root) input[type='checkbox']` stays at (0,1,1) against `.checkboxes input.checkboxInput` (0,2,1), which matches today's relationship with (1,1,1).

## Plan impacts

**P1 — `_signin.scss` is not dead** (Tasks 17, 18, 19). `input[name='email']` gives the contact email input `padding: 0 10px` and `margin-bottom: 10px`; nothing else supplies those. `.dark ::placeholder` gives the weather search placeholder its dark `#ffffff`. Task 18 must carry the two declarations into `ContactForm.module.css`. Put them on the email input at a specificity that doesn't disturb `.formContainer input` and `.formContainer input.contactEmail`, e.g. as extra declarations on `.formContainer input.contactEmail`, because neither rule sets padding or margin-bottom. Task 17 must add the placeholder escape. Task 19's criterion ("rerun the Step 2 loop, every count must be 0") can't be met by either `_signin` (`.button` → 22 substring hits) or `_nprogress` (`.bar` → 5, "navbar"). Task 19 should instead confirm that the live rules above have moved and cite §A's runtime evidence.

**P2 — `article > p:nth-of-type(2)` (`_news`) is a blog-post rule in practice** (Tasks 9, 18). It pads the blog post's second paragraph (`40px`) and matches nothing on news feeds. It goes to `blog/[...slug].astro` as `article > :global(p:nth-of-type(2))`, not to NewsFeed.

**P3 — no web font is dropped** (Task 3). The brief's premise that some `@import`s are ignored doesn't hold for this build. All 6 URLs become `<link>` tags, in §E order.

**P4 — layer and specificity hazards that the visual gate can't see** (they occur only on hover or in dark mode after tokenisation):

- **H1, NewsFeed `.title`** (Tasks 5, 6, 18). In dark mode today the title is `#ffa804` only because `.dark a` (0,1,1) beats `.title` (0,1,0). Verified: dropping `.dark a` turns the titles `#047fa5`. Task 5 must give `.title` `color: var(--color-news-title)`. After Task 6 layers `a:hover` into `base`, the unlayered `.title` also beats `a:hover`, so light hover would stay `#047fa5` instead of `#ffa804`. Add `.title:hover { color: var(--color-link-hover) }` at Task 6. Dark titles are in the screenshots, so the gate would catch the first half; hover is not.
- **H2, weather credit link** `.widgetLeftMenu__link` (Tasks 5, 6, 17). Light hover `#ffa804` comes from `a:hover` today. Once `a:hover` is layered, the unlayered `.widgetLeftMenu__link` wins (`#484848`). Handled by the §C/§D `--color-weather-credit-hover` rule. It is only visible after a live search plus hover.
- **H3, CodeBlocks back link** (Task 6). It has both `backBtn` and `btnLink`. `a.backBtn` currently wins by source order. If `btnLink` lands in `code` (a later layer) and `backBtn` in `layout`, the order inverts; only `transition` differs (0.25s vs 0.2s), because every colour is equal (`#639` = `rebeccapurple`, `#fff` = `#ffffff`). §A puts both in `layout.css` in the original order.
- This list comes from inspection plus the removal tests. It is not exhaustive. Task 6 should specifically re-check hover and focus rules that lose to typography today.

**P5 — `h1 { color: var(--black) }` refers to an undefined property** (Task 5). Step 2's "replace every old custom property" must map `--black` to `--color-text`. This is verified pixel-neutral: 0 of 15 routes × 2 themes change.

**P6 — `input[type='checkbox']` from `_password-generator` styles the checkbox-styling widget** (Tasks 10, 15). Per-page CSS will drop it from `/projects/checkbox-styling` once Task 15 modularises it (checkbox `margin-right` `0` → `3px`). Add `:where(.root) input[type='checkbox'] { margin-right: 0; height: auto; min-width: auto; }` to `CheckboxStyling.module.css` in Task 10; it is harmless while the global copy still exists.

**P7 — WeatherApp finds its output by class name** (Task 17). `document.getElementsByClassName('weatherOutput')` at `WeatherApp.tsx:72`, `:149` and `:172` would find nothing once the class is `styles.weatherOutput`. Keep a stable hook: a literal `weatherOutput` class alongside the module class, an `id`, or a `ref`. This is on top of the `innerHTML` class interpolation the plan already covers.

**P8 — `_atom-dark.scss` is inert** (Tasks 6, 19). It has no computed effect anywhere today (§A). Task 6 appends it to `code.css`. The cheaper option is to delete it in Task 19 and let the gate confirm. Not blocking. Note that the spec's "Prism atom-dark theme follows the same token approach" has nothing to tokenise: the theme is theme-invariant, and the visible colours come from react-syntax-highlighter's inline styles.

**P9 — "missing wrapper" is four widgets, and fixing it is visible** (Tasks 11, 13, 15, 17). Currency, Pagination, Password Generator and Weather render `<CodeBlocks>` outside `.code-content`. Moving it inside changes the open code panel: its `<p class="red-msg">` takes `.code-content p` (`#000000`) instead of `p` (`#585858`) in light mode. Screenshots capture the panel closed, so the gate won't show it. Per the spec this needs an exceptions-log entry, and Peter should decide whether the fix is wanted. The styles-root wrapper alone is neutral.

**P10 — compound selectors with the global `.stage`** (Tasks 12, 14). `.stage.clock` and `.stage.pizza-pie` must become `:global(.stage).clock` and `:global(.stage).pizzaPie` in their modules to keep (0,2,0). `.clock` is on two elements (§B).

No partial fits no destination, no CSS was found that can't be made pixel-identical, and the only Sass features in use are those listed under §A.
