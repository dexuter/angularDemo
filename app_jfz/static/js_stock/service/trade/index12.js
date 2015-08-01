define(['angular', 'zepto', 'url', 'common'], function(angular, $, Url, Common) {

	var appName = 'stockApp';

	angular.module(appName, ['commonApp'])
		.factory('accountInfo', ['$http', '$q', 'commonReq',  function($http, $q, commonReq) {

			// 请求URL 集合
			var URL_COL = {
				postCreateAccout : '/plugin/app_jfz/static/js_stock/service/trade/data/data12.json', // 创建账户
			};

			function creatAccount (params) {
				return commonReq.postData(URL_COL.postCreateAccout, params);
			}

			return {
				creatAccount: creatAccount
			}

		}])
		.controller('accountCtrl', function ($scope, $q, accountInfo) { 
			var useId = Url.getId('/uid_', '/');

			$scope.createAccount = function () {
				var params = {uid: useId};
				var handler = accountInfo.creatAccount(params);
				handler.then(function (res) {
					window.location.href="index05.html";
				});


			}

		});

		$(function() {
			angular.bootstrap(document.body, [appName]);
		});

});