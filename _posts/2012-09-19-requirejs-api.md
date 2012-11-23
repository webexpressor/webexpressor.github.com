---
layout: page
title: "RequireJs API"
category: JavaScript
tags: [requirejs]
description: RequireJs API 中文版
published: true
---

# 1. 用法
## 1.1 加载JavaScript文件
RequireJs加载脚本的途径与传统&lt;script>不同，它的目标是鼓励使用模块化的代码(module code)，因为这样可以更快地加载和更好地优化。在模块化的代码中会使用model IDs，而不是&lt;script>中的URL。

RequireJs是相对于[baseUrl]()来加载所有的代码，baseUrl通常设置为data-main属性值中所引用的脚本的所在目录。data-main是RequireJs中的一个特殊属性，脚本最初的加载就是它来触发的。例如：

{% highlight javascript %}
<--baseUrl会被设置为scripts目录-->
<script data-main="scripts/main.js" src="scripts/require.js"></script>
{% endhighlight %}

baseUrl也可以通过RequireJs config进行设置。如果没有明确设置baseUrl，并且data-main也没有使用，这时baseUrl就为运行RequireJs的html所在的目录。

RequireJs默认假设我们依赖的都是脚本，所以module IDs不需要写“.js”后缀，RequireJs将module ID转化成路径时会自动加上它。因此，在路径配置（paths config）中，与传统的&lt;script>相比，我们可以使用很简短的字符串。

有时你需要直接的引用一个脚本，不必使用"baseUrl+path"规则。此时的module ID要符合下面的规则：

* ▪ 以".js"结尾
* ▪ 以"/"开始
* ▪ 包括URL协议，如"http:"或"https:"

一般来说，最好是用baseUrl和path来设置module IDs，这样做的话，在优化构建（optimization builds）时，就可以更灵活地重命名和配置指向不同位置的路径。

同样的，为了避免大量的配置，最好要避免深层次的目录结构，你可以将所有脚本放到baseUrl目录下，或者将你的脚本和第三方的放在不同的文件夹下，例如下面这样：

{% highlight javascript %}
▪ www/
	▪ index.html
	▪ js/
		▪ app/
			▪ sub.js
		▪ lib/
			▪ jquery.js
			▪ canvas.js
		▪ app.js
{% endhighlight %}

在index.html中：

{% highlight javascript %}
<script data-main="js/app.js" src="js/require.js"></script>
{% endhighlight	%}

在app.js中：

{% highlight javascript %}
requirejs.config({
	//默认会从js/lib中加载module
    baseUrl: 'js/lib',
    //如果module ID以"app"开头，就会从js/app去加载。
    //paths config是相对baseUrl的，不需要加上".js"，因为paths config是针对目录的。
    paths: {
        app: '../app'
    }
});
//应用程序逻辑的开始
requirejs(['jquery', 'canvas', 'app/sub'],
function   ($, canvas, sub) {
    //jQuery,canvas和app/sub模块对象在这里就可以使用了
});
{% endhighlight	%}

在该例中，像第三方类库jquery，在文件名中并没有使用版本号。如果你想跟踪版本，强烈建议将版本信息存储在一个单独的文件中，或者可以使用[volo]()这个工具，它会在package.json文件中加盖版本信息，但是磁盘上的文件仍然以"jquery.js"命名。这样就可以使用更简短的配置，而不是将版本信息也包括进去。例如：配置"jquery"就代表"jquery-1.7.2"。

理想情况下，通过define()定义的脚本会被当做为模块(module)。但是，要获取没有通过define()定义的脚本如传统的全局脚本，就需要用到[shim config]()，它可以正当地描述依赖关系。

如果你没有描述依赖关系，在加载的时候就可能会出错，因为RequireJs为了加快加载速度，会采用异步和无序的方式。

## 1.2 模块的定义

模块与传统的脚本文件不同，它定义了良好作用域的对象（well-scoped object）,它可以避免污染全局命名空间，可以明确地列出其依赖关系，并且处理依赖时不会涉及到global对象，而是将这些依赖作为参数传递给定义模块的函数。RequireJs中的模块是[Module Pattern]()的扩展，优势是引用其它模块时不需要使用global对象。

