import { minify } from 'terser'
import { compilation, Compiler } from 'webpack'
import { buildEui } from './buildEui'
import { IOptions } from './types'
import { toAssetsByOutputName } from './utils'

const DEFAULT_RES_PATH = 'resource'
const DEFAULT_NAME = 'default.thm.js'

export async function createThm(compiler: Compiler, compilation: compilation.Compilation, options: IOptions) {
  const context = options.context || compiler.context
  const resPath = options.resource || DEFAULT_RES_PATH
  const files = await buildEui(resPath, options.sdkRoot, context)
  if (!files || files.length === 0) return null
  // todo thm split
  const result = await minify(files.map(f => f.content))
  return toAssetsByOutputName(compilation, Buffer.from(result.code), DEFAULT_NAME, options.thmName)
}
