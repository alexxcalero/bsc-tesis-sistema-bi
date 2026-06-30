# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate as analista
- Location: tests\auth.setup.ts:5:6

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Test source

```ts
  1  | import { test as setup, expect } from '@playwright/test';
  2  | 
  3  | const authFile = 'playwright/.auth/user.json';
  4  | 
  5  | setup('authenticate as analista', async ({ page }) => {
  6  |   page.on('console', (msg) => {
  7  |     if (msg.type() === 'error') {
  8  |       console.log(`PAGE ERROR: ${msg.text()}`);
  9  |     }
  10 |   });
  11 |   page.on('pageerror', (err) => {
  12 |     console.log(`PAGE EXCEPTION: ${err.message}`);
  13 |   });
  14 | 
> 15 |   await page.goto('/login', { waitUntil: 'networkidle' });
     |              ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  16 |   await page.evaluate(() => localStorage.clear());
  17 |   await page.reload({ waitUntil: 'networkidle' });
  18 |   await page.waitForFunction(() => document.querySelector('#username') !== null, { timeout: 60000 });
  19 |   await page.fill('#username', 'analista');
  20 |   await page.fill('#password', 'analista123');
  21 |   await page.click('button[type="submit"]');
  22 |   await page.waitForURL('/module1/dashboard', { timeout: 60000 });
  23 |   await expect(page.locator('h1, h2, h3').first()).toBeVisible();
  24 | 
  25 |   await page.context().storageState({ path: authFile });
  26 | });
  27 | 
```