### egret webpack tools

webpack plugins for egret

----

##### webpack插件

- EgretDevWebpackPlugin - 调试模式使用的插件

- EgretWebpackPlugin - 生产环境使用的插件

##### 设计思路 

egret一直让人吐槽的地方就是namespace的开发方式和编译工具不够强大，新版本可以用模块方式开发了，并引入了webpack进行编译，但用起来还是不舒服，所以自己尝试实现插件，摆脱egret自带的编译工具。

* eui的编译 - 其实代码本身用webpack编译是没啥问题的，需要特殊处理的是eui的编译，这一块还是需要用到egret sdk中的编译工具。基本逻辑就是查找本机安装的egret sdk，调用相关接口
* egret资源的处理，主要是指走egret那套资源管理的resource目录下的资源，因为要和eui配置使用，所以还是要保留的。其他资源可以结合url-loader走webpack的资源管理方式。

##### 编译调试

```bash
# 编译工具插件
npm install
npm run build

# 例子工程
cd example/01
npm install
npm run dev
```



#####  使用注意

1. 使用egret create 建个项目，用模块方式开发。 添加package.json文件走webpack工作流， 要注意的是egret项目里存在 package.json文件会导致egret的命令出问题，所以如果要执行egret命令时（比如升级egret sdk，或更新libs等），可以给package.json改个名字，执行完再改回来。
2. Main.ts 中要加一句`window['Main'] = Main`，暴露入口函数
3. eui的自定义组件也需要加一句`egret.registerClass(XXXComponent, 'XXXComponent');` 手动注册组件好给eui自动创建



##### todo

- [ ] 支持windows环境
- [ ] 入口优化，不依赖egret自带的html模板