RequireJs中的模块会尽可能快地被加载，甚至是无序的方式，但是使用时是按照正确的依赖顺序。因为global对象没有被使用，所以在同一页面中可以为一个模块加载不同的版本。

(如果你熟悉或者使用过CommonJs Modules，请参见[CommonJS Notes]()，它会说明怎样将CommonJS Module映射为RequireJs Module)。

磁盘上的每个文件只可以定义一个模块，但是通过优化工具可以将多个模块组织在一起即压缩到一个文件。

### 1.2.1 简单的Name\/Value

如果模块不存在任何依赖，只是一些Name/Value值，这时可以采用创建对象的语法来定义：

{% highlight javascript %}
//my/shirt.js:
define({
    color: "black",
    size: "unisize"
});
{% endhighlight%}

### 1.2.2 函数定义

如果模块不存在任何依赖，但是需要一个函数来做一些创建工作，这时可以给define()传递一个函数：

{% highlight javascript %}
//在返回模块定义之前可以做一些其它的事情。
define(function () {
    //Do setup work here
    return {
        color: "black",
        size: "unisize"
    }
});
{% endhighlight%}

### 1.2.3 函数定义和依赖关系

如果模块存在依赖关系，第一个参数是一个数组，用来存放依赖名称，第二个参数为函数，用来调用模块，一旦所有依赖加载好之后。该函数应该返回一个对象，就是这个对象定义了该模块。依赖数组作为参数传递给函数，二者的顺序会一一对应。

{% highlight javascript %}
//my/shirt.js依赖cart和inventory
//创建的模块会和依赖在同一个目录，名为shirt.js
define(["./cart", "./inventory"], function(cart, inventory) {
		//返回"my/shirt"模块对象
        return {
            color: "blue",
            size: "large",
            addToCart: function() {
                inventory.decrement(this);
                cart.add(this);
            }
        }
    }
);
{% endhighlight %}

该例中，my/shirt模块被创建，它依赖my/cart和my/inventory。在磁盘上，文件的组织结构为：

* ▪ my/cart.js
* ▪ my/inventory.js
* ▪ my/shirt.js

上面函数中的"cart"和"inventory"参数与"./cart"和"./inventory"模块名对应。

直到所有的依赖模块加载好之后，该函数才会被调用，并且通过"cart"和"inventory"参数来引用模块。

模块被定义成全局的是不建议这么做，因为有可能在同一页面针对同一模块会加载不同的版本（参见[高级用法]()）。并且，函数参数的顺序要与依赖数组对应。

函数中返回的对象就定义了"my/shirt"模块。通过这种方式定义的模块，不在global对象中。

### 1.2.4 定义模块为函数

模块不一定非得返回对象，函数也是可以的。例如：

{% highlight javascript %}
//在foo/title.js文件中定义模块，它依赖my/cart和my/inventory模块，
//但是foo/bar.js与其不在同一个目录，它会使用"my"来查找。"my"会被
//映射到任何目录，默认的是同级的"foo"目录。
define(["my/cart", "my/inventory"],
    function(cart, inventory) {
    	//返回一个函数，它定义了"foo/title"模块
        return function(title) {
            return title ? (window.title = title) :
                   inventory.storeName + ' ' + cart.name;
        }
    }
);
{% endhighlight%}

### 1.2.5 使用简单的CommonJs Wrapper定义模块

如果你希望重新使用之前通过CommonJS定义的模块，使用上面模块数组的方式会比较困难，而且你想通过模块名来引用该模块对象，你可以使用简单的CommonJS Wrapper：

{% highlight javascript %}
define(function(require, exports, module) {
        var a = require('a'),
            b = require('b');
        //返回模块
        return function () {};
    }
);
{% endhighlight%}

