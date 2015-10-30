'use strict';

module.exports = function(server) {

  if (server.get('env') === 'production') return;

  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');

  const compiler = webpack(require('../../../webpack.config.js'));

  server.use(webpackDevMiddleware(compiler, {
    publicPath: '/build/',
    quiet: false,
    noInfo: true
  }));

  let bundleStart = Date.now();

  compiler.plugin('compile', function() {
    console.log('Bundling...');
    bundleStart = Date.now();
  });

  compiler.plugin('done', function() {
    console.log('Bundled in ' + (Date.now() - bundleStart) + 'ms!');
  });

};
