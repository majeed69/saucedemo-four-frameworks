const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: [['list'], ['junit', { outputFile: 'reports/junit.xml' }]],
  use: {
    baseURL: 'https://www.saucedemo.com',
    channel: 'chrome',
    testIdAttribute: 'data-test',
  },
});
