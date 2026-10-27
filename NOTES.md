# Dev notes

Every time a test failed while I was building this, I wrote down what happened here.

## Playwright: slow login timed out at 5s

**Error:** `expect(locator).toBeVisible() failed ... Timeout: 5000ms ... element(s) not found` on `getByTestId('inventory-list')` in "slow login still works".

**Cause:** Playwright's `expect` retries for 5 seconds by default. saucedemo freezes the inventory page with a busy loop for exactly 5 seconds when you log in as `performance_glitch_user`, so the list wasn't there yet when the assertion gave up. Selenium didn't hit this because I gave its `WebDriverWait` 10 seconds.

**Fix:** passed `{ timeout: 10_000 }` to that one assertion. I didn't raise the global `expect` timeout, because the other tests should still fail fast if something is really missing.

## Cypress: slow login passed when I expected it to fail

Not a failure, but it surprised me. Cypress's default timeout is 4s and saucedemo freezes for 5s, so I expected the same problem as Playwright. It passed. I cut the timeout to 1s and it still passed.

**Cause:** I timed it. The login click returned in 212ms, then `cy.get('inventory-list', { timeout: 1000 })` took 5303ms and passed. Cypress runs inside the same browser tab as the app, on the same JavaScript thread, so while the page is frozen Cypress's timeout clock is frozen too. When the page wakes up, the next retry finds the list.

**Fix:** none needed, but I set `{ timeout: 10000 }` anyway so the test doesn't rely on that quirk. If saucedemo ever switched to an async delay, the default 4s would fail.

## Cypress: failing test with no error message

**Error:** I broke a price in the data file to make sure the subtotal check fails. The run summary said `Failing: 1` and that was it. No assertion, no expected vs received.

**Cause:** I had `reporter: 'junit'` in `cypress.config.js`. That reporter replaces the normal spec output in the terminal, so the reason only ends up inside `reports/junit.xml`.

**Fix:** took the reporter out of the config and added a `test:ci` npm script that passes `--reporter junit` on the command line. `npm test` locally prints the normal output (`Timed out retrying after 4000ms: expected ... to have text 'Item total: $39.97', but the text was 'Item total: $39.98'`), and CI still gets the XML file with the same message in it.

## WebdriverIO and Selenium: slow login also passes with a 0.5s wait

Not a failure either. WebdriverIO's `expect` waits 3s by default and the slow login passed anyway, so I timed it in WebdriverIO and went back and timed Selenium too, both with a 0.5s wait.

| | login click | wait for inventory list (0.5s timeout) |
|---|---|---|
| WebdriverIO | 5115ms | 259ms, passed |
| Selenium | 73ms | 5242ms, passed |

**Cause:** a WebDriver command can't finish while the page's JavaScript thread is frozen. In WebdriverIO the click is the command that gets stuck. In Selenium the click returns, then the first `find_element` inside `WebDriverWait` gets stuck. `WebDriverWait` only checks the clock between attempts, so when that one call comes back 5 seconds later with the element, it counts as a pass. My Selenium comment from Phase 1 said the 10s wait "has room to spare", which was true but not why it worked. I fixed the comment.

So out of the four, Playwright is the only one whose timeout kept counting during the freeze (its timer runs in Node, outside the browser), and it's the only one that failed.

**Fix:** none needed. I gave WebdriverIO `{ wait: 10000 }` like the others so none of them depend on where the freeze lands.

## WebdriverIO: xvfb-run not found warnings

**Error:** every run started with three `WARN @wdio/xvfb: xvfb-run not found` lines.

**Cause:** on Linux, WebdriverIO 9 tries to start a virtual display (Xvfb) so headed Chrome can run on machines without a screen. I run headless in CI and have a real screen locally, so I don't need it.

**Fix:** `autoXvfb: false` in `wdio.conf.js`.

## Selenium: checkout failed at random, clicks went nowhere

**Error:** `TimeoutException: Message:` (empty message) on `wait.until(EC.element_to_be_clickable(by_test("checkout")))` in "checkout as standard user". It had passed every run in Phase 1. Tonight it failed 5 out of 15 runs, then 9 out of 12.

**Cause:** I had to dig for this one.
- On failure the URL was still `/inventory.html`. Sometimes the cart badge said 2, sometimes 1, sometimes nothing, so add-to-cart clicks were getting lost too, not only the cart link click.
- No page reload (a marker I put on `window` survived) and nothing in the browser console.
- I logged every pointer and click event the page received. Every lost click never reached the page at all. Selenium sent it, the page never saw it.

That points at something in Chrome itself, outside the page. After you log in with a password that's in a public breach list (and `secret_sauce` is), Chrome can show its "change your password" warning. It's browser UI, so it doesn't show up in screenshots or the DOM, and it takes the next clicks. The check goes over the network, so the timing changes from run to run.

**Fix:** turned off the breach check with a Chrome pref in `conftest.py`: `"profile.password_manager_leak_detection": False`. With only that pref, 0 failures in 15 runs of the same probe, and the full suite passed 5 out of 5.

WebdriverIO uses the same chromedriver and never failed (0 out of 8). Its own launch code (`@wdio/utils`) sets that exact pref by default, so someone there already hit this. Playwright (0 out of 5) and Cypress (0 out of 3) didn't fail either. For Playwright my guess is that each test gets a fresh incognito style browser context, where Chrome doesn't run the check, but I haven't confirmed that.
