import { expect, test, type Locator, type Page } from '@playwright/test';

async function resetBrowserState(page: Page) {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
}

async function openBlankWorkspace(page: Page) {
  await resetBrowserState(page);
  const welcome = page.getByRole('dialog', { name: 'Welcome to DES System Builder' });
  await expect(welcome).toBeVisible();
  await welcome.getByRole('button', { name: /New System/ }).click();
  await expect(welcome).toBeHidden();
}

async function addCatalogProduct(page: Page, category: string, type: string, productId: string) {
  await page.getByTitle(category).click();
  await page.getByRole('button', { name: new RegExp(`^${type}\\b`) }).click();
  const selector = page.getByRole('dialog', { name: type });
  await expect(selector).toBeVisible();
  await selector.getByLabel('Model').selectOption(productId);
  await selector.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(selector).toBeHidden();
}

async function dragBy(page: Page, locator: Locator, dx: number, dy: number) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element has no bounding box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
}

async function connectTerminals(page: Page, source: Locator, target: Locator) {
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();
  if (!sourceBox || !targetBox) throw new Error('Terminal has no bounding box');
  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 8 });
  await page.mouse.up();
}

test('startup surfaces internal-release guidance and supports keyboard dismissal', async ({ page }) => {
  await resetBrowserState(page);
  const dialog = page.getByRole('dialog', { name: 'Welcome to DES System Builder' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Changelog' })).toBeVisible();
  await expect(dialog).toContainText('working first copy for internal evaluation only');
  const firstAction = dialog.getByRole('button', { name: /New System/ });
  const lastAction = dialog.getByRole('button', { name: /Load Default System/ });
  await expect(firstAction).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(lastAction).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(firstAction).toBeFocused();
  await expect(page.getByText('Preliminary design aid — not certified engineering')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('place, connect, edit, autosave, reload, and export a design', async ({ page }) => {
  await openBlankWorkspace(page);

  await addCatalogProduct(page, 'Battery', 'Lithium', 'bat-vic-smart-12-100');
  await addCatalogProduct(page, 'DC Power', 'DC Load', 'acc-dc-load-generic');
  const canvas = page.locator('.canvas-shell');
  await expect(canvas.locator('[data-product-id="bat-vic-smart-12-100"]')).toHaveCount(1);
  await expect(canvas.locator('[data-product-id="acc-dc-load-generic"]')).toHaveCount(1);

  const labelSection = page.locator('.right-inspector .inspector-section').filter({
    has: page.getByText('Label', { exact: true }),
  }).first();
  await labelSection.locator('input').fill('Smoke Test DC Load');

  await dragBy(page, canvas.locator('[data-product-id="acc-dc-load-generic"]'), 230, 80);

  const batteryPositive = canvas.locator('[data-terminal-id="dc_pos"]').filter({
    has: page.locator('title', { hasText: 'SmartLithium' }),
  });
  const loadPositive = canvas.locator('[data-terminal-id="dc_pos"]').filter({
    has: page.locator('title', { hasText: 'Smoke Test DC Load' }),
  });
  const batteryNegative = canvas.locator('[data-terminal-id="dc_neg"]').filter({
    has: page.locator('title', { hasText: 'SmartLithium' }),
  });
  const loadNegative = canvas.locator('[data-terminal-id="dc_neg"]').filter({
    has: page.locator('title', { hasText: 'Smoke Test DC Load' }),
  });

  await connectTerminals(page, batteryPositive, loadPositive);
  await connectTerminals(page, batteryNegative, loadNegative);
  await expect(canvas.locator('[data-connection-id]')).toHaveCount(2);

  await page.getByLabel('System name').fill('UI Smoke Test System');
  await expect(page.locator('.header-save-status')).toContainText('Saved', { timeout: 10_000 });

  await page.getByTitle('Settings').click();
  const saveDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect((await saveDownload).suggestedFilename()).toBe('ui-smoke-test-system.system-builder.json');

  await page.reload();
  const welcome = page.getByRole('dialog', { name: 'Welcome to DES System Builder' });
  await welcome.getByRole('button', { name: /Resume Drawing/ }).click();
  await expect(page.getByLabel('System name')).toHaveValue('UI Smoke Test System');
  await expect(page.locator('.canvas-shell [data-connection-id]')).toHaveCount(2);

  await page.getByTitle('Settings').click();
  await expect(page.locator('.header-dropdown-about')).toContainText('Preliminary design aid');
  await page.keyboard.press('Escape');

  const openBomButton = page.getByTitle('Open BOM summary');
  await openBomButton.click();
  const bomDialog = page.getByRole('dialog', { name: 'BOM Summary' });
  await expect(bomDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(bomDialog).toBeHidden();
  await expect(openBomButton).toBeFocused();

  await openBomButton.click();
  await expect(bomDialog).toBeVisible();
  const csvDownload = page.waitForEvent('download');
  await bomDialog.getByRole('button', { name: 'Export CSV' }).click();
  await expect((await csvDownload).suggestedFilename()).toBe('UI_Smoke_Test_System_BOM.csv');
});
