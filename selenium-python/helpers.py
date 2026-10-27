from selenium.webdriver.common.by import By

BASE_URL = "https://www.saucedemo.com"


def by_test(test_id):
    return By.CSS_SELECTOR, f'[data-test="{test_id}"]'
