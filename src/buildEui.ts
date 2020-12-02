import fs from 'fs-extra'
import path from 'path'
import find from 'find'
import { EgretEUIThemeConfig, EXMLFile, EXMLFile2 } from './types';

//@ts-ignore
global.egret = global.egret || {};
//@ts-ignore
global.registerClass = "egret";
//@ts-ignore
egret.args = {}

let sdkRoot: string

function checkSdkExist(path: string): string {
  if (path) {
    if (fs.existsSync(path)) {
      return path
    }
    console.warn(`egret sdk root: ${path} is not exist!`)
  }
  if (process.platform === 'win32') { // ignore windows os
    return null
  }
  const cwd = process.cwd()
  const execSync = require('child_process').execSync
  path = execSync(`cd ${cwd} && egret info | awk 'END {print}' | awk -F '：|:' {'print $2'}`, {
    encoding: 'utf-8'
  }).trim()
  if (path && fs.existsSync(path)) {
    console.log(`find egret sdk root: ${path}`)
    return path
  }
  console.warn(`not found egret sdk!`)
  return null
}

/**
 * 编译项目的eui文件
 * @param resPath egret项目resource目录路径
 * @param sdkRoot egret sdk路径，如果不传会尝试通过egret命令去查找
 * @param projectRoot egret项目根目录，如果传会使用命令执行目录
 */
export async function buildEui(resPath: string, sdkRoot?: string, projectRoot?: string) {
  sdkRoot = checkSdkExist(sdkRoot)
  if (!sdkRoot || !resPath) return null
  //@ts-ignore
  egret.root = sdkRoot
  projectRoot = projectRoot || process.cwd()
  //@ts-ignore
  egret.args.projectDir = projectRoot
  const exmlFiles = find.fileSync(/\.exml$/i, resPath)
  let exmls: { filename: string, contents: string }[] = []
  let file: string
  let filename: string
  let contents: string
  if (exmlFiles) {
    for (let i = exmlFiles.length - 1; i >= 0; i--) {
      file = exmlFiles[i]
      filename = path.relative(projectRoot, file)
      contents = await fs.readFile(file, { encoding: 'utf-8' })
      exmls.push({ filename, contents: contents.trim() })
    }
    exmls = exmls.sort((a, b) => a.filename.localeCompare(b.filename))
  }
  const thmFiles = find.fileSync(/\.thm\.json$/i, resPath)
  const themeDatas = []
  let data: any
  if (thmFiles) {
    for (let i = thmFiles.length - 1; i >= 0; i--) {
      file = thmFiles[i]
      filename = path.relative(projectRoot, file)
      data = await fs.readJSON(file, { encoding: 'utf-8' })
      data.path = filename
      themeDatas.push(data)
    }
  }
  return publishEXML(exmls, themeDatas)
}

function publishEXML(exmls: EXMLFile2[], themeDatas: EgretEUIThemeConfig[]) {
  const exml = require(`${sdkRoot}/tools/lib/eui/EXML`)
  const exmlParser = require(`${sdkRoot}/tools/lib/eui/EXMLParser`)

  var oldEXMLS: EXMLFile[] = [];
  themeDatas.forEach((theme) => {
    if (!theme.exmls || theme.autoGenerateExmlsList) {
      theme.exmls = [];
      for (let exml of exmls) {
        theme.exmls.push(exml.filename);
      }
    }
  })

  let paths: string[] = []
  themeDatas.forEach((theme) => {
    theme.exmls && theme.exmls.forEach(e => {
      var path = e.path ? e.path : e;
      if (oldEXMLS[path]) {
        oldEXMLS[path].theme += theme.path + ",";
        return;
      }
      var exmlFile = {
        path: path,
        theme: "," + theme.path + ","
      }
      oldEXMLS[path] = exmlFile;
      oldEXMLS.push(exmlFile);
      paths.push(path);
    });
  });

  exmls = exml.sort(exmls);

  let screenExmls = []
  let versionExmlHash = {};
  for (let exml of exmls) {
    for (let path of paths) {

      if (path.indexOf(exml.filename) > -1) {
        screenExmls.push(exml);
        versionExmlHash[exml.filename] = path;
        versionExmlHash[path] = exml.filename;
      }
    }
  }

  themeDatas.forEach(theme => theme.exmls = []);
  screenExmls.forEach(e => {
    exmlParser.fileSystem.set(e.filename, e);
    var epath = versionExmlHash[e.filename];
    themeDatas.forEach((thm) => {
      if (epath in oldEXMLS) {
        const exmlFile = oldEXMLS[epath];
        if (exmlFile.theme.indexOf("," + thm.path + ",") >= 0) {
          thm.exmls.push(epath);
        }
      }
    });
  })
  themeDatas.forEach(theme => theme.exmls = []);
  screenExmls.forEach(e => {
    exmlParser.fileSystem.set(e.filename, e);
    var epath = e.filename;
    var exmlEl: any;
    // commonjs parse
    var parser1 = new exmlParser.EXMLParser();
    let result1 = parser1.parse(e.contents);
    exmlEl = { path: e.filename, gjs: result1.code, className: result1.className };

    themeDatas.forEach((thm) => {
      if (versionExmlHash[epath] in oldEXMLS) {
        const exmlFile = oldEXMLS[versionExmlHash[epath]];
        if (exmlFile.theme.indexOf("," + thm.path + ",") >= 0)
          thm.exmls.push(exmlEl);
      }
    });
  });
  return themeDatas.map((thmData) => {
    let path = thmData.path;
    let content = `
              var __extends = this && this.__extends|| function (d, b) {
                  for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
                      function __() {
                          this.constructor = d;
                      }
                  __.prototype = b.prototype;
                  d.prototype = new __();
              };`;
    content += `
              window.generateEUI = window.generateEUI||{};
              generateEUI.paths = generateEUI.paths||{};
              generateEUI.styles = ${JSON.stringify(thmData.styles)};
              generateEUI.skins = ${JSON.stringify(thmData.skins)};`;

    let namespaces = [];
    for (let item of thmData.exmls) {
      let packages: string[] = item.className.split(".")
      let temp = '';
      for (let i = 0; i < packages.length - 1; i++) {
        temp = i == 0 ? packages[i] : temp + "." + packages[i];
        if (namespaces.indexOf(temp) == -1) {
          namespaces.push(temp);
        }
      }
      content += `generateEUI.paths['${item.path}'] = window.${item.className} = ${item.gjs}`;
    }
    let result = namespaces.map(v => `window.${v}=window.${v}||{};`).join("\n");
    content = result + content;
    path = path.replace("thm.json", "thm.js");
    return { path, content }
  })
}