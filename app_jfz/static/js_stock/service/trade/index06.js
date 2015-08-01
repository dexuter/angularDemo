define([ 'zepto' ], function( $ ) {

	$(function() {

		var agreementState = true;

		$("#pact_check").on('tap', function() {
			if( agreementState ) {
				$(this).removeClass('check');
				agreementState = false;
			} else {
				$(this).addClass('check');
				agreementState = true;
			}
		});

		$("#pass_dialog_close").on('tap', function() {
			$("#pass_dialog").hide();
		});



	});

});