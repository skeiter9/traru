exports.config = {
  specs: [
    'app/client/e2e-tests/*.js'
  ],

  capabilities: {
    browserName: 'chrome'
  },

  baseUrl: 'http://0.0.0.0:3010/',
  framework: 'mocha'
};
