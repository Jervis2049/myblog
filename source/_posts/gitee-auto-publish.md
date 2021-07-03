---
title: bat脚本+puppeteer自动化部署gitee pages
date: 2020-12-14 14:16:02
tags: 其它
---

## 背景
最初博客使用hexo搭建之后，部署到了github pages。然后使用`AppVeyor`可以做到自动化，每次只需要push到github就会触发构建，自动部署，非常方便。无奈国内访问速度不尽人意，后来又把博客迁到`Netlify`，这个的配置更简单，效果是一样的，push就完事了。但是访问速度也很慢，所以考虑把它迁到国内的服务器，于是便选择了gitee。访问速度这个解决了，但是问题又来了，部署到gitee pages，不能做到一键发布。网上搜了一圈好像没找到像github那样可以通过CI工具自动化部署的方案，push到gitee后，不仅不会自动构建，免费版的还需要手动地点一下“更新”的按钮，才能最终发布。

<!--more-->

## 解决方案

### bat脚本
编写一个bat脚本（Windows系统），把所有的操作都写在里面，只需要双击执行它就会自动完成。
```shell
@echo off 

echo building...
@call hexo g


@echo =============================================================================================
@echo pushing to gitee
@echo =============================================================================================

git add .
git commit -m "Update automatically by running a batch file."
git push

@echo =============================================================================================
@echo deploying
@echo =============================================================================================
node deploy-local.js

pause

```

### puppeteer

> 简介：Puppeteer是来自谷歌Chrome团队的一个项目，它使我们能够以编程的方式，通过调用Puppeteer API，控制一个Chrome(或任何其他基于Chrome DevTools协议的浏览器)浏览器，并执行常见的操作，就像在使用真实的浏览器中一样。简单地说，它是一个方便有用的工具，可以在headless模式或headful模式下自动化测试和爬取web页面。

前面提及到成功push到gitee之后，还需要手动地触发一个页面的“更新”按钮，才能最终发布。这里使用`puppeteer`来帮我们自动完成。这个操作对应bat脚本里面的`node deploy-local.js`。

deploy-local.js
```js
const puppeteer = require("puppeteer");
(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto("https://gitee.com/login");
    //username
    await page.type("#user_login", "你的gitee账号", { delay: 100 });
    //password
    await page.type("#user_password", "你的gitee密码", { delay: 100 });
    //login btn
    page.click('input[sa_evt="loginButtonClick"]')
    //wait for the selector to appear in page
    await page.waitForSelector('#users-dashboard')
    //go to the next page
    await page.goto("你的gitee项目路径/pages");
	//update btn
    page.click('.update_deploy')  
    //comfirm dialog
    await page.on('dialog', async dialog => { 
        console.log('ok')
        dialog.accept();
    })
    while (true) {
        await page.waitForTimeout(2000)
        try {
            let deploying = await page.$x('//*[@id="pages_deploying"]')
            if (deploying.length > 0) {
                console.log('update...')
            } else {
                console.log('complete')
                break;
            }
        } catch (err) {
            break;
        }
    }
    browser.close();
})()
```

