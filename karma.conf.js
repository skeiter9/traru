const path = require('path');
const srcPath = path.join(__dirname, 'app', 'client');

const postcssImport = require('postcss-import');
const postcssUrl = require('postcss-url');
const autoprefixer = require('autoprefixer');
const customProperties = require('postcss-custom-properties');

const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'app/client',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    //frameworks: ['mocha', 'chai'],
    frameworks: ['browserify', 'tap'],

    // list of files / patterns to load in the browser
    files: [
      'vendor.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'app-test.js',
      '**/*_test.js'
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'vendor.js': ['webpack'],
      'app-test.js': ['webpack'],
      '**/*_testo.js': ['browserify']//'coverage'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['tape'],//'coverage'

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,
    webpack: {
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      resolveLoader: {
        modulesDirectories: [
          path.join(__dirname, 'node_modules')
        ],
      },
      module: {
        loaders: [
          {test: /\.js$/, loaders: ['babel'], include: [srcPath], exclude: [path.resolve(srcPath, 'api/api-lb.js')]},
          {test: /\.css$/, loaders: ['style', 'css', 'postcss'], include: [srcPath]},
          {test: /\.jade$/, loaders: ['jade'], include: [srcPath]},
          {test: /\.(eot|ttf|svg|woff|woff2)$/, loaders: ['url?limit=40000&name=[name].[ext]']}
        ],
      },
      postcss(webpack_) {
        return {
          defaults: [
            postcssImport({
              addDependencyTo: webpack_
            }),
            postcssUrl(),
            customProperties(),
            autoprefixer()
          ],
        };
      }
    },
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    },
    plugins: [
      'karma-browserify',
      'karma-tap',
      'karma-tape-reporter',
      'karma-webpack',
      'karma-coverage',
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher'
    ],

    // optionally, configure the reporter
    coverageReporter: {
      type: 'html',
      dir: 'coverage-reporter/'
    }
  });
};
