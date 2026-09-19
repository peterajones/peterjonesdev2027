# CSS Refactor — Size Before/After

Measured with `tests/visual/css-size.spec.ts` (desktop project), which loads
each route in the production build and sums the bytes of every `<link
rel="stylesheet">` response plus every inline `<style>` element in the page.
Both numbers are **uncompressed** bytes (no gzip/brotli).

**Before** (`docs/css-refactor-size-before.json`, recorded in Task 1 against
`main`): every route loaded the same single site-wide stylesheet compiled
from `globals.scss` — 41,472 bytes on every page, whether or not the route
used most of what was in it. Inline bytes were whatever the page already
inlined (the React widgets' small inline styles).

**After**: `tokens.css` + the layered globals (`reset`, `base`, `layout`,
`code`) compile to one shared stylesheet, now 13,970 bytes on every route
except `/projects/currency-converter`, which also loads its own
`CurrencyConverter.module.css` as a separate `<link>` (18,170 bytes
combined). Each `.astro` component's scoped `<style>` and each
`<Widget>.module.css` ship only on the routes that render that component,
which is why inline/module bytes now vary by route instead of a flat number.

| Route | Before (stylesheet) | Before (inline) | Before total | After (stylesheet) | After (inline) | After total | Change |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/` | 41,472 | 0 | 41,472 | 13,970 | 2,931 | 16,901 | −24,571 (−59.2%) |
| `/blog` | 41,472 | 0 | 41,472 | 13,970 | 264 | 14,234 | −27,238 (−65.7%) |
| `/blog/2026-09-15-hello-world` | 41,472 | 0 | 41,472 | 13,970 | 389 | 14,359 | −27,113 (−65.4%) |
| `/projects` | 41,472 | 0 | 41,472 | 13,970 | 702 | 14,672 | −26,800 (−64.6%) |
| `/projects/checkbox-styling` | 41,472 | 59 | 41,531 | 13,970 | 2,200 | 16,170 | −25,361 (−61.1%) |
| `/projects/currency-converter` | 41,472 | 59 | 41,531 | 18,170 | 59 | 18,229 | −23,302 (−56.1%) |
| `/projects/js-clock` | 41,472 | 59 | 41,531 | 13,970 | 335 | 14,305 | −27,226 (−65.6%) |
| `/projects/pagination` | 41,472 | 1,226 | 42,698 | 13,970 | 4,414 | 18,384 | −24,314 (−56.9%) |
| `/projects/pizza-pie` | 41,472 | 59 | 41,531 | 13,970 | 2,573 | 16,543 | −24,988 (−60.2%) |
| `/projects/random-password-generator` | 41,472 | 59 | 41,531 | 13,970 | 2,558 | 16,528 | −25,003 (−60.2%) |
| `/projects/rollup-counter` | 41,472 | 59 | 41,531 | 13,970 | 769 | 14,739 | −26,792 (−64.5%) |
| `/projects/weather-app` | 41,472 | 59 | 41,531 | 13,970 | 3,347 | 17,317 | −24,214 (−58.3%) |
| `/news` | 41,472 | 0 | 41,472 | 13,970 | 756 | 14,726 | −26,746 (−64.5%) |
| `/news/cbc-world-news` | 41,472 | 410 | 41,882 | 13,970 | 479 | 14,449 | −27,433 (−65.5%) |
| `/news/cbc-top-stories` | 41,472 | 410 | 41,882 | 13,970 | 479 | 14,449 | −27,433 (−65.5%) |
| `/news/cbc-toronto-news` | 41,472 | 410 | 41,882 | 13,970 | 479 | 14,449 | −27,433 (−65.5%) |
| `/news/cbc-technology-news` | 41,472 | 410 | 41,882 | 13,970 | 479 | 14,449 | −27,433 (−65.5%) |
| `/news/cnbc-international-news` | 41,472 | 410 | 41,882 | 13,970 | 479 | 14,449 | −27,433 (−65.5%) |
| `/news/euro-news` | 41,472 | 410 | 41,882 | 13,970 | 479 | 14,449 | −27,433 (−65.5%) |
| `/contact` | 41,472 | 59 | 41,531 | 13,970 | 1,265 | 15,235 | −26,296 (−63.3%) |
| **Total (20 routes)** | **829,440** | **4,158** | **833,598** | **281,470** | **27,566** | **309,036** | **−524,562 (−62.9%)** |

Every route drops, even the two heaviest after-state pages
(`/projects/pagination` at 18,384 bytes, `/projects/currency-converter` at
18,229 bytes) — both well under the old 41,472-byte flat cost every route
paid before. Site-wide CSS bytes fell 62.9% in aggregate.
