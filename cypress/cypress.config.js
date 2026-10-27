const { defineConfig } = require('cypress');

module.exports = defineConfig({
  screenshotsFolder: 'screenshots',
  fixturesFolder: false,
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'e2e/**/*.cy.js',
    supportFile: 'support/e2e.js',
  },
});
