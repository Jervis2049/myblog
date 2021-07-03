---
title: 写了一个Chrome扩展，方便查看NBA赛况
date: 2018-06-02 22:21:03
tags: chrome
---

先来看看效果图：

默认展示当天的赛况
![25.png][1]
<!--more-->
还有相邻两天的赛况

![26.png][2]
![28.png][3]

# 目录结构
```
├── css
│   ├── index.css
│   ├── boostrap.min.css
├── img
│   ├── icon-128.png
│   ├── icon-48.png
│   └── icon.png
├── js
│   ├── lib
│   │    └── jqurey.min.js	
│   │    └── boostrap.min.js		
│   └── index.js
├── manifest.json
└── popup.html

```
# manifest.json
入口文件，每个`Chrome`插件都必须包含一个`manifest.json`文件，其中必须包含`name`、`version`和`manifest_version`属性
```
{  
  "name": "NBA Plugin",  
  "version": "1.0",  
  "description": "A Chrome extension for checking nba match",  
  "browser_action": {  
    "default_icon": "img/icon.png" ,
    "default_title": "NBA",
    "default_popup": "popup.html"
  },
  "icons": {
      "16": "img/icon.png",
      "48": "img/icon-48.png",
      "128": "img/icon-128.png"
  },
  "permissions": [
      "http://*/*",
      "https://*/*"
  ],
  "manifest_version": 2  
} 
```
属性说明：
- `manifest_version`：此键指定此扩展使用的`manifest.json`的版本，目前必须是2
- `version`：插件版本号
- `name`：插件名称
- `description`：插件描述
- `icons`：插件图标，`Chrome`扩展程序页显示
- `browser_action`：指定插件在`Chrome`工具栏中的显示信息
	1. `default_icon`：图标
	1. `default_title`：标题
	1. `default_popup`：弹出页
- `permissions`：权限
注意:如果我们需要向服务器请求数据，就需要在`permissions`中添加请求数据的接口，否则会报跨域请求的限制。但是如果需要向多个接口请求数据，建议直接按我的方式书写匹配规则，这样不管多少接口都适用。

此外，还有其他的一些配置，暂时没用到。

# popup.html
这个就是安装扩展之后，点击浏览器右上角小icon出现的弹出页。
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<title>NBA</title>
<meta name="description" content="">
<meta name="keywords" content="">
<link href="css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="css/index.css">
</head>
<body>

	<div class="container">
		
		<ul id="myTab" class="nav nav-tabs">
		    <li><a href="#content1" class="tab yesterday" data-toggle="tab"></a></li>
		    <li class="active"><a href="#content2" class="tab today" data-toggle="tab"></a></li>
		    <li><a href="#content3" class="tab tomorrow"  data-toggle="tab"></a></li>
		</ul>
		<div id="myTabContent" class="tab-content">
		    <div class="tab-pane fade" id="content1">
				<table>
				</table>
		    </div>
		    <div class="tab-pane fade in active" id="content2">
		        <table>
				</table>
		    </div>
		    <div class="tab-pane fade" id="content3">
		      	<table>
				</table>
		    </div>
		</div>
		<div class="bottomlink">
			<div class="left"></div>
			<div class="right dropup">
				  <button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">
				    按球队查看赛程
				    <span class="caret"></span>
				  </button>
				  <ul class="dropdown-menu"></ul>
			</div>
		</div>
	</div>
    <script type="text/javascript" src="js/lib/jquery.min.js"></script>
    <script type="text/javascript" src="js/lib/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/index.js"></script>

</body>
</html>
```
# index.js

我在<a href="https://www.juhe.cn/docs/api/id/92" target="_blank" style="color:#5ba1cf">这里</a>拿到了一个NBA数据的接口：<a href="http://op.juhe.cn/onebox/basketball/nba?key=c763e527b86addb9e21d455e4c467879" target="_blank"  style="color:#5ba1cf">http://op.juhe.cn/onebox/basketball/nba?key=c763e527b86addb9e21d455e4c467879</a>
，其中这个KEY需要申请一下。PS:这个接口有个别字段还有点问题，url不对，比如点湖人队，查看赛程，跳去了<a href="http://kbs.sports.qq.com/kbsweb/teams.htm?tid=13" target="_blank"  style="color:#5ba1cf">http://kbs.sports.qq.com/kbsweb/teams.htm?tid=13</a>，其实正确应该是<a href="http://kbs.sports.qq.com/kbsweb/teams.htm?tid=13&cid=100000" target="_blank"  style="color:#5ba1cf">http://kbs.sports.qq.com/kbsweb/teams.htm?tid=13&cid=100000</a>

```javascript

