---
layout: page
title: "Get To Know Backbone"
category: JavaScript
tags: [backbone]
description: "介绍Backbone的主要组件：Model、View、Collection、Router"
---
# 1. 简介
Backbone主要的组件是Model、View、Collection，也是通过它们来构建web应用的。Model支持key-value的绑定和自定义的事件，Collection提供了丰富的集合操作，View用来和用户交互，接收用户事件，呈现数据。

Backbone项目托管在[github](https://github.com/documentcloud/backbone/)上。

Backbone唯一严重依赖的是[Underscore.js](http://documentcloud.github.com/underscore/)(>1.3.1)，与[jQuery](http://jquery.com)(>1.4.2)，[zepto](http://zeptojs.com)兼容。

[Backbone官方文档](http://documentcloud.github.com/backbone/)

# 2. Backbone.Model
Model负责模型的定义，它提供数据验证，属性运算，属性绑定等功能。

## 2.1 模型的创建
{% highlight javascript %}
//创建一个Todo模型
window.Todo = Backbone.Model.extend({
	idAttribute: '_id',
	defaults:{
		done: false
	},
	toggle: function() {
      this.save({done: !this.get("done")});
    }
});
{% endhighlight%}

+ 模型创建时会最先调用initialize方法；
+ defaults属性可以设置默认值；
+ 可以通过为属性绑定change事件来监听其值的改变
+ 与服务器交互的方法fetch、save、destroy

## 2.2 Model Demo：
{% highlight javascript %}
//创建Person模型
Person = Backbone.Model.extend({ 
	//设置默认值 
    defaults:{  
        sex:"male"  
    }, 
    //初始化时常用来做一些类似本例的工作
    initialize : function() {  
        //为属性绑定事件  
        this.bind("change:name",function(){  
            alert("更改后的名字为："+this.get("name"));  
        });  
        this.bind("error",function(model,error){  
            alert(error);  
        });  
    }, 
    //数据合法性的验证 
    validate:function(attributes){  
        if(attributes.sex != "male" || attributes.sex != "female"){  
            return "Sex must be male or female.";  
        }  
    },  
    //用户自定义的方法
    changeName:function(name){  
        this.set({name:name});  
    }  
});  

// Model的属性在创建的时候传入
var person = new Person({ name : "Thomas",  age : 67 }); 
{% endhighlight %}

# 3. Backbone.View
View主要负责数据的渲染和接收用户的输入

## 3.1 数据渲染
数据渲染需要渲染的template和插入数据的位置；template可以使用任何一种，如[Mustache](http://mustache.github.com/),也可以使用underscore中自带的；
插入数据的位置是通过el来确定的。
{% highlight javascript %}
<div id="search_container"></div>

<script type="text/javascript">
	SearchView = Backbone.View.extend({
    	//制定插入数据的位置
    	el: $('#search_container'),
        initialize: function(){
            this.render();
        },
        render: function(){
            // 使用underscore模板编译为html
            var template = _.template( $('#search_template').html(),{});
            // 插入到DOM中 ， this.el 和 this.$el的区别就是前者返回Dom元素，后者返回JQuery对象
            // 即$(this.el) == this.$el
            this.$el.html(template);
        }
    });
    
    var search_view = new SearchView;
</script>

//模板文件
<script type="text/template" id="search_template">
    <label>Search</label>
    <input type="text" id="search_input" />
    <input type="button" id="search_button" value="Search" />
</script>
{% endhighlight %}

## 3.2 接收用户的输入
实现途径就是通过绑定事件，完全支持[官方的事件类型](http://www.tutorialspoint.com/html5/html5_events.htm)如下：
{% highlight javascript %}
<div id="search_container"></div>

<script type="text/javascript">
	SearchView = Backbone.View.extend({
    	//制定插入数据的位置
    	el: $('#search_container'),
        initialize: function(){
            this.render();
        },
        events: {
            "click input[type=button]": "doSearch"
        },
        render: function(){
            // 使用underscore模板编译为html
            var template = _.template( $('#search_template').html(),{});
            // 插入到DOM中 ， this.el 和 this.$el的区别就是前者返回Dom元素，后者返回JQuery对象
            // 即$(this.el) == this.$el
            this.$el.html(template);
        },
        doSearch: function(){
        	alert('doSearch');
        }
    });
    
    var search_view = new SearchView;
</script>

//模板文件
<script type="text/template" id="search_template">
    <label>Search</label>
    <input type="text" id="search_input" />
    <input type="button" id="search_button" value="Search" />
</script>
{% endhighlight %}

# 4. Backbone.Collection
Collection就是有序的models的集合，它可以绑定change事件来监听model的改变。其中的fetch方法，用来请求服务器端的数据，当server端返回success，则会触发reset方法。url属性可以用来设置请求服务器的根路径。
{% highlight javascript %}
//创建一个存放 Todo Model的集合，并且设置请求服务器的根路径为‘/todos’
window.TodoList = Backbone.Collection.extend({
	model: Todo,
	url: '/todos'
});

window.Todos = new TodoList;

//在创建时就会执行fetch方法，发出一个GET请求
window.AppView = Backbone.View.extend({
	initialize: function() {
		Todos.bind('reset', this.addAll, this);
		Todos.fetch();
	},
	addAll: function(){
		//通过reset来触发
	}
});
{% endhighlight %}

另外Collection中包含了underscore中的很多utils，方便我们的使用。

# 5. Backbone.Router
Router可以解决Singal App中遇到的URL state的问题。例如经常用到的hash，如果用户浏览到某一处时，想要收藏起来，结果发现下次打开时还是进入到了主页面，这就是URL State丢失。

Router可以和客户端的action、event建立联系，谨记当Router创建好之后，一定要调用Backbone.history.start()。

{% highlight javascript %}
var Workspace = Backbone.Router.extend({
  routes: {
    "help":                 "help",    // #help
    "search/:query":        "search",  // #search/kiwis
    "search/:query/p:page": "search"   // #search/kiwis/p7
  },

  help: function() {
    ...
  },

  search: function(query, page) {
    ...
  }

});	
{% endhighlight%}


