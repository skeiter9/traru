const path = require('path');
const webpack = require('webpack');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const srcPath = path.join(__dirname, 'app', 'client');

const config = {
  addVendor(name, path_) {
    this.resolve.alias[name] = path_;
  },

  debug: true,
  devtool: 'eval',
  context: srcPath,
  entry: {
    app: './app.js',
    vendor: './vendor.js'
  },
  output: {
    path: path.join(srcPath, 'build'),
    filename: '[name].bundle.js',
    publicPath: '/build/',
    pathinfo: true,
  },
  module: {
    noParse: [/\.min\.js/],
    preLoaders: [

      //{test:/\.js$/, loaders: ['jscs'], include: [srcPath]},
    ],
    loaders: [
      {
        test: /\.js$/,
        loaders: ['babel'],
        include: [srcPath],
        exclude: [path.resolve(srcPath, 'api/api-lb.js')]
      },
      {
        test: /\.css$/,
        loaders: [
          'style',
          'css?localIdentName=[path][name]---[local]---[hash:base64:5]',
          'postcss'
        ],
        include: [srcPath]
      },
      {test: /\.jade$/, loaders: ['jade'], include: [srcPath]},
      {
        test: /\.(eot|ttf|svg|woff|woff2)$/,
        loaders: ['url?limit=40000&name=[name].[ext]']
      }
    ],
  },
  resolve: {
    alias: [],
    modulesDirectories: ['node_modules', 'lib_components']
  },
  resolveLoader: {
    modulesDirectories: [
      path.join(__dirname, 'node_modules')
    ],
  },
  plugins: [
    new LiveReloadPlugin({
      appendScriptTag: true,
      port: 35721
    }),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
      minSize: 20
    })
  ],
  postcss(webpack_) {
    return {
      defaults: [
        require('postcss-import')({
          addDependencyTo: webpack_
        }),
        require('postcss-alias')(),
        require('postcss-nesting')(),
        require('postcss-extend')(),
        require('postcss-url')(),
        require('postcss-custom-properties')(),
        require('postcss-custom-media')(),
        require('autoprefixer')()
      ],
    };
  }
};

config.addVendor('angular-min',
  path.join(srcPath, 'node_modules') + '/angular/angular.min.js');

config.addVendor('angular-ui-router-min',
  path.join(srcPath, 'node_modules') +
  '/angular-ui-router/release/angular-ui-router.min.js');

config.module.noParse.push(/api-lb\.js/);

module.exports = config;

