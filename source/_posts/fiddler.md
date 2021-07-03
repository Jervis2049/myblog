---
title: Fiddler调试总结
date: 2017-011-17 18:43:00
tags: 其它
---
![image](/img/articleimg/lW9zR.jpg)

### 前言
> Fiddler无疑是一个很强大的工具，日常工作中着实帮了不少忙，这里总结下它的用处。

<!--more-->

### 请求重定向至本地文件
> 由于我们早期的一些老旧页面，没有托管在我们的Gitlab上，而是直接存放在FTP，所以修改就没那么方便。有时修改这些页面的js或者css，就用了Fiddler的这个线上调试功能，挺实用的。

打开你要调试的页面，如图左侧，你会看到有各种请求，然后右侧工具栏切换到`AutoResponder`选项。

![image](/img/articleimg/l0Mff.jpg)

选中你要调试的文件（一般是JS，CSS），然后拖拽到如图位置

![image](/img/articleimg/l0CY6.jpg)

找到 `Find a file`选项，选择你要用于线上调试的本地文件，然后点`save`保存，就可以在本地调试线上的页面了。例如在本地文件写个`alert`语句，重新刷新页面，线上应该能看到效果了。

![image](/img/articleimg/l0KtP.jpg)

### 捕获https请求
fiddler默认是不抓取https请求的，所以需要我们再做一些设置。

菜单栏选择 Tools->Options->Https，然后再点击`Actions`按钮，选择`Export Fiddler Root Certificate to Desktop`把证书导出到本地。

![image](/img/articleimg/lyAZ4.jpg)

然后安装证书，以Chrome浏览器为例，在`chrome://settings/`找到管理证书的地方，导入此前下载在本地的证书。至此，重新刷新页面应该可以看到HTTPS请求了。

![image](/img/articleimg/lyQsO.jpg)
![image](/img/articleimg/ly3ee.jpg)

### Willow插件的使用

前文提到了Fiddler的AutoResponder重定向功能，这里介绍的Willow也具备类似的功能，而且很方便。 Fiddler的AutoResponder功能常用于单一文件的重定向，willow可以将整个域名下的内容重定向到本地。在本地开发，有时某些内容可能需要在发布到正式地址后才能确认，但是没完成开发不可能发布出去，没关系，Willow可以让我们用线上的域名预览本地内容。

切换到willow面板，右键->Add Project ->Add Rule可以添加规则。这里的Match我填了<a href="http://my.163.com/" target="_blank">http://my.163.com/</a>(假设这个是正式的发布地址)，Action这里我填的是我本地服务器根目录的路径。（注意末尾要以'/'或'\'结束）

![image](/img/articleimg/gCO3V.md.png)

我们平时一般是这样预览本地页面的 <a href="javascript:;">http://127.0.0.1:8080</a>，这么设置之后就可以用 <a href="http://my.163.com/" target="_blank">http://my.163.com/index.html</a> 来替代它了。

如果仅仅只是想这样，在菜单栏选择 Tools->HOSTS，配一下host，然后启动本地服务器的时候使用80端口同样可以。
![image](/img/articleimg/gkHqU.png)

我们平时制作列表页会遇到一个问题，这个问题还是由willow来解决吧。以<a href="http://my.163.com/" target="_blank">http://my.163.com/</a>为例。我们的列表页通常是这样：`http://my.163.com/news/index_1.html` ，`http://my.163.com/news/index_2.html`，`http://my.163.com/news/index_3.html`...(假设具体是这样的)。那么，在本地 http://127.0.0.1:8080 请求这些地址的时候肯定会出现跨域问题。前面提到可以用线上地址预览，没错，不过还差个步骤。

willow设置<a href="http://my.163.com/" target="_blank">http://my.163.com/</a>重定向的时候，需要过滤掉news目录下面的内容。这里还要注意顺序问题，这条规则需要至于前面。这样就可以解决在本地制作列表页时，因为跨域而无法预览的问题了。
![image](/img/articleimg/gEmtJ.md.png)

最后附上：<a href="http://www.w3cmark.com/2016/fiddler-willow.html" target="_blank">willow插件资源下载地址</a>（PS:貌似是fiddler2才能用的）

### 修改接口返回的数据

Fiddler设置断点有2种方式，一种是全局断点，将中断所有请求，Rules-> Automatic Breakpoint  -> Before Requests(或 After Requests)。另一种是局部的，可以设置自己想要拦截的请求，在左下角的输入框输入相应的命令即可。推荐使用这种方式。

`Before Requests`， 是指在请求发送到服务器之前断点。对应的命令是 `bpu xxx`(xxx是你请求的地址，如某个接口)。`After Requests`， 是指客户端发送请求之后，服务器返回给客户端之前断点。对应的命令是 `bpafter xxx` 。我们把东西拦截下来就是为了篡改里面的内容，以达到我们的目的。调试接口就是这样的，我们可能需要修改某些字段返回的值，来看看我们前端页面的展示情况，不同的返回值页面样式可能不同。

前段时间做了一个抽奖的专题，顺便拿来说明一下。点击"抽奖按钮"请求A接口，查看用户剩余抽奖的次数，如果抽奖次数大于0（会有个抽奖的交互，转圈什么的，否则提示没有抽奖机会），然后自动调用B接口抽奖（弹窗提示抽中的奖品）。制作过程中，我用自己的账号登录之后抽奖，抽完之后次数就不够用了，那就满足不了调B接口的要求了，然后看不到抽奖的交互效果和显示结果，那我要怎么制作和调试啊？虽然也可以在代码逻辑里强制设定，然后让程序跑通，但是感觉不太好。那怎么办呢？我总不能每次都和后端同学说，啊，我的账号抽奖次数又用完了，麻烦你帮我在后台改下数据，让我可以无限抽；咦，我IP也达到上限了，也抽不了，你再帮我配置一下，不限IP吧；呀，可以返回固定的这个值吗，让我抽中这个奖品，我看看前端页面展示对不对？...此时后端同学内心可能是崩溃的。这样的做法沟通成本就有点高了。

![image](/img/articleimg/lfaND.jpg)]

这种情况下Fiddler就登场了，我们自己修改返回的数据达到调试页面的目的...就用`bpafter`这个命令吧，也就是说我想在服务器返回数据到客户端前，拦截下来修改。左下角输入框输入命令:bpafter xxx(xxx是你请求的接口，可以不带协议头)，然后回车。

![image](/img/articleimg/lfIvn.jpg)

点击"抽奖按钮"，请求抽奖记录接口，此时你可以打开浏览器控制台看下接口，一直是没数据返回的，因为在fiddler打了断点。看到了吗，选中的接口左侧有个红色图标，它表示响应在断点处被暂停。再看截图右下方处就是接口返回的数据，其中有个字段`draw_times`表示剩余抽奖次数，现在是为0，为0的话就不能调抽奖接口抽奖了，可以在这里改成1，进入抽奖的逻辑。改完之后，点击`Run to Completion`运行，然后控制台就可以看到接口有返回值了。

![image](/img/articleimg/loKSg.png)

上面的逻辑通了之后，就会自动调抽奖接口，进行抽奖，同样是可以修改抽奖接口返回的数据，你需要抽中哪个奖品，修改一下奖品字段返回的值就行了，然后页面就会如预期的一样展示相应的内容...最后调试完记得输入`bpafter`清除断点，不然每当请求接口还会一直打断点。

### 最后

BTW，由于Fiddler本身就是一个代理工具，在使用过程中，可能会出现网络问题，关闭或者点击左下角的Capturing就行了。综上，Fiddler是个好东西，应该加以利用。本文暂时总结到这里，以后有需要再补充...

