---
title: Chrome扩展之消息传递
date: 2018-11-02
tags: chrome
---

 > 需求：点击扩展程序图标弹出popup，在当前页面完全载入后（即window.onload时机），在popup上展示performance.timing的信息。



#### popup、background、content_scripts的概念简述

+ popup就是点击扩展图标弹出的一个页面。
+ content_scripts是注入到web页面的js，可以设置多个。
+ background是一个会一直运行在浏览器后台的js，可以用于添加监听器等等。

<!--more-->

manifest.json相关配置
```js
...
"page_action": {
    "default_icon": {
        "24": "img/icon-24.png",
        "48": "img/icon-48.png"
    },
    "default_title": "XXX",
    "default_popup": "popup.html"
},
"background": {
    "scripts": [
        "js/background.js"
    ]
},
"content_scripts": [
    {
        "matches": [
            "http://*/*",
            "https://*/*"
        ],
        "js": [
            "js/content.js"
        ],
        "run_at": "document_start"
    }
],
...
```

#### 消息传递流程

画了一个流程图（比较丑，别介意哈）
![image](/img/articleimg/1.jpg)

#### content_script注入到web
```js
//window.onload之后获取到performance.timing，发送给background
const getPerformance = () => {
	return {
		timing: performance.timing,
	}
}
window.onload = function() {
	setTimeout(function() {
		chrome.runtime.sendMessage(getPerformance())
		console.log("onload")
	}, 500)
}
```

#### popup建立长连接（Long-lived connections）

在popup可以发送消息给background，也可以监听来自background的消息
```js
//建立连接
let port = chrome.runtime.connect({ name: 'popup_port' });

//监听来自background的message
port.onMessage.addListener(msg => {
  
});

//发送tab id到background  
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    port.postMessage({
        tabId: tabs[0].id
    });
});
```

#### background接收消息

background可以接收来自content的消息，也可以发送消息给popup
```js
//接收来自content的消息
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log("msg_from_content", message)
});
//监听在popup建立的连接，可以返回数据给popup
chrome.runtime.onConnect.addListener(function (port) {
	if (port.name === 'popup_port') {
		port.onMessage.addListener(msg => {
			port.postMessage({});
		});
	}
});
```


