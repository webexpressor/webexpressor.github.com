---
layout: page
title: "[Backbone]如何获取列表中单击条目的model"
category: Backbone
tags: [Backbone]
description: "经常会遇到这种情况，使用collector渲染出列表后，怎么得到我所单击的item的model呢？从而获取数据..."
published: true
---


如何获取列表中单击条目的model呢？这取决于你渲染list的方式，我总结出有两种方式可以渲染：

1. list和item用一个view来渲染

2. list和item分别用各自的view来渲染

下面举例来说明，场景为将collection中的假数据渲染到id为showIt的div中。

# 一个View来组织
{%highlight javascript%}
<script id="item-template" type="text/x-jquery-tmpl">
    <li><a href="#">${name}</a></li>
</script>
{%endhighlight%}

{%highlight javascript%}
// Model
Item = Backbone.Model.extend({});
ItemCollection = Backbone.Collection.extend({
    model: Item
});

// View
ItemListView = Backbone.View.extend({
    tagName: "ul",
    events: {
        "click a": "clicked"
    },
    
    clicked: function(e){
        e.preventDefault();
        // ??? 我们怎样获取呢？
        var item = ??? // TODO 01
        var name = item.get("name");
        alert(name);
    },
    
    render: function(){
        var template = $("#item-template");
        var el = $(this.el);
        // 这里需要从collection中取出model数据进行渲染，
        // 两种方式在这里的写法会有所不同
        // TODO 02
        $("#showIt").html(view.el);
    }
});
 
var items = new ItemCollection([
    {id: 1, name: "item 1"},
    {id: 2, name: "item 2"},
    {id: 3, name: "item 3"}
]);
 
var view = new ItemListView({collection: items});
view.render();
{%endhighlight%}


先来看TODO 02处，我们只需遍历collection取得model将数据都append到当前的el，即ul元素中，然后html到#showIt，代码如下：
{%highlight javascript%}
this.collection.each(function(model){
    var html = template.tmpl(model.toJSON());
    el.append(html);
});
{%endhighlight%}

再来看TODO 01处，由于我们直接将model渲染到了list的view中，并没有建立model和所单击item之间的关系，所以需要通过其他途径来保存model，我们给item的元素（li）添加data属性来保存。如下：
{%highlight javascript%}
<script id="item-template" type="text/x-jquery-tmpl">
    <li><a href="#" data-id="${id}">${name}</a></li>
</script>
{%endhighlight%}

然后TODO 01 处的代码就可以这么写：
{%highlight javascript%}
var id = $(e.currentTarget).data("id");
var item = this.collection.get(id);
{%endhighlight%}

这种做法比较适用于item对model的操作比较少，最好只是用来展示model的数据。

# 两个View
这种做法是ListView中的每个item都是一个View，它存放着model，代码如下：
{%highlight javascript%}
Item = Backbone.Model.extend({});
ItemCollection = Backbone.Collection.extend({
    model: Item
});
 
ItemListView = Backbone.View.extend({
    tagName: "ul",
    
    initialize: function(){
        _.bindAll(this, "renderItem");
    },
    
    renderItem: function(model){
        var itemView = new ItemView({model: model});
        itemView.render();
        $(this.el).append(itemView.el);
    },
    
    render: function(){
        this.collection.each(this.renderItem);
    }
});
 
ItemView = Backbone.View.extend({
    tagName: "li",
    events: {
        "click a": "clicked"
    },
    
    clicked: function(e){
        e.preventDefault();
        var name = this.model.get("name");
        alert(name);
    },
 
    render: function(){
        var template = $("#item-template");
        var html = template.tmpl(this.model.toJSON());
        $(this.el).append(html);
    }  
});
 
var items = new ItemCollection([
    {id: 1, name: "item 1"},
    {id: 2, name: "item 2"},
    {id: 3, name: "item 3"}
]);
 
var view = new ItemListView({collection: items});
view.render();
$("#showIt").html(view.el);
{%endhighlight%}

在ListView中的renderItem方法中，迭代collection时都要为每一个item去new一个ItemView，所以当单机item时就可以通过this.model得到该model，这种方式比较适合对item的操作比较多的情况，可以很方便取到当前单击的model。