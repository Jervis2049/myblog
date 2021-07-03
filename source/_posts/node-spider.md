---
title: 用nodejs写个小爬虫
date: 2017-01-05 16:16:02
tags: nodejs
---

> 目的是抓取漫画的每一话的标题，整理到一个txt。

如图所示：
![image](https://s1.imagehub.cc/images/2020/09/30/8.png)

+ request模块用于发起网络请求
+ cheerio模块用法类似了jQuery，可以操作网页的Dom元素。

```javascript
var request=require("request");
var cheerio=require("cheerio");
var fs=require("fs");
request("http://www.1kkk.com/manhua6746/p5/",
    function(err,res,body){
    var $=cheerio.load(body);//获取文档对象
    var str = "";
    $("#detail-list-select-1 li").each(function(i){
        var title =$(this).children("a").text().replace(/(?<=.*)(\s*（.*)/,"");
        str+=title + '\r\n'
    })
    fs.writeFile("data.txt",str,function(err){
        if(err) console.log(err)
    });
});
```

执行后，在本地生成了data.txt文件。

内容如下

```
第573话 挺身直面之人                 
第572话 卡塔利之仇                 
第571话 Chance For Redemption                 
第570话 完美的邂逅                 
第569话 巴吉欧的誓言                 
....                                    
第3话 替身                                     
第2话 地图                                     
第1话 无名的少年                                     
```

中间省略，篇幅较长就不贴完了。这是一部好漫画啊，强烈推荐，哈哈。