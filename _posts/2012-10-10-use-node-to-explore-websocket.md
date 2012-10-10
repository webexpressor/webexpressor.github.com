---
layout: page
title: "基于Node中的websocket实现简单聊天功能"
category: "NodeJs"
tags: [nodejs-cookbook]
description: "使用node中的websocket模块和html5的websocket特性实现简单的聊天室逻辑"
---

# 搭建服务器端
我们要使用websocket模块，所以先安装，执行 npm install websocket。

创建server.js，代码如下：
{% highlight javascript%}
var http = require('http');

//使用server
var WSServer = require('websocket').server;
var url = require('url');
var clientHtml = require('fs').readFileSync('client.html');

//请求静态文件，后面会创建client.html
var plainHttpServer = http.createServer(function(request, response){
    response.writeHead(200, {'Content-type':'text/html'});
    response.end(clientHtml);
}).listen(8080);

//基于http server创建一个websocket server
var webSocketServer = new WSServer({httpServer:plainHttpServer});

//用来存放连接的用户
var users = [];

//监听用户的连接
webSocketServer.on('request',function(request){
    request.origin = request.origin || "*";
    var user = request.remoteAddress;

    //获得连接
    var connection = request.accept(null, request.origin);
    //存放
    users.push(connection);
    //接收信息，push给所有连接上的用户
    connection.on('message',function(msg){
        for(var i=0; i<users.length; i++){
            users[i].send(user+'说:'+msg.utf8Data);
        }
    });

    //连接关闭
    connection.on('close',function(code,desc){
        console.log('服务器关闭了');
    });
});
{% endhighlight%}

# 搭建客户端

创建client.html，代码如下：
{% highlight javascript%}
<!doctype html>
<html>
    <head>
        <title>websocket</title>
        <meta charset="utf-8"/>
    </head>

    <body>
        <input type="text" id="msg"/><input type="button" value="send" id="send"/>
        <div id="output"></div>
        <script>
            (function () {
              window.WebSocket = window.WebSocket || window.MozWebSocket;

              //获得连接
              var ws = new WebSocket("ws://10.2.2.108:8080"),
                output = document.getElementById('output'),
                send = document.getElementById('send');
              function logStr(msg) {
                return '<div>' + msg + '</div>';
              }  

              send.addEventListener('click', function (){ 
                  var msg = document.getElementById('msg').value;
                  ws.send(msg);//向服务器发送消息
                  document.getElementById('msg').value="";
              });

              //监听服务器推送的消息
              ws.onmessage = function (e) {
                console.log(e.data);
                output.innerHTML += logStr(e.data);
              };

              //监听服务器的关闭
              ws.onclose = function (e) {
                output.innerHTML += logStr( e.code + '-' + e.type);
              };

              //监听服务器发生错误
              ws.onerror = function (e) {
                output.innerHTML += logStr(e.data);
              };  

            }());
        </script>
    </body>
</html>
{% endhighlight%}

# 运行 node server.js

打开多个浏览器窗口就可以自己和自己聊天了~~，使用node实现起来还是比较简单的。

# 相关资料

- [websocket module](https://github.com/Worlize/WebSocket-Node)
- [html5demos](http://html5demos.com/web-socket)


