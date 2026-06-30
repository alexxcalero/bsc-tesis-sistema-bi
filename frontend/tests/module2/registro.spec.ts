import { test, expect } from '@playwright/test';
import { takeScreenshot } from '../helpers';

async function loginViaApi(page: any, username: string, password: string) {
  const response = await page.context().request.post('http://localhost:8080/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/json' },
    data: { username, password },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const token = body.token;

  await page.addInitScript((t: string) => {
    localStorage.setItem('bi_token', t);
  }, token);
}

test.describe('Módulo 2 - Registro de Carga', () => {
  test('M2-E2E-03: El formulario rechaza el envío sin archivo', async ({ page }) => {
    await loginViaApi(page, 'especialista', 'especialista123');

    const catalogPromise = page.waitForResponse(
      (resp: any) => resp.url().includes('/catalogos/tipos-carga') && resp.request().method() === 'GET'
    );

    await page.goto('/module2/registro', { waitUntil: 'networkidle' });

    await expect(page.locator('main h1')).toContainText('Registro de Proceso de Carga');

    const response = await catalogPromise;
    expect(response.ok()).toBeTruthy();

    const tipoTrigger = page.locator('[data-slot="select-trigger"]', { hasText: 'Selecciona tipo de carga' });
    await expect(tipoTrigger).toBeVisible({ timeout: 30000 });
    await tipoTrigger.click();

    const firstOption = page.locator('[data-slot="select-item"]').first();
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    await page.locator('input[placeholder="Ej: Carga_Enero_2025"]').fill('Carga_E2E_Prueba');

    const submitButton = page.getByRole('button', { name: /Iniciar Proceso de Carga/i });
    await expect(submitButton).toBeDisabled();

    await expect(page.locator('text=Por favor complete todos los campos requeridos')).not.toBeVisible();

    await takeScreenshot(page, 'm2-registro-rechaza-archivo-vacio.png');
  });
});
