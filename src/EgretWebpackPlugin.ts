import { Compiler } from 'webpack'
import fs from 'fs-extra'
import path from 'path'
import find from 'find'
import Concat from 'concat-with-sourcemaps'
import { toAssets, toAssetsByOutputName } from './utils'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { IOptions } from './types'
import { createLibs } from './createLibs'

const NAME = 'egret-webpack-plugin'

export class EgretWebpackPlugin {

  options: IOptions

  constructor(options?: IOptions) {
    this.options = options || {}
  }

  apply(compiler: Compiler) {
    const files: string[] = []
    compiler.hooks.compilation.tap(NAME, (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation)
      if (!hooks) {
        console.warn('not found HtmlWebpackPlugin hooks!')
      } else {
        hooks.beforeAssetTagGeneration.tap(NAME, data => {
          data.assets.js = [...files, ...data.assets.js]
          const manifest = {
            "initial": data.assets.js,
            "game": []
          }
          toAssets(compilation, Buffer.from(JSON.stringify(manifest)), 'manifest.json')
          return data
        })
      }
    })

    compiler.hooks.make.tapAsync(NAME, async (compilation, callback) => {
      let filename = await createLibs(compiler, compilation, this.options)
      files.push(filename)
      callback()
    })
  }
}