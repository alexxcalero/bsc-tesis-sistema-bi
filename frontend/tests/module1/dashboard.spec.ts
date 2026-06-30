import { test, expect } from '@playwright/test';

test.describe('Módulo 1 - Dashboard', () => {
  test('M1-E2E-01: Login y visualización del dashboard', async ({ page }) => {
    await page.goto('/module1/dashboard');
    await page.waitForURL('/module1/dashboard');

    await expect(page).toHaveURL('/module1/dashboard');
    await expect(page.locator('body')).toContainText(/dashboard/i);

    await page.screenshot({ path: '../evidencias/pruebas/e2e/dashboard-piloto.png', fullPage: true });
  });
});
