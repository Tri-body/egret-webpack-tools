import { Compiler } from 'webpack'
import path from 'path'
import fs from 'fs-extra'
import find from 'find'

interface IOptions {
  context?: string
}

export class EgretDevWebpackPlugin {

  options: IOptions

  constructor(options: IOptions) {
    this.options = options || {}
  }

  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync('EgretWebpackDevPlugin', async (compilation, callback) => {
      const context = this.options.context || compiler.context
      const jsonPath = path.join(context, 'egretProperties.json')
      const egretProps = await fs.readJson(jsonPath, { encoding: 'utf-8' })
      const libDirs = egretProps.modules.map(m => {
        return path.join(context, m.path || `./libs/modules/${m.name}`)
      })
      let initial: string[] = []
      let temp: string[]
      for (let dir of libDirs) {
        temp = find.fileSync(/\.js$/, dir).filter(f => f.indexOf('.min.js') === -1)
        initial = initial.concat(temp)
      }
      initial = initial.map(f => path.relative(context, f))
      const game = []
      for (let key in compilation.assets) {
        if (path.extname(key) === '.js') {
          game.push(key)
        }
      }
      const manifest = {
        initial,
        game
      }
      await fs.writeFile(path.join(context, 'manifest.json'), JSON.stringify(manifest, null, 2))
      callback()
    })
  }

}