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

## How they compare

All local numbers are from my laptop (Linux, Chrome 156) on the same evening, all headless. CI numbers are from three runs on GitHub's `ubuntu-latest` runners.

| | Selenium | Playwright | Cypress | WebdriverIO |
|---|---|---|---|---|
| **Version** | 4.51.0 (pytest 9.1.1) | 1.64.1 | 16.2.0 | 9.32.0 |
| **What I installed** | 2 pip packages | 1 npm package | 1 npm package, plus an 822 MB app it downloads | 5 npm packages (311 in `node_modules`, 125 MB) |
| **First install** | 45s | 11s | 274s | 61s |
| **Lines of test code** (tests, fixtures, page objects, no blank lines) | 70 | 43 | 38 | 47 |
| **Lines of config** (the framework's own config file) | 3 | 10 | 10 | 22 |
| **Local run, whole command** (3 back to back runs) | 10.9 to 16.3s | 11.1 to 14.3s | 17.8 to 18.3s | 13.5 to 13.7s |
| **CI job, start to finish** (3 runs) | 26s, 27s, 40s | 18s, 18s, 48s | 40s, 49s, 60s | 29s, 35s, 39s |
| **CI test time from JUnit** (3 runs) | 10.3s, 11.2s, 21.9s | 7.0s, 7.5s, 13.6s | 7.5s, 7.5s, 7.7s | 7.2s, 7.5s, 8.0s |
| **How it waits** | It doesn't, unless you ask. `find_element` fails right away, so I used `WebDriverWait` with expected conditions before every step that follows a page change. | Before every action it waits for the element to be visible, stable, enabled and not covered. `expect` assertions retry for 5s. | Every query plus its assertion retries for 4s. Actions wait for the element to be actionable once. | Before every action it waits for the element to exist. `expect` assertions retry for 3s. |
| **What annoyed me** | Writing the waits myself. A `TimeoutException` whose message is empty. Chrome's password breach popup eating clicks. | The 5s `expect` default was exactly as long as saucedemo's freeze. A `--reporter` flag silently replaces the reporters in the config. | The 822 MB download. The `junit` reporter hides failure messages from the terminal. You can't put a value from the page in a normal variable, everything goes through `.then()`. | The biggest dependency tree, with 18 npm audit warnings I can't fix without a major upgrade. `xvfb-run not found` warnings until I turned that feature off. |

A few things the table doesn't show:

- **Test time isn't measured the same way everywhere.** pytest counts fixture setup in each test's time, and my `driver` fixture starts a new Chrome for every test. Playwright starts the browser once and gives each test a fresh context, so its startup mostly isn't in the test times. Part of Selenium's higher numbers is just that.
- **The slow runs.** In CI, one Playwright run spent about 17s starting Chrome, and one Selenium run took 15.5s on the checkout test instead of about 4s. Both passed, and the other runs of the same code were normal, so I put them down to the runner. I'd want more runs before calling any framework faster than another by a couple of seconds.
- **Cypress startup.** Earlier the same evening, the whole Cypress command took 27 to 28s for the same 10s of tests. In the back to back runs above it was about 18s. It was the slowest locally either way.
- **The 5 second freeze surprised me.** saucedemo freezes the page with a busy loop for `performance_glitch_user`. Selenium, Cypress and WebdriverIO all passed that test even with a 0.5 or 1 second timeout, because their commands are stuck while the page is frozen and their clocks only get checked afterwards. Playwright's timer runs in Node outside the page, so it was the only one that failed with a 5 second timeout. I gave all four a 10 second wait so none of them depend on where the freeze lands. The details are in [NOTES.md](NOTES.md).
