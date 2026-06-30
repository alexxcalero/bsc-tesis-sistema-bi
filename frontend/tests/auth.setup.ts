import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as analista', async ({ page }) => {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    console.log(`PAGE EXCEPTION: ${err.message}`);
  });

  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#username') !== null, { timeout: 60000 });
  await page.fill('#username', 'analista');
  await page.fill('#password', 'analista123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/module1/dashboard', { timeout: 60000 });
  await expect(page.locator('h1, h2, h3').first()).toBeVisible();

  await page.context().storageState({ path: authFile });
});
