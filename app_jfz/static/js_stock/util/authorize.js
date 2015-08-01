// 授权
define([], function() {

	var authorize = {};

	// 对返回数据检查是否没登陆
	// 401为未登陆
	// 已登陆 return ture
	// 没登陆 return false
	authorize.check = function (res) {   
		if( res.statusCode == 401 ) return false;
		else return true;
	};

	authorize.login = function (callback) {
		var url = window.location.href;
		if( typeof loginWithRedirectUrl != "undefined" ) {
			loginWithRedirectUrl(url);
		}
		
	};

	return authorize;

});
