---
title: 基于NodeJs的自定义命令行图片压缩工具制作
date: 2017-09-15 11:36:22
tags: nodejs
---

### 前言

目前，我们小组用的fis已经集成了图片压缩这个功能，通过一行简单的命令，就可以完成对图片的批处理，非常方便。我这里把核心代码抽出来，做了一些修改和扩展，制作成一个独立的工具。

较小组使用的压缩工具，新增了压缩单个或多个文件功能，由于我经常给官网换版头，有时一次就是替换1张，或者2张图而已，所以感觉没必要把项目目录下的所有图片压缩一遍。另外还新增了图片等比缩放功能，这也是源自一次需求，虽然少见。有一次，需求方丢来了20张大概是4000*3000这种尺寸的图片，最大的达到了10M，就算压缩后仍然很大，所以有必要缩小一下图片尺寸。虽然PS可以做批处理缩放，大概就是新建一个“动作”，然后让它重复执行，具体怎么忘了。当时还是一张张用PS修改，还好只有20张，这时候就想，要是可以通过一行命令完成这个事情那就好了！

关于这个工具的制作，小组的这篇文章提供了基本思路，可以参考下：<a href="http://feg.netease.com/archives/207.html" target="_blank" style="color: #B94A48;">自定义命令行工具基于Nodejs</a>

<!--more-->

### 目录结构

在该目录下：C:\Users\用户名\AppData\Roaming\npm ，新建相关文件，以及安装所依赖的插件包。
```
npm
|--nie.cmd  //windows下的命令入口文件(自定义的命令)
|--node_modules  //nodejs的全局插件保存目录
|    |--nie    //nie命令插件的目录
|    |    |--nie.js  //nie命令的代码实现文件
|    |    |--index.js //默认入口文件
|    |    |--package.json
|    |    |--README.md
|    |    |--node_modules    //命令行工具依赖插件包
|    |    |    |--liftoff    
|    |    |    |--minimist   
|    |    |    |--glob       
|    |    |    |--node-pngquant-native 
|    |    |    |--imagemin   
|    |    |    |--imagemin-jpegoptim 
|    |    |    |--images    

```
在nie目录下，`npm init`创建`package.json`文件。到时发布npm包，这个文件是必须要有的，文件里记录了版本号，名称，描述，依赖的插件等等信息。


第三方模块说明：

`liftoff`：自定义命令行，执行命令行插件

`minimist`：命令行参数解析插件

`glob`：用于获取匹配对应规则的文件，基本用法如：
```javascript
var glob = require("glob");
glob('*.jpg',function(err,files){
    console.log(files) //返回一个数组，存放了所有匹配到的文件
})
```
`node-pngquant-native`：用于压缩png图片

`imagemin`、`imagemin-jpegoptim`：用于压缩jpg图片，需要注意的是，这里需要安装指定的版本

```
npm install imagemin@4.0.0 imagemin-jpegoptim@4.1.0 --save
```

`images`：用于等比缩放图片


##### nie.cmd文件
```
@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\nie\nie.js" %*
) ELSE (
  node  "%~dp0\node_modules\nie\nie.js" %*
)
```

### nie.js

