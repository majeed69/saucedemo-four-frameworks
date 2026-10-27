const chromeArgs = ['--window-size=1280,900'];
if (process.env.CI) {
  chromeArgs.push('--headless=new');
}

exports.config = {
  runner: 'local',
  specs: ['./test/specs/**/*.js'],
  maxInstances: 1,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': { args: chromeArgs },
  }],
  // headless in CI and a real display locally, so no virtual display needed
  autoXvfb: false,
  baseUrl: 'https://www.saucedemo.com',
  logLevel: 'warn',
  framework: 'mocha',
  reporters: [
    'spec',
    ['junit', { outputDir: 'reports', outputFileFormat: () => 'junit.xml' }],
  ],
};
