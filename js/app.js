var TOC = (function(){
	var TOC = function(container,target){
		var h1 = [];
		this.$container = $(container);
		this.$container.find('h1').each(function(){
			var p = { h1 : this , children: null};
			p.children = $(this).nextUntil('h1', 'h2');
			h1.push(p);
		});
		var str = '<ul class="delimited"><li class="title">内容导航</li>'
		for(var i = 0; i < h1.length ;i++){
			var node = h1[i];
			str += '<li><a href="#parent_'+i+'">' + $(node.h1).attr('id','parent_'+i).text() + '</a></li>';
			if(node.children && node.children.length > 0){
				str += '<ul>';
				for(var j = 0 ; j < node.children.length; j++){
					var childNode = node.children[j];
					str += '<li><a href="#child_'+i+j+'">'+ $(childNode).attr('id','child_'+i+j).text() +'</a></li>';
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