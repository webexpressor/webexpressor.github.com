---
layout: page
title: "Javascript中的模板"
category: "Javascript"
tags: [template,mustache]
description: "构建复杂的web应用时，需要将视图(View)和数据(Model)分离，此时我们必须要选择模板，目前已经有好多这种framework，根据需求来选择一种适合我们的是很重要的。。。"
---

如果你使用Backbone，你肯定知道它所依赖的Underscore中自带template，它可以满足我们一般的需求，而且你是java程序员，用起来也不会很陌生，因为它的语法和jsp很相似，它的写法如下：

{%highlight javascript%}
//渲染单个对象{name:'zhangsan'}
<li><%= name %></li>
//渲染数组 arrs=[{name:'zhangsan',age:'20'},{name:'lisi',age:'15'}]
<%
    _.each(arrs,function(item){
        //我们的逻辑
        <% if(item.age > 18){%>
            <span>成年了</span>
        <%}else{%>
            <span>未成年</span>
        <%}%>
    });
%>
{%endhighlight%}

如果我们的业务数据需要做更复杂的处理，使用上面的方法肯定会在模板中嵌入大量的js代码，这不是我们希望的，我们要做到模板越简洁越好！

下面我用[Mustache](http://mustache.github.com/)来实现：

{%highlight javascript%}
//渲染单个对象{name:'zhangsan'}
<li>{{name}}</li>

//渲染数组 arrs=[{name:'zhangsan',age:'20'},{name:'lisi',age:'15'}]
//对数据进行业务处理
var users = {
    users: arrs,
    isAdult: function(){
        return this.age > 18 ? '成年了' : '未成年';
    }
};

//模板文件
var temp = "{{#users}}\
  {{isAdult}}\
{{/users}}";

//渲染
Mustache.render(users,temp);
{%endhighlight%}

区别很明显吧，Mustache中的自定义函数可以使模板很简洁！具体可以参见[官方文档](https://github.com/janl/mustache.js)

下面我说下模板文件的写法，它终究要转换成字符串，这样template框架可以通过正则来实现匹配替换，常见的有三种做法：

1. 直接使用字符串

{%highlight javascript%}
var Template = (function(){
    var rs;
    return {
      get: function(id){
          switch(id){
            case 'userList':
                rs = '<div>{{name}}</div>'+
                     '<div>{{age}}</div>';
            break;
            //可以将应用的模板都写在该文件中，增加case即可。
          }
          return rs;
      }  
    };
})();

//调用：
Mustache.render(data,Template.get('userList'));
{%endhighlight%}

2. 使用script脚本
{%highlight javascript%}
<script type="text/template" id="item-template">  
    <div><%= name%></div>
</script>  
{%endhighlight%}

3. 一个模板一个html文件

在requirejs中有相应的插件text.js，写法如下：

{%highlight javascript%}
define([
    'backbone',
    'mustache',
    'text!templates/receiveList.html',
    'text!templates/info.html'
    ],
    function(Backbone,Mustache,ReceiveListTempl,InfoTempl){
    var view = Backbone.View.extend({
        events: {
            'click div': 'itemClick'
        },
        render: function(){
            $(this.el).html(Mustache.render(ReceiveListTempl,this.model.toJSON()));
            return this;
        },
        itemClick: function(){
            location.hash = 'menu/menuItem_0/'+this.model.id;
        },
        showDetail: function(){
            location.hash = 'receive/'+this.model.cid;
            $('#msgDetail').html(Mustache.render(InfoTempl,this.model.toJSON()));
            $('.container > div').hide();
            $('#msgDetail').show();
        }
    });

    return view;
});
{%endhighlight%}

该例使用了requirejs来进行管理模块之间的依赖，当用到模板时可以使用text!来引用templates文件夹下的模板文件，在回调方法中持有该模板返回的字符串的引用，上面例子没有使用underscore中的template，而是使用了Mustache。


