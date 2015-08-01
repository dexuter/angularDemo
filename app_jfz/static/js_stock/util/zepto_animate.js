define(['zepto'], function( $ ) {

	// 扩展Zepto slideDown 和 slideUp方法
	$.fn.slideDown = function (duration) {    
	    var position = this.css('position');

	    this.show();

	    this.css({
	      position: 'absolute',
	      visibility: 'hidden',
	      height: 'auto'
	    });

	    var height = this.height();
	    console.log(height);
	    this.css({
	      position: position,
	      visibility: 'visible',
	      overflow: 'hidden',
	      height: 0
	    });

	    this.animate({
	      height: height+ "px"
	    }, duration);

	};

	$.fn.slideUp = function (duration) { 
		this.animate({
	      height: 0
	    }, duration);
	    
	};

});