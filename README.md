# saucedemo-four-frameworks

[![tests](https://github.com/majeed69/saucedemo-four-frameworks/actions/workflows/tests.yml/badge.svg)](https://github.com/majeed69/saucedemo-four-frameworks/actions/workflows/tests.yml)

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

All four run in GitHub Actions on every push and pull request, as four parallel jobs. A last job reads their JUnit reports with [scripts/compare_runs.py](scripts/compare_runs.py) and writes a comparison table to the run's summary page.

Whenever something broke while I was building this, I wrote it down in [NOTES.md](NOTES.md).

## Running the suites

You need Google Chrome installed. All four use your installed Chrome, none of them download their own browser. Locally, Selenium and WebdriverIO open a visible Chrome window and run headless when `CI` is set. Playwright and Cypress run headless by default.

**Selenium** (Python 3.14)
```bash
cd selenium-python
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/pytest
```

**Playwright** (Node 22)
```bash
cd playwright
npm ci
npx playwright test
```
Add `--headed` to watch it.

**Cypress** (Node 22)
```bash
cd cypress
npm ci
npm test
```
`npm run test:ci` does the same and also writes `reports/junit.xml`.

**WebdriverIO** (Node 22)
```bash
cd webdriverio
npm ci
npm test
```

Every suite writes its JUnit report to `reports/junit.xml` inside its own folder (Cypress only with `test:ci`).
