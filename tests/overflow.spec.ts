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
// Deliberately narrow for now — it guards the one route fixed in this commit.
// `/projects/pizza-pie` also overflows (5px at 390px, 40px at 320px), as do
// several routes at 320px only; those are item 15 in docs/css-follow-ups.md
// and each needs its own fix and baselines. Add routes here as they're fixed.
const ROUTES = ['/projects/random-password-generator'];

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
