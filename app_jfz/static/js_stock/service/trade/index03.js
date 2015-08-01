define([ 'angular', 'zepto', 'iscroll_probe', 'loading', 'url'], function( angular, $, Iscroll, Loading, Url ) {

	var appName = 'stockApp';

	angular.module(appName, [])
		.factory('withdrawInfo', ['$http', '$q', function($http, $q) {
			var accountId = Url.getId('/accountId_', '/');

			// 请求URL 集合
			var URL_COL = {
				getWithdraw	: '/plugin/app_jfz/static/js_stock/service/trade/data/data8.json' // 获取 提现记录
			};

			// 公用Get方法 return promise obj
			function getData(url, params) {
				params = !!params ? params : {};

				var deferred = $q.defer();
				$http.get(url, {params: params})
					.success(function(data, status, headers, config) {  
				        deferred.resolve(data);  
				      })
					.error(function(data, status, headers, config) {  
				        deferred.reject(data); 
				      });

				return deferred.promise;
			}

			function getWithdraw (params) {
				return getData(URL_COL.getWithdraw, params);
			}

			return {
				getWithdraw: getWithdraw
			}


		}])
		.controller('withdrawCtrl', function ($scope, $q, withdrawInfo) { 

			// 提现记录
			$scope.withdrawList = [];

			var withdrawMore = true;

			var reqParams = {};

			var loadingHandler;
			// 提现记录
			reqParams.withdraw = {
				userId	  : '123',
				accountId : '321456',
				index	  : 1,
				number    : 5
			};

			var time = 0;
			if( !window.innerHeight ) time = 100;

			setTimeout(function() {
				init();
			}, time);
			

			function init() {

				loadingHandler = new Loading("list_wp", "record_loading", loadMore);
				loadingHandler.open();

				bindTapEven();
			
			}
			
			function loadMore() {
				if( withdrawMore ) {
					reqParams.withdraw.index = reqParams.withdraw.index + reqParams.withdraw.number;
					getWithdraw(function() {
						loadingHandler.close();
					});
				} else loadingHandler.close();
				
			}

			function getWithdraw(callback) {
				var withdrawHandler = withdrawInfo.getWithdraw(reqParams.withdraw);
				withdrawHandler.then(function(res) {
					if ( res.data.records.length ) {

						angular.forEach(res.data.records, function (value) {
							$scope.withdrawList.splice(0, 0, value);
						});

						reqParams.withdraw.index = res.data.index;
						reqParams.withdraw.number = res.data.number;

						// setTimeout(function() {
						// 	loadingHandler.refresh();
						// }, 0);
						
					} else withdrawMore = false;
					callback && callback();
				}, function(err) {
					console.error(err);
				});
			}

			function bindTapEven() {
				$(document).on('tap', '.list_item',function () {
					var state  = $(this).attr('state');
					var imgDom = $(this).find(".drt_img");
					var botDom = $(this).find(".bot_part");
					// 1 表示已下拉
					if( state == 1 ) {
						imgDom.addClass('drt_img_ream').removeClass('drt_img_am');
						$(this).attr('state', '0');
						botDom.hide();
					} else {
						imgDom.addClass('drt_img_am').removeClass('drt_img_ream');
						$(this).attr('state', '1');
						botDom.show();
					}

				});
			}

		});

		$(function() {
			angular.bootstrap(document.body, [appName]);
		});

});