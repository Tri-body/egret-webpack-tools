import { minify } from 'terser'
import { compilation, Compiler } from 'webpack'
import { buildEui } from './buildEui'
import { IOptions } from './types'
import { toAssetsByOutputName } from './utils'
import fs from 'fs-extra'
import path from 'path'

const DEFAULT_RES_PATH = 'resource'
const DEFAULT_NAME = 'default.thm.json'

export async function createThm(compiler: Compiler, compilation: compilation.Compilation, options: IOptions) {
  const context = options.context || compiler.context
  const resPath = path.join(context, options.resource || DEFAULT_RES_PATH)
  const resJsonPath = path.join(resPath, DEFAULT_NAME)
  if (!fs.existsSync(resJsonPath)) {
    console.log(`${resJsonPath} not esist, skip...`)
    return null
  }
  const files = await buildEui(resPath, options.sdkRoot, context)
  if (!files || files.length === 0) return null
  // todo thm split
  const result = await minify(files.map(f => f.content))
  return toAssetsByOutputName(compilation, Buffer.from(result.code), DEFAULT_NAME, options.thmName)
}
