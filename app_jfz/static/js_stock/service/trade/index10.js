define([ 'zepto' ], function( $ ) {

	$(function() {

		$("#eye_logo").on('tap', function() {
			if ( $(this).attr('state') == 1 ) {
				$(this).removeClass('eye_show');
				$("#password_in").attr("type", "password");
				$(this).attr('state', 0);
			} else {
				$(this).addClass('eye_show');
				$("#password_in").attr("type", "text");
				$(this).attr('state', 1);
			}
		});

	});

});