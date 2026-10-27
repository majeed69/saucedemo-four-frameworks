# saucedemo-four-frameworks

I wrote the same checkout test on [saucedemo.com](https://www.saucedemo.com) four times, once each in:

- Selenium (Python, pytest)
- Playwright (JavaScript, @playwright/test)
- Cypress (JavaScript)
- WebdriverIO (JavaScript, Mocha)

All four suites read the same data file, [test-data/checkout.json](test-data/checkout.json), so changing a user, product or customer detail there changes it for every framework.

Each framework has the same three tests:

- **checkout as standard user**: log in, add the products from the data file, check the cart badge, fill in customer info, check that the item total matches the sum of the product prices, finish the order, check the confirmation message.
- **locked out user sees an error**: log in as `locked_out_user` and check the error text.
- **slow login still works**: log in as `performance_glitch_user` and reach the inventory page with no fixed sleeps.

The suites, the CI setup and the comparison are still in progress.
