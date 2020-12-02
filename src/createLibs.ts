import { compilation, Compiler } from 'webpack'
import { IOptions } from './types'
import path from 'path'
import fs from 'fs-extra'
import find from 'find'
import Concat from 'concat-with-sourcemaps'
import { toAssetsByOutputName } from './utils'

const BASE_NAME = 'egret.libs.js'

export async function createLibs(compiler: Compiler, compilation: compilation.Compilation, options: IOptions) {
  const context = options.context || compiler.context
  const mode = options.mode || compiler.options.mode
  const jsonPath = path.join(context, 'egretProperties.json')
  const egretProps = await fs.readJson(jsonPath, { encoding: 'utf-8' })
  const libDirs = egretProps.modules.map(m => {
    return path.join(context, m.path || `./libs/modules/${m.name}`)
  })
  let jsFiles: string[] = []
  let temp: string[]
  for (let dir of libDirs) {
    if (mode === 'production') {
      temp = find.fileSync(/\.min\.js$/, dir)
    } else {
      temp = find.fileSync(/\.js$/, dir).filter(f => f.indexOf('.min.js') === -1)
    }
    jsFiles = jsFiles.concat(temp)
  }
  let content: Buffer, file: string
  const concat = new Concat(false, BASE_NAME, '\n')
  for (let i = 0; i < jsFiles.length; i++) {
    file = jsFiles[i]
    content = await fs.readFile(file)
    concat.add(path.basename(file), content)
  }
  return toAssetsByOutputName(compilation, concat.content, BASE_NAME, options.name)
}