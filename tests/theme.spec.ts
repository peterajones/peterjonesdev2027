import { test, expect, type Page } from '@playwright/test';

const stored = (page: Page) => page.evaluate(() => localStorage.getItem('theme'));
const html = (page: Page) => page.locator('html');

test.describe('theme', () => {
  test('stored dark theme is applied before <body> exists (no flash)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
      const order: string[] = [];
      (window as unknown as { __order: string[] }).__order = order;
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.type === 'attributes') order.push('theme');
          else r.addedNodes.forEach((n) => n.nodeName === 'BODY' && order.push('body'));
        }
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-theme'] });
    });
    await page.goto('/');
    const order = await page.evaluate(() => (window as unknown as { __order: string[] }).__order);
    expect(order).toContain('theme');
    expect(order.indexOf('theme')).toBeLessThan(order.indexOf('body'));
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  });

  test('first visit, OS light: light, nothing written to storage', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(html(page)).not.toHaveAttribute('data-theme', 'dark');
    expect(await stored(page)).toBeNull();
  });

  test('first visit, OS dark: dark before <body> exists, nothing written to storage', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      const order: string[] = [];
      (window as unknown as { __order: string[] }).__order = order;
      new MutationObserver((records) => {
        for (const r of records) {
          if (r.type === 'attributes') order.push('theme');
          else r.addedNodes.forEach((n) => n.nodeName === 'BODY' && order.push('body'));
        }
      }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-theme'] });
    });
    await page.goto('/');
    const order = await page.evaluate(() => (window as unknown as { __order: string[] }).__order);
    expect(order.indexOf('theme')).toBeGreaterThanOrEqual(0);
    expect(order.indexOf('theme')).toBeLessThan(order.indexOf('body'));
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    expect(await stored(page)).toBeNull();
  });

  test('a stored choice beats the OS setting', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('theme', 'light'));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    await expect(html(page)).not.toHaveAttribute('data-theme', 'dark');

    await page.evaluate(() => localStorage.setItem('theme', 'dark'));
    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  });

  for (const os of ['light', 'dark'] as const) {
    const other = os === 'light' ? 'dark' : 'light';
    test(`toggle with OS ${os}: stores ${other}, then clears the choice on the way back`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: os });
      await page.goto('/');
      await page.locator('#theme-toggle').click();
      await expect(html(page)).toHaveAttribute('data-theme', other);
      expect(await stored(page)).toBe(other);
      // Back to what the OS already uses: no choice to remember, so follow the OS again.
      await page.locator('#theme-toggle').click();
      await expect(html(page)).toHaveAttribute('data-theme', os);
      expect(await stored(page)).toBeNull();
    });
  }

  test('follows a live OS change while no choice is stored, and not once one is', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html(page)).not.toHaveAttribute('data-theme', 'dark');

    await page.locator('#theme-toggle').click(); // stores dark
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
  });

  test('blocked storage follows the OS and the toggle still works, without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    });
    await page.goto('/');
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    expect(errors).toEqual([]);
  });
});
