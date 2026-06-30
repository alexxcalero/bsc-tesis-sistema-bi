import { test, expect } from '@playwright/test';
import { takeScreenshot } from '../helpers';

test.describe('Módulo 1 - Clientes', () => {
  test('M1-E2E-04: Listado de clientes carga correctamente', async ({ page }) => {
    const listPromise = page.waitForResponse(
      (resp) => resp.url().includes('/clientes?') && resp.request().method() === 'GET'
    );

    await page.goto('/module1/clients', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1')).toContainText('Clientes 360');
    await expect(page.locator('text=Total de Clientes')).toBeVisible();
    await expect(page.locator('text=Personas Naturales')).toBeVisible();
    await expect(page.locator('text=Personas Jurídicas')).toBeVisible();

    const response = await listPromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
    await takeScreenshot(page, 'm1-clients-listado.png');
  });
});
