---
title: 微信网页授权返回invalid code 40029
date: 2019-12-26 12:48:15
tags: 微信
---

> 最近做的一个微信公众号H5，遇到的问题，这里记录一下~

invalid code，无效的code。网上查了一遍，普遍认为是重定向的问题，授权的时候出现两次跳转。因为code是一次性的，所以后面报错了。防止多次重定向的解决方法是在授权地址后面加上connect_redirect=1参数，意为只触发一次请求，加上参数像如下链接：

```
https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIR
ECT_URI&response_type=code&scope=SCOPE&state=STATE&connect_redirect=1#wechat_redirect
```
这时查看后台日志只看到一次请求了，但是仍然没起作用。后来经过组里的“老司机”提醒，说有可能是前端填的appid和后端的不一致造成的。

果不其然，是配置的信息有误...
