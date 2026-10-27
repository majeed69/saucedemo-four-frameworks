import json
import os
from pathlib import Path

import pytest
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait

from helpers import BASE_URL, by_test

DATA_FILE = Path(__file__).parent.parent / "test-data" / "checkout.json"


@pytest.fixture(scope="session")
def data():
    return json.loads(DATA_FILE.read_text())


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    if os.environ.get("CI"):
        options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,900")
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 10)


@pytest.fixture
def login(driver, data):
    def _login(username):
        driver.get(BASE_URL)
        driver.find_element(*by_test("username")).send_keys(username)
        driver.find_element(*by_test("password")).send_keys(data["password"])
        driver.find_element(*by_test("login-button")).click()

    return _login
