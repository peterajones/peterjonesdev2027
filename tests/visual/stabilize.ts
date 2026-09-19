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
  // The CBC RSS feeds embed <img> thumbnails from i.cbc.ca inside item
  // descriptions. In this environment every request to that host fails at
  // the network level (net::ERR_HTTP2_PROTOCOL_ERROR) — consistently, and
  // only for that host (CNBC/Euronews feed items carry no images at all).
  // A live request fails fast, so recording captures it fine, but HAR
  // replay of a "failed before any response" entry doesn't resolve the
  // same way: the page-side request is left pending forever, so
  // `networkidle` never fires. Short-circuit it ourselves so the outcome
  // (image never loads) is identical but doesn't depend on replaying a
  // failure through the HAR. Registered after routeFromHAR so it runs
  // first (Playwright evaluates route handlers most-recently-added-first).
  await page.route('https://i.cbc.ca/**', (route) => route.abort());
  // Google Maps (pagination and weather-app projects) loads via its own
  // multi-chunk async bootstrap (a versioned main.js/common.js/map.js/...
  // sequence keyed off a `callback=` global). Under this suite's parallel
  // load, replaying that whole sequence from HAR is unreliable: chunks can
  // resolve out of the order the live loader expects, leaving
  // `window.google.maps` half-initialized (`Map is not a constructor`) —
  // an uncaught error that breaks the whole React island's render, not
  // just the map area. It never shows real tiles here anyway (the API key
  // isn't authorized for localhost — RefererNotAllowedMapError even when
  // the script loads cleanly), and the map region is already masked
  // (`masks['project-pagination']` in routes.ts), so both components
  // (Maps.tsx, WeatherApp.tsx) already treat `window.google` being absent
  // as the normal "not ready" case and no-op. Abort the whole family so
  // `window.google` never partially exists, instead of depending on HAR
  // replay of a script sequence that only works when fully serialized.
  await page.route(/^https:\/\/maps\.(googleapis|gstatic)\.com\//, (route) => route.abort());
}

export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Several React islands render a server-side "loading"/"unmounted" fallback
  // (e.g. CurrencyConverter's `!mounted` state, WeatherApp, NewsFeed's
  // "Loading feed...") that only becomes the real content once client-side
  // hydration runs and its effect fires. That hydration is a same-tick DOM
  // mutation, not a network request, so `networkidle` can resolve before or
  // during it — especially under the parallel load this suite runs with —
  // leaving a race between the fallback and real markup at screenshot time.
  // Wait for the DOM to go quiet (no mutations for 150ms) instead of
  // guessing a fixed delay, with a 5s cap so a page that's never mutating
  // doesn't wait needlessly and one that's still fetching doesn't hang.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let quietTimer: ReturnType<typeof setTimeout>;
        const finish = () => {
          observer.disconnect();
          clearTimeout(quietTimer);
          clearTimeout(capTimer);
          resolve();
        };
        const observer = new MutationObserver(() => {
          clearTimeout(quietTimer);
          quietTimer = setTimeout(finish, 150);
        });
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
        quietTimer = setTimeout(finish, 150);
        const capTimer = setTimeout(finish, 5000);
      }),
  );
}
