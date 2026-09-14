// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import node from '@astrojs/node';

// Server-only code (src/lib/mailer.ts, src/pages/api/contact.ts) reads
// process.env directly rather than import.meta.env, matching how Coolify
// injects real environment variables in production (see README — no .env
// file is shipped there). Vite's dev server only loads .env into
// import.meta.env, not process.env, so mirror it in for local dev. No-op
// when .env doesn't exist (Docker build, CI, production).
try {
  process.loadEnvFile();
} catch {
  // .env not present — expected outside local dev.
}

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  adapter: node({
    mode: 'standalone'
  })
});