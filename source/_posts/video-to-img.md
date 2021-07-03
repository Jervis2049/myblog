---
title: 移动端视频转序列图片播放
date: 2019-05-08 16:32:19
tags: 其它
---
### 页面使用视频嵌入的问题：
1.微信支持视频内嵌播放,支持自动播放
2.IOS 10以下safari不支持视频内嵌及自动播放
3.IOS 10及以上safari支持视频内嵌及无音轨视频的自动播放
4.安卓下原生浏览器播放控制栏规范不统一，部分机型无法隐藏，内嵌播放及自动播放规范不统一
5.安卓和IOS的第三方浏览器会弹出小窗口播放视频，无法内嵌显示

### 解决方案

将视频转化成序列帧，用JS控制img的src进行切换，视觉上达到和播放视频一样的效果。这种方式也是有局限性的，视频不能太大，建议控制在5s以内，本次项目就是5s的视频导出的base64 js达到了3.5M，勉强可以用。所以3s视频转base64序列帧，大小感觉最适中。视频太大的话，导出的图片就会多，那么存放base64的JS文件也将会很大，所以这个是要根据具体情况斟酌的。

<!--more-->

#### 1、使用 Premiere 将视频转化成序列帧 

![image](https://s1.imagehub.cc/images/2020/11/03/1562588258.png)

选择合适的尺寸，宽750会比较大，可选600，640。质量选择50左右。输出格式选择JPEG，帧速率选择12-15。5s的视频，选择12帧速率，导出了60张：
![image](https://s1.imagehub.cc/images/2020/09/29/1257f8502c8fcd77bf.png)


#### 2、使用node将导出的图片转化成base64

将导出的图片转化成base64，然后以数组的形式存放在一个JS文件，最终生成这个JS文件。

目录结构
```javascript
|--img
|--index.js   
```
index.js   
```javascript
const fs = require('fs');
const toBase64 = foldername => {
	let fileNmaeArr = fs.readdirSync(foldername);
	let strBase64 = "";
	fileNmaeArr.sort((a, b) => {
		return parseInt(a) - parseInt(b)
	})
	fileNmaeArr.forEach((item, index, array) => {
		let path = foldername + '/' + item;
		let str = fs.readFileSync(path, {
			encoding: 'base64'
		})
		if (index < array.length - 1) {
			strBase64 += '\"' + str + '\"' + ",";
		} else {
			strBase64 += '\"' + str + '\"';
			let imgs = `var imgList = [${strBase64}]`;
			fs.writeFileSync('img.js', imgs);
			console.log("导出成功！")
		}
	})
}
toBase64('img')
```
执行`node index.js` 导出`img.js`

### 3、JS切换img标签的src，播放序列帧

`ImgSequence `调用前，页面要先预加载img.js。
```html
<img src="" id="imgVideo">
```

```javascript
var requestAnimFrame = (function() {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60)
		}
	)
})()

var ImgSequence = function() {
	var _class = function(opt) {
		this.el = opt.el;
		this.imgArr = opt.imgArr || [];
		this.isOver = false;
		this.nowPic = 0;
		this.oldPic = -1;
		this.startPic = opt.startPic || 0;
		this.speed = opt.speed || 12;
		this.isLoop = opt.isLoop === false ? false : true;
		this.complete = opt.complete;
		this.playing = opt.playing;
	}
	_class.prototype = {
		loop: function() {
			if (this.isOver) {
				return;
			}
			this.ntime = +new Date;
			this.diftime = this.ntime - this.stime;
			this.nowPic = Math.floor(this.diftime * this.speed * 0.001) + this.startPic;
			if (typeof this.playing == "function") {
				this.playing(this)
			}
			if (this.nowPic >= this.imgArr.length) {
				if (typeof this.complete == "function") {
					this.complete(this)
				}
				this.startPic = 0;
				if (this.isLoop) {
					this.play();
				}
				return;
			}
			requestAnimFrame(() => {
				this.loop();
			});
			if (this.nowPic == this.oldPic) {
				return;
			}
			this.el.setAttribute("src", "data:image/jpg;base64," + this.imgArr[this.nowPic]);
			this.oldPic = this.nowPic;
		},
		play: function() {
			this.oldPic = -1;
			this.stime = +new Date;
			this.el.setAttribute("src", "data:image/jpg;base64," + this.imgArr[this.startPic]);
			this.loop();
		},
		onplay: function() {
			this.isOver = false;
			this.play()
		},
		stop: function() {
			this.isOver = true;
			this.startPic = this.nowPic;
		}
	}
	return {
		init: function(opt) {
			return new _class(opt);
		}
	}
}()
var imgSequence = ImgSequence.init({
	el: document.getElementById('imgVideo'), //必填
	imgArr: [], //必填，img数组
	speed: 12, //可选，每秒播放多少帧，默认12 ，小于imgList的长度
	isLoop: true, //可选，是否循环播放，默认true
	startPic: 0, //可选，从第几帧开始播放，默认0（也就是第1帧）
	playing: function(data) { //播放中

	},
	complete: function(data) { //播放完成

	},
})
imgSequence.play() //播放
imgSequence.stop() //暂停
imgSequence.onplay() //继续播放	
```
### 线上案例
http://mc.163.com/m/brain/



## 2019/06/28更新


> 最近的一个H5也有类似的需求，需求方给来了一个20M的视频，经过一些处理之后，转base64，JS文件达到了6M。这还是太大了。因为script标签是异步下载，同步解析的，这么大的JS堵在前面，页面会停留空白时间很久，所以肯定不能这样做了。最终的解决方法是，视频经过优化后变为了8M,然后对这个视频输出序列图。图片不再转base64了，也不用生成那个JS文件。直接对图片帧进行预加载，这时页面起码可以做一个loading百分比提示，而不至于显示空白。预加载完成之后仍然用上面封装好的组件进行播放。

### 线上案例
http://sky.163.com/m/2019/workshop/
