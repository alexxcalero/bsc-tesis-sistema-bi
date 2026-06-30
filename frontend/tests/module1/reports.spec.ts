import { test, expect } from '@playwright/test';
import { takeScreenshot } from '../helpers';

test.describe('Módulo 1 - Reportes', () => {
  test('M1-E2E-05: Página de reportes carga y muestra reportes disponibles', async ({ page }) => {
    const reportsPromise = page.waitForResponse(
      (resp) => resp.url().includes('/reportes') && resp.request().method() === 'GET'
    );

    await page.goto('/module1/reports', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1')).toContainText('Reportes y Exportación');

    const response = await reportsPromise;
    expect(response.ok()).toBeTruthy();

    await expect(page.locator('h2', { hasText: 'Reportes Disponibles' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Generador de Reportes' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Generar y Descargar CSV/i })).toBeVisible();

    await takeScreenshot(page, 'm1-reports-disponibles.png');
  });

  test('M1-E2E-06: Generar un reporte en CSV', async ({ page }) => {
    await page.goto('/module1/reports', { waitUntil: 'networkidle' });
    await expect(page.locator('main h1')).toContainText('Reportes y Exportación');

    const generateButton = page.getByRole('button', { name: /Generar y Descargar CSV/i });
    await expect(generateButton).toBeEnabled({ timeout: 30000 });

    const generatePromise = page.waitForResponse(
      (resp) => resp.url().includes('/reportes/') && resp.url().includes('/generar') && resp.request().method() === 'POST',
      { timeout: 60000 }
    );

    const downloadPromise = page.waitForEvent('download', { timeout: 60000 });

    await generateButton.click();

    const response = await generatePromise;
    expect(response.ok()).toBeTruthy();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.(csv|txt)$/i);

    await expect(page.locator('text=Error al generar reporte')).not.toBeVisible();
    await takeScreenshot(page, 'm1-reports-generado.png');
  });
});
