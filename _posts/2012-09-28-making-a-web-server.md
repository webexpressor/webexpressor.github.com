---
layout: page
title: "Ch01:创建一个Web服务器"
category: NodeJs
tags: [nodejs-cookbook]
description: "不像Java那样，nodejs中的web server和code是在一起的，也没有tomcat那么复杂的配置。通过几行代码就可以启动服务器。"
---

# 1.创建一个Router

## 1.1 创建服务器
新建server.js文件，代码如下：
{% highlight javascript %}
var http = require('http');
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/html'}); 
  response.end('Woohoo!');
}).listen(8080);
{% endhighlight %}
为了方便调试，安装 [hotnode]()
{% highlight javascript%}
npm install -g hotnode
hotnode server.js
{% endhighlight%}
此时就可以通过http://localhost:8080来访问了，http://localhost:8080/someelse也可以访问，所以继续。。。

## 1.2 简单路由功能
路由就相当于java中的action，用于拦截用户请求。可以使用 *path* 模块中的 *basename* 方法来获取url尾斜杠部分。

server.js代码改为：
{% highlight javascript %}
var http = require('http');
var path = require('path');

var pages = [
  {route: '', output: 'Woohoo!'},
  {route: 'about', output: 'A simple routing with Node example'},
  {route: 'another page', output: function() {return 'Here\'s '+this.route;}},
];

http.createServer(function (request, response) {
  var lookup = path.basename(decodeURI(request.url));
  pages.forEach(function(page) {
    if (page.route === lookup) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(typeof page.output === 'function'
                   ? page.output() : page.output);
    }
  });
  //所有逻辑处理完成后，如果response没有返回给客户端
  //即response.finished为false
  if (!response.finished) {
     response.writeHead(404);
     response.end('Page Not Found!');
  }
}).listen(8080);
{% endhighlight%}

其中用到了ES5中的forEach，Node采用V8引擎，而它已经支持ES5。

注意：这时我们只能处理simple-level形式的url（如：/about），如果要处理multilevel形式（如：/about/node）,需要移除path.basename。

## 1.3 解析querystring
会涉及到url.parse方法，它可以接受两个参数，第一个为url串，第二个如果为true，则内部实现会去加载querystring模块，最好将字符串解析为对象，我们操作起来就会很方便了。

例如：解析该url：http://localhost:8080/about/node?id=1
{% highlight javascript%}
var id = url.parse(decodeURI(request.url),true).query.id;
{% endhighlight%}

# 2.处理静态文件
先准备些静态资源，创建一个content文件夹，在里面新建html、js、css文件

主要用到fs模块，来访问文件。

{% highlight javascript%}
var http = require('http');
var path = require('path');
var fs = require('fs');

var mimeTypes = {
  '.js' : 'text/javascript',
  '.html': 'text/html',
  '.css' : 'text/css'
};

http.createServer(function (request, response) {
  var lookup = path.basename(decodeURI(request.url)) || 'index.html',
    f = 'content/' + lookup;
  //文件是否存在
  fs.exists(f, function (exists) {
    if (exists) {
      fs.readFile(f, function (err, data) {
        if (err) { response.writeHead(500);
          response.end('Server Error!');  
          return;
        }
        //path.extname('about.html') --> .html
        var headers = {'Content-type': mimeTypes[path.extname(lookup)]};
        response.writeHead(200, headers);
        response.end(data);
      });
      return;
    }
    response.writeHead(404); //no such file found!
    response.end();
  });
}).listen(8080);
{% endhighlight%}

这时就可以访问静态文件了。

# 3.在内存中缓存
上面的做法只是简单实现了功能，但是性能很差，用户的每次请求都需要从磁盘上读取文件。我们应该将它缓存起来，只需要第一次读取，之后其他用户访问就直接从内存返回。

