---
layout: page
title: "如何将MongoDB做一项windows服务启动"
category: Mongodb
tags: [config]
description: "将mongodb像mysql那样可以随着windows启动而启动"
---

每次开机运行都需要在（cmd）下面手动输入下面的命令来启动mongodb服务，非常不方便。

{% highlight javascript%}
D
cd D:\MongoDb\bin
mongod --dbpath D:\MongoDb\data
{% endhighlight%}

我们应该将它作为windows服务，开机就启动了
{% highlight javascript%}
 D:\MongoDb\bin>
 mongod --logpath D:\MongoDb\logs\MongoDB.log 
 --logappend --dbpath D:\MongoDb\data 
 --directoryperdb --serviceName MongoDB --install
{% endhighlight%}

回车显示如下便是服务安装成功

 all output going to: D:\MongoDb\logs\MongoDB.log

运行net start MongoDB就可以启动服务了，之后在任务管理器中可以看到MongoDB服务

windows服务相关命令：

- 启动MongoDB：net start MongoDB
- 停止MongoDB：net stop MongoDB
- 删除MongoDB：sc delete MongoDB