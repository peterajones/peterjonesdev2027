import { defineConfig } from '@playwright/test';

const PORT = 4399;

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/visual/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  retries: 0,
  // Default worker count (half the CPU cores = 6 on this machine) was
  // observed to occasionally produce a genuine 1px total-page-height
  // difference on the longest page (home, dark, desktop) between otherwise
  // identical runs — reproduced 0/5 times at workers:1, so it's rendering
  // contention under parallel load, not app or test nondeterminism. Capped
  // instead of raising expect.timeout, since that would only paper over
  // the same race with more retries rather than reducing the contention
  // causing it.
  workers: 2,
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
