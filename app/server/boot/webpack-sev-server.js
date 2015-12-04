'use strict';

module.exports = function(server) {

  if (server.get('env') === 'production') return;

  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpack = require('webpack');
  const webpackConfig = require('../../../webpack.config.js');

  const compiler = webpack(webpackConfig);
  /*
  server.use(webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    noInfo: false,
    headers: {'x-compiled': 'traru'},
    stats: {}
  }));
  */
  let bundleStart = Date.now();

  compiler.plugin('compile', function() {
    console.log('Bundling...');
    bundleStart = Date.now();
  });

  compiler.plugin('done', function() {
    console.log('Bundled in ' + (Date.now() - bundleStart) + 'ms!');
  });

  server.middleware('routes:before', webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true,
    noInfo: false,
    headers: {'x-compiled': 'traru'},
    stats: {}
  }));

};
