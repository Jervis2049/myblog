---
title: 网站微信分享总结
date: 2019-06-08 18:42:58
tags: 微信
---
### 背景
目的是微信分享做到自定义图片，描述，标题。做到这样需要在公众号后台做一些配置，把网站和公众号关联起来。

### 流程
+ 公众号运营方提供公众号的AppID和AppSecret，以及那个需要放到服务器目录下的txt文件；
![image](/img/articleimg/6.png)
+ 提供需要配置的JS接口安全域名给公众号运营方，假设是: www.test.com（网站域名） 和 weixin.test.com（接口）
+ 提供AppID和AppSecret给后端，后端接口返回signature等等信息；
+ 提供前面所说的txt上传到weixin.test.com的根目录；
+ 问后端要服务器IP白名单，我们提供给公众号运营方配置；  
+ 前端页面引入JS-SDK，调用相应的API。

### 开发调试
在微信开发者工具-公众号网页开发调试，如有报错，会有log提示。

### 文档
JS-SDK说明文档。常见报错，看该文附录五。
https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html

