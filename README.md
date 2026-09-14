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
  for the reference pattern; the other project pages are stubs pointing back
  at the 2026 (Next.js) source until ported the same way.
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
Google Maps / OpenWeatherMap / ExchangeRatesAPI keys once those widgets are
ported).

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

## What's ported vs. still pending

Ported end-to-end: layout/nav/footer, home page, projects index, the
`js-clock` project (as the reference island pattern), the full news section
(config-driven, consolidated RSS proxy), and the contact form + API.

Still stubbed (pages exist, link correctly, but render a "not yet ported"
note): `currency-converter`, `weather-app`, `random-password-generator`,
`pagination`, `checkbox-styling`, `pizza-pie`, `rollup-counter`. Port each
by copying its React component from the 2026 repo's `Components/projects/*`,
dropping the `next/*` imports, and mounting it as an island the way
`ClockWidget` is mounted in `src/pages/projects/js-clock/index.astro`.
