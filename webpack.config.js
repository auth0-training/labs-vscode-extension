//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const config = {
  target: 'node', // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
  mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    extensions: ['.ts', '.js'],
    //fix: added to resolve issue with node-auth0 v2.36.2
    alias: {
      'coffee-script': false, // unused dependency of node-auth0
      'vm2': false, // unused dependency of node-auth0
      'yargs': false, // unused dependency of auth0-deploy-cli
      'keyv': false, // unused dependency of openid-client
      'formidable': false, // unused dependency of node-auth0
      'colors': false, // unused dependency of auth0-deploy-cli
    },
  },
  module: {
    rules: [
      // allows the cli to be webpacked
      {
        test: path.resolve(
          __dirname,
          'node_modules/auth0-deploy-cli/lib/index.js'
        ),
        loader: 'string-replace-loader',
        options: {
          search: '#!/usr/bin/env node',
          replace: '',
        },
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  plugins: [],
};
module.exports = config;