这种包装依赖Function.prototype.toString()，来为函数内容提供一个有用的字符串值，但是在一些设备上，如PS3，和一些老的浏览器，如Opera mobile，它会工作不正常。使用优化器(optimizer)就可以将这些依赖存放为上面提到的数组的形式，这样可以兼容这些设备了。

更多的信息参见[CommonJS]()，和[ "Sugar" section in the Why AMD]()。

### 1.2.6 使用名称来定义模块

你或许会遇到一些定义，它包括模块名称，作为define()方法的第一个参数：
{% highlight javascript %}
//明确定义"foo/title"模块:
define("foo/title",
    ["my/cart", "my/inventory"],
    function(cart, inventory) {
        //Define foo/title object in here.
   }
);
{% endhighlight%}

模块名称通常是由优化工具生成的，你可以明确指定模块名，但是这样做使得模块变得移植性差--如果你将该文件移到其它的文件夹，你得修改模块名。通常不要自己命名模块，让优化工具去处理。优化工具会加上模块名，然后将各个模块合并为一个文件，这样就可以加载更快。

### 1.2.7 模块的其它知识

*一个模块一个文件：* 每个JavaScript文件只定义一个模块，这样会给模块赋有name-to-path的查询算法。通过优化工具大量的模块会被合并到一个文件中，但是仅可以通过优化工具来合并。

*define()中的相对模块名：* 例如require('./relative/name')可能会在define()函数体内被调用，这样就要求依赖"require"，以便relative name可以被正确地解析。

{% highlight javascript %}
define(["require", "./relative/name"], function(require) {
    var mod = require("./relative/name");
});
{% endhighlight%}

更好的是采用 translating CommonJS 模块，可以更简洁地定义：

{% highlight javascript %}
define(function(require) {
    var mod = require("./relative/name");
});
{% endhighlight%}

*生成相对某一模块的URL：*依赖require，然后调用require.toUrl()方法：

{%highlight javascript%}
define(["require"], function(require) {
    var cssUrl = require.toUrl("./style.css");
});
{%endhighlight%}

*控制台调试：*如果你在JavaScript控制台调用通过require(["module/name"], function(){})加载的模块，你可以通过为require()指定模块名来进行加载：

{% highlight javascript%}
require("module/name").callSomeFunction()
{% endhighlight%}

注意：这只会在通过require(["module/name"])的异步加载的方式下工作，如果使用相对路径，例如：'./module/name'，这只会在define内中执行。

### 1.2.8 循环依赖

如果你定义了一个循环依赖（a依赖b，b依赖a），在这种情况下，当b模块中的函数执行时，a的值为undefined。b可以在当模块使用require()定义之后去获取（一定要加上require的依赖，才能保证正确的上下文去寻找a）。

{% highlight javascript%}
//Inside b.js:
define(["require", "a"],
    function(require, a) {
    	//如果"a"依赖b，这时"a"将为null
        return function(title) {
            return require("a").doSomething();
        }
    }
);
{% endhighlight%}

通常你不需要使用require()来获取模块，而是将模块作为参数传递给函数。循环依赖是少数情况，这意味着你需要重新去考虑设计。但是有时它是必须的，此时就需要用到require()。

如果你对CommonJs模块比较熟悉，你可以使用exports为模块创建一个空的对象，它就可以立即被其它模块引用。为循环依赖的两端都使用这种做法，在其它模块中就可以很安全地使用了。这种情况只适合为模块返回对象，而不是函数：

{% highlight javascript%}
//b.js:
define(function(require, exports, module) {
    //如果"a"也已经使用exports，我们就可以引用它。但是我们不能使用"a"的任何属性，
    //直到"b"返回一个值。
    var a = require("a");
    exports.foo = function () {
        return a.bar();
    };
});
{% endhighlight%}

如果使用数组形式，需要依赖"exports"：
{% highlight javascript%}
define(['a', 'exports'], function(a, exports) {
    exports.foo = function () {
        return a.bar();
    };
});
{% endhighlight%}

### 1.2.9 指定JSONP服务的依赖

[JSONP]()是JavaScript调用服务的一种方式。它是跨域的，是通过script脚本的http get请求来建立的。

