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

Not yet done: the actual Coolify deployment.
