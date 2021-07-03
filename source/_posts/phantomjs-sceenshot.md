---
title: 使用PhantomJS对网页截屏
date: 2017-03-29 22:42:44
tags: 其它
---
> PhantomJS 可以看做是一个没有UI界面的webkit浏览器，这个东西用途很广泛，可以用来做网络监控，网页截屏，自动化测试等等，这里抛砖引玉，做个简单的介绍，就主要介绍下它截图的这功能。

### 1.安装

到<a href="http://phantomjs.org/download.html" target="_balnk" style="color:#B94A48;">官网</a>下载`phantomjs.exe`，然后复制文件所在路径`D:\chrome download\phantomjs-2.1.1-windows\bin`（这个是我的路径） ，在环境变量的系统变量中找到path，添加即可，这样就可以在任意地方执行CMD命令操作PhantomJS了。

<!--more-->

### 2.使用

demo.js
```javascript
var page = require('webpage').create();//创建网页对象

page.open('http://game.163.com', function(status) {
	if (status !== 'success') {
		console.log('Unable to load the address!')
	} else {
		page.render('a.jpg');//导出a.jpg
		phantom.exit();//退出程序
	}
})
```


在CMD命令行窗口输入 `phantomjs demo.js`，就可以导出game.163.com的截图了。这样我们在没有打开浏览器的情况就知道它页面长什么样了~

![1.png][1]

看截下来的图，会发现一些问题，截图宽度是1260，显示不全，最明显的是中间一块有留白。留白原因是有些页面可能是做了lazyload，需要滚动到相应的位置才会触发。下面进一步调整解决这个问题，这样就能看到完整的截图了，这里就不贴图了。


```javascript
var page = require('webpage').create();//创建网页对象

page.viewportSize = { width: 1920, height: 100 };//高度可以随意给个值
page.open('http://game.163.com', function(status) {
	if (status !== 'success') {
		console.log('Unable to load the address!')
	} else {
		page.evaluate(function(){
			scrollTo(0, 10000); //给个足够大的值滚动到底部
		})
		//也可以截取某个区域
		// page.clipRect = { 
		// 	top: 0,
		// 	left: 0,
		// 	width: 1920,// 宽度
		// 	height: 400 //高度
		// }
		setTimeout(function() {
			page.render('a.jpg', { //导出a.jpg
				format: 'jpg',
				quality: '100' //对比发现默认好像不是100，设置为100截图更清晰
			});
			phantom.exit(); //退出程序
		}, 1000);
	}
})

```
我们还可以在`page.evaluate`中的函数里对页面做一些操作，比如Dom操作...这里遍历了页面上所有的a元素，然后加个border，最后我们可以把这个效果截图导出来~
```javascript
    ...
    page.evaluate(function() {
        scrollTo(0, 10000); //给个足够大的值滚动到底部
    	var aList = document.querySelectorAll("a");
    	[].forEach.call(aList,function(a){
    	  a.style.border="1px solid red";
    	})
    });
    ...
```
![2.png][2]


 #### System Module 
 
下面将使用system模块提供的args。
+ system.args {String[]}  获取运行phantomjs时传入的所有参数

从上面的介绍看，很多东西都是写死的，比如图片大小的设置，url，图片名称等等。我们可以使用system.args来代替这些。
```javascript
var page = require('webpage').create(),
	address, output, sizeX , sizeY;
var system = require('system');

var arg_count = system.args.length;
if (arg_count !=  5) {
	console.log('Usage: **.js URL filename sizeX sizeY');
	phantom.exit();
} else {

	address = system.args[1];
	output = system.args[2];
	sizeX = system.args[3];
	sizeY = system.args[4];
	page.viewportSize = {
		width: sizeX,
		height: sizeY
	};
	page.open(address, function(status) {
		if (status !== 'success') {
			console.log('Unable to load the address!');
		} else {
			page.evaluate(function() {
			      scrollTo(0, 10000); //给个足够大的值滚动到底部
			});
			setTimeout(function() {
				page.render(output, {
					format: 'jpg',
					quality: '100' //对比发现默认好像不是100，设置为100截图更清晰
				});
				phantom.exit();
			}, 1000);
		}
	});
}
```

我们试下对<a href="http://my.163.com" target="_blank">梦幻官网</a>截屏，输入CMD命令，其中demo.js就是第一个参数，以此类推...
```
phantomjs demo.js http://my.163.com bg.jpg 1920 1000
```
观察导出的效果图，又发现问题了，第一，有个黑色透明弹层(不支持flash，视频没显示出来，这问题忽略)。第二，可以看到中间一块是黑色的。我想拿到一开始没有视频弹窗，而且中间的一块不会出现黑色的截图，怎么办？（温馨提示：如果你看到页面不是这样，梦幻官网有可能改版了~）
![3.png][3]


### addCookie
Phantomjs有操作Cookie的一些API。

+ addCookie(Object) {Boolean}

这个是官网的一个例子
```
phantom.addCookie({
  'name': 'Added-Cookie-Name',
  'value': 'Added-Cookie-Value',
  'domain': '.google.com'
});
```
<a href="http://my.163.com" target="_blank" style="color:#B94A48;">梦幻官网</a>现在有这样的一个逻辑，当你第一次访问的时候，会有个判断，如果没有相关的Cookie，就会出现视频弹窗，然后下次访问就没有了。一开始，我们可以手动种一下Cookie，去掉这个视频弹窗，然后最后截取到没有透明黑色弹层的页面。

到<a href="http://my.163.com" target="_blank" style="color:#B94A48;">梦幻官网</a>，打开开发者工具，找到这个cookie

![12.png][4]

具体代码如下：
```javascript
var page = require('webpage').create(),
	address, output, sizeX , sizeY;
var system = require('system');

var arg_count = system.args.length;
if (arg_count != 5) {
	console.log('Usage: **.js URL filename sizeX sizeY');
	phantom.exit();
} else {

	address = system.args[1];
	output = system.args[2];
	sizeX = system.args[3];
	sizeY = system.args[4];

	page.viewportSize = {
		width: sizeX,
		height: sizeY
	};
	phantom.addCookie({
		'name': 'myVideoPop',
		'value': '1',
		'domain': 'my.163.com'
	});
	page.open(address, function(status) {
		if (status !== 'success') {
			console.log('Unable to load the address!');
		} else {

			page.evaluate(function() {
				scrollTo(0, 10000); 
			});
			setTimeout(function() {
				page.render(output, {
					format: 'jpg',
					quality: '100'
				});
				phantom.exit();
			}, 1000);
		}
	});
}
```

这次导出的效果图：

![11.png][5]


可以看到黑色透明弹层终于没了，还剩最后一个问题，为啥那块是黑色的呢，原因也简单，因为没有背景色，需要我们加个背景色，然后就可以去掉黑块了。这问题官网给了答案。

> Q: When using render(), why is the background transparent?

> A: PhantomJS does not set the background color of the web page at all, it is left to the page to decide its background color. If the page does not set anything, then it remains transparent.

> To set an initial background color for a web page, use the following trick:
```javascript
page.evaluate(function() {
    document.body.bgColor = 'white';
});
```


  [1]: http://feg.netease.com/usr/uploads/2017/03/4252741625.png
  [2]: http://feg.netease.com/usr/uploads/2017/03/1655246296.png
  [3]: http://feg.netease.com/usr/uploads/2017/03/944031150.png
  [4]: http://feg.netease.com/usr/uploads/2017/03/1833297422.png
  [5]: http://feg.netease.com/usr/uploads/2017/03/2329043885.png