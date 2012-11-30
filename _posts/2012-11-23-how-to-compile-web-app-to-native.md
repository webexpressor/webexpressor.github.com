---
layout: page
title: "云编译帮助文档"
category: "JavaScript"
tags: [js,phonegap]
description: "介绍怎么将web mobile app项目打包成客户端"
---

# 1.准备工作

## 1.1 编写你的应用
你可以通过JavaScript、Css和HTML来编写[SPA(单页应用程序)](http://en.wikipedia.org/wiki/Single-page_application)，页面的入口为index.html。也可以使用Mobile Framework，如[Sencha Touch]()、[jQtouch]()、[JQuery Mobile]()。

## 1.2 配置config.xml文件
### 1.2.1 配置包名
通过widget标签的id属性可以配置，它是应用的唯一标记。

### 1.2.2 配置版本
通过widget标签的version属性可以配置。

### 1.2.3 配置程序名
通过name标签进行配置，如：
{%highlight javascript%}
<name>Demo</name>
{%endhighlight%}

### 1.2.4 配置程序icon
通过icon标签可以配置，如：
{%highlight javascript%}
<icon src="icon.png"/>
{%endhighlight%}
把icon图标放到和index.html文件相同的目录即可，大小可以为114*114px。

## 1.3 调用手机功能
该编译环境使用了开源项目[PhoneGap](http://phonegap.com)，因此调用手机API可以参见：

* [PhoneGap中文文档](http://www.phonegap.cn/?page_id=402)
* [PhoneGap英文文档](http://docs.phonegap.com/en/2.2.0/index.html)

例如要调用手机摄像头功能，需要在JavaScript中添加如下代码：
{%highlight javascript%}
navigator.camera.getPicture(onSuccess, onFail);

function onSuccess(imageData) {
   //在页面中显示拍照的图片，也可以上传到服务器
   var image = document.getElementById('myImage');
   image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
   alert('Failed because: ' + message);
}
{%endhighlight%}

# 2.开始编译

该编译环境可以将基于JavaScript、Css和HTML创建的应用实现跨平台，目前我们只支持Android和IOS平台。

## 2.1 上传你的应用

你的应用中可以包含以下内容：

* index.html(必须)
* config.xml(必须)
* icon.png：应用程序图标(必须)
* 其它资源文件： JavaScrpit、Css文件、图片、多媒体文件等等

最后将你的应用压缩为zip格式的文件进行上传。

## 2.2 进行编译

选择要编译的平台进行编译，该过程要等待几分钟。

# 3.下载安装

编译好之后就可以进行下载安装了。



