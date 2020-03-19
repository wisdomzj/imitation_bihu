$(function(){
	
	var c = 0,timer,t;

	//自动轮播
	function fun(){
		$(".shuffing .foc").eq(c).stop().fadeIn(300).siblings(".foc").stop().fadeOut(300);
		$(".shuffing .page ul li").eq(c).addClass("bgchange").siblings("li").removeClass("bgchange");
	}
	function autorun(){
		c++;
		c=c==5?0:c;
		fun();
	}
	
	timer = setInterval(autorun,3000);
	
	//移入移出停止或启动轮播
	$(".shuffing").mouseenter(function(){
		clearInterval(timer);
	}).mouseleave(function(){
		timer = setInterval(autorun,3000);
	})
	
	//分页器控制轮播
	$(".shuffing ul li").mouseenter(function(){
		//this的对象在每个特定的环境中所指的的当前事件源不同。
		var _this = $(this); 
		t = setTimeout(function(){
			c = _this.index();
			fun();
		},200)
	}).mouseleave(function(){
		clearTimeout(t);
	})
})