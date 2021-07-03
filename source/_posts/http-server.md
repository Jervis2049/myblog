---
title: 使用nodejs快速搭建一个本地服务器
date: 2018-01-02 21:33:47
tags: nodejs
---
> 我们都知道，有些情况本地直接点开HTML文件是不行的，需要在服务器环境才能正常访问。这里介绍node的一个第三方小模块http-server,可以快速地搭建一个本地服务器。

### 安装
```
npm install http-server -g
```

<!--more-->

### 使用

使用非常简单，进入当前目录，输入`http-server` 即可，还可以加上其他的一些参数，比如`http-server -p 3000 -o`,`-p`指定端口，`-o`启动服务后自动打开浏览器，更多参数，请<a href="https://www.npmjs.com/package/http-server" target="_blank">查看文档</a>


### 最后
这个是我平时有些时候会使用到的一个小东西，非常便捷。比如写个小demo，需要的时候，可以随时随地秒开一个本地的服务器测试，感觉挺方便的。