import { test, expect } from '@playwright/test';
import { routes } from './routes';
import { stabilize, settle, type Theme } from './stabilize';

const themes: Theme[] = ['light', 'dark'];

for (const theme of themes) {
  for (const route of routes) {
    test(`${route.name} [${theme}]`, async ({ page }, testInfo) => {
      const harPath = `tests/visual/.har/${testInfo.project.name}/${route.name}-${theme}.har`;
      await stabilize(page, { theme, harPath });
      await page.goto(route.path);
      await settle(page);
      await expect(page).toHaveScreenshot(`${route.name}-${theme}.png`, {
        fullPage: true,
        mask: (route.mask ?? []).map((sel) => page.locator(sel)),
      });
    });
  }
}
