---
title: 设置定时任务自动执行shell脚本备份mongodb
date: 2022-01-28 18:42:58
tags: 其它
---

### 脚本编写

`vim mongodb_bak.sh`新建并且编辑脚本文件。

```bash
#!/bin/bash
DATE=$(date +%Y%m%d%H%M%S) #时间戳
DAYS=30    #DAYS=30代表删除30天前的备份，即只保留近30天的备份
DIR=/data/mongodb_bak #备份的目录
MONGODUMP=/usr/local/mongodb/bin/mongodump
$MONGODUMP -h 127.0.0.1 -d bluemoon_project -o  /data/mongodb_bak/$DATE/
cd $DIR
find . -type d -mtime +$DAYS -exec rm -rf {} \;
exit

```

`mongodump`备份命令，`-h`表示 MongoDB 所在服务器地址，`-d`表示需要备份的数据库实例，`find`查找文件/目录，`-type d`表示目录，`-mtime`也就是 modify time ，表示文件内容被修改的最后时间。这里的操作表示只保留最近 30 天的，大于的都删除。

<!--more-->

脚本写好之后，还要赋予脚本执行权限。

```
# 给所有用户执行权限
$ chmod +x mongodb_bak.sh

# 给所有用户读权限和执行权限
$ chmod +rx mongodb_bak.sh
# 或者
$ chmod 755 mongodb_bak.sh

# 只给脚本拥有者读权限和执行权限
$ chmod u+rx mongodb_bak.sh
```

### 添加定时任务

crontab 是用来定期执行程序的命令

```
crontab -e
```

此时进入了编辑模式，输入指定的定时任务，可以换行写多个。这里的第一行表示每天 23:00 执行一次 mongodb_bak.sh。第二行表示每一分钟执行一次 test.sh。

```
0 23 * * * /data/mongodb_bak.sh
*/1 * * * * /data/test.sh
```

这里有 6 个字段，分别为 minute、hour、day、month、week、command

```
# For details see man 4 crontabs
# Example of job definition:
# .---------------- minute (0 - 59)
# |  .------------- hour (0 - 23)
# |  |  .---------- day of month (1 - 31)
# |  |  |  .------- month (1 - 12) OR jan,feb,mar,apr ...
# |  |  |  |  .---- day of week (0 - 6) (Sunday=0 or 7) OR sun,mon,tue,wed,thu,fri,sat
# |  |  |  |  |
# *  *  *  *  * user-name command to be executed
```

`crontab -l`之后, 如果看到有这个提示，说明脚本可能出错了。

```
You have new mail in /var/spool/mail/root
```

定时任务没生效，但是直接通过命令（如：mongodump)又可以正常执行，这主要是因为无法读取环境变量的原因。使用绝对路径，如把`mongodump`改成`/usr/local/mongodb/bin/mongodump`。

##### 查看

`mail`查看邮件列表
`file` 命令查看一共多少封邮件，会显示比如： 42 messages
然后输入 42，查看最后一封邮件内容，然后就可以看到有报错的信息了。

##### 退出查看

按`q`或者`ctrl+d`

##### 清空邮件

`cat /dev/null > /var/spool/mail/root`

### 删除定时任务

查看任务列表

```
crontab -l
```

删除所有任务

```
crontab -r
```

删除指定的任务。如将含 test.sh 的行的内容删除掉。

```
sed -i '/test.sh/d' /var/spool/cron/root
```
