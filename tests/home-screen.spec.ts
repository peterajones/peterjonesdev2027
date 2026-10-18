import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { routes } from './visual/routes';

// iPhone "Add to Home Screen" (and Android "Install app").
//
// Safari reads the apple-* tags from whichever page is open, so every page
// needs them, not just the home page. The manifest and icons are fetched
// without cookies; there's no login on this site, but if one is ever added
// they must stay outside it or the home-screen app silently loses its name
// and icon.
//
// Runs against the production build (playwright.config.ts webServer), so the
// Content-Type checks cover the Node adapter's real static handler.

const SHORT_NAME = 'Peter Jones';

const pagesDir = fileURLToPath(new URL('../src/pages/', import.meta.url));

// PNG header: 8-byte signature, then IHDR — width, height, bit depth, colour type.
function pngInfo(buf: Buffer) {
  expect(buf.subarray(1, 4).toString('latin1')).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), colourType: buf[25] };
}

test.describe('home-screen app', () => {
  // Width-independent; run once.
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'run once, in the desktop project');
  });

  test('every page renders through BaseLayout', () => {
    // The tags live only in BaseLayout, so a page that bypassed it would
    // have none. API routes return JSON and don't count.
    const pages = (readdirSync(pagesDir, { recursive: true }) as string[]).filter((f) => f.endsWith('.astro'));
    expect(pages.length).toBeGreaterThan(0);
    for (const f of pages) {
      expect(readFileSync(pagesDir + f, 'utf8'), f).toMatch(/import BaseLayout from ['"][./]+\/layouts\/BaseLayout\.astro['"]/);
    }
  });

  for (const route of routes) {
    test(`head tags on ${route.path}`, async ({ request }) => {
      const res = await request.get(route.path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      const head = html.slice(0, html.indexOf('</head>'));
      expect(head).toContain('<link rel="manifest" href="/manifest.webmanifest">');
      expect(head).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png">');
      expect(head).toContain('<meta name="mobile-web-app-capable" content="yes">');
      expect(head).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');
      expect(head).toContain(`<meta name="apple-mobile-web-app-title" content="${SHORT_NAME}">`);
      expect(head).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="default">');
      expect(head).toMatch(/<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: light\)">/);
      expect(head).toMatch(/<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: dark\)">/);
    });
  }

  test('manifest is served as application/manifest+json and names its icons', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/^application\/manifest\+json/);

    const m = await res.json();
    expect(m.short_name).toBe(SHORT_NAME);
    expect(m.short_name.length).toBeLessThanOrEqual(12);
    expect(m.name).toBeTruthy();
    expect(m).toMatchObject({ start_url: '/', scope: '/', display: 'standalone' });
    expect(m.background_color).toMatch(/^#[0-9a-f]{6}$/);
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/);
    expect(m.icons.map((i: { sizes: string }) => i.sizes).sort()).toEqual(['192x192', '512x512']);
    for (const icon of m.icons) {
      expect(icon).toMatchObject({ type: 'image/png', purpose: 'any maskable' });
    }
  });

  test('every icon exists at its stated size and is opaque', async ({ request }) => {
    const m = await (await request.get('/manifest.webmanifest')).json();
    const icons: { src: string; sizes: string }[] = [
      ...m.icons,
      { src: '/apple-touch-icon.png', sizes: '180x180' },
    ];
    for (const { src, sizes } of icons) {
      const res = await request.get(src);
      expect(res.status(), src).toBe(200);
      expect(res.headers()['content-type'], src).toBe('image/png');
      const { width, height, colourType } = pngInfo(await res.body());
      expect(`${width}x${height}`, src).toBe(sizes);
      // 2 = RGB with no alpha channel. iOS paints transparency black.
      expect(colourType, src).toBe(2);
    }
  });
});
