---
layout: page
title: "探索Node中的HTTP对象"
category: "NodeJs"
tags: [nodejs-cookbook]
description: "Http对象不仅可以处理服务器端逻辑，而且还可以实现客户端的功能"
---

# 1.处理Post数据
创建ch02目录，在该目录中创建form.html和server.js

原生实现方式如下：

form.html
{% highlight javascript%}
<!doctype html>
<html>
    <head>
        <title>form</title>
        <meta charset="utf-8"/>
    </head>

    <body>
         <form method=post>
           <input type=text name=userinput1><br>
           <input type=text name=userinput2><br>
           <input type=submit>
         </form>     
    </body>
</html>
{% endhighlight%}
server.js
{% highlight javascript%}
var http = require('http');
var form = require('fs').readFileSync('form.html');
var util = require('util');
var querystring = require('querystring');
var maxData = 2 * 1024 * 1024; //2mb

http.createServer(function (request, response) {
  if (request.method === "GET") {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(form);
  }
  if (request.method === "POST") {
    var postData = '';
    request.on('data', function (chunk) {
      postData += chunk;
      //数据超过限制
      if (postData.length > maxData) {
        postData = '';
        this.pause();
        response.writeHead(413); 
        response.end('Too large');
      }
    }).on('end', function() {
      //阻止空的请求
      if (!postData) { response.end(); return; } 
      var postDataObject = querystring.parse(postData);
      console.log('User Posted:\n', postData);
      response.end('You Posted:\n' + util.inspect(postDataObject));
    });
  }
}).listen(8080);
{% endhighlight%}

