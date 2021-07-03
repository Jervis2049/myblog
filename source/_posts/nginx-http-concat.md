---
title: 安装nginx-http-concat模块，实现自由合并静态资源文件
date: 2020-12-05 16:32:12
tags: linux
---
 ### 介绍
 
 nginx-http-concat模块可以实现静态资源的合并，假如你的CDN资源目录有以下这些文件：
 
```
├─js
| ├─axios.min.js
| ├─vue.min.js
| ├─swiper.4.4.2.min.js
| ├─swiper.5.4.5.min.js
| ├─vue-router.min.js
├─css
|  ├─bootstrap.min.css
|  ├─swiper.4.4.2.min.css
|  └swiper.5.4.5.min.css
```

那么你可以使用以下这种方式自由地组合使用它们。前面两个问号`??`，后面的每个文件用`,`连接，比如：

```
https://cdn.com/css/??bootstrap.min.css,swiper.4.4.2.min.css
https://cdn.com/css/??bootstrap.min.css,swiper.5.4.5.min.css
https://cdn.com/js/??vue.min.js,vue-router.min.js,axios.min.js
...
```
<!--more-->

 ### 安装
 
 
 ```
# 下载
> wget https://codeload.github.com/alibaba/nginx-http-concat/zip/master 

# 解压
> unzip master 

# 切换到nginx所在目录
> cd /usr/local/nginx/nginx-1.12.2
 
# 添加nginx-http-concat模块
> ./configure \
    --prefix=/usr/local/nginx \
    --without-http_rewrite_module \
    --without-http_gzip_module \
    --with-http_stub_status_module \
    --add-module=/root/nginx-http-concat-master
	
# 安装
> make && make install

# 查看ngixn版本及其编译参数，若输出的configure arguments内容有nginx-http-concat则说明成功了。
> /usr/local/nginx/sbin/nginx  -V

 ```
 

 
 #### nginx配置
 
编辑nginx.conf，加入`nginx-http-concat`参数
 
 ```
 > cd /usr/local/nginx/conf
 > vim nginx.conf
 ```
 
 `concat_max_files`表示可以合并的最大个数；`concat_unique`表示是否允许合并不同类型的文件，默认是`on`，不能合并不同类型的文件。
 
 ```nginx
 location /css/ {
    root /home/demo/static/;
    concat on;
    concat_max_files 10;
    concat_unique on;
    concat_types text/css;
}
location /js/ {
    root /home/demo/static/;
    concat on;
    concat_max_files 10;
    concat_unique on;
    concat_types application/javascript;
}
 ```
 
 
 配置完成重启nginx
 ```
/usr/local/nginx/sbin/nginx -s reload
 ```

另外，这个目录可能不太好记，你可以给nginx创建一个软链接。
```
ln -s /usr/local/nginx/sbin/nginx /usr/local/sbin/
```
这样就可以全局使用nginx命令了，例如:
```
nginx -v
```