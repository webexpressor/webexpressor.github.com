---
layout: page
title: "用HTML5、Css3和Javascript的特殊特性来开发Web Mobile"
category: "Html5"
tags: [meta]
description: "使用本文的这些特性可以调用电话/短信面板，可以实现RWD（响应式设计）等等，提高用户体验"
---
# 1.Mobile中特殊的HTML标记
## 1.1 viewport
viewport标记使网页更加适应手机屏幕

{% highlight html %}
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>  
{% endhighlight %}

## 1.2 调用手机拨电话面板

{% highlight html %}
<a href="tel:18005555555">Call us at 1-800-555-5555</a>  
{% endhighlight %}

## 1.3 调用手机短信面板

{% highlight html %}
<a href="sms:18005555555">
<a href="sms:18005555555,18005555556">              
<a href="sms:18005555555?body="> //大都不支持body参数
{% endhighlight %}

## 1.4 设置是否关联打电话

{% highlight html%}
<meta name="format-detection" content="telephone=no">
{% endhighlight %}

## 1.5 IOS中特殊的HTML

{% highlight html %}
<!--添加到桌面主屏幕，设置icon -->
<link rel="apple-touch-icon" href="icon.png"/>    
<!-- iOS 2.0+: 不应用icon的光泽效果 -->  
<link rel="apple-touch-icon-precomposed" href="icon.png"/>    
<!-- iOS 4.2+ 分辨率的不同选择不同的icon -->  
<link rel="apple-touch-icon" sizes="72x72" href="touch-icon-ipad.png" />  
<link rel="apple-touch-icon" sizes="114x114" href="touch-icon-iphone4.png" />    
<!-- iOS 3+: 启动界面 (must be 320x460) -->  
<link rel="apple-touch-startup-image" href="startup.png">    
<!--允许使用启动界面功能，只能通过桌面主屏幕进入-->  
<meta name="apple-mobile-web-app-capable" content="yes" />    
<!-- 控制状态栏的样式 -->  
<meta name="apple-mobile-web-app-status-bar-style" content="black" /> 
{% endhighlight %}

## 1.6 设置是否使用输入的自动更正、自动不全、英文自动首字母大写

{% highlight html %}
<input autocorrect="off" autocomplete="off" autocapitalize="off"> 
{% endhighlight %}

# 2. Mobile特殊的CSS

## 2.1 Media Queries

Meida Queries可以使你根据屏幕的分标率（resolution）、方向（orientation）和尺寸（screen width）来分别实现特殊的效果。
可以有两种实现方式：1）在样式表中嵌入css。2）在link标记中使用“media”属性，来引入css文件，下面来举例说明：

{% highlight html %}
//只有屏幕是portrait（竖直）的时候，该css才会起作用：
@media all and (orientation: portrait) {...}
<link rel="stylesheet" media="all and (orientation: portrait)" href="portrait.css" />
//下面是另外一些例子：
// target small screens (mobile devices or small desktop windows)  
@media only screen and (max-width: 480px) {  
  /* CSS goes here */ 
 }   
 /* high resolution screens */  
@media (-webkit-min-device-pixel-ratio: 2),   
            (min--moz-device-pixel-ratio: 2),  
           (min-resolution: 300dpi) {
   header { background-image: url(header-highres.png); }  
}    
/* low resolution screens */ 
 @media (-webkit-max-device-pixel-ratio: 1.5),
               (max--moz-device-pixel-ratio: 1.5),
               (max-resolution: 299dpi) {
    header { background-image: url(header-lowres.png); }  
} 
{% endhighlight %} 

## 2.2 其它的CSS

-webkit-tap-highlight-color (iOS):设置单击超链接的系统背景色。

-webkit-user-select: none;禁止用户选择文本。

-webkit-touch-callout: none;禁止弹出操作提示（当你长按一个链接，ios会在屏幕下方弹出操作提示面板）

# 3. 特殊的Javascript
## 3.1 window.scrollTo(0,0);
可以用来隐藏浏览器地址栏
## 3.2 window.matchMeida();
可以用来检测浏览器是否支持"media queries"。
## 3.3 navigator.connection
检测设备是否连接上wifi，3G等，例如：

{% highlight javascript %}
if (navigator.connection.type==navigator.connection.WIFI) { 
   // code for WiFi connections (high-bandwidth)  
} 
{% endhighlight%}
## 3.4 window.devicePixelRatio
可以检测ios对Ratio的支持
## 3.5 window.navigator.onLine  
当前的网络状态
## 3.6 window.navigator.standalone 
是否是全屏幕模式
## 3.7 Touch and Guesture Event
1)touch events(ios,Android2.2):touchstart,touchmove,touchend,touchcancel

2)gesture events(Apple only,ios 2+):guesturestart,guesturechange

## 3.8 Screen orientation
orientation event:portrait,landscape
## 3.9 Device orientation
## 3.10 devicemotion 
用户shake或者move手机的时候触发
## 3.11 Media Capture API（Android only）
{% highlight html%}
<input type="file"></input>    
<!-- opens directly to the camera (Android 3.0+) -->  
<input type="file" accept="image/*;capture=camera"></input>    
<!-- opens directly to the camera in video mode (Android 3.0+) -->  
<input type="file" accept="video/*;capture=camcorder"></input>    
<!-- opens directly to the audio recorder (Android 3.0+) -->  
<input type="file" accept="audio/*;capture=microphone"></input> 
{% endhighlight%}