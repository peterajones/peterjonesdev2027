import { test, expect } from '@playwright/test';

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
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('first visit: light, no attribute, nothing written to storage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
  });

  test('toggle flips theme and persists it', async ({ page }) => {
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  });

  test('blocked storage falls back to light without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
    });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(errors).toEqual([]);
  });
});
