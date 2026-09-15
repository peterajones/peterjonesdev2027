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

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
