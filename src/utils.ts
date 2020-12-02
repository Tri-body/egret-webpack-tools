import path from 'path'
import crypto from 'crypto'

function getHashDigest(buffer: Buffer) {
  return crypto.createHash('md4').update(buffer).digest('hex')
}

function getFinalFilePath(filePath, basename, fileHash, ext) {
  ext = ext.replace('.', '')
  const finalPath = filePath
    .replace(/\[contenthash/i, '[hash')
    .replace(/\[chunkhash/i, '[hash')
    .replace(/\[name\]/i, basename)
    .replace(/\[ext\]/i, ext)
  const hashReg = /\[hash(?:(?::)([\d]+))?\]/i
  if (hashReg.test(finalPath)) {
    const hashResult = finalPath.match(hashReg)
    const hashLength = hashResult[1] ? Number(hashResult[1]) : 20
    return finalPath.replace(hashReg, fileHash.substr(0, hashLength))
  }
  return finalPath
}

export function toAssets(compilation: any, buffer: Buffer, name: string) {
  compilation.assets[name] = {
    source: () => buffer,
    size: () => buffer.length
  }
}

export function toAssetsByOutputName(compilation: any, buffer: Buffer, baseName: string, outputName?: string) {
  const name = path.parse(baseName)
  const hash = getHashDigest(buffer)
  const outputOptions = compilation.outputOptions || {}
  const cfgFilename = outputName || outputOptions.chunkFilename || outputOptions.filename || baseName
  const realName = getFinalFilePath(cfgFilename, name.name, hash, name.ext)
  toAssets(compilation, buffer, realName)
  return realName
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