import { test, expect, type Page } from '@playwright/test';
import { routes } from './visual/routes';

// Prerendered pages and public files are served without running Astro's
// middleware, so a header set in the wrong place would reach only some of
// these. The visual suite can't see any of this, and it replays recorded
// traffic, so it would never notice the policy blocking a real request.
const responses = [
  { kind: 'prerendered page', path: '/' },
  { kind: 'public file', path: '/favicon.png' },
  { kind: 'API route', path: '/api/rss/does-not-exist' },
  { kind: 'not found page', path: '/does-not-exist' },
];

for (const { kind, path } of responses) {
  test(`${kind} is sent the security headers`, async ({ request }) => {
    const { 'x-content-type-options': nosniff, 'strict-transport-security': hsts, 'content-security-policy': csp } =
      (await request.get(path)).headers();
    expect(nosniff).toBe('nosniff');
    expect(hsts).toMatch(/max-age=[1-9]/);
    expect(csp).toContain('script-src');
  });
}

async function collectViolations(page: Page) {
  const violations: string[] = [];
  await page.exposeFunction('reportViolation', (v: string) => violations.push(v));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { reportViolation(v: string): void }).reportViolation(
        `${e.effectiveDirective} blocked ${e.blockedURI}`,
      );
    });
  });
  return violations;
}

test('a script from an unlisted site is blocked', async ({ page }) => {
  const violations = await collectViolations(page);
  await page.goto('/');
  await page.evaluate(() => {
    const script = document.createElement('script');
    script.src = 'https://example.com/evil.js';
    document.head.append(script);
  });
  await expect.poll(() => violations).toContainEqual(expect.stringContaining('example.com/evil.js'));
});

test('a request to an unlisted site is blocked', async ({ page }) => {
  const violations = await collectViolations(page);
  await page.goto('/');
  await page.evaluate(() => fetch('https://example.com/steal').catch(() => {}));
  await expect.poll(() => violations).toContainEqual(expect.stringContaining('example.com/steal'));
});

test('another site cannot frame the page', async ({ request }) => {
  const csp = (await request.get('/')).headers()['content-security-policy'];
  expect(csp).toContain("frame-ancestors 'none'");
});

// Real network on purpose: this is the check that the policy allows what the
// site actually loads, so a replayed recording would prove nothing.
for (const { name, path } of routes) {
  test(`${name} loads with nothing blocked`, async ({ page }) => {
    test.setTimeout(60_000);
    const violations = await collectViolations(page);
    await page.goto(path, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});
    expect(violations).toEqual([]);
  });
}