在RequireJs中使用JSONP，需要指定callback参数的值为"define"。可以通过JSONP的url来得到值，就好像它是模块的定义。

下面是调用JSONP API端点的例子，在这个例子中，JSONP的回调参数就为"callback"，所以"callback=define"告诉API使用define()将JSON格式的返回对象包装起来。

{% highlight javascript %}
require(["http://example.com/api/data.json?callback=define"],
    function (data) {
        //data就为这次JSONP调用所返回的对象
        console.log(data);
    }
);
{% endhighlight %}

JSONP的使用应该被限制在用JSONP服务来初始化程序的创建。如果JSONP服务超时，通过define()定义的其它模块可能将不会被执行，所以这样的错误处理机制是不健全的。

*JSONP的返回值只支持JSON对象。*JSONP返回数组，字符串或数字将不会执行。

此功能不应该使用在长轮询(long-polling)的JSONP连接——APIs用来处理实时数据流。这种类型的APIs应该在接收到响应后进行脚本清理，而RequireJs仅仅获取一次JSONP URL，以后在require()或者define()中使用相同的URL作为依赖时会得到一个缓存值。

在加载一个JSONP 服务时，错误常常发生在超时，因为script tag没有提供网络问题更多的细节。为了错误检测，你可以重写requirejs.onError()。更多参考请参见错误处理章节。

### 1.2.10 取消模块的定义
全局函数requirejs.undef()可以用来取消模块的定义。它会充值加载器的内部状态，会忽略之前对该模块的定义。

但是它不会再已经依赖该模块的其它模块中把它移除。所以可以用在一些错误处理上，当没有其它模块依赖的情况下，或者之后的模块会依赖它。参见[errback section]()例子。

如果你想为取消定义做更复杂的依赖关系图分析，参见semi-private [onResourceLoad API]()。

# 2. 内部机制
RequireJs加载的每个模块作为script tag，使用head.appendChild()。

在模块的定义时，RequireJs等到所有的依赖都加载完毕，会为函数的调用计算出正确的顺序，然后再函数中通过正确的顺序进行调用。

在拥有同步加载的服务器端JavaScript环境中使用RequireJs，重新定义require.load()会比较容易。构建系统也是如此，环境中的require.load方法可以在build/jslib/requirePatch.js中找到。

将来，它可能会被作为可选模块拉到require/ directory，你可以在你的环境中加载，就会基于主机环境得到正确的加载行为。

# 3. 配置
在最高级的html页面（或者是最高级的不是定义模块的script脚本）中使用require()，可以传一个配置对象：
{% highlight javascript%}
<script src="scripts/require.js"></script>
<script>
  require.config({
    baseUrl: "/another/path",
    paths: {
        "some": "some/v1.0"
    },
    waitSeconds: 15
  });
  require( ["some/module", "my/module", "a.js", "b.js"],
    function(someModule,    myModule) {
        //当依赖都加载完成后，该函数被执行。
        //注意这个函数可能在页面未加载完就执行。
        //这个回调函数式可选的。
    }
  );
</script>
{% endhighlight%}

你也可以在require.js未被加载之前，用全局变量require来定义配置对象，这些配置信息就会被自动应用。
{% highlight javascript %}
<script>
    var require = {
        deps: ["some/module1", "my/module2", "a.js", "b.js"],
        callback: function(module1, module2) {
        }
    };
</script>
<script src="scripts/require.js"></script>
{% endhighlight%}
*注意：*最好使用var require = {}，不要使用window.require = {}，因为它在IE中工作不正常。

支持的配置选项：

[baseUrl]():所有模块查询所基于的根路径。在上面的例子中，"my/module"对应的&lt;script>中的src值就为"/another/path/my/module.js"。baseUrl不会加载.js文件，所以a.js和b.js会从相对于该脚本当前目录直接加载。

如果在配置中没有明确地设置baseUrl，它的默认值就为加载require.js的html的目录所在的位置。如果指定了data-main属性值，则该路径就为baseUrl。

