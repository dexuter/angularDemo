define(['angular', 'zepto', 'url', 'common'], function(angular, $, Url, Common) {

	var appName = 'stockApp';

	angular.module(appName, ['commonApp'])
		.factory('assetsInfo', ['$http', '$q', 'commonReq',  function($http, $q, commonReq) {

			var accountId = Url.getId('/accountId_', '/');
			// 请求URL 集合
			var URL_COL = {
				getLastMoney    : '/v1/accountId_'+ accountId +'/draw/drawInfo', // 提现 信息
				postWithdraw	: '/v1/accountId_'+ accountId +'/draw/withDraw' // 提交提现申请
			};

			function getLastMoney (params) {
				return commonReq.getData(URL_COL.getLastMoney, params);
			}

			function postWithdraw (params) {
				return commonReq.postData(URL_COL.postWithdraw, params);
			}

			return {
				getLastMoney : getLastMoney,
				postWithdraw : postWithdraw
			}

		}])
		.controller('withdrawCtrl', function ($scope, $q, assetsInfo) { 

			// 提现
			$scope.withdraw = {};
			// 是否可以提现
			$scope.canWithdraw = false;
			init();

			$scope.submit = function () {
				if( !$scope.canWithdraw ) return;
				var money = $scope.withdraw.trueWithDrawMoney;
				if( !money ) return;
				submitWithdraw(money);
			};

			function submitWithdraw (money) {
				var params = {amount: money};
				var handler = assetsInfo.postWithdraw(params);
				handler.then(function(res) {
					if( res.statusCode == 200 ) {
						Common.MS.alert("申请成功");
					} else {
						Common.MS.alert(res.message);
					}
				});
			}

			function init() {
								
				getLastMoney();
			}

			function getLastMoney() {
				var _withDrawRateTxt;
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

						_withDrawRateTxt = res.data.withDrawRate * 100;
						_withDrawRateTxt = _withDrawRateTxt.toFixed(2);
						_withDrawRateTxt += '%';

						res.data.withDrawRate = _withDrawRateTxt;
						res.data.nowProfit = Number(res.data.nowProfit);
						res.data.trueWithDrawMoney = Number(res.data.trueWithDrawMoney);
					}
					$scope.withdraw = res.data;
				});
			}



		});

		$(function() {
			angular.bootstrap(document.body, [appName]);
		});

});