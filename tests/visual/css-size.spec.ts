import { test } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { routes } from './routes';

test('CSS bytes per route', async ({ page }, testInfo) => {
  const out = process.env.CSS_SIZE_OUT;
  test.skip(!out, 'set CSS_SIZE_OUT=<path> to measure');
  test.skip(testInfo.project.name !== 'desktop', 'measured once, on desktop');

  const results: { route: string; stylesheetBytes: number; inlineStyleBytes: number }[] = [];
  for (const route of routes) {
    const bodies: Promise<number>[] = [];
    const onResponse = (resp: import('@playwright/test').Response) => {
      if (resp.request().resourceType() === 'stylesheet' && resp.url().startsWith('http://localhost')) {
        bodies.push(resp.body().then((b) => b.length));
      }
    };
    page.on('response', onResponse);
    await page.goto(route.path);
    await page.waitForLoadState('networkidle');
    page.off('response', onResponse);
    const stylesheetBytes = (await Promise.all(bodies)).reduce((a, b) => a + b, 0);
    const inlineStyleBytes = await page.evaluate(() =>
      [...document.querySelectorAll('style')].reduce((n, s) => n + (s.textContent?.length ?? 0), 0),
    );
    results.push({ route: route.path, stylesheetBytes, inlineStyleBytes });
  }
  mkdirSync(dirname(out!), { recursive: true });
  writeFileSync(out!, JSON.stringify(results, null, 2));
});
