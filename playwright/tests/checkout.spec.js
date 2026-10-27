const { test, expect } = require('./fixtures');
const data = require('../../test-data/checkout.json');

test('checkout as standard user', async ({ page, login }) => {
  const { products, customer } = data;
  await login(data.users.standard);

  for (const product of products) {
    await page.getByTestId(`add-to-cart-${product.slug}`).click();
  }
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText(String(products.length));

  await page.getByTestId('shopping-cart-link').click();
  await page.getByTestId('checkout').click();

  await page.getByTestId('firstName').fill(customer.firstName);
  await page.getByTestId('lastName').fill(customer.lastName);
  await page.getByTestId('postalCode').fill(customer.postalCode);
  await page.getByTestId('continue').click();

  const expectedSubtotal = products.reduce((sum, product) => sum + product.price, 0);
  await expect(page.getByTestId('subtotal-label')).toHaveText(`Item total: $${expectedSubtotal.toFixed(2)}`);

  await page.getByTestId('finish').click();
  await expect(page.getByTestId('complete-header')).toHaveText(data.messages.orderComplete);
});

test('locked out user sees an error', async ({ page, login }) => {
  await login(data.users.lockedOut);

  await expect(page.getByTestId('error')).toHaveText(data.messages.lockedOut);
});

test('slow login still works', async ({ page, login }) => {
  await login(data.users.performanceGlitch);

  // expect gives up after 5s by default, which is exactly how long saucedemo freezes for this user
  await expect(page.getByTestId('inventory-list')).toBeVisible({ timeout: 10_000 });
  await expect(page).toHaveURL(/inventory\.html$/);
});
