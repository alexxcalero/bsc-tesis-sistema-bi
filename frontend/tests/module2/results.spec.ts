import { test, expect } from '@playwright/test';
import { takeScreenshot } from '../helpers';

test.describe('Módulo 2 - Consulta de Resultados', () => {
  test('M2-E2E-04: Página de resultados carga y muestra totales', async ({ page }) => {
    const listPromise = page.waitForResponse(
      (resp) => resp.url().includes('/cargas?') && resp.request().method() === 'GET'
    );
    const summaryPromise = page.waitForResponse(
      (resp) => resp.url().includes('/cargas/estadisticas/resumen') && resp.request().method() === 'GET'
    );

    await page.goto('/module2/results', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1')).toContainText('Consulta de Resultados y Errores');

    const [listResponse, summaryResponse] = await Promise.all([listPromise, summaryPromise]);
    expect(listResponse.ok()).toBeTruthy();
    expect(summaryResponse.ok()).toBeTruthy();

    await expect(page.locator('text=Cargas Publicadas')).toBeVisible();
    await expect(page.locator('text=Total Procesados')).toBeVisible();
    await expect(page.locator('text=Registros Válidos')).toBeVisible();
    await expect(page.locator('text=Errores Totales')).toBeVisible();

    await takeScreenshot(page, 'm2-results-totales.png');
  });

  test('M2-E2E-05: Tabla de cargas ejecutadas se muestra en resultados', async ({ page }) => {
    await page.goto('/module2/results', { waitUntil: 'networkidle' });
    await expect(page.locator('main h1')).toContainText('Consulta de Resultados y Errores');

    await expect(page.locator('h3', { hasText: 'Cargas Ejecutadas' })).toBeVisible();
    await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('th', { hasText: 'ID Carga' })).toBeVisible();

    await takeScreenshot(page, 'm2-results-listado.png');
  });
});
