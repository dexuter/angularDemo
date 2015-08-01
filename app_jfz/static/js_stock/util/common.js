// 通用
define(['angular', 'zepto', 'jockey'], function(angular, $, Jockey) {

	// 模拟alert框
	var MS = {
		z_index: 1000,
		time   : 2000,

		_createHtml: function (txt) {
			this.id = "messaeg_dialog_"+ this.z_index++;

			var html = [];
			html.push('<div class="message_dialog" style="z-index: '+ this.z_index +'" id="'+ this.id +'">');
			html.push('<div class="message_bg"></div>');
			html.push('<div class="message_content">');
			html.push('<div class="content_wrap">');
			html.push('<p class="content_txt">'+ txt +'</p>');
			html.push('</div>');
			html.push('</div>');
			html.push('</div>');
			html.push('</div>');

			return html.join('');
		},

		alert: function (txt) {
			if( !txt ) return;

			var html = this._createHtml(txt);
			$(document.body).append(html);
			var dom  = $("#"+this.id);

			this._bindTap(dom);
		},

		_bindTap: function(dom) {
			var handler = setTimeout(function() {
				off();
			}, this.time);

			dom.on('tap', function() {
				off();
			});

			function off() {
				clearTimeout(handler);
				dom.hide();
				dom.off('tap');
				dom.remove();
			}
		}
	};

	// 登陆验证
	var Authorize = {};

	// 对返回数据检查是否没登陆
	// 401为未登陆
	// 已登陆 return ture
	// 没登陆 return false
	Authorize.check = function (res) {   
		if( res.statusCode == 401 ) return false;
		else return true;
	};

	Authorize.login = function (callback) {
		var url = window.location.href;
		Jockey.send("loginWithRedirectUrl", {url: url});
	};

	// 初始化angular
	angular.module('commonApp', [])
		.config(['$httpProvider', function($httpProvider) {
			// 修改 angular 默认的 post 提交数据方式
			$httpProvider.defaults.headers.post = {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'};
		}])
		.factory('commonReq', ['$http', '$q', function($http, $q) {
			// 公用Get方法 
			function getData(url, params) {
				params = !!params ? params : {};

				var deferred = $q.defer();
				$http.get(url, {params: params})
					.success(function(data, status, headers, config) {
						if( !Authorize.check(data) ) {
							Authorize.login();
							MS.alert('需要登陆');
							return;
						}
				        deferred.resolve(data);  
				      })
					.error(function(data, status, headers, config) {
						MS.alert('服务器错误');
				        deferred.reject(data); 
				      });

				return deferred.promise;
			}

			// 公用post方法
			function postData(url, params) {
				params = !!params ? params : {};

				var deferred = $q.defer();
				$http.post(url, $.param(params))
					.success(function(data, status, headers, config) { 
						if( !Authorize.check(data) ) {
							Authorize.login();
							MS.alert('需要登陆');
							return;
						} 
				        deferred.resolve(data);  
				      })
					.error(function(data, status, headers, config) {
						MS.alert('服务器错误');
				        deferred.reject(data); 
				      });

				return deferred.promise;
			}

			return {
				getData   : getData,
				postData  : postData
			}
		}]);

	return {
		MS 		  : MS,
		Authorize : Authorize
	};


});