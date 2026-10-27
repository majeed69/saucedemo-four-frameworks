const base = require('@playwright/test');
const data = require('../../test-data/checkout.json');

exports.test = base.test.extend({
  login: async ({ page }, use) => {
    await use(async (username) => {
      await page.goto('/');
      await page.getByTestId('username').fill(username);
      await page.getByTestId('password').fill(data.password);
      await page.getByTestId('login-button').click();
    });
  },
});

exports.expect = base.expect;
