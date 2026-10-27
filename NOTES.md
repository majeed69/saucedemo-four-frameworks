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