class NbaMatch {

	static getData() {
		$.ajax({
			type: "GET",
			url: "http://op.juhe.cn/onebox/basketball/nba?key=c763e527b86addb9e21d455e4c467879",
			success: function(data) {

				let result = data.result;
				let listHtml = [];
				let arr = [];
				let dataList = result.list;


				for (let i = 0, len = dataList.length; i < len; i++) {

					$('.tab').eq(i).html(dataList[i].title)

					for (let j = 0, len = dataList[i].tr.length; j < len; j++) {

						arr[i] = dataList[i].tr[j];

						let status = arr[i].status; //比赛状态:0未开赛、1直播中、2已结束
						let statusText;

						switch (status) {
							case '0':
								statusText = '未开赛';
								break;
							case '1':
								statusText = '直播中';
								break;
							case '2':
								statusText = '已结束';
								break;
							default:
								statusText = '未知';
						}

						//每天的比赛列表分别存入数组
						listHtml[i] = `<tr>
										<td class="status${status}">${statusText}</td>
										<td>${arr[i].time}</td>
										<td width="64"><a href="${arr[i].player1url}" target='_blank'>${arr[i].player1}</a></td>
										<td><img src="${arr[i].player1logo}" alt="logo" /></td>
										<td>${arr[i].score}</td>
										<td><img src="${arr[i].player2logo}" alt="logo" /></td>
										<td width="64"><a href="${arr[i].player2url}" target='_blank'>${arr[i].player2}</td>
										<td><a href="${arr[i].link1url}" target="_blank">${arr[i].link1text}</a></td>
										<td class="ds"><a href="${arr[i].link2url}" target="_blank">${arr[i].link2text}</a></td>
									</tr>`;

						$('table').eq(i).append(listHtml[i]);
					}
				}

				$('.ds a').each(function() {
						$(this).click(() => {
							let a = $(this).attr('href');
							if (a == '' || a == 'javascript:;') {
								$(this).attr('href', 'javascript:;')
								alert('暂无数据');
							}
						})
				})
					// 常规赛赛程,球队排名,球员排名,社区讨论
				let bottomlink = dataList[0].bottomlink;
				let blHtml = '';
				for (let i = 0, len = bottomlink.length; i < len; i++) {
					blHtml += `<a href="${bottomlink[i].url}" target="_blank">${bottomlink[i].text}</a>`
				}
				$('.bottomlink .left').append(blHtml);
				
				//球队下拉列表
				let teammatch = result.teammatch;
				let tmHtml = '';
				for (let i = 0, len = teammatch.length; i < len; i++) {
					tmHtml += `<li><a href="${teammatch[i].url}" target="_blank">
						      ${teammatch[i].name}</a></li>`;
				}
				$('.dropdown-menu').append(tmHtml);

			}
		})
	}
}

NbaMatch.getData();
```


# 安装本扩展

在Chrome浏览器地址栏打开[chrome://extensions/](chrome://extensions/) ，（其他浏览器就不是这个地址了，如QQ浏览器，360浏览器之类的，反正找到安装扩展的地方即可）

![15.png][4]

把这个文件夹拖拽到上面

![41.png][5]

然后就OK了。

可能有个别浏览器不能这样拖拽安装，还可以点这里安装的。

![7.png][6]


# 遇到的问题

1、在开发的过程中，可能会用到Chrome的一些API(不过我这里的这个小应用还暂时用不上)，比如你想获取当前页面的url，像平常这样写`window.location.href`是获取不到的，需要这样写：
```javascript
chrome.tabs.query({active:true, currentWindow:true}, function(tab){
      var curUrl = tab[0].url; //获取当前页面的url
      //dosomething
});
```
然后还需要在`manifest.json`配置文件中声明 "tabs" 权限
```
  "permissions": [
      "tabs"
  ]
