---
title: 【翻译】如何用JavaScript触发文件下载
date: 2021-03-29 18:42:58
tags: 译文
---

> 看到不错的文章，尝试着翻译出来，并且在需要的地方加上自己的理解。

原文地址：https://pqina.nl/blog/how-to-prompt-the-user-to-download-a-file-instead-of-navigating-to-it/

原文标题：`How to prompt the user to download a file instead of navigating to it`，翻译过来是：如何提示用户下载文件，而不是导航到文件。读起来怪怪的，按我理解本文是这个意思：`如何用JavaScript触发文件下载`。

以下是正文

有时候我们只是想下载一张图片而不是在浏览器上打开它。对于这种情况，我们可以使用`download `属性。在这篇文章，
我们将会学习怎么使用它，以及如何使用JavaScript来自动触发它的行为。

`download`属性告诉浏览器，当该元素被点击的时候，下载链接目标。
```js
<a href="/media/cat.jpeg" download>cat.jpeg</a>
```


<!--more-->

我们也可以通过设置`download`属性的value来提供文件的名称，在这个例子，我们设置它为`'my-cat.jpeg'`。
```js
<a href="/media/cat.jpeg" download="my-cat.jpeg">cat.jpeg</a>
```

### 自动下载

假如我们在浏览器生成了一个文件，我们如何将这个文件提供给用户，而不需要要求用户点击一个链接。

JavaScript助您一臂之力！

```js
function downloadFile(file) {
  //使用`creatObjectURL`创建一个链接并设置URL
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = URL.createObjectURL(file);
  link.download = file.name;

  //它需要被添加到DOM中，这样就才能被点击。
  document.body.appendChild(link);
  link.click();

  //要想在火狐浏览器上运行，我们需要等一下再删除它。
  //URL.createObjectURL被创建之后，使用完需要手动释放。
  setTimeout(() => {
    URL.revokeObjectURL(link.href);
    link.parentNode.removeChild(link);
  }, 0);
}
```

我们可以这样使用：
```js
// 动态创建一个文件
const myFile = new File([`${new Date()}: Meow!`], "my-cat.txt");

// 使用我们的函数下载
downloadFile(myFile);
```

### 写在最后
`URL.createObjectURL()`介绍：https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL
`File.File()`介绍：https://developer.mozilla.org/zh-CN/docs/Web/API/File/File