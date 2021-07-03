---
title: 使用Appveyor持续集成hexo博客
date: 2017-09-04 18:42:58
tags: 其它
reward: true
---
![lWisx.jpg](https://s1.ax1x.com/2017/09/27/lWisx.jpg)

> 很久没搞点事情了，最近一时兴起用Hexo+Github搭建了个人博客。本文就不详细介绍这个搭建的过程了，主要写下如何对Hexo博客做版本控制与持续集成。

<!--more-->

### Hexo
安装好hexo之后，`hexo init`得到如下文件，这些就是博客最原始的源文件。

```
---
|--node_modules
|--scaffolds
|--source
|--themes
|--.gitignore
|--_config.yml
|--package.json
```

`source`文件夹存放的是md文件，也就是平时我们用markdown语法写的文章。`themes`文件夹存放的是主题相关的文件，默认的hexo主题很挫，可以自己找些好看的主题，我博客用的是yilia主题。`_config.yml`，这是个很重要的配置文件。其中一项配置是关联到你的GitHub仓库的，下面是我的配置。

```yml
deploy:
  type: git
  repository: https://github.com/xiaojiecong/xiaojiecong.github.io.git
  branch: master
```

使用命令`hexo g`生成静态网页，`hexo d`部署到GitHub。到这步如无意外博客就正常发布上线了。一般就是这种域名`https://username.github.io`，比如我的：<a href="https://xiaojiecong.github.io/" target="_blank">https://xiaojiecong.github.io/</a>。这里可以看出在github上存放静态文件的那个仓库，是不用动的，我们只需在本地的Hexo源文件修改之后，经过一些命令操作就发布上去了，我们写的md文件将会被转成静态的HTML文件。这里我写的很简略，当中会有一些坑，多踩踩就习惯了~

### 版本控制与持续集成

博客搞好了，接下来应该考虑下如何对Hexo源文件做版本管理了。假如电脑坏了，或者想换台电脑更博，那就gg了。我的做法是在github再新建个仓库`xiaojiecong.github.io.source`存放Hexo源文件。或者也可以在原来的仓库再建个分支存。至此，就做到版本控制了，很简单吧。那现在我们的发布流程就是（以我的为例）：


对Hexo源文件修改后push到 `xiaojiecong.github.io.source`（源文件仓库，这里称为Source Repo）。然后执行命令`hexo g`，`hexo d`，生成静态网页，部署上`xiaojiecong.github.io`（用于存生成的静态页面的仓库，这里称为Content Repo）。这里总的来说，经过了2个步骤，尽管看起来还不算麻烦，但是我们可以对此简化，最终达到一键发布的目的。我们可以用`AppVeyor`做持续集成（Continuous integration，简称CI），可以省去`hexo g`，`hexo d`等等步骤，`AppVeyor` 可以自动帮我们做编译，打包，部署等等工作。


#### 使用github账号登录AppVeyor

<a href="https://www.appveyor.com/" target="_blank">AppVeyor官网</a>

![image](/img/appveyor/1.png)

#### NEW PROJECT

添加你的GitHub项目，这里要注意添加的是你的Source Repo，而不是Content Repo。一开始我就是混淆了，绕了一些弯路 - -！

![image](/img/appveyor/2.png)

#### 添加appveyor.yml到Source Repo根目录

就是前面提到的这个源文件夹下多了一个`appveyor.yml`

```
---
|--node_modules
|--scaffolds
|--source
|--themes
|--.gitignore
|--_config.yml
|--package.json
|--appveyor.yml
```

`appveyor.yml`配置

```yml
clone_depth: 5

environment:
  nodejs_version: "6"
  access_token:
    secure: MvjDPMTBE+hD5iZPRY2mIUuTl8quMhcEfhYe1rOti5g2GaTPQSDU/Mliff7NainM

install:
  - ps: Install-Product node $env:nodejs_version
  - node --version
  - npm --version
  - npm install
  - npm install hexo-cli -g

build_script:
  - hexo generate

artifacts:
  - path: public

on_success:
  - git config --global credential.helper store
  - ps: Add-Content "$env:USERPROFILE\.git-credentials" "https://$($env:access_token):x-oauth-basic@github.com`n"
  - git config --global user.email "%GIT_USER_EMAIL%"
  - git config --global user.name "%GIT_USER_NAME%"
  - git clone --depth 5 -q --branch=%TARGET_BRANCH% %STATIC_SITE_REPO% %TEMP%\static-site
  - cd %TEMP%\static-site
  - del * /f /q
  - for /d %%p IN (*) do rmdir "%%p" /s /q
  - SETLOCAL EnableDelayedExpansion & robocopy "%APPVEYOR_BUILD_FOLDER%\public" "%TEMP%\static-site" /e & IF !ERRORLEVEL! EQU 1 (exit 0) ELSE (IF !ERRORLEVEL! EQU 3 (exit 0) ELSE (exit 1))
  - git add -A
  - if "%APPVEYOR_REPO_BRANCH%"=="master" if not defined APPVEYOR_PULL_REQUEST_NUMBER (git diff --quiet --exit-code --cached || git commit -m "Update Static Site" && git push origin %TARGET_BRANCH% && appveyor AddMessage "Static Site Updated")
```


要注意的一点是，我看的原教程上是没有`nodejs_version: "6"`，`- ps: Install-Product node $env:nodejs_version`这2项设置的，如果不写，`appveyor`是默认安装4.X版本node的，官网这篇<a href="https://www.appveyor.com/docs/lang/nodejs-iojs/" target="_blank">文章</a>有介绍。然而，有些hexo主题是需要6.X版本以上的。除此之外的配置，只有`access_token`是不一样，这个需要去Github生成，参考这篇<a href="https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/" target="_blank">文章</a>。在github拿到`access_token`之后，还需要到<a href="https://ci.appveyor.com/tools/encrypt" target="_blank" rel="external">AppVeyor加密页面</a>进行加密，最终得到类似这样一串东西
`MvjDPMTBE+hD5iZPRY2mIUuTl8quMhcEfhYe1rOti5g2GaTPQSDU/Mliff7NainM`(这个是我的)

![image](/img/appveyor/3.png)

#### 设置Appveyor环境变量

四个变量：GIT_USER_EMAIL、GIT_USER_NAME是你GitHub邮箱和用户名，STATIC_SITE_REPO是你的Content Repo地址，TARGET_BRANCH默认是master。

![image](/img/appveyor/4.png)

### 报错处理
到这步如无意外，就成功了。对本地的Hexo源文件修改push到Source Repo，按理来说，就不用做什么事情了，`appveyor`会帮我们自动部署到Content Repo。然而事情往往不会那么顺利，你可能会收到`appveyor`的报错邮件。我的报错是因为我的主题没有通过git提交到GitHub上，到GitHub的Source Repo看themes文件夹也是空的。到网上看了一些网友的评论，也出现过同样的问题。

themes文件夹下的这个第三方的yilia主题是通过git clone的方式放进来的。那就是说我们在这个`xiaojiecong.github.io.source`仓库下，又存在了别的仓库。所以提交的时候，yilia文件夹下的东西就没提交上去。
```
---
|--node_modules
|--scaffolds
|--source
|--themes
|    |--yilia  
|--.gitignore
|--_config.yml
|--package.json
|--appveyor.yml
```
我的解决方法是把 yilia改成一个自定义的名称，然后在`_config.yml`主题引用的配置也相应改下就可以了。也有网友说剪切出来，然后再放进去，再push。或者，你下载主题不要用git clone这种方式，可以在Github点`
  Download ZIP`，把包下载下来再放进去。还有一种靠谱的方法，就是把隐藏的`.git`文件夹删掉就行了。有些方法我本人并没试过，如果你也遇到这个问题，这些方法都可以尝试一下，反正达到把文件上传到Github的目的就可以了。

### 成功部署

对本地的Hexo源文件修改push到Source Repo就可以了。然后可以到appveyor，看一下commit记录。
![image](/img/appveyor/5.png)

点进去看看详情，看到Build success 就放心了。
![image](/img/appveyor/6.png) 

（以我的为例）这样以后我只需管理的`xiaojiecong.github.io.source`这个仓库就可以了，即使电脑坏了，GitHub上也还有备份，以后也可以拉下来修改，而且是一键发布。
一般push到`xiaojiecong.github.io.source`这个仓库之后，`xiaojiecong.github.io`这个仓库会2分钟左右就会自动更新，可以到Github去观察一下commit记录。

### 最后
参考文章：<a href="https://formulahendry.github.io/2016/12/04/hexo-ci/#" target="_blank">Hexo的版本控制与持续集成</a>

### 2020.04 更新

使用`netlify`搭建更方便，可以参考这篇文章：<a href="https://www.jianshu.com/p/1d47bea6e728" target="_blank">使用netlify发布自己的静态网站项目</a>