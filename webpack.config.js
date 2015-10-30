const path = require('path');
const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const srcPath = path.join(__dirname, 'app', 'client');

const cssnext = require('cssnext');
const postcssImport = require('postcss-import');

const config = {
  addVendor(name, path_) {
    this.resolve.alias[name] = path_;
  },

  debug: true,
  devtool: 'eval',
  context: srcPath,
  entry: {
    app: './app.js',
    vendor: [
      'angular-min',
      'angular-ui-router-min'
    ]
  },
  output: {
    path: path.join(srcPath, 'build'),
    filename: '[name].bundle.js',
    publicPath: 'build/',
    pathinfo: true,
  },
  module: {
    noParse: /\.min\.js/,
    preLoaders: [

      //{test:/\.js$/, loaders: ['jscs'], include: [srcPath]},
    ],
    loaders: [
      {test: /\.js$/, loaders: ['babel'], include: [srcPath]},
      {test: /\.css$/, loaders: ['style', 'css', 'postcss'], include: [srcPath]},
      {test: /\.jade$/, loaders: ['jade'], include: [srcPath]},
      {test: /\.(eot|ttf|svg|woff|woff2)$/, loaders: ['url?limit=40000&name=[name].[ext]']}
    ],
  },
  resolve: {
    alias: [],
    modulesDirectories: ['node_modules']
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(__dirname, 'node_modules')
    ],
  },
  plugins: [
    new LiveReloadPlugin({appendScriptTag: true}),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
      minSize: 20
    })
  ],
  postcss(webpack_) {
    return {
      defaults: [
        postcssImport({
          addDependencyTo: webpack_
        }),
        cssnext()
      ],
    };
  },
};

config.addVendor('angular-min',
  path.join(srcPath, 'node_modules') + '/angular/angular.min.js');

config.addVendor('angular-ui-router-min',
  path.join(srcPath, 'node_modules') +
  '/angular-ui-router/release/angular-ui-router.min.js');

module.exports = config;
