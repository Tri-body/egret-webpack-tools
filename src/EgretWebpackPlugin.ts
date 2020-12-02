import HtmlWebpackPlugin from 'html-webpack-plugin'
import { Compiler } from 'webpack'
import { createLibs } from './createLibs'
import { createThm } from './createThm'
import { IOptions } from './types'
import { toAssets } from './utils'

const NAME = 'egret-webpack-plugin'

export class EgretWebpackPlugin {

  options: IOptions

  constructor(options?: IOptions) {
    this.options = options || {}
  }

  apply(compiler: Compiler) {
    const files: string[] = []
    let js: string[]

    compiler.hooks.compilation.tap(NAME, (compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation)
      if (!hooks) {
        console.warn('not found HtmlWebpackPlugin hooks!')
      } else {
        hooks.beforeAssetTagGeneration.tap(NAME, data => {
          js = [...files, ...data.assets.js]
          data.assets.js = js
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

    compiler.hooks.emit.tapAsync(NAME, async (compilation, callback) => {
      if (!js) {
        js = []
        for (let ep of compilation.entrypoints.values()) {
          js.push(...ep.getFiles())
        }
        js = js.filter((v, i, arr) => arr.indexOf(v) === i)
      }
      toAssets(compilation, Buffer.from(JSON.stringify({ initial: files, game: js })), 'manifest.json')
      callback()
    })
  }
}