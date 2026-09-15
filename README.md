# peterjones.dev (2027 rebuild)

Rebuild of the site on Astro, replacing Next.js/Netlify. See `CLAUDE.md` /
`AGENTS.md` for Astro-specific agent notes.

## Requirements

Astro 7 requires **Node >= 22.12**. If your default `node` is older (check
with `node -v`), use a newer one just for this project, e.g.:

```sh
nvm install 22
nvm use 22
```

## Architecture

- **Static by default.** Most pages (`/`, `/projects`, `/news`, the news
  detail pages) are plain prerendered HTML — no framework JS ships unless a
  page actually needs it.
- **React islands for interactivity.** Each project demo under `/projects/*`
  and the news reader mount a React component with `client:load` — isolated
  per page, not loaded site-wide. See `src/pages/projects/js-clock/index.astro`
  for the reference pattern (widget component + `CodeBlocks.tsx` showing the
  original vanilla HTML/CSS/JS + a `*Widget.tsx` wiring up the description/
  code toggles) — all eight `/projects/*` pages now follow it.
- **Google Maps, when a widget needs it**, loads via
  `src/components/GoogleMapsScript.astro` rather than a per-page script tag —
  conditional on `PUBLIC_GOOGLE_MAPS_API_KEY`, bridging its load callback to a
  `google-maps-loaded` window event so a component can pick it up whether it
  mounts before or after the script finishes (used by `weather-app` and
  `pagination`).
- **Two server endpoints**, via the Node adapter (`@astrojs/node`, standalone
  mode) — everything else is prerendered static output:
  - `POST /api/contact` — the contact form. See `src/lib/mailer.ts` /
    `src/lib/rateLimit.ts`.
  - `GET /api/rss/[feed]` — CORS proxy for the RSS feeds (config in
    `src/config/news.ts`), replacing 6 duplicated Next.js API routes.
- **Content Collections** (`src/content.config.ts`) for content that's
  genuinely a list of documents rather than app config — currently `blog`
  (`/blog`, `/blog/[...slug]`, one seed post so far — dormant until real
  posts are written) and `updates` (the navbar's "Latest Updates" modal,
  27 entries migrated off a flat `src/config/updates.ts` array). Each entry
  is a Markdown file under `src/content/<collection>/`; `updates` entries
  use their filename as the unique id (not the date — several entries
  intentionally share a date) with only `date` in frontmatter and the
  changelog text as the file body. Uses Astro 7.3's current loader API
  (`glob()` from `astro/loaders`, `z` from `astro/zod` — not `astro:content`,
  deprecated there and removed in Astro 8).

## Styling gotcha: `src/styles/partials/*.scss` is all global

`globals.scss` `@use`-concatenates every partial into one shared
stylesheet — there's no per-component scoping between them (unlike Astro's
own `<style>` blocks in `.astro` files, which *do* auto-scope). A bare
tag selector in any partial (e.g. `span { ... }`, `input { ... }`) applies
to that element **everywhere on the site**, not just the widget the partial
is named for. This has already caused two real bugs, both from leftover
selectors that made sense in whatever more-isolated context they were
originally written for, but not once concatenated globally:
- an unscoped `span { display: inline-block; }` in `_rollup-counter.scss`
  broke every project's syntax-highlighted code block (a `\n` inside an
  `inline-block` box doesn't propagate a line break to the surrounding
  flow, even under `white-space: pre`) — fixed by removing it, since
  `span.count` already covers what that widget actually needs.
- unscoped `label`/`input`/`textarea` in `_contactForm.scss` forced
  `min-width: 300px; height: 50px` onto every input/textarea/label
  site-wide — fixed by scoping to `.form-container`.

When adding to an existing partial or writing a new one, scope selectors
to that widget's actual class/container rather than bare tag names, unless
the rule is genuinely meant to be global (as in `_typography.scss`,
`_reset.scss`, `_footer.scss`, `_layout.scss` — site-wide by design).

## Environment variables

Copy `.env.example` to `.env` for local dev. In Coolify, set these as env
vars on the app instead of shipping a `.env` file. See that file for the
full list (SMTP settings for the contact form, plus the client-exposed
Google Maps / OpenWeatherMap / ExchangeRatesAPI keys used by the weather-app,
pagination, and currency-converter widgets).

Server-only code (`src/lib/mailer.ts`, `src/pages/api/contact.ts`) reads
`process.env` directly rather than `import.meta.env`, matching how Coolify
injects real environment variables at the OS level in production (no `.env`
file is ever shipped there). Vite's dev server only loads `.env` into
`import.meta.env`, not `process.env` — `astro.config.mjs` mirrors it in via
Node's `process.loadEnvFile()` so `astro dev` sees the same values locally.
No-op when `.env` doesn't exist (Docker build, CI, production), so this
doesn't affect the deployed app.

## Commands

