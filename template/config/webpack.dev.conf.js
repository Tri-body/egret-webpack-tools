'use strict'
const path = require('path')
const webpack = require('webpack')
const {
  merge
} = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const portfinder = require('portfinder')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const notifier = require('node-notifier')
const {
  EgretDevWebpackPlugin
} = require('egret-webpack-tools')

const defineVars = {}

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  // entry: {
  //   mock: './src/mock/index.ts'
  // },
  output: {
    filename: '[name].js',
  },
  // cheap-module-eval-source-map is faster for development
  devtool: 'cheap-eval-source-map',

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    disableHostCheck: true,
    hot: true,
    compress: false,
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8000,
    open: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    contentBase: path.resolve(__dirname, '../'),
    // proxy: ,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: false,
    },
    // contentBase: path.join(__dirname, '../resource'),
    // contentBasePublicPath: '/resource',
    proxy: {}
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      template: path.resolve(__dirname, '../index.html'),
    }),
    new webpack.DefinePlugin(defineVars),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new EgretDevWebpackPlugin(),
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || 8000
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: (severity, errors) => {
          if (severity !== 'error') {
            return
          }
          const error = errors[0];
          notifier.notify({
            title: "Webpack error",
            message: severity + ': ' + error.name,
            subtitle: error.file || '',
            // icon: ICON
          });
        }
      }))

      resolve(devWebpackConfig)
    }
  })
})