在加载require.js页面中的baseUrl的URL可以是不同域的。RequireJs的脚本加载可以进行跨域。唯一的限制是加载​​文本的text!插件：至少在开发环境中，他们的路径应该和当前页面在同一域下。在使用优化工具之后，它就会在text!插件资源里，你在其它的域就可以引用text!插件资源来使用该资源了。

[paths]():是为没有直接在baseUrl中找到模块名而作的路径映射。路径的设置是相对于baseUrl，除非使用"/"或者URL协议(如"http:")，用上面的例子说明："some/module"的&lt;script>的src为"/another/path/some/v1.0/module.js"，被用作模块名的路径中不应该包括'.js'，因为路径是针对文件夹的，将模块名映射为路径时会自动加上'.js'。

[shim]():可以为没有使用define()来申明依赖和定义模块的那种传统的浏览器全局脚本进行配置和导出：
{% highlight javascript%}
requirejs.config({
    shim: {
        'backbone': {
            //这些依赖在加载backbone之前就会被加载
            deps: ['underscore', 'jquery'],
            //一旦加载完成，将"Backbone"作为该模块名
            exports: 'Backbone'
        },
        'foo': {
            deps: ['bar'],
            //函数也可以用来生成导出的值。
            //函数中的"this"为global对象。
            //依赖会作为函数参数传递进去
            exports: function (bar) {
                //使用函数可以为该类库调用它支持的noConfilict方法，
                //但是要注意，那些类库依赖的插件或许需要是全局的。
                return this.Foo.noConflict();
            }
        }
    }
});
{% endhighlight%}
那些不需要导出任何模块值，而仅仅是jQuery或Backbone的插件，可以在shim中配置数组依赖：
{% highlight javascript%}
requirejs.config({
    shim: {
        'jquery.colorize': ['jquery'],
        'jquery.scroll': ['jquery'],
        'backbone.layoutmanager': ['backbone']
    }
});
{% endhighlight%}
在IE中如果想要404检测，可以paths fallbacks或errbacks，这时需要exports一个字符串值，以便用来检测脚本是否被正确加载：
{% highlight javascript%}
requirejs.config({
    shim: {
        'jquery.colorize': {
            deps: ['jquery'],
            exports: 'jQuery.fn.colorize'
        },
        'jquery.scroll': {
            deps: ['jquery'],
            exports: 'jQuery.fn.scroll'
        },
        'backbone.layoutmanager': {
            deps: ['backbone']
            exports: 'Backbone.LayoutManager'
        }
    }
});
{% endhighlight%}

map：对于给定的模块前缀，就不会使用提供的ID来加载模块了，是用新的ID来代替。

这种分类能力在大的项目中尤为重要，你或许会用到两个不同版本的'foo'模块，它们之间不会造成冲突。

这是在基于上下文的多版本支持是不可能的。另外paths配置只是为模块ID创建根路径，而不是将一个模块ID映射到另一个模块。

map 例子：
{% highlight javascript%}
requirejs.config({
    map: {
        'some/newmodule': {
            'foo': 'foo1.2'
        },
        'some/oldmodule': {
            'foo': 'foo1.0'
        }
    }
});
{% endhighlight%}
如果模块在磁盘存储的形式如下：

- foo1.0.js
- foo1.2.js
- some/
-   newmodule.js
-   oldmodule.js

"some/newmodule"通过equire('foo')会获得'foo1.2.js',"some/oldmodule"会获得'foo1.0.js'。

这个特性只会在调用define()的AMD模块，并注册为匿名模块时才可以使用。

可以支持"*"通配符，所有模块都会用该map配置，如果匹配了特殊配置，则使用该特殊配置。例如：
{%highlight javascript%}
requirejs.config({
    map: {
        '*': {
            'foo': 'foo1.2'
        },
        'some/oldmodule': {
            'foo': 'foo1.0'
        }
    }
});
{% endhighlight%}
除了"some/oldmodule"的所有模块，如果想要"foo"，就会得到foo1.2。但是对于"some/oldmodule"，会得到foo1.0。

