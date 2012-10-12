---
layout: page
title: "使用JavaScript来得到图片的base64编码"
category: JavaScript
tags: [base64]
description: "使用JavaScript调用canvas.toDataURL()可以获得图片的base64编码" 
---

# canvas.toDataURL([type,...])
将canvas中的image返回data:URL

如果提供第一个参数，可以控制返回image类型，默认为image/png，如果提供的类型不支持也是返回image/png。

如果canvas中的origin-clean flag被设置为false，浏览器就会抛出SecurityError。

当canvas中填充的图片地址和本机地址不同时，origin-clean就会被设置为false。
没有运行在服务器上时，origin-clean也会设置为false。

详情参见[whatwg](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#the-canvas-element)

# demo
实现方法是：1.创建canvas；2.将图片填充进去；3.调用toDataURL()方法。

下面先创建demo.html文件，body中内容如下：
{% highlight javascript%}
<canvas id="canvas"></canvas>
<textarea id="data" rows="20" cols="80"></textarea>
<img id="echo"> 
<script type="text/javascript">
  var can = document.getElementById('canvas');
  var ctx = can.getContext('2d');
  var img = new Image();
  img.onload = function(){
    can.width  = img.width;
    can.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var url = document.getElementById('data').value = can.toDataURL();
    var url = can.toDataURL();
    document.getElementById('echo').src = url;
  }
  //本地的图片
  img.src = 'png_1.png';
</script>
{% endhighlight%}

上面例子如果不运行在服务器，只会看到图片显示出来了，但是文本框中并没有base64的数据。这时查看控制台发现报SecurityError。
所以我们的把该例子运行在服务器上。

我选择了nodejs，顺便学习下node怎么加载静态资源，在同目录下创建app.js:
{% highlight javascript%}
var http = require('http');
var path = require('path');
var fs = require('fs');
 
http.createServer(function (request, response) {
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './demo.html';
     
    path.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
}).listen(1234);
{% endhighlight%}
控制台运行node app.js，没有任何错误输入时，可以用浏览器访问了，这时在文本框中就有base64编码内容了。

如果将demo.html中的img.src的值设置为其它服务器的一张图片时，也是得不到base64数据的，同样浏览器会抛出SecurityError。
