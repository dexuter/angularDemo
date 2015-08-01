define(['angular', 'zepto', 'url', 'common'], function(angular, $, Url, Common) {

	var appName = 'stockApp';

	angular.module(appName, ['commonApp'])
		.factory('assetsInfo', ['$http', '$q', 'commonReq',  function($http, $q, commonReq) {

			var accountId = Url.getId('/accountId_', '/');
			// 请求URL 集合
			var URL_COL = {
				getStockIndex	: 'v1/market/index/', // 获取 上证/深成 指数 未定
				getMyAssets  	: '/plugin/app_jfz/static/js_stock/service/trade/data/data7.json', // 获取个人资产信息
				getLastMoney    : '/v1/accountId_'+ accountId +'/draw/drawInfo' // 再赚多少提现 
			};

			function getStockIndex (params) {
				var url = URL_COL.getStockIndex + params.indexCode;
				return commonReq.getData(url);
			}

			function getMyAssets (params) {
				return commonReq.getData(URL_COL.getMyAssets, params);
			}

			function getLastMoney (params) {
				return commonReq.getData(URL_COL.getLastMoney, params);
			}

			return {
				getStockIndex 	: getStockIndex,
				getMyAssets 	: getMyAssets,
				getLastMoney 	: getLastMoney
			}

		}])
		.controller('myAssetsCtrl', function ($scope, $q, assetsInfo) { 
			// Common.MS.alert('111111');

			// 我的资产
			$scope.myAssets = {};
			// 股票指数
			$scope.stockIndex = {};
			// 提现
			$scope.withdraw = {};

			// 轮询时间 6s
			var TIME = 6000;
			// 用户id
			var accountId;

			var reqParams = {};

			init();

			function init() {

				accountId = Url.getId('/accountId_', '/');

				// 我的资产参数
				reqParams.myAssets = {
					accountId : accountId
				};

				// 上证指数
				reqParams.SSE = {
					indexCode: '000001'
				};

				// 深成
				reqParams.PLU = {
					indexCode: '399001'
				};

				setAssetsTimer();
				setSSETimer();
				setPLUTimer();

				getLastMoney();
			}

			function getLastMoney() {
				var handler = assetsInfo.getLastMoney();
				handler.then(function (res){
					if( res.data && res.data.nowProfit ) {
						// 可提现
						if( Number(res.data.nowProfit) > 0 ) {
							res.data.isWithdraw = true;
						} else {
							res.data.isWithdraw = false;
							res.data.nowProfit  = Math.abs(res.data.nowProfit);
						}
					}
					$scope.withdraw = res.data;
				});
			}

			function setAssetsTimer () {
				getMyAssets(reqParams.myAssets, function() {
					setTimeout(function() {
						setAssetsTimer();
					}, TIME);
				});
				
			}

			function getMyAssets (params, callback) {
				var myAssetsHandler = assetsInfo.getMyAssets(params);
				myAssetsHandler.then(function(res) {
					var _todayProfitRateTxt;
					if( res.data && res.data.todayProfitRate ) {
						_todayProfitRateTxt = res.data.todayProfitRate * 100;
						_todayProfitRateTxt = _todayProfitRateTxt.toFixed(2);
						_todayProfitRateTxt += '%';
						res.data.todayProfitRateTxt = _todayProfitRateTxt;
					}
					$scope.myAssets = res.data;
					callback();
				}, function(err) {
					console.error(err);
				});
			}

			function setSSETimer () {
				getSSE(function() {
					setTimeout(function() {
						setSSETimer();
					}, TIME);
				});
			}

			function getSSE (callback) {
				var handler = assetsInfo.getStockIndex(reqParams.SSE);
				handler.then(function (res){
					if( res.data && res.data.HQDQZF ) {
						res.data.HQDQZF = res.data.HQDQZF * 100;
						res.data.HQDQZF = res.data.HQDQZF.toFixed(2);
						res.data.HQDQZF += '%';
					}
					$scope.stockIndex.SSE = res.data;
					callback();
				});
			}

			function setPLUTimer () {
				getPLU(function() {
					setTimeout(function() {
						setPLUTimer();
					}, TIME);
				});
			}

			function getPLU (callback) {
				var handler = assetsInfo.getStockIndex(reqParams.PLU);
				handler.then(function (res){
					if( res.data && res.data.HQDQZF ) {
						res.data.HQDQZF = res.data.HQDQZF * 100;
						res.data.HQDQZF = res.data.HQDQZF.toFixed(2);
						res.data.HQDQZF += '%';
					}
					$scope.stockIndex.PLU = res.data;
					callback();
				});
			}

			

		});

		$(function() {
			angular.bootstrap(document.body, [appName]);
		});

});