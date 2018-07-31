const helpers = require('./helpers');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const webpackMergeDll = webpackMerge.strategy({plugins: 'replace'});
const commonConfig = require('./webpack.common.js'); // the settings that are common to prod and dev

const deployConfig = require('./deploy/index.js');
var deployProfile = deployConfig('ots-app');

/**
 * Webpack Plugins
 */
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');
const LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'ots-app';
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;
const HMR = helpers.hasProcessFlag('hot');
const VARS = require('./vars')('ots-app'); // the project VARS
const METADATA = webpackMerge(commonConfig({env: ENV}).metadata, {
  host: HOST,
  port: PORT,
  ENV: ENV,
  HMR: HMR
});
const randomVersion = new Date().getTime();

const DllBundlesPlugin = require('webpack-dll-bundles-plugin').DllBundlesPlugin;

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = function (options) {
  return webpackMerge(commonConfig({env: ENV}), {

    /**
     * Developer tool to enhance debugging
     *
     * See: http://webpack.github.io/docs/configuration.html#devtool
     * See: https://github.com/webpack/docs/wiki/build-performance#sourcemaps
     */
    devtool: 'cheap-module-source-map',

    /**
     * Options affecting the output of the compilation.
     *
     * See: http://webpack.github.io/docs/configuration.html#output
     */
    output: {

      /**
       * The output directory as absolute path (required).
       *
       * See: http://webpack.github.io/docs/configuration.html#output-path
       */
      path: helpers.root('dist'),

      /**
       * Specifies the name of each output file on disk.
       * IMPORTANT: You must not specify an absolute path here!
       *
       * See: http://webpack.github.io/docs/configuration.html#output-filename
       */
      filename: '[name].bundle.js?ver=' + randomVersion,

      /**
       * The filename of the SourceMaps for the JavaScript files.
       * They are inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-sourcemapfilename
       */
      sourceMapFilename: '[file].map?ver=' + randomVersion,

      /** The filename of non-entry chunks as relative path
       * inside the output.path directory.
       *
       * See: http://webpack.github.io/docs/configuration.html#output-chunkfilename
       */
      chunkFilename: '[id].chunk.js?ver=' + randomVersion,

      library: 'ac_[name]',
      libraryTarget: 'var',
    },

    module: {

      rules: [
       {
         test: /\.ts$/,
         use: [
           {
             loader: 'tslint-loader',
             options: {
               configFile: 'tslint.json'
             }
           }
         ],
         exclude: [/\.(spec|e2e)\.ts$/, /node_modules/]
       },

        /*
         * css loader support for *.css files (styles directory only)
         * Loads external css styles into the DOM, supports HMR
         *
         */
        {
          test: /\.css$/,
          use: ['style-loader', {loader: 'css-loader', options: { minimize: true }}],
          include: [helpers.root('src', 'styles'), helpers.root('node_modules')]
        },

        /*
         * sass loader support for *.scss files (styles directory only)
         * Loads external sass styles into the DOM, supports HMR
         *
         */
        {
          test: /\.scss$/,
          use: ['style-loader', {loader: 'css-loader', options: { minimize: true }}, 'resolve-url-loader', 'sass-loader'],
          include: [helpers.root('src', 'styles'), helpers.root('node_modules')]
        },
        {
          test: /app\.constant\.ts$/,
          use: [
            {
              loader: 'string-replace-loader',
              query: {
                multiple: [
                  {
                    search: "domain:(\\s)?('|\").*('|\")",
                    replace: 'domain: \'' + deployProfile.domain + '\'',
                    flags: 'gi'
                  }
                ]
              }
            }
          ]
        }

      ]

    },

    plugins: [

      /**
       * Plugin: DefinePlugin
       * Description: Define free variables.
       * Useful for having development builds with debug logging or adding global constants.
       *
       * Environment helpers
       *
       * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
       */
      // NOTE: when adding more properties, make sure you include them in custom-typings.d.ts
      new DefinePlugin(Object.assign({
        'ENV': JSON.stringify(METADATA.ENV),
        'HMR': METADATA.HMR,
        'process.env': {
          'ENV': JSON.stringify(METADATA.ENV),
          'NODE_ENV': JSON.stringify(METADATA.ENV),
          'HMR': METADATA.HMR,
        }
      }, VARS)),

      new DllBundlesPlugin({
        bundles: {
          polyfills: [
            'core-js',
            {
              name: 'zone.js',
              path: 'zone.js/dist/zone.js'
            },
            {
              name: 'zone.js',
              path: 'zone.js/dist/long-stack-trace-zone.js'
            },
          ],
          vendor: [
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/core',
            '@angular/common',
            '@angular/forms',
            '@angular/http',
            '@angular/router',
            '@angularclass/hmr',
            'rxjs',
          ]
        },
        dllDir: helpers.root('dll'),
        webpackConfig: webpackMergeDll(commonConfig({env: ENV}), {
          devtool: 'cheap-module-source-map',
          plugins: []
        })
      }),

      /**
       * Plugin: AddAssetHtmlPlugin
       * Description: Adds the given JS or CSS file to the files
       * Webpack knows about, and put it into the list of assets
       * html-webpack-plugin injects into the generated html.
       *
       * See: https://github.com/SimenB/add-asset-html-webpack-plugin
       */
      new AddAssetHtmlPlugin([
        {filepath: helpers.root('dll/' + DllBundlesPlugin.resolveFile('polyfills'))},
        {filepath: helpers.root('dll/' + DllBundlesPlugin.resolveFile('vendor'))}
      ]),

      /**
       * Plugin: NamedModulesPlugin (experimental)
       * Description: Uses file names as module name.
       *
       * See: https://github.com/webpack/webpack/commit/a04ffb928365b19feb75087c63f13cadfc08e1eb
       */
      // new NamedModulesPlugin(),

      /**
       * Plugin LoaderOptionsPlugin (experimental)
       *
       * See: https://gist.github.com/sokra/27b24881210b56bbaff7
       */
      new LoaderOptionsPlugin({
        debug: true,
        options: {
          // Fix: Path must be a string. Received undefined (sass-loader)
          // Fix: Cannot read property 'path' of undefined (resolve-url-loader)
          // https://github.com/bholloway/resolve-url-loader/issues/33
          sassLoader: {
            includePaths: [
              helpers.root('node_modules'),
              helpers.root('src')
            ]
          },

          context: helpers.root('src'),

          output: {
            path: helpers.root('dist')
          }
        }
      }),

      // Enable ES6 debugger in browser
      // https://github.com/webpack/webpack/issues/2145
      new webpack.SourceMapDevToolPlugin()

    ],

    /**
     * Webpack Development Server configuration
     * Description: The webpack-dev-server is a little node.js Express server.
     * The server emits information about the compilation state to the client,
     * which reacts to those events.
     *
     * See: https://webpack.github.io/docs/webpack-dev-server.html
     */
    devServer: {
      port: METADATA.port,
      host: METADATA.host,
      historyApiFallback: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      },
      stats: {
        // Add asset Information
        assets: false,
        // Add information about cached (not built) modules
        cached: false,
        // Show cached assets (setting this to `false` only shows emitted files)
        cachedAssets: false,
        // Add children information
        children: false,
        // Add chunk information (setting this to `false` allows for a less verbose output)
        chunks: true,
        // Add built modules information to chunk information
        chunkModules: false,
        // Add the origins of chunks and chunk merging info
        chunkOrigins: false,
        // `webpack --colors` equivalent
        colors: true,
        // Display the distance from the entry point for each module
        depth: false,
        // Display the entry points with the corresponding bundles
        entrypoints: false,
        // Add errors
        errors: true,
        // Add details to errors (like resolving log)
        errorDetails: true,
        // Add the hash of the compilation
        hash: false,
        // Set the maximum number of modules to be shown
        maxModules: 0,
        // Add built modules information
        modules: false,
        // Show performance hint when file size exceeds `performance.maxAssetSize`
        performance: true,
        // Show the exports of the modules
        providedExports: false,
        // Add public path information
        publicPath: false,
        // Add information about the reasons why modules are included
        reasons: false,
        // Add the source code of modules
        source: false,
        // Add timing information
        timings: true,
        // Show which exports of a module are used
        usedExports: false,
        // Add webpack version information
        version: true,
        // Add warnings
        warnings: true
      }
    },

    /*
     * Include polyfills or mocks for various node stuff
     * Description: Node configuration
     *
     * See: https://webpack.github.io/docs/configuration.html#node
     */
    node: {
      global: true,
      crypto: 'empty',
      process: true,
      module: false,
      clearImmediate: false,
      setImmediate: false
    }

  });
};
