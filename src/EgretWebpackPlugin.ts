import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Compiler } from 'webpack'
import { createLibs } from './createLibs'
import { createThm } from './createThm'
import { IOptions } from './types'
import { toAssets } from './utils'

export const NAME = 'egret-webpack-plugin'

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
      filename = await createThm(compiler, compilation, this.options)
      files.push(filename)
      callback()
    })
  }
}