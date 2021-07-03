---
title: Chrome扩展开发如何调试？
date: 2019-11-12
tags: chrome
---

之前没用构建工具的时候，项目目录大概是这样的：
```
├── css
├── img
├── js
│   ├── content.js		
│   ├── background.js		
│   └── popup.js
├── manifest.json
└── popup.html
```

打开`chrome://extensions/`，点击`加载已解压的扩展程序`，把这个项目目录导进去就可以了。但是不好的地方是改动之后不会热更新，而且代码组织不方便。初始阶段可以采用这样的做法，熟悉以后应该使用工程化的做法。

<!--more-->

使用webpack后的项目目录
```
├─.babelrc
├─.gitignore
├─package.json
├─README.md
├─webpack.config.js
├─src
|  ├─background.html 
|  ├─content.html
|  ├─manifest.json
|  ├─popup.html  
|  ├─utils
|  ├─pages
|  |   ├─popup
|  ├─img
|  ├─fonts
|  ├─entry
|  |   ├─background.js
|  |   ├─content.js
|  |   └─popup.js
|  ├─config
|  ├─components
├─dll
|  ├─vendors.js
|  └vendors.manifest.json
├─configs
|    ├─utils.js
|    ├─webpack.base.config.js
|    ├─webpack.dev.config.js
|    ├─webpack.dll.config.js
|    └─webpack.prod.config.js
```

从上面可以看到`entry`目录下有`popup.js`、`content.js`、`background.js`，而且src目录有3个html与它们一一对应。（其中只有popup.html是有用的，其它的两个html只是为了热更新content.js和background.js而存在）。这里为了动态生成webpack的`entry`配置。

摘取部分配置。

`webpack.base.config.js`
```js
...
function getEntry(globPath) {

    let files = glob.sync(globPath);
    let entries = {},
        entry, dirname, basename, pathname, extname;

    for (let i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);//返回路径的所在的文件夹名称
        extname = path.extname(entry);//返回指定文件名的扩展名称
        /**
         * path.basename(p, [ext])
         * 返回指定的文件名，返回结果可排除[ext]后缀字符串
         * path.basename('/foo/bar/baz/asdf/quux.html', '.html')=>quux
         */
        basename = path.basename(entry, extname);
        pathname = path.join(dirname, basename);//路径合并
        entries[basename] = entry;
    }
    //返回map=>{fileName:fileUrl}
    return entries;
}
//获取所有的入口文件
let jsEntries = getEntry('./src/entry/*.js');
let config = {
    entry: jsEntries,
    resolve: {

    },
    module: {

    },
    plugins: [

    ],
}
//获取所有html页面
let tplPages = Object.keys(getEntry('./src/*.html'));

tplPages.forEach((pathname) => {
    let conf = {
        filename: pathname + '.html',
        template: './src/' + pathname + '.html',
        chunks: ["vendors", pathname]
    };
    config.plugins.push(new HtmlWebpackPlugin(conf));
});
...
```

到此目前为止，build可以生成我们想要的文件了。但是！只能是生产环境的build，因为dev模式下打包通常是存在内存中，并没有产出实际的文件的，那这样怎么加载项目调试呢？难不成我每修改一下就build一次生产环境的，生成最终打包的文件，然后再打开`chrome://extensions/`导入预览。这样显然不友好，经查阅文档，找到了webpack-dev-server一个配置项，设置writeToDisk为true即可，意为写入硬盘，产出实体文件。


`webpack.dev.config.js`如下：
```js
const webpackMerge = require("webpack-merge");
const baseConfig = require("./webpack.base.config")
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { resolve } = require("./utils");

const config = webpackMerge.smart(baseConfig, {
    output: {
		path: resolve('debug'),
		filename: 'js/[name].js'
	},
    plugins: [
        new CopyWebpackPlugin([{
			from: resolve('src/img/'),
			to: resolve('debug/img/')
		},{
			from: resolve('src/manifest.json'),
			to: resolve('debug/manifest.json')
		}]),
    ],
    devServer: {
        writeToDisk: true,
        port: 9000, 
    }
});

config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
)

module.exports = config;
```

这样`npm run dev`的时候就可以生成`debug`目录了。每次修改文件，也会重新build，生成最新的。

此外还有个问题，dev模式打包的js文件里面含有eval，chrome认为这样是不安全的，eval的使用会存在XSS的风险。
```
Uncaught EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self' blob: filesystem:".
```

解决方法是在`manifest.json`加上一个配置，以暂时放松eval策略，production环境打包的时候再去掉就好了。

```js
"content_security_policy": "script-src 'self' 'unsafe-eval'; object-src'self'"
```

写个plugin，修改manifest.json，生成新的。

```js
// configs/new-manifest-plugin.js

/**
 * prodution环境打包，重新生成manifest.json。新的manifest.json去除了content_security_policy字段。
 */
 class Manifest {

    constructor() {

    }
    apply(compiler) {

        const pluginName = this.constructor.name;

        //emit钩子表示生成资源到 output 目录之前。
        compiler.hooks.emit.tapAsync(pluginName, (compilation, cb) => {

            let manifest = require("../src/manifest.json")

            if (manifest.content_security_policy) {
                delete manifest.content_security_policy
            }
            let newManifest = JSON.stringify(manifest);

            compilation.assets["manifest.json"] = {
                source: () => {
                    // fileContent 即可以代表文本文件的字符串，也可以是代表二进制文件的buffer
                    return newManifest;
                },
                // 返回文件大小
                size: () => {
                    return newManifest.length
                }
            }
            // 执行回调，让 webpack 继续执行
            cb();
        });

    }
}

module.exports = Manifest
```