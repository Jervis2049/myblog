---
title: 写个简单的基于jq的轮播图插件
date: 2017-09-10 11:13:22
tags: 其它
---
#### 1、首先写个面向过程的程序，后面再逐步改写成面向对象程序

css
```css
.slide{width: 582px;height: 248px;position: relative;margin:20px auto 0;overflow: hidden;}
.slide .banner{overflow: hidden;position: absolute;width: 582px;height: 248px;left: 0;}
.slide ul li{width: 582px;height: 248px;float: left;}
.slide ul li img{width: 100%;height: 100%;border:none;}
.tab{width: 100%;height: 36px;position: absolute;left: 0;bottom: 0;background: rgba(0,0,0,.5);}
.tab ul{overflow: hidden;float: right;margin:12px 10px 0 0; }
.tab ul li{width: 12px;height: 12px;background: #fff;border-radius: 50%;margin-right:5px;cursor: pointer;float: left;}
.tab ul li.cur{background: #12BEFE;}
```

html
```html
<div class="slide" id="slide-box">
	<ul class="banner">
		<li><a href=""><img src="img/1.jpg" alt=""></a></li>
		<li><a href=""><img src="img/2.jpg" alt=""></a></li>
		<li><a href=""><img src="img/3.jpg" alt=""></a></li>
		<li><a href=""><img src="img/4.jpg" alt=""></a></li>
		<li><a href=""><img src="img/5.jpg" alt=""></a></li>
	</ul>
	<div class="tab"></div>
</div>
```
<!--more-->
js

```javascript
var Slide = function() {
	var $slideBox = $('.slide-box'),
		$banner = $slideBox.find('.banner'),
		$tab = $('.tab'),
		$tabLi = $tab.find('li'),
		sWidth = $slideBox.width(),
		len = $banner.find('li').length,
		index = 0,
		timer = null,
		_html,
		init = function() {
			$banner.html($banner.html()+$banner.html())
			$banner.width(sWidth * len*2);

			_html = '<li class="cur"></li>';
			for (var i = 1; i < len; i++) {
				_html = _html + '<li></li>'
			}
			_html = '<ul>' + _html + '</ul>';
			$tab.append(_html);

			autoPlay()
			switchFn()
			bindEvent()
		}

	function bindEvent() {
		$tab.on('click', 'li', function() {
		      switchFn($(this).index());
		      index = $(this).index();
		})
		$slideBox.hover(function() {
			clearInterval(timer)
		}, function() {
			autoPlay()
		})
	}

	function autoPlay() {
		timer = setInterval(function() {						
			index++;	
			switchFn(index);
			if (index == len) {index = 0;}
		}, 2000)
	}

	function switchFn(index) {
		var nowLeft = -index * sWidth;
		$banner.stop().animate({
			"left": nowLeft
		},function(){
			if (index == len) {
				$banner.css('left',0)
				index = 0;
			}
			$('.tab').find('li').eq(index).addClass('cur').siblings().removeClass('cur');
		});
	}
	return {
		init: init
	};

}();

Slide.init(); //调用初始化函数
```
#### 2、构造函数模式和原型模式组合使用

实例属性在构造函数中定义，方法在原型中定义。

```javascript
var Slide = function() { //定义单例

	var _class = function(param) { //内部类
		this.param = $.extend({
			obj: null,
			interTime: null
		}, param)
		this.o = $(param.obj);
		this.oUl = this.o.find('.banner');
		this.aLi = this.oUl.find('li');
		this.oTab = this.o.find('.tab');
		this.aBtn = this.oTab.find('li');
		this.timer = null; //定时器
		this.index = 0; //索引值
		this.interTime = param.interTime * 1000; //自动切换的时间间隔，单位为秒
		this.sWidth = this.o.width(); //轮播图容器宽度
		this.len = this.aLi.length; //轮播图个数
		this.init(); //调用初始化函数
	}
	_class.prototype = { //对象私有方法
		init: function() { //对象初始化

			this.oUl.html(this.oUl.html() + this.oUl.html()); //轮播图个数复制一份
			this.oUl.width(this.len * this.sWidth * 2); //轮播图片总宽度

			var _html = '<li class="cur"></li>';
			for (var i = 1; i < this.len; i++) {
				_html = _html + '<li></li>'
			}
			_html = '<ul>' + _html + '</ul>';
			this.oTab.append(_html);
			this.clickFn();
			this.autoPlay();
			this.isoverFn();
		},
		clickFn: function() { //点击切换
			var _this = this;
			this.oTab.on('click', 'li', function() {
				_this.switchFn($(this).index());
				_this.index = $(this).index();
			});

		},
		switchFn: function(index) { //图片和按钮切换
			var _this = this;
			var nowLeft = -this.sWidth * index;
			this.oUl.stop().animate({
				'left': nowLeft
			}, function() {
				if (index == _this.len) {
					_this.oUl.css('left', 0);
					index = 0;
				}
				_this.oTab.find('li').eq(index).addClass('cur').siblings().removeClass('cur');
			});
		},
		autoPlay: function() { //自动轮播
			var _this = this;
			this.timer = setInterval(function() {

				_this.index++;
				_this.switchFn(_this.index);
				if (_this.index == _this.len) {
					_this.index = 0;
				}

			}, this.interTime)
		},
		isoverFn: function() { //鼠标移入轮播停止，移开则自动轮播
			var _this = this;
			this.o.hover(function() {
				clearInterval(_this.timer);
			}, function() {
				_this.autoPlay();
			});
		}
	}
	return {
		create: function(param) { //提供给外部调用的方法，创建实例
			return new _class(param);
		}
	}
}();
var s1 = Slide.create({   //创建实例1
	'obj': '#slide-box',
	'interTime': 2
});
var s2 = Slide.create({    //创建实例2
	'obj': '#slide-box2',
	'interTime': 3
});
```
 



  [1]: https://xiaojiecong.github.io/demo/slide.html
  [2]: http://res.nie.netease.com/comm/doc/professional/javascript%E4%BB%A3%E7%A0%81%E8%A7%84%E8%8C%83.html