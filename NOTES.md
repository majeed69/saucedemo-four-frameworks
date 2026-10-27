# Dev notes

Every time a test failed while I was building this, I wrote down what happened here.

## Playwright: slow login timed out at 5s

**Error:** `expect(locator).toBeVisible() failed ... Timeout: 5000ms ... element(s) not found` on `getByTestId('inventory-list')` in "slow login still works".

**Cause:** Playwright's `expect` retries for 5 seconds by default. saucedemo freezes the inventory page with a busy loop for exactly 5 seconds when you log in as `performance_glitch_user`, so the list wasn't there yet when the assertion gave up. Selenium didn't hit this because I gave its `WebDriverWait` 10 seconds.

**Fix:** passed `{ timeout: 10_000 }` to that one assertion. I didn't raise the global `expect` timeout, because the other tests should still fail fast if something is really missing.
