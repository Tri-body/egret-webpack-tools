import { Compiler } from 'webpack'
import { createLibs } from './createLibs'
import { createThm } from './createThm'
import { processRes } from './processRes'
import { IOptions } from './types'
import { toAssets } from './utils'

const NAME = 'EgretWebpackPlugin'

export class EgretWebpackPlugin {

  options: IOptions

  constructor(options?: IOptions) {
    this.options = options || {}
  }

  apply(compiler: Compiler) {
    const files: string[] = []
    let js: string[]

    compiler.hooks.compilation.tap(NAME, (compilation) => {
      const [htmlWebpackPlugin] = compiler.options.plugins.filter(plugin => plugin.constructor.name === 'HtmlWebpackPlugin')
      const getHooks = htmlWebpackPlugin.constructor['getHooks']
      if (typeof getHooks !== 'function') {
        console.warn('not found HtmlWebpackPlugin.getHooks function!')
        return
      }
      getHooks(compilation).beforeAssetTagGeneration.tap(NAME, data => {
        js = [...files, ...data.assets.js]
        data.assets.js = js
        return data
      })
    })

    compiler.hooks.make.tapAsync(NAME, async (compilation, callback) => {
      try {
        console.log('create egret libs...')
        let filename = await createLibs(compiler, compilation, this.options)
        files.push(filename)
        console.log('build egret thm...')
        filename = await createThm(compiler, compilation, this.options)
        if (filename) {
          files.push(filename)
        }
        console.log('process egret resource...')
        await processRes(compiler, compilation, this.options)
      } catch (error) {
        console.error(error)
      }
      callback()
    })

    compiler.hooks.emit.tapAsync(NAME, async (compilation, callback) => {
      if (!js) {
        js = [...files]
        for (let ep of Array.from(compilation.entrypoints.values())) {
          js.push(...ep.getFiles())
        }
        js = js.filter((v, i, arr) => arr.indexOf(v) === i)
      }
      toAssets(compilation, Buffer.from(JSON.stringify({ initial: js, game: [] })), 'manifest.json')
      callback()
    })
  }
}