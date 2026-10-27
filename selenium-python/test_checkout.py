from selenium.webdriver.support import expected_conditions as EC

from helpers import by_test


def test_checkout_as_standard_user(driver, wait, login, data):
    products = data["products"]
    customer = data["customer"]
    login(data["users"]["standard"])

    for product in products:
        wait.until(EC.element_to_be_clickable(by_test(f"add-to-cart-{product['slug']}"))).click()
    assert driver.find_element(*by_test("shopping-cart-badge")).text == str(len(products))

    driver.find_element(*by_test("shopping-cart-link")).click()
    wait.until(EC.element_to_be_clickable(by_test("checkout"))).click()

    wait.until(EC.visibility_of_element_located(by_test("firstName"))).send_keys(customer["firstName"])
    driver.find_element(*by_test("lastName")).send_keys(customer["lastName"])
    driver.find_element(*by_test("postalCode")).send_keys(customer["postalCode"])
    driver.find_element(*by_test("continue")).click()

    expected_subtotal = sum(product["price"] for product in products)
    subtotal = wait.until(EC.visibility_of_element_located(by_test("subtotal-label")))
    assert subtotal.text == f"Item total: ${expected_subtotal:.2f}"

    driver.find_element(*by_test("finish")).click()
    header = wait.until(EC.visibility_of_element_located(by_test("complete-header")))
    assert header.text == data["messages"]["orderComplete"]


def test_locked_out_user_sees_an_error(wait, login, data):
    login(data["users"]["lockedOut"])

    error = wait.until(EC.visibility_of_element_located(by_test("error")))
    assert error.text == data["messages"]["lockedOut"]


def test_slow_login_still_works(driver, wait, login, data):
    login(data["users"]["performanceGlitch"])

    # saucedemo freezes the page for 5s for this user. The find_element call inside
    # the wait blocks until the page unfreezes, so even a short timeout would pass,
    # but I don't want the test to depend on where the freeze happens to land
    wait.until(EC.visibility_of_element_located(by_test("inventory-list")))
    assert driver.current_url.endswith("/inventory.html")