使用[connect模块](http://www.senchalabs.org/connect/)
{% highlight javascript%}
var connect = require('connect');
var util = require('util');
var form = require('fs').readFileSync('form.html');
connect(connect.limit('64kb'), connect.bodyParser(),
  function (request, response) {
    if (request.method === "POST") {
      console.log('User Posted:\n', request.body);
      response.end('You Posted:\n' + util.inspect(request.body));
    }
    if (request.method === "GET") {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(form);
    }
  }).listen(8080);
{% endhighlight%}
通过指定connect.bodyParser()回调函数之后，就可以从request.body中获得post数据了。
# 2.文件上传处理
不能像处理普通数据那样来处理文件，当含有file input的表单被提交，浏览器会将file按multipart message来处理。

我们使用[formidable模块](https://github.com/felixge/node-formidable)来处理
{% highlight javascript%}
var http = require('http');
var formidable = require('formidable');
var form = require('fs').readFileSync('form.html');
http.createServer(function (request, response) {
  if (request.method === "POST") {
    var incoming = new formidable.IncomingForm();
    incoming.uploadDir = 'uploads';
    //设置上传文件的文件名
    incoming.on('fileBegin', function (field, file) {
      if (file.name){
        file.path += "-" + file.name;
      }
    })
    .on('file', function (field, file) {
      if (!file.size) { return; }
      response.write(file.name + ' received\n');
    })
    .on('field', function (field, value) {
      response.write(field + ' : ' + value + '\n');
    })
    .on('end', function () {
      response.end('All files received');
    });
    incoming.parse(request);
  }
  if (request.method === "GET") {
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(form);
  }
}).listen(8080);
{% endhighlight%}

# 3.将Node的作为Http Client
Http对象不只是提供服务器的能力，它还提供一些客户端的功能。在本节中，我们将使用http.get和process通过命令行来动态获取外部网页。

我们新建fetch.js文件，它不是担任服务器的角色
{% highlight javascript%}
var http = require('http');
var urlOpts = {host: 'www.nodejs.org', path: '/', port: '80'};
http.get(urlOpts, function (response) {
  response.on('data', function (chunk) {
    console.log(chunk.toString());
  });
});
{% endhighlight%}

运行node fetch.js后，在控制台会输入nodejs.org的html内容。

我们可以在node命令中加入参数，这样就可以动态传入url了
{% highlight javascript%}
var http = require('http');
var url = require('url');
var urlOpts = {host: 'www.nodejs.org', path: '/', port: '80'};
//获取控制台输入的参数，node为0，然后1,2
if (process.argv[2]) {
  if (!process.argv[2].match('http://')) {
    process.argv[2] = 'http://' + process.argv[2];
  }
  urlOpts = url.parse(process.argv[2]);
}
http.get(urlOpts, function (response) {
  response.on('data', function (chunk) {
    console.log(chunk.toString());
  });
}).on('error', function (e) {
  console.log('error:' + e.message);
});
{% endhighlight%}
运行node fetch.js www.google.com就可以获取其html内容。

我们还可以向server.js发送post请求，新建post.js，代码如下：
{% highlight javascript%}
var http = require('http');
var urlOpts = {host: 'localhost', path: '/',
  port: '8080', method: 'POST'};
var request = http.request(urlOpts, function (response) {
    response.on('data', function (chunk) {
      console.log(chunk.toString());
    });
  }).on('error', function (e) {
    console.log('error:' + e.stack);
  });
//控制台第二个参数后的就为发送的数据
//forEach为ES5中新增的
process.argv.forEach(function (postItem, index) {
  if (index > 1) { request.write(postItem + '\n'); }
});
request.end();
{% endhighlight%}
在控制台运行node post.js foo=bar&x=y&anotherfield=anothervalue 就可以向server.js发送post数据了。

我们还可以上传多个文件，代码如下：
{% highlight javascript%}
var http = require('http');
var fs = require('fs');
var urlOpts = { host: 'localhost', path: '/', port: '8080', method: 
'POST'};
var boundary = Date.now();
urlOpts.headers = {
  'Content-Type': 'multipart/form-data; boundary="' + boundary + '"'
};

boundary = "--" + boundary;
var request = http.request(urlOpts, function (response) {
    response.on('data', function (chunk) {
      console.log(chunk.toString());
    });
}).on('error', function (e) {
  console.log('error:' + e.stack);
});

//自运行函数
(function multipartAssembler(files) {
  var f = files.shift(), fSize = fs.statSync(f).size;
  fs.createReadStream(f)
    .on('end', function () {
      if (files.length) { 
        //一旦一个文件被上传完成，就再次调用
        multipartAssembler(files); 
        return; 
      }
      //放在这里的代码永远都不会被执行，由于上面的return
  });
}(process.argv.splice(2, process.argv.length)));
{% endhighlight%}
在控制台执行node upload.js file1 file2 fileN 就可以一次上传多个文件了

我们通过splice方法去掉控制台的node和fetch.js，以数组的形式获取到要上传的文件，并传递给multipartAssembler函数，该函数先通过shift方法来获取第一个文件，通过createReadStream来上传，并通过end来监听，如果没有全部上传完成(files.length)，就再次调用该函数。

下面是改造后的代码：
{% highlight javascript%}
(function multipartAssembler(files) {
  var f = files.shift(), fSize = fs.statSync(f).size,
  progress = 0;
  fs.createReadStream(f)
    .once('open', function () {
      request.write(boundary + '\r\n' +
         'Content-Disposition: ' +
         'form-data; name="userfile"; filename="' + f + '"\r\n' +
         'Content-Type: application/octet-stream\r\n' +
         'Content-Transfer-Encoding: binary\r\n\r\n');
    }).on('data', function(chunk) {
      request.write(chunk);
      progress += chunk.length;
      console.log(f + ': ' + Math.round((progress / fSize) * 
          10000)/100 + '%');
    }).on('end', function () {
      if (files.length) { 
        multipartAssembler(files);
        return; 
      }
      request.end('\r\n' + boundary + '--\r\n\r\n\r\n');    
    });
}(process.argv.splice(2, process.argv.length)));
{% endhighlight%}
