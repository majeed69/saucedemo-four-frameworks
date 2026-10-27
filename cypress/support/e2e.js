const data = require('../../test-data/checkout.json');

Cypress.Commands.add('getByTest', (testId, options) => cy.get(`[data-test="${testId}"]`, options));

Cypress.Commands.add('login', (username) => {
  cy.visit('/');
  cy.getByTest('username').type(username);
  cy.getByTest('password').type(data.password);
  cy.getByTest('login-button').click();
});
