---
title: 编写一个webpack loader，用于获取指定目录下的图片，返回图片URL数组
date: 2019-10-16 14:12:12
tags: webpack
---

## 前言

经常遇到这么一个问题。h5项目需要做图片资源预加载的情况，我们往往需要手动的拿到一个个图片地址存在数组里面，然后再对其遍历做预加载处理，比如这样：
```javascript
let imgList = ['http://domain.com/img/1.jpg','http://domain.com/img/2.jpg','http://domain.com/img/3.jpg',...];
```

本着能偷懒就偷懒的心态，我们可以编写一个webpack loader来处理，然后给我们返回以上所述那样一个数组。

预期在页面上这样调用，获取项目目录下的img文件夹的图片，给返回一个URL数组。注意，这里的`__getPath`并不是一个方法，只是把它写得像一个方法而已，而且js里面也没有像函数那样声明它，实际上它是在loader里面做了转换。

```javascript
let imgList = __getPath('img');
```
<!--more-->

## 原理
代码量很少，其实原理也比较简单，使用正则匹配`__getPath('img')`获得图片所在的文件夹名称，然后拿到图片的相对路径，require，再将其拼接字符返回，如：
```javascript
[require("img/1.jpg"),require("img/2.jpg"),require("img/3.jpg"),...]
```

最终return的content会被执行，然后就返回了一个图片URL数组。
```javascript
const fs = require("fs")
const path = require('path');
const glob = require('glob');
const loaderUtils = require('loader-utils');

module.exports = function (content) {
    const options = loaderUtils.getOptions(this) || {}; 
    if(options.noCache)this.cacheable(false);
    
    let fileReg = /__getPath\(([^\)]+)\)/gim;
    //自定义文件 context|| 从webpack 4开始，原先的this.options.context被改进为this.rootContext
    let rootPath = options.context || this.rootContext || (this.options && this.options.context);
    let srcPath = path.join(rootPath, "/src");
    let filepath = this.context; ////当前处理文件所在的目录
    content = content.replace(fileReg, (ret, src) => {
        let folderName = src.replace(/'|"/g, "");
        let resList = glob.sync(path.join(srcPath, folderName) + "/*");
        let result = '[';
        for (let i = 0; i < resList.length; i++) {
            let respath = path.relative(filepath, resList[i]).replace(/\\/g, "/")
            result += "require('" + respath + "')" + ","
        }
        result = result.substr(0,result.length-1) + "]";
        return result;
       
    })
    return content;
}
```

## 安装和使用
我将其命名为`imgurl-loader`发布到npm上了。
```javascript
 npm install --save-dev imgurl-loader
```
### webpack配置
```javascript
...
  module: {
    rules: [
	 {
        test: /\.js$/, 
        include:/src/,
		use: [{
          loader:'imgurl-loader'
        }]
      },
      //图片处理
	{
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [{
            loader: 'file-loader',
            options: {
                outputPath: 'img',
                name: '[name]_[contenthash:8].[ext]'
            }
        }]
    }
    ],
  },
```

**Demo:** [https://github.com/Jervis2049/imgurl-loader/tree/demo](https://github.com/Jervis2049/imgurl-loader/tree/demo)



