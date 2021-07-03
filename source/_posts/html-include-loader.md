---
title: webpack之html-include-loader开发
date: 2020-11-16 21:12:12
tags: webpack 
---

> 用于我们官网静态网站。实现了html模块化复用，如header，footer。

社区也有方案，比如`webpack-html-plugin`配合`html-loader`， `webpack-html-plugin`支持ejs模板语法，`html-loader`支持引用html模块，写法如下：

```javascript
// `html-loader!` 表示引用html-loader这个加载器来解析。
<%= require('html-loader!./components/header.html') %>
```

这里写得没问题，但是不能在webpack里再配置`html-loader`了，因为`html-loader`会把html内容都转成字符串输出，使得ejs语法失效了。另外一个个人觉得不好的地方，就是这个写法`<%= require %>`不太好看。相比而言还是传统写法直观，下面就来实现一下，改造成更贴近html的语法~

<!--more-->

#### 项目目录

```
-html-include-loader
├─package.json
├─webpack.config.js
├─src
|  ├─index.html
|  ├─components
|  |    ├─footer.html
|  |    └header.html
|  ├─img
|  |  ├─logo.png
├─loaders
|    └html-include-loader.js
```


#### html-include-loader.js
```javascript
// loaders/html-include-loader.js

const path = require('path');
const fs = require('fs');

module.exports = function (content) {

    const callBack = this.async();
    //匹配页面上的，如<include src="components/header.html" />内容 ,获取html组件文件路径，e.g. include/header.html
    let reg = /<include\s+src="([^"]+)"\s+\/\>/gim;
    //当前处理的模块所在的目录 e.g. index.html所在目录：html-include-loader/src/
    let filePath = this.context; 
    // debugger
    content = content.replace(reg, (ret, includePath) => {
        //e.g.  D://loader-plugin-study/src/components/header.html
        let includeHtmlPath = path.resolve(filePath, includePath)

        //依赖收集，webpack可以监测文件变动并刷新
        this.addDependency(includeHtmlPath);

        let includeHtml = fs.readFileSync(includeHtmlPath, { encoding: 'utf-8' })

        return includeHtml
    })
    content = JSON.stringify(content);
    var result = `module.exports = ${content}`;
    
    callBack(null, result)

}

```

#### webpack.config.js

```javascript
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => ({
    entry: {
        index: "./src/js/index.js"
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].js',
        publicPath: env.production ? 'https://cdn.com/' : ''
    },
    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                exclude: [/node_modules/],
                use: {
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: "img",
                        limit: 8192
                    },
                },
            },
            {
                test: /\.html$/,
                exclude: [/include/, /node_modules/],
                use: [
                    {
                        loader: 'html-include-loader'
                    }
                ]
            },
        ]
    },
    //本地开发的loader放在loaders目录下，这里的配置意思是如果在node_modules找不到相关模块，就会去loaders目录下找。
    resolveLoader: {
        modules: ['node_modules', './loaders/']
    },
    // devtool: env.production ? 'nosources-source-map' : 'cheap-module-eval-source-map',
    devServer: {
        port: 9000,
        contentBase: './dist',
        hot: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'index',
            template: './src/index.html'
        }),
        env.production ? null : new webpack.HotModuleReplacementPlugin(),
    ].filter(i => i)
})
```

#### package.json
```json
{
  "name": "html-inlude-loader",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack-dev-server --env.development",
    "build": "webpack --env.production"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "file-loader": "^6.2.0",
    "html-webpack-plugin": "^4.5.0",
    "url-loader": "^4.1.1",
    "webpack": "^4.42.1",
    "webpack-cli": "^3.3.11",
    "webpack-dev-server": "^3.10.3"
  }
}

```

### Usage
```html
<include src="components/header.html" />
<div class="main">
  <img src="img/logo.png" />
</div>
<include src="components/footer.html" />
```

