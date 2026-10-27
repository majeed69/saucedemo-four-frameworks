const data = require('../../test-data/checkout.json');

it('checkout as standard user', () => {
  const { products, customer } = data;
  cy.login(data.users.standard);

  products.forEach((product) => {
    cy.getByTest(`add-to-cart-${product.slug}`).click();
  });
  cy.getByTest('shopping-cart-badge').should('have.text', String(products.length));

  cy.getByTest('shopping-cart-link').click();
  cy.getByTest('checkout').click();

  cy.getByTest('firstName').type(customer.firstName);
  cy.getByTest('lastName').type(customer.lastName);
  cy.getByTest('postalCode').type(customer.postalCode);
  cy.getByTest('continue').click();

  const expectedSubtotal = products.reduce((sum, product) => sum + product.price, 0);
  cy.getByTest('subtotal-label').should('have.text', `Item total: $${expectedSubtotal.toFixed(2)}`);

  cy.getByTest('finish').click();
  cy.getByTest('complete-header').should('have.text', data.messages.orderComplete);
});

it('locked out user sees an error', () => {
  cy.login(data.users.lockedOut);

  cy.getByTest('error').should('have.text', data.messages.lockedOut);
});

it('slow login still works', () => {
  cy.login(data.users.performanceGlitch);

  // passes even with the 4s default because the page freeze also freezes Cypress's own timer
  // (same JS thread), but I don't want the test to depend on that
  cy.getByTest('inventory-list', { timeout: 10000 }).should('be.visible');
  cy.url().should('match', /inventory\.html$/);
});
