---
title: Chrome扩展在不发布到store的情况，如何远程更新版本？
date: 2021-05-13
tags: chrome
---

### 前言
> 如果不打算发布到谷歌商店，只是团队内部使用，组员安装了你给的crx文件，后续要怎么更新版本呢？总不能后续要修改的时候，生成了新的程序，丢给别人说，你把之前的卸载掉，然后换上这个新的，对吧？

### 安装

打开chrome://extensions/ ，左上角可以看到有两个按钮，`加载已解压的扩展程序`和`打包扩展程序`。开发阶段，点击`加载已解压的扩展程序`加载本地的文件夹目录（包含pop.html，manifest.json这些）便可以预览到效果。开发完毕之后，点击`打包扩展程序`，可以生成两个文件`xxx.crx`和`xxx.pem`。crx文件就是你开发的这个扩展本身，pem文件是一个秘钥文件，每个Chrome扩展都会有个ID，就是由这个pem文件决定的。拖拽crx文件进去就可以安装成功了。但是会看到有个报错，这是由于Chrome的安全策略导致的。
<!--more-->
![image](/img/articleimg/15.png)

### 添加注册表白名单
新建一个扩展名为reg的文件，在如下文件里，把你的ID换上去。至于`http://xxx.com/your_website/update.xml`这个是干什么的，下文再解释。
 ```
 Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallWhitelist]
"1"="xhhfjonjpkcnocnfelbfjbbebehjkldk"

[HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist]
"1"="xhhfjonjpkcnocnfelbfjbbebehjkldk;http://xxx.com/your_website/update.xml"
 ```
 保存之后，双击你新建的xx.reg，会弹出一个对话框，点击“是”即可。然后重启浏览器，就可以看到没有上图的那个红色报错了，扩展也都可以正常使用了。（这里的方法，只针对Windows系统）


### 远程更新
新建update.xml文件，保存之后，在你自己的服务器找个地方放好。前文的`http://xxx.com/your_website/update.xml`只是一个例子。同理，crx文件也是。
```
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='xhhfjonjpkcnocnfelbfjbbebehjkldk'>
    <updatecheck codebase='http://xxx.com/your_website/xxx.crx' version='1.0.0' />
  </app>
</gupdate>
```

在项目里的manifest.json文件加上：`"update_url": "http://xxx.com/your_website/update.xml"`


### 更新的核心代码
有三种状态`throttled`, `no_update`, 以及 `update_available`。当status为`update_available`的时候说明有新版本了。`throttled`有节流的含义，频繁调用的时候会返回这个状态。
```
chrome.runtime.requestUpdateCheck(function(status, details) {

})
```
新的一版开发完之后，要记得在manifest.json里修改version，以及前面所述的xml文件里的version也同步更新。生成新的crx文件，这里有一点要注意了。我们第一次不是生成了一个pem秘钥吗，这个文件要保管好的，后续打包要选择这个文件，否则你生成了新的pem，那么ID也变化了。生成新的crx文件，以及修改版本后的xml文件，上传到服务器覆盖掉之前的。这样就大功告成了。
![image](/img/articleimg/16.png)。


### 问题

前面添加注册表白名单的时候，有个ExtensionInstallForcelist，`force`有强迫的意思，这里是指强制安装。我发现在公司电脑里，安装这个扩展之后就卸载不了，不能像其它的那样移除。而在家里的电脑则没这个问题。我猜测是公司的IT部门对办公电脑可能有什么限制策略？不管怎么样，办法还是有的。Win+R快捷键打开CMD命令窗口，输入regedit打开注册表编辑器。在\HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome\ 下删除ExtensionInstallForcelist和ExtensionInstallWhitelist的内容（即删除安装的时候添加的白名单），重启浏览器就可以看到卸载成功了。