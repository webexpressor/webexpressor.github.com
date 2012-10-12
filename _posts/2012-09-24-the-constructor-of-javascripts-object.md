---
layout: page
title: "JavaScript对象的constructor属性介绍"
category: JavaScript
tags: [constructor]
description: "深刻理解这句话：constructor属性始终指向创建当前对象的构造函数"
---

*constructor*属性始终指向创建当前对象的构造函数。比如下面例子：
{% highlight javascript%}
// 等价于 var foo = new Array(1, 56, 34, 12);  
var arr = [1, 56, 34, 12];  
console.log(arr.constructor === Array); // true  
// 等价于 var foo = new Function();  
var Foo = function() { };  
console.log(Foo.constructor === Function); // true  
// 由构造函数实例化一个obj对象  
var obj = new Foo();  
console.log(obj.constructor === Foo); // true  
// 将上面两段代码合起来，就得到下面的结论  
console.log(obj.constructor.constructor === Function); // true 
{% endhighlight %}

但是当constructor遇到prototype时，有趣的事情就发生了。
 
我们知道每个函数都有一个默认的属性prototype，而这个prototype的constructor默认指向这个函数。如下例所示：
{% highlight javascript%} 
function Person(name) {  
    this.name = name;  
};  
Person.prototype.getName = function() {  
    return this.name;  
};  
var p = new Person("ZhangSan");  
console.log(p.constructor === Person);  // true  
console.log(Person.prototype.constructor === Person); // true  
// 将上两行代码合并就得到如下结果  
console.log(p.constructor.prototype.constructor === Person); // true 
{% endhighlight %}

当时当我们重新定义函数的prototype时（注意：和上例的区别，这里不是修改而是覆盖），constructor属性的行为就有点奇怪了，如下示例：
{% highlight javascript %} 
function Person(name) {  
    this.name = name;  
};  
Person.prototype = {  
    getName: function() {  
        return this.name;  
    }  
};  
var p = new Person("ZhangSan");  
console.log(p.constructor === Person);  // false  
console.log(Person.prototype.constructor === Person); // false  
console.log(p.constructor.prototype.constructor === Person); // false 
{% endhighlight %}

为什么呢？
 
原来是因为覆盖Person.prototype时，等价于进行如下代码操作：
{% highlight javascript%}  
Person.prototype = new Object({  
    getName: function() {  
        return this.name;  
    }  
}); 
{% endhighlight%}

而constructor属性始终指向创建自身的构造函数，所以此时Person.prototype.constructor === Object，即是：

{% highlight javascript%}  
function Person(name) {  
    this.name = name;  
};  
Person.prototype = {  
    getName: function() {  
        return this.name;  
    }  
};  
var p = new Person("ZhangSan");  
console.log(p.constructor === Object);  // true  
console.log(Person.prototype.constructor === Object); // true  
console.log(p.constructor.prototype.constructor === Object); // true 
{% endhighlight %}

怎么修正这种问题呢？方法也很简单，重新覆盖Person.prototype.constructor即可：

{% highlight javascript %}   
function Person(name) {  
    this.name = name;  
};  
Person.prototype = new Object({  
    getName: function() {  
        return this.name;  
    }  
});  
Person.prototype.constructor = Person;  
var p = new Person("ZhangSan");  
console.log(p.constructor === Person);  // true  
console.log(Person.prototype.constructor === Person); // true  
console.log(p.constructor.prototype.constructor === Person); // true 
{% endhighlight %}