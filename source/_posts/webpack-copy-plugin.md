---
title: 实现一个拷贝文件到指定目录的webpack插件
date: 2020-05-10 22:19:03
tags: webpack
---
### 前言
最近在写一个chrome扩展，里面有些js文件，并不需要打包到html里面。比如backgound.js,content.js。但又需要它们存在js目录下。所以需要额外的复制这些js文件到打包后的js文件夹下。

也看到有`copy-webpack-plugin`这样的现成插件可以使用。但自己还是尝试简易实现一下这个功能。基本思路就是在代码构建好之后（afterEmit钩子）进行读写文件操作。

<!--more-->
#### 实现

utils.js
```javascript
/**
 * @param {Promise} promise 
 */
exports.awaitTo = (promise) => {
    return promise.then(res => [null, res]).catch(err => [err])
}

/**
 * @description: throw error
 * @param {string} error message 
 */
exports.error = (msg) => {
    return new Error(msg);
}

```
options.json
```json
{
  "type": "object",
  "properties": {
    "from": {
      "type": "string",
      "minLength": 1
    },
    "to": {
      "type": "string"
    }
  },
  "additionalProperties": false,
  "required": ["from"]
}
```
webpack-copy-plugin.js
```javascript

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const { awaitTo, error } = require('./utils');
const { validate } = require('schema-utils');
const schema = require('./options.json');

/**
* copy files from the source directory to the output directory
* @param {string} from - from source directory path
* @param {string} to - output directory path
*/
class CopyFile {

	constructor(options = {}) {
		validate(schema, options, {
			name: 'Copy Plugin',
			baseDataPath: 'options',
		});
		this.options = options;
	}
	apply(compiler) {
		let from = this.options.from,
			to = this.options.to || compiler.options.output.path;
		//compiler钩子afterEmit ：生成资源到目录之后。
		compiler.hooks.afterEmit.tap("CopyPlugin", compilation => {
			// console.log(Object.keys(compilation.assets))
			this.copyHandle(from, to)
		});
	}
	async copyHandle(from, to) {

		let err, stats;

		[err] = await awaitTo(stat(from));
		if (err) throw error('Error occurred while checking the source directory.');


		[err, stats] = await awaitTo(stat(to));

		if (!stats) {

			[err] = await awaitTo(mkdir(to))
			if (err) throw error('Error occurred while making directories.')
			this.copyHandle(from, to)

		} else {

			let dirList;
			[err, dirList] = await awaitTo(readdir(from));
			if (err) throw error('Error occurred while reading the source directory.');

			for (let i = 0; i < dirList.length; i++) {
				let sourcePath = path.resolve(from, dirList[i]),
					destPath = path.resolve(to, dirList[i]),
					readStream, writeStream, stats;

				[err, stats] = await awaitTo(stat(sourcePath));
				if (err) throw error('Error occurred while checking source subdirectory.');

				if (stats.isFile()) {
					// 创建读取流
					readStream = fs.createReadStream(sourcePath);
					// 创建写入流
					writeStream = fs.createWriteStream(destPath);
					// 通过管道来传输流
					readStream.pipe(writeStream);
				} else if (stats.isDirectory()) {
					this.copyHandle(sourcePath, destPath)
				}
			}
		}
	}
}
module.exports = CopyFile
```
#### 使用

```javascript
const CopyFile = require('../libs/webpack-copy-plugin')
new CopyFile({
	from: path.resolve(__dirname, '../src/js/app/'),
	to: path.resolve(__dirname, '../dist/js/')
})
```


