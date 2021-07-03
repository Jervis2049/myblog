---
title: 微信小程序canvas绘制圆角base64图片
date: 2019-08-17 11:43:00
tags: 微信
---
> 接口返回base64格式小程序二维码，以往的做法是需要再调一个接口去拿到jpg/png格式的图片。如果没有这个接口呢，是不是也可以？然而小程序canvas并不支持直接使用base64绘制，好在小程序的文件系统提供了方法，可以把base64经过进一步处理转成本地图片。

#### 获取base64格式图片

```JavaScript
getXcxQrcode() {
	wx.request({
	url: app.globalData.globalUrl + "/get_wx_code",
	data: {
		token: app.globalData.weixin_token,
		scene: app.globalData.page_key,
		page: "pages/index/index"
	},
	success: (res) => {
		if (data.data.success) {
			this.base64src(data.data)
		}
	}
	})
}
```
#### base64格式图片转换成本地图片
```JavaScript
base64src(base64data) {
	const filePath = `${wx.env.USER_DATA_PATH}/tmpbase64.png`;
	const buffer = wx.base64ToArrayBuffer(base64data.buffer);
	let that = this;
	fsm.writeFile({
	  filePath,
	  data: buffer,
	  encoding: 'binary',
	  success() {
	    that.setData({
	      qrcodeUrl: filePath  // 得到http://usr/tmpbase64.png
	    })
	  },
	  fail() {
	    reject(new Error('ERROR_BASE64SRC_WRITE'));
	  },
	});
},
```

#### 使用获得的本地图片绘制圆角二维码

```JavaScript
var qrW = 150; //绘制的二维码宽度
var qrH = 150; //绘制的二维码高度
var qr_x = 540; //绘制的二维码在画布上的位置
var qr_y = 960; //绘制的二维码在画布上的位置
ctx.save();

ctx.beginPath(); //开始绘制
//先画个圆   前两个参数确定了圆心 （x,y） 坐标  第三个参数是圆的半径  四参数是绘图方向  默认是false，即顺时针
ctx.arc(qrW / 2 + qr_x, qrH / 2 + qr_y, qrW / 2, 0, Math.PI * 2, false);

ctx.clip(); //画好了圆 剪切  原始画布中剪切任意形状和尺寸。一旦剪切了某个区域，则所有之后的绘图都会被限制在被剪切的区域内 这也是我们要save上下文的原因
ctx.drawImage(this.data.qrcodeUrl, qr_x, qr_y, qrW, qrH);
ctx.draw()
```