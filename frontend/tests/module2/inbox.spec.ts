import { test, expect } from '@playwright/test';
import { takeScreenshot } from '../helpers';

test.describe('Módulo 2 - Bandeja de Cargas', () => {
  test('M2-E2E-01: Bandeja de cargas carga y muestra KPIs', async ({ page }) => {
    const listPromise = page.waitForResponse(
      (resp) => resp.url().includes('/cargas?') && resp.request().method() === 'GET'
    );

    await page.goto('/module2/inbox', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1')).toContainText('Bandeja de Cargas');
    await expect(page.locator('text=Total Cargas')).toBeVisible();
    await expect(page.locator('text=Cargas Pendientes')).toBeVisible();
    await expect(page.locator('text=Cargas Publicadas')).toBeVisible();
    await expect(page.locator('text=Total de Registros')).toBeVisible();

    const response = await listPromise;
    expect(response.ok()).toBeTruthy();

    await takeScreenshot(page, 'm2-inbox-kpis.png');
  });

  test('M2-E2E-02: Listado de cargas se muestra en la bandeja', async ({ page }) => {
    await page.goto('/module2/inbox', { waitUntil: 'networkidle' });
    await expect(page.locator('main h1')).toContainText('Bandeja de Cargas');

    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('th', { hasText: 'ID Carga' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Estado' })).toBeVisible();

    await takeScreenshot(page, 'm2-inbox-listado.png');
  });
});
