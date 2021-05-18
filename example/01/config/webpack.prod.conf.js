'use strict'
const path = require('path')
const webpack = require('webpack')
const {
  merge
} = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const {
  EgretWebpackPlugin
} = require('../../../dist/EgretWebpackPlugin')


const defineVars = {}

let webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  devtool: undefined,
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].js',
  },
  optimization: {
    // runtimeChunk: 'single',
    minimize: false,
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'initial',
          minChunks: 1,
          priority: -10,
          test: /[\\/]node_modules[\\/]/
        }
      }
    }
  },
  plugins: [
    new webpack.DefinePlugin(defineVars),
    new CleanWebpackPlugin(),
    // keep module.id stable when vender modules does not change
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../template/web/index.html'),
      // chunksSortMode: 'dependency',
      inject: true,
      favicon: path.resolve(__dirname, '../favicon.ico'),
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.NamedChunksPlugin(),
    new CaseSensitivePathsPlugin(),
    new EgretWebpackPlugin()
  ]
})
module.exports = webpackConfig