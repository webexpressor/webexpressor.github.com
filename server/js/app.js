var TOC = (function(){
	var TOC = function(container,target){
		var h1 = [];
		this.$container = $(container);
		this.$container.find('h1').each(function(){
			var p = { h1 : this , h2: null , h3: null};
			p.h2 = $(this).nextUntil('h1', 'h2');
			// p.h3 = $(this).nextUntil('h1', 'h3');
			h1.push(p);
		});
		if(h1.length === 0) return;
		var str = '<ul class="delimited"><li class="title">内容导航</li>'
		for(var i = 0; i < h1.length ;i++){
			var node = h1[i];
			str += '<li><a href="#parent_'+i+'">' + $(node.h1).attr('id','parent_'+i).text() + '</a></li>';
			if(node.h2 && node.h2.length > 0){
				str += '<ul>';
				for(var j = 0 ; j < node.h2.length; j++){
					var h2Child = node.h2[j];
					str += '<li><a href="#child_'+i+j+'">'+ $(h2Child).attr('id','child_'+i+j).text() +'</a></li>';
					// if(node.h3 && node.h3.length > 0){
					// 	for(var m = 0 ; m < node.h3.length; m++){
					// 		var h3Child = node.h3[m];
					// 		str += '<li><a href="#child_'+i+j+m+'">'+ $(h3Child).attr('id','child_'+i+j+m).text() +'</a></li>';
					// 	}
					// }
				}
				str += '</ul>';
			}
		}
		str += '</ul>';
		$(target).html(str);
	};
	return TOC;
})();

$(function(){
	new TOC('.page .content','#table-content');
	$.localScroll.hash({
		queue:true,
		duration:1000,
		easing:'swing',
		offset:-50
	});
	$.localScroll({
		queue:true,
		duration:500,
		easing:'swing',
		hash:true,
		offset:-50
	});
});

$(window).bind("load resize", function(){
    var w = $(window).height();
    var h = $("#table-content").outerHeight();
    $("#table-content").css("position",(w < h) ? ("relative") : ("fixed"));
});