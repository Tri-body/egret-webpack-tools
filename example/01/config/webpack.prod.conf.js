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
const ImageminPlugin = require('imagemin-webpack-plugin').default
const {
  EgretWebpackPlugin
} = require('../../../dist')
// const CopyWebpackPlugin = require('copy-webpack-plugin')


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
      inject: false,
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
    new ImageminPlugin({
      test: /\.(jpe?g|png|gif|svg)$/i,
      pngquant: {
        quality: '100'
      }
    }),
    new CaseSensitivePathsPlugin(),
    new EgretWebpackPlugin()
    // new CopyWebpackPlugin([{
    //   from: path.resolve(__dirname, '../public'),
    //   to: path.resolve(__dirname, '../dist')
    // }])
  ]
})

// if (process.env.npm_config_report) {
//   const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
//   webpackConfig.plugins.push(new BundleAnalyzerPlugin({
//     analyzerMode: 'static',
//     openAnalyzer: false,
//     generateStatsFile: false,
//     reportFilename: 'report.html'
//   }))
// }

module.exports = webpackConfig