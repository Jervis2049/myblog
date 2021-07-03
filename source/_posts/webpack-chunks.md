---
title: Webpack中拆分bundle，加快构建速度，提高性能
date: 2019-09-02 11:36:22
tags: webpack
---

#### 背景
> 使用webpack打包项目，通常会把所有js文件打包成一个bundle，如果项目很大，这个bundle也将会很大，这样不仅导致开发过程中，webpack编译慢，而且页面引入一个体积很大的js文件也不好。所以我们要想办法把一些第三方库抽离出来，剩余的业务逻辑代码再打包成一个js文件。以下介绍三种方式。

<!--more-->

#### CDN方式
使用CDN方式引用第三方js
```js
<script src="//cdn.domain/vue/2.5.13/vue.min.js"></script>
<script src="//cdn.domain/vue/2.5.13/vue-router.min.js"></script>
```

externals配置要引用的库，剩余的再另外打包成一个js文件。
```js
...
externals: {
	'vue': 'Vue',
	'vue-router': 'VueRouter',
},
...
```

#### splitChunks

也可以这样，把`vue.min.js`,`vue-router.min.js`,`axios.min.js`等等下载下来放在lib文件夹，最终打包成一个`vendor.js`。
```js
//添加lib第三方库的打包
optimization: {
	minimize: false,
	runtimeChunk : false,
	splitChunks: {
		cacheGroups: {
			vendor: {
				name : 'vendor',
				test: path.resolve("src/js/lib/"),
				chunks: 'all',
				minChunks: 1,
				enforce: true
			}
		}
	}
},
```

#### DllPlugin 

webpack.dll.config.js
```js
const webpack = require('webpack')

function resolve(dir) {
  return path.resolve(__dirname, '../', dir)
}

module.exports = {
  entry: {
    vendors: ['react', 'react-dom']
  },
  output: {
    filename: '[name].js',
    path: resolve('dll'),
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      path: resolve('dll/[name].manifest.json'),
      name: '[name]'
    }),
  ],
}
```

在package.json的scripts添加：`"dll": "webpack --config configs/webpack.dll.config.js"`，然后执行`npm run dll`生成
dll目录，目录下有`vendors.js`和`vendors.manifest.json`。`vendors.js`就是合并打包第三方js的总的文件，`vendors.manifest.json`，这个文件是用于让 DllReferencePlugin 能够映射到相应的依赖上。


webpack.prod.config.js
```js
...
plugins: [
	new webpack.DllReferencePlugin({
		manifest: require('../dll/vendors.manifest.json')
	})
],
...
```