const LoginPage = require('../pageobjects/login.page');
const data = require('../../../test-data/checkout.json');

describe('saucedemo', () => {
  it('checkout as standard user', async () => {
    const { products, customer } = data;
    await LoginPage.login(data.users.standard);

    for (const product of products) {
      await $(`[data-test="add-to-cart-${product.slug}"]`).click();
    }
    await expect($('[data-test="shopping-cart-badge"]')).toHaveText(String(products.length));

    await $('[data-test="shopping-cart-link"]').click();
    await $('[data-test="checkout"]').click();

    await $('[data-test="firstName"]').setValue(customer.firstName);
    await $('[data-test="lastName"]').setValue(customer.lastName);
    await $('[data-test="postalCode"]').setValue(customer.postalCode);
    await $('[data-test="continue"]').click();

    const expectedSubtotal = products.reduce((sum, product) => sum + product.price, 0);
    await expect($('[data-test="subtotal-label"]')).toHaveText(`Item total: $${expectedSubtotal.toFixed(2)}`);

    await $('[data-test="finish"]').click();
    await expect($('[data-test="complete-header"]')).toHaveText(data.messages.orderComplete);
  });

  it('locked out user sees an error', async () => {
    await LoginPage.login(data.users.lockedOut);

    await expect(LoginPage.error).toHaveText(data.messages.lockedOut);
  });

  it('slow login still works', async () => {
    await LoginPage.login(data.users.performanceGlitch);

    // the 5s freeze actually blocks the click command, so the default 3s wait passes too,
    // but I don't want the test to depend on where the freeze happens to land
    await expect($('[data-test="inventory-list"]')).toBeDisplayed({ wait: 10000 });
    await expect(browser).toHaveUrl(expect.stringContaining('/inventory.html'));
  });
});
