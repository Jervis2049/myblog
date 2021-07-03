---
title: 记MySql的编码问题
date: 2018-05-15 10:12:53
tags: 其它
---

> 最近在看一个开源项目，其中有个登陆注册的功能，试了可以注册成功，数据库表也可以查询到，可是读取的时候前端页面显示不了中文，英文是可以正常读到的，然后一查发现是编码不统一的原因导致的。
#### 报错
```
Error: ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: Incorrect string value:
 '\xE8\x82\x96","...' for column 'data' at row 1
```

根据报错，找到了`data`字段所在的表，然后输入命令(列出表的列信息)：
```
show full columns from your_table_name;
```

从输出的信息来看，可以很清楚的看到每个字段的编码。于是发现了`data`字段的Collation为`latin1_swedish_ci`编码，而与之相关联的表编码为`utf8_bin`，由于编码不统一，所以导致中文无法正常显示。

#### 解决
修改字符编码
```
 ALTER TABLE your_table_name CONVERT TO CHARACTER SET utf8 COLLATE utf8_bin;
```

