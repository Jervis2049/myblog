---
title: 红包小程序小结
date: 2019-12-28 15:48:15
tags: 微信
---

> 最近做了一个红包兑换小程序，遇到了一些问题这里做一下总结。

1、需求：回流用户在游戏客户端获取到口令，然后在小程序这边输入口令兑换红包，成功之后钱会发到用户微信账户里。
2、流程：若未授权，显示授权按钮。点击授权登录，授权成功后获取到私密字段iv和encryptedData，调取登陆接口。用户输入口令，正确则跳转校验姓名和身份证的页面，校验通过就调取提现接口，成功则提示提现成功，同时显示生成分享图按钮。分享图由用户昵称，头像，二维码，提现金额等等组成。
3、框架：uniapp

<!--more-->

### 分享图的问题

1、`measureText`获取宽度的时候，传入的参数如果是数字，则会返回0。
```
 let money = 10;  
 money = money.toString(); //必须转成字符串
 ctx.measureText(money).width;
```
2、绘制图片的时候不要忘了先使用`getImageInfo`转成临时地址，再`drawImage`，如果不经过这步，虽然开发者工具上看到是正常的，但是真机是显示不了。
3、在本地开发者工具看到打印出来的头像URL，有时是`https://wx.qlogo.cn`这个域名，有时又变成了`https://thirdwx.qlogo.cn`，所以这两个都需要在后台配置downloadFile合法域名，避免绘制分享图的时候出现问题。
> 为提供更稳定的接口服务，通过微信登录接口或者获取粉丝信息接口获取用户基本信息时，用户头像URL字段的域名将从http://wx.qlogo.cn变更为http://thirdwx.qlogo.cn。原域名将逐步失效，为保证服务稳定，请开发者重新调用接口，更新用户头像URL信息。———— 摘自https://zhuanlan.zhihu.com/p/35501598 

4、最初背景图大概170KB，尺寸750*1334，最终绘制出来的分享图太大了。解决方法：
+ 把背景图片尽量再压缩，最终是60多KB。
+ 调`canvasToTempFilePath`的时候，fileType默认是png，可以设置为jpg；quality范围是(0,1]，取个合适的值。
5、小程序里面的保存图片并不是长按保存的，需要点击按钮授权。
```html
<button  open-type="getUserInfo"  @getuserinfo="onGotUserInfo"></button>、
```
```javascript
...
onGotUserInfo(e){
	uni.saveImageToPhotosAlbum({
		filePath: this.tempPath,
		success(res) {
			uni.showToast({
			  title: '保存成功',
			  icon: 'success',
			  duration: 1500
			})
		},
		fail(err){
	
		}
	})
}
...
```

如图：如果用户点击确定，就会正常保存图片到本地相册了。
![image](/img/articleimg/13.png)
如果用户点击取消，不授权呢？那还能怎么样，点击再弹出原来的弹窗重新授权呗。很遗憾，这里并不能像授权登录弹窗一样点了取消之后，再次点击授权按钮还会唤起那个弹窗。解决方法：在`saveImageToPhotosAlbum`的fail回调函数里面操作，再次获取保存到相册权限。
```javascript
if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
  uni.showModal({
	title: '提示',
	content: '需要您授权保存相册',
	showCancel: false,
	success:res=>{
	  uni.openSetting({
		success(settingdata) {
		  if (settingdata.authSetting['scope.writePhotosAlbum']) {
			uni.showModal({
			  title: '提示',
			  content: '获取权限成功,再次点击保存图片按钮即可保存',
			  showCancel: false,
			})
		  } else {
			uni.showModal({
			  title: '提示',
			  content: '获取权限失败，将无法保存到相册哦~',
			  showCancel: false,
			})
		  }
		},
		fail(failData) {
		  console.log("failData",failData)
		},
		complete(finishData) {
		  console.log("finishData", finishData)
		}
	  })
	}
  })
}	
```
点击取消按钮之后，会跳转到这里。打开设置里的“保存到相册”的开关即可。
![image](/img/articleimg/14.png)


### 关于wx.login 和 wx.getUserInfo的先后顺序
如果先调用wx.getUserInfo，拿到私密数据iv和encryptData，然后调wx.login获取到临时登录凭证code，最后调我们的业务登录接口，传入iv，encryptData，code，发现有一定概率会解密失败。先调用wx.login再调用wx.getUserInfo就没问题。
```html
<button open-type="getUserInfo" @getuserinfo="getUserInfo"></button>
```
```javascript
getUserInfo(e){
	//不从e.detail这里拿encryptedData和iv
	wx.login({
		success:res=>{
			//1、获取code
			//2、调wx.getSetting()，wx.getUserInfo拿到encryptedData和iv
			//3、调业务登录接口拿到session和openid
		}
	})
},
```