[config]()：通常我们会给模块来设置一些配置信息。这些配置信息会被当做程序的一部分，得需要一种方式将它们传递给模块。在RequireJS中，可以通过require.config()来进行设置。之后相对应的模块就可以通过调用module.config()来获取配置信息。例如：
{%highlight javascript%}
requirejs.config({
    config: {
        //对bar模块进行配置
        'bar': {
            size: 'large'
        },
        //对baz模块进行配置
        'baz': {
            color: 'blue'
        }
    }
});

//bar.js, 加载bar模块:
define(function (require, exports, module) {
    //通过module.config()来获取配置信息
    var size = module.config().size;
});

//baz.js 加载bar模块：
define(['module'], function (module) {
    //通过module.config()来获取配置信息
    var color = module.config().color;
});
{%endhighlight%}

[packages]()：配置从CommonJs Packages中加载模块，参见[包中加载JavaScript文件]()

[waitSeconds]()：放弃加载脚本所等待的时间，默认为7秒。

[context]()：设置加载上下文名称。这个允许requirejs在同一页面中加载不同版本的模块，只要为每个顶级的require调用赋一个唯一的context值。正确使用它，参见[多版本的支持]()。

[deps]()：要加载的依赖数组。在require.js没有加载之前使用require定义配置对象的情况下，它比较有用。当require()一旦被定义，就可以立即加载你配置的依赖。

[callback]()：require对象的一个回调函数，会在所有的依赖加载完成后执行。这种情况在使用require作为配置对象，且在requirejs被加载之前时是非常有用的，你可以定义一个函数来处理模块加载完成后要做的事情。

[enforceDefine]()：

[xhtml]()：如果设置为true， document.createElementNS()会被用来创建脚本元素。

[urlArgs]()：

[scriptType]()：指定RequireJS插入document中script的type值，默认为"text/javascript"。如果使用火狐JavaScript 1.8特性，可以设置为"text/javascript;version=1.8"。

# 4. 高级用法
## 4.1 从包中加载JavaScript文件
## 4.2 多版本的支持
## 4.3 页面加载后加载代码
## 4.4 Web Worker的支持
## 4.5 Rhino的支持
## 4.6 错误处理

# 5. 加载器插件
RequireJs支持加载器插件(loader plugins)，
## 5.1 指定文本文件的依赖
使用html标记来创建html是一种很好的方式，而不是通过script来创建dom结构。但是，还没有一种好的方式来在js脚本中嵌入html，我们可以使用字符串形式的html，但是它比较难于管理，尤其是遇到多行的html。

RequireJS提供一个插件，text.js，它可以解决这个问题。如果使用为依赖使用!text前缀，它就会自动加载。详情请参见[text.js README]()。

## 5.2 页面加载事件支持/DOM Ready
使用RequireJs可以使脚本尽可能地加载更快，可以在DOM ready之前就已经加载完成。任何和DOM交互的操作必须的等待DOM ready之后才可以进行，对于一些现代的浏览器，是在等待DOMContentLoaded 事件。

但是，并不是所有的浏览器都支持DOMContentLoaded。domeReady模块实现了一个浏览器的兼容的方法来检测DOM是否ready。下载该模块，在你的项目中像如下使用：

{%highlight javascript%}
require(['domReady'], function (domReady) {
  domReady(function () {
    //在DOM ready之后该方法就被执行
  });
});
{%endhighlight%}

因为DOM ready在应用程序中都会用到，像上面的嵌套写法应该避免。domeReady模块也实现了Loader Plugin API，所以你可以使用loader plugin语法（在domeReady依赖中注意!）中的require()的回调函数，它会返回当前的文档对象。

{%highlight javascript%}
require(['domReady!'], function (doc) {
    //一旦dom ready该函数立即被执行
  });
});
{%endhighlight%}

*注意：*有肯能会遇到文档加载时间很长（有可能文档很大，或许加载的大文件脚本阻塞了DOM），因此使用domeReady有可能发生超时错误
## 5.3 定义一个I18N捆绑