---
title: 记第一次使用gulp
date: 2016-5-29 22:32:47
tags: gulp
---
> 最近接触了一下gulp，入门还是比较简单的，有兴趣的同学可以了解下~

gulp，和我们小组项目使用的FIS一样，是自动化构建工具的一种，帮助我们处理一些重复，繁琐的事情，比如压缩，合并，刷新页面等等，有利于提高我们的工作效率，也会避免一些由于我人工手动去做出现的错误。下面做个简单的介绍。

#### 1、全局安装gulp(都懂的，先要安装node)
```
npm install -g gulp
```
如果安装比较慢可以使用淘宝NPM镜像 ，如 `npm install -g gulp --registry=https://registry.npm.taobao.org`

<!--more-->

#### 2、创建配置文件package.json
进入项目目录，打开命令提示符执行 `npm init` 命令 ，之后会引导你创建，然后项目下面就会多了一个`package.json`文件。

#### 3、在本地项目根目录再安装一遍
```
npm install gulp --save-dev  
```
`--save`表示将配置信息保存到`package.json`文件
`-dev`表示将信息保存至`package.json`的`devDependencies`节点，比如安装了什么插件，也会记录在这里。



#### 4、安装项目所需插件
```
npm install  gulp-less gulp-uglify browser-sync gulp-imagemin gulp-minify-css gulp-concat --save-dev
```
插件功能分别为编译less，压缩js、页面自动刷新、压缩图片、压缩css、合并。本文小例暂时用到这些。

#### 5、新建gulpfile配置文件，类似于我们项目使用的FIS的 fis-conf.js配置文件

```javascript
//首先require相关模块
var gulp = require('gulp'),
    less = require('gulp-less'),//编译less
    uglify = require("gulp-uglify"),//压缩js
    browserSync = require('browser-sync'),//自动刷新
    imagemin = require('gulp-imagemin'),//压缩图片
    minifyCss = require('gulp-minify-css'),//压缩css
    concat = require('gulp-concat');//文件合并

    // 编译less
    gulp.task('less',function(){  //这里的less是自定义任务名称
        gulp.src('src/css/*.less')// 要处理的less
            .pipe(less())//编译less
            .pipe(minifyCss())//压缩css
            .pipe(gulp.dest('dist/less'));//文件输出路径
    })

    // 压缩css
    gulp.task('minifyCss',function(){
        gulp.src('src/css/*.css')
            .pipe(minifyCss()) 
            .pipe(gulp.dest('dist/css'));
    })

    // 压缩js
    gulp.task('minifyJs', function() {
        gulp.src('src/js/**/*.js') 
            .pipe(uglify()) 
            .pipe(gulp.dest('dist/js')); 
    });
    // 合并、压缩lib文件夹下的js
    gulp.task('concatJs',function() {
        gulp.src('src/js/lib/*.js')
            .pipe(concat('lib.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js/lib')) 
    });
    // 压缩图片
    gulp.task('img', function() {
        gulp.src('src/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
    })
    // 实时自动刷新页面，执行后自动打开src下的index.html,默认3000端口
    gulp.task('browser-sync', function() {

        browserSync({
            server: {
                baseDir: 'src/'
            }
        });
        //监听src文件夹下的所有文件变化，实时刷新页面
        gulp.watch("src/**/*.*").on("change",browserSync.reload);
    });

   gulp.task('default', ['minifyCss','less','minifyJs','img','browser-sync','concatJs']);

```
执行命令`gulp`就可以运行所有任务了。gulp的task默认是异步运行的，所以这里的任务会同时执行。若是想单独执行某个任务，执行命令`gulp 任务名称` 即可，如`gulp minifyCss`;如果有任务先后执行的需求，需要另外做处理。

项目目录结构如下，src文件夹下存放html文件和资源文件

    src   
    |--css  
    |--img  
    |--js  
    |   |--app   
    |   |--common  
    |   |--lib   
    |--index.html   