在处理静态文件例子代码之上修改为：
{% highlight javascript%}
//增加缓存逻辑
var cache = {};
//f为要读取的文件，cb为回调 
function cacheAndDeliver(f, cb) {
  if (!cache[f]) {
    fs.readFile(f, function(err, data) {
      if (!err) {
        cache[f] = {content: data} ;
      }     
      cb(err, data);
    });
    return;
  }
  console.log('loading ' + f + ' from cache');
  cb(null, cache[f].content);
}

//...inside http.createServer:
fs.exists(f, function (exists) {
    if (exists) {
      cacheAndDeliver(f, function(err, data) {
        if (err) { response.writeHead(500);
          response.end('Server Error!');  
          return; 
        }
        var headers = {'Content-type': mimeTypes[path.extname(f)]};
        response.writeHead(200, headers);
        response.end(data);      
      });
      return;
    }
//rest of fs.exists code (404 handling)...
{% endhighlight%}

ok，如果我们修改了文件内容，但仍然是从缓存中读取旧的文件，直到重启服务器，所以需要监测文件内容变化。

两个关键时间必须的知道：1.缓存时间；2.文件上次修改的时间。如果后者大于前者就需要重新缓存了。

修改cacheAndDeliver方法为：
{% highlight javascript%}
function cacheAndDeliver(f, cb) {
  fs.stat(f, function (err, stats) {
    //stats可以取三个值atime(最后访问时间)、mtime(最后内容修改时间)
    //ctime(最后文件改变时间)
    var lastChanged = Date.parse(stats.ctime),
        isUpdated = (cache[f]) && lastChanged  > cache[f].timestamp;
    //缓存中没有、缓存需要更新
    if (!cache[f] || isUpdated) {
      fs.readFile(f, function(err, data) {
        if (!err) {
          cache[f] = {
            content: data，
            timestamp: Date.now()//记录缓存时间
          };
        }     
        cb(err, data);
      });
      return;
  }); //end of fs.stat
}
{% endhighlight%}

# 4.使用streaming来优化性能
readFile操作是将整个文件独到内存之后，才去response。而streaming是边读边传。

需要使用 *fs.createReadStream* 来初始化流，它需要request和response对象，所以我们在 我们*http.createServer* 中的callback来处理。

{% highlight javascript %}
//该代码块替换readFile
var s = fs.createReadStream(f).once('open', function () {
    response.writeHead(200, headers);      
    this.pipe(response);
}).once('error', function (e) {
    console.log(e);
    response.writeHead(500);
    response.end('Server Error!');
});

//该代码块进行缓存
fs.stat(f, function(err, stats) {
  var bufferOffset = 0;
  //存放buffer对象
  cache[f] = {content: new Buffer(stats.size)};
  s.on('data', function (chunk){
    chunk.copy(cache[f].content, bufferOffset);
    bufferOffset += chunk.length;
  });
});
{% endhighlight%}

我们还可以设置缓存的文件大小和缓存时间：
{% highlight javascript%}
var cache = {
  store: {},
  maxSize : 26214400, //(bytes) 25mb
  maxAge: 5400 * 1000, //(ms) 1 and a half hours
  clean: function(now) {
      var that = this;
      Object.keys(this.store).forEach(function (file) {
        if (now > that.store[file].timestamp + that.maxAge) {
          delete that.store[file];      
        }
      });
  }
}

fs.stat(f, function (err, stats) {
  if (stats.size < cache.maxSize) {
    var bufferOffset = 0;
    cache.store[f] = {content: new Buffer(stats.size),
        timestamp: Date.now() };
    s.on('data', function (data) {
      data.copy(cache.store[f].content, bufferOffset);
      bufferOffset += data.length;
    });
  }  
});
{% endhighlight%}
# 5.安全考虑

如果我们请求的路径为：http://localhost:8080/../../../../../../../etc/passwd，此时我们的代码不会发现已经在请求本地磁盘上的文件了。

可以使用*path.normalize*方法，它相对来说会比较安全，它可以去掉重复的../和/。

可以列一个白名单，请求的所有文件都需要在该白名单中检测。

可以为请求过来的path加上一个后缀，而我们的文件就是以该后缀结尾。