| Command             | Action                                       |
| -------------------- | --------------------------------------------- |
| `npm install`         | Install dependencies                          |
| `npm run dev`          | Start local dev server at `localhost:4321`     |
| `npm run build`        | Build production output to `./dist/`           |
| `npm run preview`      | Preview the build locally                      |
| `npx astro check`      | Type-check the project                        |

## Deployment (Coolify)

The `Dockerfile` builds and runs the Node-adapter standalone server on port
4321. Point a Coolify app at this repo with the Dockerfile build pack, set
the env vars above, and it's a normal container deploy — no
framework-specific hosting integration needed.

**Live test deployment:** deployed to a self-hosted Coolify instance (public
GitHub repo, no deploy key needed). Currently reachable only at its
Coolify-assigned `*.sslip.io` test URL — no custom domain attached yet.
(Coolify gives every app a working HTTPS-less URL this way before a real
domain is attached, by resolving `<anything>.<server-ip>.sslip.io` straight
to that server.) Infra specifics (instance URL, server IP, test URL) are
intentionally not listed here since this repo is public — see local
deployment notes.

To attach a real domain: Coolify → app → **Domains**, add it, point an
A/AAAA record at the server's IP, and Coolify's built-in proxy
auto-provisions a Let's Encrypt cert once DNS resolves.

**Push-to-deploy is configured**: a manual GitHub webhook (Coolify app →
**Git** → **Webhooks**, the "Manual Git webhooks" → GitHub section — not
the GitHub App source) is registered on this repo, so pushes to `main`
auto-trigger a deploy. This works independent of which Source (public URL
vs. GitHub App) the app uses, since the webhook lives on the app resource
itself.

Build-pack settings Coolify needs (already set on the test app): Dockerfile
build strategy, base directory `/`, Dockerfile location `/Dockerfile`, port
`4321`. The `PUBLIC_*` env vars must be marked "available at buildtime" —
they get baked into the client bundle during `npm run build`, which runs in
the Docker build stage, not at container start.

**Known issue found in this test deploy:** the run-stage of `Dockerfile`
originally copied only `dist/`, but the Node adapter's standalone build
doesn't bundle every dependency into `entry.mjs` (e.g. `devalue`, used for
session/actions serialization, stays an external `import`) — the container
crash-looped with `ERR_MODULE_NOT_FOUND: Cannot find package 'devalue'`,
which surfaced to the browser as a generic Traefik 404 (not an app error
page) since nothing was listening on 4321. Fixed by pruning dev deps out of
the build stage (`npm prune --omit=dev`) and copying that `node_modules`
into the run stage alongside `dist` (see git log for the fix commit).

**Known issue, fixed:** Google Places autocomplete (weather-app's city
search) errored in this test deploy. Two separate causes, both on the
Google Cloud side rather than app code:
1. The API key's HTTP-referrer allowlist didn't include the test/dev URLs
   being used — add each origin you test from (`localhost:<port>`, the
   Coolify test URL, the eventual production domain) under the key's
   **Website restrictions** in Cloud Console.
2. `google.maps.places.AutocompleteService`/`PlacesService` (what the code
   originally used) were discontinued for any API key/project created after
   **March 1, 2025** — Google's console error names the replacement
   (`AutocompleteSuggestion`), which `WeatherApp.tsx` now uses. That class
   calls a different endpoint (`places.googleapis.com`, "Places API (New)")
   than the legacy client library, so the key's **API restrictions** also
   need "Places API (New)" checked, separately from the legacy "Places API"
   that was already allowed.

A harmless, cosmetic `InvalidValueError: <callback> is not a function`
console error can also show up from Google's own Maps JS loader when using
the classic `callback=` URL-param loading style — confirmed to originate
inside Google's script (reproducible with extensions disabled) and to have
no effect on functionality. Left as-is rather than risk a larger loader
rewrite to silence a console-only message.

## Status

Everything is ported: layout/nav/footer, home page, projects index, all
eight `/projects/*` demos (`js-clock`, `rollup-counter`, `checkbox-styling`,
`pizza-pie`, `random-password-generator`, `currency-converter`,
`weather-app`, `pagination`), the full news section (config-driven,
consolidated RSS proxy), and the contact form + API (verified sending real
mail through the production build). No pages remain stubbed.

A few ports deliberately diverge from a literal copy of the 2026 Next.js
source, in each case to fix a real bug found while testing rather than
reproduce it, or to avoid a new dependency this project doesn't otherwise
use (no FontAwesome, no axios, no `@react-google-maps/api` —
`react-transition-group` specifically is broken under this project's React
19, see the git log for `rollup-counter`). Check each project's port commit
message for specifics before assuming its code matches the old site 1:1.

Coolify deployment: done as a test deploy, Dockerfile and Google Places API
issues both found and fixed (see Deployment section above), push-to-deploy
configured. Not yet done: custom domain + TLS.

Blog: scaffolded on Content Collections (see Architecture above), one seed
post, not linked to a real domain yet — dormant until then.
