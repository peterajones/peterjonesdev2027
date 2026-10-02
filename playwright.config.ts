import { defineConfig } from '@playwright/test';

const PORT = 4399;

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  retries: 0,
  // Half the CPU cores (Playwright's default, stated so it's visible): 6 on
  // the 12-core dev machine. This was capped at 2 from September 2026 after
  // the default occasionally produced a genuine 1px total-page-height
  // difference on the longest page (home, dark, desktop) under parallel
  // load. Retested 2026-10-02, after the CSS rebuild had changed that page:
  // 20 consecutive visual runs at 6 workers (1,600 zero-tolerance
  // comparisons) were all clean, at ~19s a run against ~46s at 2. If that
  // 1px race comes back, set this to 2 again rather than raising
  // expect.timeout, which would only hide it.
  workers: '50%',
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    // threshold: 0 makes "zero tolerance" literal. Without it Playwright's
    // default per-pixel threshold (0.2) let any colour shift under ~20% pass
    // unnoticed: merging #4a4a4a into #464646 moved 915,000 pixels and every
    // screenshot still "matched". Rendering here is deterministic enough for
    // exact comparison: 15 consecutive full runs on 2026-10-02 (1,200
    // comparisons) were all clean.
    toHaveScreenshot: { maxDiffPixels: 0, threshold: 0, animations: 'disabled', caret: 'hide', scale: 'css' },
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
