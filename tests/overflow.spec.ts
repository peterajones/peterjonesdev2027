import { test, expect } from '@playwright/test';

// Horizontal-overflow gate.
//
// A page that is wider than the viewport scrolls sideways on a phone, and the
// overflowing content is unreachable because the site doesn't scroll
// horizontally. The visual suite can't catch this: it screenshots at
// `fullPage`, which expands to the content, so an overflowing page still
// matches its own baseline pixel-for-pixel.
//
// 390px is the standard iPhone 14/15/16 viewport; 320px is the narrowest
// phone still in use. Both are widths the layout has to survive, and the
// widths every measurement in docs/css-follow-ups.md is quoted at.
//
// Add routes here as they're fixed.
const ROUTES = [
  '/projects/random-password-generator',
  '/projects/pizza-pie',
  '/blog',
  '/projects',
  '/news',
  '/contact',
];

const WIDTHS = [390, 320];

test.describe('no horizontal overflow', () => {
  for (const path of ROUTES) {
    for (const width of WIDTHS) {
      test(`${path} @ ${width}px`, async ({ page }, testInfo) => {
        // Sets its own viewport, so it's width-independent — run it once.
        test.skip(testInfo.project.name !== 'mobile', 'run once, in the mobile project');
        await page.setViewportSize({ width, height: 844 });
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');

        const { clientWidth, scrollWidth, widest } = await page.evaluate(() => {
          const docEl = document.documentElement;
          const vw = docEl.clientWidth;

          // Only an element with no clipping/scrolling ancestor can widen the
          // document, so ignore anything inside an `overflow: hidden|auto` box
          // (the code panel's <span class="token"> runs, for instance).
          const escapes = (el: Element) => {
            let p = el.parentElement;
            while (p && p !== docEl) {
              if (getComputedStyle(p).overflowX !== 'visible') return false;
              p = p.parentElement;
            }
            return true;
          };

          let widest: string | null = null;
          let worst = vw;
          for (const el of docEl.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) continue;
            if (r.right <= worst || !escapes(el)) continue;
            worst = r.right;
            const cls = typeof el.className === 'string' ? el.className.trim() : '';
            widest = `<${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${
              cls ? '.' + cls.split(/\s+/).join('.') : ''
            }> right=${Math.round(r.right)}`;
          }
          return { clientWidth: vw, scrollWidth: docEl.scrollWidth, widest };
        });

        expect(
          scrollWidth,
          `page scrolls ${scrollWidth - clientWidth}px past the ${clientWidth}px viewport` +
            (widest ? `; widest unclipped element: ${widest}` : ''),
        ).toBe(clientWidth);
      });
    }
  }
});

// The header is `position: fixed`, so anything it pushes past the right edge
// is simply cut off: it never widens the document, and the scrollWidth check
// above can't see it. Measure the nav's own items instead. The widths are the
// ones the logo's shrink was tuned against: each breakpoint's edge (600, 400),
// the in-between band just above 400 (401), common phones (412, 390, 360), and
// the 320px floor.
const NAV_WIDTHS = [600, 412, 401, 390, 360, 320];

test.describe('navbar fits the viewport', () => {
  for (const width of NAV_WIDTHS) {
    test(`nav @ ${width}px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'run once, in the mobile project');
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const { rightmost, logoLeft, logoRatio } = await page.evaluate(() => {
        const items = [...document.querySelectorAll('nav a, nav button')]
          .map((el) => el.getBoundingClientRect())
          .filter((r) => r.width > 0);
        const logo = [...document.querySelectorAll<HTMLImageElement>('.logo img')]
          .find((img) => getComputedStyle(img).display !== 'none')!
          .getBoundingClientRect();
        return {
          rightmost: Math.max(...items.map((r) => r.right)),
          logoLeft: logo.left,
          logoRatio: logo.width / logo.height,
        };
      });

      expect(rightmost, 'a nav link or icon sits past the right edge').toBeLessThanOrEqual(width);
      expect(logoLeft, 'the logo is clipped at the left edge').toBeGreaterThanOrEqual(0);
      // 224×60 source image: the logo must scale, never squash.
      expect(logoRatio).toBeCloseTo(224 / 60, 1);
    });
  }
});
