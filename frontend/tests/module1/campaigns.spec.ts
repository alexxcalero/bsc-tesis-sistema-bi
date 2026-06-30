import { test, expect } from '@playwright/test';
import { takeScreenshot } from '../helpers';

test.describe('Módulo 1 - Campañas', () => {
  test('M1-E2E-02: Listado de campañas carga y muestra datos', async ({ page }) => {
    const listPromise = page.waitForResponse(
      (resp) => resp.url().includes('/campanias?') && resp.request().method() === 'GET'
    );

    await page.goto('/module1/campaigns', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1')).toContainText('Campañas Comerciales');
    await expect(page.getByText('Total de Campañas', { exact: true })).toBeVisible();
    await expect(page.getByText('Campañas Activas', { exact: true })).toBeVisible();

    const response = await listPromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
    await takeScreenshot(page, 'm1-campaigns-listado.png');
  });

  test('M1-E2E-03: Filtro de estado en listado de campañas', async ({ page }) => {
    await page.goto('/module1/campaigns', { waitUntil: 'networkidle' });
    await expect(page.locator('main h1')).toContainText('Campañas Comerciales');

    const estadoTrigger = page.locator('div:has(> label:has-text("Estado")) [data-slot="select-trigger"]').first();
    await expect(estadoTrigger).toBeVisible();
    await estadoTrigger.click();

    await page.getByRole('option', { name: 'Activa', exact: true }).click();

    const filteredPromise = page.waitForResponse(
      (resp) => resp.url().includes('/campanias?') && resp.url().includes('estado=ACTIVA') && resp.request().method() === 'GET'
    );
    const response = await filteredPromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
    await takeScreenshot(page, 'm1-campaigns-filtro-estado.png');
  });
});
