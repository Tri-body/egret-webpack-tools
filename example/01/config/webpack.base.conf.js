'use strict'
const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  target: 'web',
  stats: 'minimal',
  context: path.resolve(__dirname, '../'),
  entry: {
    main: './src/Main.ts'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {

    }
  },
  module: {
    rules: [{
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }]
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10,
          name: 'resource/img/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10,
          name: 'resource/media/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10,
          name: 'resource/fonts/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.(xml|txt)$/,
        loader: 'url-loader',
        options: {
          limit: 10,
          name: 'resource/data/[name].[hash:8].[ext]'
        }
      },
      {
        test: /\.zip$/,
        loader: 'url-loader',
        options: {
          limit: 10,
          name: 'resource/bin/[name].[hash:8].[ext]'
        }
      },
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ]
}