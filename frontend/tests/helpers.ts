import * as fs from 'fs';
import * as path from 'path';
import type { Page } from '@playwright/test';

export const EVIDENCIAS_DIR = path.resolve(__dirname, '../../evidencias/pruebas/e2e');

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(EVIDENCIAS_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(EVIDENCIAS_DIR, name),
    fullPage: true,
  });
}