```
2、引用资源文件不能直接用外链，要写相对路径，引用项目目录下的资源。这个是出于安全的考虑，不允许那样做。当然，它还是给我们留了后路。举个例子：如果想引用这个外部脚本
```
<script type="text/javascript" src="https://cdn.staticfile.org/jquery/3.1.1/jquery.min.js"></script>
```
可以在manifest.json文件这样配置一下：
```
"content_security_policy": "script-src 'self' https://cdn.staticfile.org; object-src 'self'"
```
这个也仅限于HTTPS的资源，通过将HTTPS源的脚本加入白名单来放宽“只加载本地脚本”的策略。

3、unsafe-inline报错：
```
Refused to execute JavaScript URL because it violates the following Content
 Security Policy directive: "script-src 'self' blob: filesystem: chrome-extension-resource:". 
 Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce ('nonce-...') is required to
  enable inline execution.
```
inline javascript会报这个错，比如这样：
```html
<button onclick=""></button>
```

4、如果你是用jQuery的Ajax方法获取非本域的数据，不要加上`dataType:"jsonp"`，否则会报错。`jsonp`并不是通过`XMLHttpRequest`实现的Ajax请求的，它是通过script标签实现跨域的，那么这样src填的就是绝对路径了，上面第2点说了一般是不可以直接引用外部资源的。其实`manifest.json`文件已经声明了`permissions`权限，获取了跨域请求许可，已经可以进行跨域请求的了，所以没必要写上`dataType:"jsonp"`。


5、Chrome浏览器安装之后，会出现这个问题，然后每次启动后都要点一下取消，非常烦人。

![8.png][7]

这个也是Chrome的一个保护机制，提醒用户这样安装有风险，扩展应该来源于Chrome Web Store。但是有些时候我们开发的工具只是个人使用，就没发布到商店去。想解决掉这个的问题，还是有办法的。


简单地说就是在这里拿到这个ID（注意这个ID不是固定不变的） ，然后添加扩展程序白名单。网上有很多文章有介绍，这里就不描述了。比如这篇：<a style="color:#5ba1cf" href="http://ju.outofmemory.cn/entry/158944" target="_blank">屏蔽Google Chrome安装第三方插件之后反复提示“请停用以开发者模式运行的扩展程序”</a>

![9.png][8]

我下面补充一点，是关于安装方式的，由于这个原因chrome浏览器下就不能按照上面那种方式安装了。要点打包扩展程序这里：

![10.png][9]

然后在和扩展程序文件夹同级目录下会生成一个crx和pem文件。

![11.png][10]

把生成的crx文件拖拽安装，然后到了这一步：

![12.png][11]
![13.png][12]

可能第一次还要点一下“已启用”，到这如无意外就正常了。

![14.png][13]


  [1]: http://feg.netease.com/usr/uploads/2017/02/675864619.png
  [2]: http://feg.netease.com/usr/uploads/2017/02/3020244005.png
  [3]: http://feg.netease.com/usr/uploads/2017/02/2614979482.png
  [4]: http://feg.netease.com/usr/uploads/2017/02/845410351.png
  [5]: http://feg.netease.com/usr/uploads/2017/02/2629913699.png
  [6]: http://feg.netease.com/usr/uploads/2017/02/3115659345.png
  [7]: http://feg.netease.com/usr/uploads/2017/02/147352728.png
  [8]: http://feg.netease.com/usr/uploads/2017/02/3262360458.png
  [9]: http://feg.netease.com/usr/uploads/2017/02/4099914523.png
  [10]: http://feg.netease.com/usr/uploads/2017/02/3280434091.png
  [11]: http://feg.netease.com/usr/uploads/2017/02/298805741.png
  [12]: http://feg.netease.com/usr/uploads/2017/02/1689179106.png
  [13]: http://feg.netease.com/usr/uploads/2017/02/3367618286.png



