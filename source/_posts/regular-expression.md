---
title: 正则表达式笔记
date: 2018-04-24 18:42:58
tags: 其它
---

### 零宽断言

#### 前瞻
零宽正向先行断言 (zero-width positive lookahead assertion)
exp1(?=exp2)，表示匹配exp2前面的exp1。例子：

```javascript
//输出"ab ac d"
"ab ac ad".replace(/a(?=d)/g,"")
```

#### 负前瞻
零宽负向先行断言(zero-width negative lookahead assertion)
exp1(?!exp2)，表示匹配后面不是exp2的exp1。例子：
```javascript
//输出"b c ad"
"ab ac ad".replace(/a(?!d)/g,"")
```

<!--more-->

#### 后顾
零宽正向后行断言 (zero-width positive lookbehind assertion)
(?<=exp2)exp1，表示匹配exp2后面的exp1。例子：

```javascript
//输出"a bb cb" (匹配前面是a的b)
"ab bb cb".replace(/(?<=a)b/g,"")
```

#### 负后顾
零宽负向后行断言 (zero-width negative lookbehind assertion)
(?<!exp2)exp1，表示匹配前面不是exp2的exp1。例子：

```javascript
//输出"ab  c" (匹配前面不是a的b)
"ab bb cb".replace(/(?<!a)b/g,"")
```



### 捕获分组与非捕获分组
捕获组(Capturing Groups)与非捕获组(Non-Capturing Groups)

+ ()表示捕获分组，()会把每个分组里匹配的值保存起来。
+ (?:)表示非捕获分组，参与匹配，但不保存分组的值。

例子：
```javascript
//输出 ["2049-10-1", "2049", "10", "1", index: 0, input: "2049-10-1", groups: undefined]
/(\d{4})-(\d{1,2})-(\d{1,2})/.exec("2049-10-1")

//输出 ["2049-10-1", "10", "1", index: 0, input: "2049-10-1", groups: undefined]
/(?:\d{4})-(\d{1,2})-(\d{1,2})/.exec("2049-10-1")
```
上面返回的`groups: undefined`又是怎么回事呢？这个 groups 属性只有在当前正则里至少存在一个命名分组的前提下才会存在。、

命名分组  (?<name>xxx)     
```javascript
// ["2049-10-1", "2049", "10", "1", index: 0, input: "2049-10-1", groups: {year: "2049", month: "10", day: "1"}]
/(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{1,2})/.exec("2049-10-1")
```