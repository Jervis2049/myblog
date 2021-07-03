---
title: koa2 + mongodb项目
date: 2021-01-02 19:20:17
tags: nodejs
---

### 介绍
+ 技术栈：koa2 + mongodb
+ 功能点：获取客户端ip和所在地址；统计用户访问次数；以及收集浏览器相关信息。
+ 目的：实现功能很少，主要是把项目基础架构搭建起来，方便后续扩展。
+ 项目地址：https://github.com/Jervis2049/koa2-mongodb-demo

目录结构
```
├─app.js  //入口文件
├─views   //ejs模板
├─static  //静态资源
├─services //操作数据库的方法
├─routers //路由
├─models  //定义接口字段
├─db      //mongodb 配置
├─package.json //依赖文件

```

<!--more-->

### 小结
#### 根据ip获取地理位置信息

本项目使用了高德地图的接口。先到<a href="https://lbs.amap.com/api/webservice/guide/create-project/get-key" target="_blank">这里</a>申请key。调用此接口便可获取到数据。
```
https://restapi.amap.com/v3/ip?ip=${ip}&key=5e91b92a1d8714b64202548a8ec4cee0
```
#### 获取真实客户端ip

在koa里通过`ctx.request.ip`便可获取到ip。如果部署了代理服务器的话，比如nginx。那么获取到的往往是nginx所在的ip。我们要做的是：

1、在nginx.conf的proxy_pass添加` proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`

2、设置代理头字段信任
```js
//文档：https://koajs.com/#response
//Request remote address. Supports X-Forwarded-For when app.proxy is true.

const app = new Koa()
app.proxy = true;

```

#### 获取用户的ipv4地址
获取客户端真实ip默认是ipv6格式。如果不指定hostname(0.0.0.0)，服务器会接受ipV6的主机访问（如果可用），也就是说访问服务器的ip会是::ffff:开头的，如`::ffff:192.168.0.1`，否则就是ipv4格式。
```js
//文档：https://nodejs.org/dist/latest-v4.x/docs/api/http.html
app.listen(3000, '0.0.0.0' , () => {
    console.log('localhost:3000')
})

```

### 使用pm2守护进程
#### 全局安装pm2
```
npm i pm2 -g
```
#### 启动项目
```
pm2 start app.js --watch
```

打开 http://localhost:3000/index 即可访问。页面会请求/client/record接口。请求成功将收集到用户ip和一些浏览器信息。

### mongodb的几个常用简单命令

```
//连接本机
mongo
//查询所有数据库
show dbs
//查询所有集合
show collections 或者 show tables
//查询表内所有数据
db.<tableName>.find();
//删除table内所有数据
db.<tableName>.remove({});
//条件查询 (查询ip为123.222.64.88的数据)
db.<tableName>.find({"ip":"123.222.64.88"});
//查询前5条
db.<tableName>.find().limit(5);
//模糊查询 (age>22的数据)
db.<tableName>.find({"age":{$gt:22}) 
//删除table
db.<tableName>.drop();
//删除当前数据库
db.dropDatabase()
//collection删除
db.collection.drop()
```


参考文章：

+ https://www.jianshu.com/p/bcab08f2f924
+ https://ifttl.com/get-client-ip-in-koa/