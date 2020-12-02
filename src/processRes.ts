import fs from 'fs-extra'
import path from 'path'
import { compilation, Compiler } from 'webpack'
import { IOptions } from './types'
import { toAssetsByOutputName, toAssets } from './utils'

const DEFAULT_RES_PATH = 'resource/'
const DEFAULT_RES_NAME = 'default.res.json'
const BASE_NAME = '[name].[hash:8].[ext]'

async function processRes(compiler: Compiler, compilation: compilation.Compilation, options: IOptions) {
  const context = options.context || compiler.context
  const resBaseName = options.assetsName || BASE_NAME
  const resPath = path.join(context, options.resource || DEFAULT_RES_PATH)
  const resJson = await fs.readJson(resPath)
  const resources = resJson.resources || []
  let buffer: Buffer, json: any, outputName: string, outputName2: string, fileName: string, fileName2: string, filePath: string, filePath2: string
  for (let r of resources) {
    fileName = r.url
    filePath = path.join(resPath, fileName)
    if (r.type !== 'sheet') {
      buffer = await fs.readFile(filePath)
      outputName = path.join(DEFAULT_RES_PATH, path.dirname(fileName), BASE_NAME)
      outputName = toAssetsByOutputName(compilation, buffer, fileName, getOutputName(fileName, resBaseName))
      r.url = outputName.replace(DEFAULT_RES_PATH, '')
    } else {
      json = await fs.readJson(filePath)
      fileName2 = path.join(path.dirname(fileName), json.file)
      filePath2 = path.join(resPath, fileName2)
      buffer = await fs.readFile(filePath2)
      outputName2 = toAssetsByOutputName(compilation, json, fileName2, getOutputName(fileName2, resBaseName))
      json.file = path.relative(path.join(DEFAULT_RES_PATH, getFileType(fileName)), outputName2)
      outputName = toAssetsByOutputName(compilation, Buffer.from(JSON.stringify(json)), fileName, getOutputName(fileName, resBaseName))
      r.url = outputName.replace(DEFAULT_RES_PATH, '')
    }
  }
  toAssets(compilation, Buffer.from(JSON.stringify(resJson)), path.join(DEFAULT_RES_PATH, DEFAULT_RES_NAME))
}

function getFileType(url: string) {
  const ext = path.extname(url).toLowerCase()
  switch (ext) {
    case '.mp3':
    case '.mp4':
      return 'media'
    case '.png':
    case '.jpg':
      return 'img'
    case '.fnt':
    case '.json':
      return 'data'
    case '.zip':
    case '.dbz':
      return 'bin'
    default:
      return 'other'
  }
}

function getOutputName(fileName, baseName) {
  return path.join(DEFAULT_RES_PATH, getFileType(fileName), baseName)
}

module.exports = processRes