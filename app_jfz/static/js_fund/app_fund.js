(function(window,$){

	$(document).ready(function() {
		// data-tab
	    $('[data-tab="tab"]').each(function(index, el) {
	       $(el).find('.tab_hd .tab_control_item').on('tap', function(event) {	       		
	       		var _index = $(this).index();	       		
	       			$tabcon = $(el).find('.tab_bd .tab_con');
	       		$(this).addClass('active').siblings().removeClass('active');
	       		$tabcon.eq(_index).addClass('active').siblings().removeClass('active');
	       });	       
	    });
	    // data-url
	    $('[data-url]').each(function(index, el) {
	       $(el).on('tap', function(event) {	       		
	       		var _url = $(this).attr("data-url");	 
	       		console.log(_url)
	       		window.location.href = _url;  	
	       });	       
	    });

	});
})(window,jQuery,undefined)