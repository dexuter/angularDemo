define([ 'zepto', 'iscroll' ], function( $, iscroll) {

	$(function() {

		initScroller();

		function initScroller() {
			$(".hd_top_item").css({'float': 'left', 'display': 'block'});
			var itemLength = 3;
			var width = $("#hd_top_wp").width();
			var wrap_width = width * itemLength;
			$("#hd_top_box").css('width', wrap_width+'px');
			$(".hd_top_item").css('width', width+'px');

			var scroller = new iscroll("#hd_top_wp", {
				scrollX: true,
				scrollY: false,
				snap: true,
				snapSpeed: 400
			});

			scroller.on('scrollEnd', function() {
				var index = scroller.currentPage.pageX;
				$("#s_bot_list .point").removeClass("active").eq(index).addClass("active");
				if( index == 1 ) {
					$("#hd_wp").removeClass('hd_posi hd_nega').addClass('hd_posi');
				} else {
					$("#hd_wp").removeClass('hd_posi hd_nega').addClass('hd_nega');
				}
			});
		}

	});

});