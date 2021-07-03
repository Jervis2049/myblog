---
title: 最近项目在iOS系统出现的兼容性问题
date: 2019-2-16 17:16:02
tags: 其它 
---
### 勾选字符 ✔ 在iOS的设备上显示黑色
![image](https://s1.imagehub.cc/images/2020/09/30/9.jpg)
<!--more--> 
写在after伪类content里面的这个勾选字符 ✔ 在iOS的设备上显示黑色，设置color无效，原样式是这样写的
```css
span:after{
    content: "\2714";
    color: #fff;
}
```

iphone手机上显示的是黑色。

在stackoverflow看到两个帖子有提到这个，可以参考一下。
<a target="_blank" href="https://stackoverflow.com/questions/39514315/safari-on-iphone-is-unable-to-style-the-color-of-pseudo-element-after-with-cont">Safari on iPhone is unable to style the color of pseudo element :after with content \2714 but it works for \2713</a>
<a target="_blank" href="https://stackoverflow.com/questions/32639694/ios-9-removed-the-possibility-to-change-certain-symbol-colors-using-css">iOS 9 removed the possibility to change certain symbol colors using CSS</a>

我最后采取的是这个方法:

```css
span:after{
    content: "\2714\fe0e";
    color: #fff;
}
```

### input的问题

#### 1、input不能获得焦点
在iOS上只有用户主动触发的focus事件才会起效，而不能直接通过focus()唤出键盘。所以一般会需要有一个按钮给用户主动触发。所以可以给一个元素绑定一个事件，然后在事件回调里面执行input的focus方法。
```Javascript
let inputEle = document.querySelector('.input');
let btn = document.querySelector('.btn');
btn.addEventListener('click',()=>{
  btn.focus()
},false)
```

如果是用vue写的话，如下：

```Javascript
<template>
  <div class="container">
    <div @click="showInput"></div>
    <div class="input-box" :class="focus?'show':''">
      <input v-focus ref="input" class="input-text" placeholder="我来评论..." type="text" />
    </div>
  </div>
</template>
<style>
  .input-box{
    position: fixed;
    bottom:0;
    width:100%;
    height:.80rem;
    transform: translateY(100%);
  }
  .input-box.show{
    transform: translateY(0);
  }
</style>
<script>
  export default {
    data () {
      focus : false
    },
    directives: {
      focus: {
        inserted(el) {
          el.focus()
        }
      }
    },
    methods:{
      showInput(){
        this.focus = true;
        this.$refs.input.focus()         
      }
    }
  }
</script>
```
#### 2、收起软键盘的时候，页面没有滑下来

由于聚焦input的时候，出现软键盘，所以页面会被顶上去，当收起软键盘的时候，页面按理应该会滑下来，可是没有。
解决：失去焦点的时候 window.scroll(0,0) 
```html
<input v-focus ref="input" @blur="onBlur" class="input-text" placeholder="我来评论..." type="text" />

onBlur(){
  window.scroll(0,0) 
},
```

