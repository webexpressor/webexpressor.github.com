---
layout: page
title: "深入理解JavaScript中的this关键字"
category: JavaScript
tags: [this]
description: "JavaScript中的this关键字在不同的场合出现表现的行为也不一样，因此本文列出了一些通用法则"
---

# this
当函数创建后，this也被创建，它指向该函数所操作的对象。

我们先来创建一个对象：

{% highlight javascript%}
var zhangsan = {
  living:true,
  age:23,
  gender:'male',
  getGender:function(){return zhangsan.gender;}
};
console.log(zhangsan.getGender()); //'male'
{% endhighlight%}

注意在getGender方法中我们使用了zhangsan对象本身。它可以使用this来代替，因为this指向该函数所操作的对象，即zhangsan。

# this由上下文决定
传递给函数的this的值是由函数被调用时的上下文决定的。

下面例子中myObject的属性sayFoo指向了sayFoo函数。当在全局的作用域下调用sayFoo函数，this就为window对象。当它被myObject的方法调用时，this就为myObject。

{% highlight javascript%}
var foo = 'foo';
var myObject = {foo: 'I am myObject.foo'};
var sayFoo = function() {
  console.log(this['foo']);
};
myObject.sayFoo = sayFoo;
myObject.sayFoo(); // 'I am myObject.foo' 
sayFoo(); // 'foo'
{% endhighlight%}

很显然this的值是基于函数调用时的上下文。

# 嵌套函数中的this

当this出现在嵌套函数中，它就会指向window对象，而不是该函数中的对象。

{% highlight javascript%}
var myObject = {
  func1:function() {
     console.log(this); //myObject
     var func2=function() {
        console.log(this); //window
        var func3=function() {
           console.log(this); //window
        }();
     }();
  }
};
myObject.func1();
{% endhighlight%}
该例中的func2和func3都是嵌套函数，所以this为window。

下面的例子就很容易得出答案了~

{%highlight javascript%}
var foo = {
  func1:function(bar){
    bar(); //window
    console.log(this);//foo object
  }
};
foo.func1(function(){console.log(this)});
{%endhighlight%}

如果我们不想this的值丢失，仍然指向该对象，一般我们会使用变量_this或that来存储this的值。如：

{%highlight javascript%}
var myObject = {
  myProperty:'some',
  myMethod:function() {
   var that=this; 
   var helperFunction = function() { 
     console.log(that.myProperty); //'some'
     console.log(this); //window
    }();
  }
}
myObject.myMethod(); 
{%endhighlight%}

# 修改this的值

this的值通常是由调用函数的上下文决定的，但是你可以通过apply()或者call()方法来重写它的值。即可以使用其它任意对象来调用一个函数。而这两个方法唯一不同之处就是参数传递方式不同，apply()方法传递参数数组，call()方法可以传递任意多个参数，下面举例说明：

{%highlight javascript%}
var myObject = {};
var myFunction = function(param1, param2) {
  this.foo = param1;
  this.bar = param2;
  console.log(this); //{foo = 'foo', bar = 'bar'}
};
myFunction.call(myObject, 'foo', 'bar'); // 将this设为myObject
//myFunction.apply(myObject, ['foo', 'bar']);
console.log(myObject);//foo = 'foo', bar = 'bar'}
{%endhighlight%}

# 构造函数中的this

当一个函数(构造函数)通过new关键字来调用，该函数中的this指向它的实例。

{%highlight javascript%}
var Person = function(name) {
  this.name = name || 'zhangsan'; // this将指向具体的实例对象
}
var zhangsan = new Person('lisi'); //创建一个Person实例
console.log(zhangsan.name);//'lisi'
{%endhighlight%}

下面将调用方式改变下，不使用new：
{%highlight javascript%}
var Person = function(name) {
  this.name=name||'zhangsan';
}
var lisi = Person('lisi'); //注意没有使用new
console.log(lisi.name); //报错，因为zhangsan为undefined
console.log(window.name);//'lisi'
{%endhighlight%}

# 构造函数的原型方法中的this

构造函数的原型方法中的this会指向调用该方法的实例对象：

{%highlight javascript%}
var Person = function(x){
    if(x){this.fullName = x};
};
Person.prototype.getName = function() {
    return this.fullName; //this为实例对象
}
var zhangsan = new Person('zhangsan');
var lisi = new Person('lisi');
console.log(zhangsan.getName(), lisi.getName());//zhangsan , lisi

//如果该实例没有fullName属性，就会从原型链中查找
Object.prototype.fullName = 'John';
var john = new Person(); 
console.log(john.getName());//John
{%endhighlight%}