```javascript
#!/usr/bin/env node

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var fs = require("fs");
var glob = require("glob");
var command = argv["_"];
var version = require('./package.json').version;

var cli = new Liftoff({
	name: 'nie', // 命令名字
	processTitle: 'nie',
	moduleName: 'nie',
	configName: '',

	// only js supported!
	extensions: {
		'.js': null
	}
});

function mkdirsSync(dirpath, mode) {
	if (!fs.existsSync(dirpath)) {
		var pathtmp = "";
		dirpath.split(path.sep).forEach(function(dirname) {
			if (pathtmp) {
				pathtmp = path.join(pathtmp, dirname);
			} else {
				pathtmp = dirname;
			}

			if (!fs.existsSync(pathtmp)) {
				if (!fs.mkdirSync(pathtmp, mode)) {
					return false;
				}
			}
		});
	}
	return true;
}

function globImg(pattern, imgtype) {


	if (command[0] == 'compress') {

		if (imgtype == 'png') {

			var pngquant = require('node-pngquant-native');

		} else if (imgtype == 'jpg') {

			var Imagemin = require('imagemin');
			var imageminJpegoptim = require('imagemin-jpegoptim');

			if (command.length == 2 || command.length > 2 && typeof command[command.length - 1] != 'number') {
				var max = 60;
			} else if (command.length > 2 && typeof command[command.length - 1] == 'number') {
				var max = command[command.length - 1];
			}

		}
	}

	if (command[0] == 'resize') {
		var images = require("images");
		var quality = command[3] || 100; //质量默认100
	}

	//glob查询所有匹配到的图片
	glob(pattern, function(err, files) {

		var project_path = process.cwd();

		if (command[0] == 'compress') {
			console.log("Compress " + imgtype.toUpperCase() + " Start,Total " + imgtype.toUpperCase() + ": " + files.length);
		}
		if (command[0] == 'resize') {
			console.log("Resize " + imgtype.toUpperCase() + " Start,Total " + imgtype.toUpperCase() + ": " + files.length);
		}

		for (var i = 0; i < files.length; i++) {

			var relative_path = path.relative(project_path, files[i]);
			if (!fs.existsSync(project_path + "/output/" + path.dirname(relative_path))) {
				mkdirsSync(path.join(project_path + "/output/" + path.dirname(relative_path)));
			}
			var startTime = new Date();
			//压缩图片
			if (command[0] == 'compress') {
				if (imgtype == 'png') { //png的处理方式

					var buffer = fs.readFileSync(files[i]);
					var resBuffer = pngquant.compress(buffer, {
						"speed": 10
					});
					fs.writeFileSync('./output/' + relative_path, resBuffer, {
						flags: 'wb'
					});

				} else if (imgtype == 'jpg') { //jpg的处理方式
					new Imagemin()
						.src(files[i])
						.dest('./output/' + path.dirname(relative_path))
						.use(imageminJpegoptim({
							progressive: true,
							max: max
						}))
						.run();
				}
				console.log("Compress File Success(" + (new Date() - startTime) + "ms):" + path.basename(files[i]));
			}
			//修改图片尺寸
			if (command[0] == 'resize') {
				images(files[i]) //Load image from file 					
					.size(command[2]) //Geometric scaling the image to * pixels width
					.save('./output/' + files[i], {
						quality: quality //图片质量设置
					});
				console.log("Resize File Success(" + (new Date() - startTime) + "ms):" + path.basename(files[i]));
			}
		}
	})

}

function compress(imgtype) {
	if (command[0] == 'compress') {
		if (command[1] == imgtype) {
			globImg('**/*.' + imgtype, imgtype)
			return false;
		} else if (command[1] && command[1].indexOf('.' + imgtype) != -1) {
			if (command.length == 2) { //压缩单个文件如 nie compress 1.png
				globImg(command[1], imgtype);
				return false;
			} else {
				globImg('{' + command.slice(1).join(',') + '}', imgtype); //压缩多个文件如 nie compress 1.png 2.png 3.png		
			}
		}
	}
}

function resize(imgtype) {
	if (command[0] == 'resize') {
		if (command[1] == imgtype && command[2]) {
			globImg('**/*.' + imgtype, imgtype)
			return false;
		}
	}
}

cli.launch({
	cwd: argv.r || argv.root,
	configPath: argv.f || argv.file
}, function(env) {

	if (process.argv[2] == '-v') { // nie -v  
		console.log('v' + version) //输出版本
	}

	//压缩png图片
	compress('png')

	//压缩jpg图片
	compress('jpg')

	//等比修改png图片尺寸
	resize('png')

	//等比修改jpg图片尺寸
	resize('jpg')

});
```

### index.js
```
var compress = module.exports =  require('nie');

```
制作阶段完成之后，注册npm账号，然后`npm login`登录，`npm publish`就发布了。如果有修改，下次发布前需要在`package.json`文件修改一下版本号。发布之后，<a href="https://www.npmjs.com/package/nie" target="_blank" style="color: #B94A48;">官网</a>这里就可以搜到这个了。


### 安装
发布之后就可以通过npm方式来安装这个工具了，安装比较慢的话，可以带上`--registry=https://registry.npm.taobao.org`

```
npm install -g nie --registry=https://registry.npm.taobao.org
```

### 使用

压缩所有png图片

```
nie compress png
```
压缩单个png图片，如
```
nie compress 1.png
```

压缩多个png图片，如
```
nie compress 1.png 2.png 3.png
```

压缩所有jpg图片，压缩质量不填，默认会是60

```
nie compress jpg 80
```
压缩单个jpg图片，如
```
nie compress 1.jpg 80
```

压缩多个jpg图片，如
```
nie compress 1.jpg 2.jpg 3.jpg 80
```

等比缩放jpg或png图片，参数400为设置的宽度，参数90是图片质量，不填默认是100

```
nie resize jpg 400 90

```
```
nie resize png 400 90

```

### 写在最后

其实还是觉得这个工具还是有些缺点的,等比压缩图片处理之后的图片质量不太好，有空再看看有没更好的插件。另外，就是对一般人来说操作成本有点高，毕竟不是谁都习惯敲命令，一般人更希望的是有图形界面操作，所以有想法研究一下用electron写个桌面应用程序...