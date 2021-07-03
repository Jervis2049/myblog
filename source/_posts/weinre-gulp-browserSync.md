---
title: Weinre+Gulp+BrowserSync结合实现远程调试
date: 2016-06-12 22:38:27
tags: gulp
---
> weinre，大家可能都听过，是一个远程调试工具。继上次学习了gulp,这次突发奇想把它们结合起来做一些事情。虽然在Chrome下可以模拟移动端，但毕竟会有偏差。这次我想达到的目的是，在PC端开发移动端项目，然后可以在移动设备上实时看到效果，这是一种很棒的体验。

### 1、安装和启动weinre
#### 全局安装weinre
```
npm install weinre -g 
```
我的node版本是v0.12.6,一开始安装报了个错。原因是npm安装的时候无法匹配到weinre插件所对应安装的版本。安装的时候指定它的版本为 `2.0.0-pre-I0Z7U9OV` 就可以了。如 `npm install -g weinre@2.0.0-pre-I0Z7U9OV`

<!--more-->

#### 启动weinre
```
weinre --httpPort 1000 --boundHost -all-
```
`weinre --httpPort [portNumber] --boundHost [hostname | ip address | -all-]`，这里的`--httpPort`指定端口，默认是8080；`--boundHost` 一般填 `-all-`就可以了。这样，同一网段下所有的机器都可以用来调试咯（PS：本次试验，我手机和电脑是连了同一个wifi）至此，对于weinre，我们要做的事情就只有这么多。

### 2、gulp和browserSync
这里用了`browserSync`，其实就是想让PC和移动端实时刷新页面。

#### gulpfile.js配置文件
```javascript
var gulp = require('gulp'),
    browserSync = require('browser-sync');

    gulp.task('browser-sync', function() {

        browserSync({
            server: {
                baseDir: 'src/'//执行browser-sync任务后，浏览器自动打开src文件夹下index.html,默认3000端口
            }
        });
        //监听src文件夹下的所有文件变化，实时刷新页面
        gulp.watch("src/**/*.*").on("change",browserSync.reload);
    });

```
#### gulp项目文件结构
```
weinre-demo
|--node_modules
|--src   
|   |--css  
|   |--img  
|   |--js  
|   |--index.html
|--gulpfile.js
|--package.json    
```
#### index.html
这是我下面要测试的内容
```html
<h1 style="font-size:80px;color: red">Hello NetEase!!!</h1>
```
#### 运行gulp项目
进入该项目所在目录，执行`browser-sync`任务,浏览器自动打开src文件夹下的`index.html`

![2016-06-11_004601.jpg][1]

#### PC端看到的效果

![pc.jpg][2]

#### 移动端输入地址 http://192.168.1.100:3000 打开页面（192.168.1.100是我本机的IP）

![603594036241353462.jpg][3]

### 总结：
完成整个流程需要做的事情其实并不多，本次试验达到了目的。在PC端开发移动端项目，一方面，可以一如既往地在Chrome下模拟移动端,依旧可以进行各种调试，另一方面，当项目文件内容发生改变，PC和移动设备会同时自动刷新页面，可以实时看到呈现出来的效果。


[1]: http://feg.netease.com/usr/uploads/2016/06/1727684530.jpg
[2]: http://feg.netease.com/usr/uploads/2016/06/2583961473.jpg
[3]: http://feg.netease.com/usr/uploads/2016/06/2559967678.jpg