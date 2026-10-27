const data = require('../../../test-data/checkout.json');

class LoginPage {
  get username() { return $('[data-test="username"]'); }
  get password() { return $('[data-test="password"]'); }
  get loginButton() { return $('[data-test="login-button"]'); }
  get error() { return $('[data-test="error"]'); }

  async login(username) {
    await browser.url('/');
    await this.username.setValue(username);
    await this.password.setValue(data.password);
    await this.loginButton.click();
  }
}

module.exports = new LoginPage();
