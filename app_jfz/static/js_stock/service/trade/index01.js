define(['angular', 'zepto', 'common', 'iscroll', 'url', 'service/trade/stock', 'tab', 'loading'],
 function(angular, $, Common, iscroll, Url, Stock, Tab, Loading) {
	
	var appName = 'stockApp';
	
	angular.module(appName, ['commonApp'])
		.factory('stockInfo', ['$http', '$q', 'commonReq', function($http, $q, commonReq) {

			// 请求URL 集合
			var URL_COL = {
				getPosition		: '/plugin/app_jfz/static/js_stock/service/trade/data/data3.json', // 获取持仓信息
				getCompanyInfo  : '/plugin/app_jfz/static/js_stock/service/trade/data/data4.json', // 获取公司名称、代码信息
				getStockTimeInfo: '/plugin/app_jfz/static/js_stock/service/trade/data/data5.json', // 获取股票实时行情
				getAccountInfo  : '/plugin/app_jfz/static/js_stock/service/trade/data/data6.json', // 获取账户信息
				postBuy			: '/plugin/app_jfz/static/js_stock/service/trade/data/data6.json', // 提交买申请
				postSel 	    : '/plugin/app_jfz/static/js_stock/service/trade/data/data7.json', // 提交卖申请
				getEntrustInfo  : '/plugin/app_jfz/static/js_stock/service/trade/data/data9.json', // 委托记录
				postWithdraw	: '/plugin/app_jfz/static/js_stock/service/trade/data/data10.json', // 委托撤单
				getTransInfo	: '/plugin/app_jfz/static/js_stock/service/trade/data/data11.json', // 获取交易记录
			};

			// 获取公司名称、代码信息
			function getCompanyInfo (params) {
				var codeStr = params.codeStr;
				// URL_COL.getCompanyInfo = "/plugin/app_jfz/static/js_stock/service/trade/data/data4.json"+ codeStr;
				return commonReq.getData(URL_COL.getCompanyInfo, params);
			}

			// 获取实时行情
			function getStockTimeInfo (params) {
				var stockCode = params.stockCode;
				// URL_COL.getStockTimeInfo = "/plugin/app_jfz/static/js_stock/service/trade/data/data5.json"+ stockCode;
				return commonReq.getData(URL_COL.getStockTimeInfo, params);
			}

			// 获取账户信息
			function getAccountInfo (params) {
				return commonReq.getData(URL_COL.getAccountInfo, params);
			}

			// 提交买申请
			function submitBuy(params) {
				return commonReq.postData(URL_COL.postBuy, params);
			}

			// 提交卖申请
			function submitSel(params) {
				return commonReq.postData(URL_COL.postSel, params);
			}

			// 获取我的持仓
			function getMyPosition(params) {
				return commonReq.getData(URL_COL.getPosition, params);
			}

			// 获取委托信息
			function getEntrustInfo(params) {
				return commonReq.getData(URL_COL.getEntrustInfo, params);
			}

			// 提交撤单申请
			function submitWithdraw(params) {
				return commonReq.postData(URL_COL.postWithdraw, params);
			}

			// 获取交易记录
			function getTransInfo(params) {
				return commonReq.getData(URL_COL.getTransInfo, params);
			}

			return {
				getCompanyInfo   : getCompanyInfo,
				getStockTimeInfo : getStockTimeInfo,
				getAccountInfo   : getAccountInfo,
				submitBuy		 : submitBuy,
				submitSel	     : submitSel,
				getMyPosition	 : getMyPosition,
				getEntrustInfo	 : getEntrustInfo,
				submitWithdraw	 : submitWithdraw,
				getTransInfo	 : getTransInfo
			}
		}])
		.controller('stockBuyCtrl', function ($scope, $q, $http, $timeout, stockInfo) {
			
			var accountId = Url.getId('/accountId_', '/');
			// loading 是否显示
			$scope.is_mod_loading = true;
			$scope.isShowStockIn = true;
			// 股票信息
			$scope.stock = {};
			$scope.stock.showCode = "股票代码";
			$scope.stock.showName = "股票名称";
			// 实时行情
			$scope.stockTimeInfo = {};
			// 带方法的股票项
			$scope.stockItem;
			// 持仓信息
			$scope.myPosition  = [];
			$scope.myPosition2 = [];
			// 撤单
			$scope.widthdrawList = [];
			// 交易记录
			$scope.transList = [];

			// 公司列表
			$scope.companyList = [];
			// 账户信息
			$scope.accoutnInfo = {};
			// 弹出框
			$scope.buyDialog = {};
			$scope.isShowBuyDialog = false;

			// 判断字母的正则
			var Letter_Reg = /^[A-Za-z]+$/;
			// 判断中文正则
			var Chinese_Reg = /^([\u4E00-\u9FA5]+，?)+$/;
			// 保留俩位小数
			var Price_Reg = /^-?\d+\.?\d{0,2}$/;
			// 整数
			var Num_Reg = /^-?\d+$/;

			// 请求参数
			var reqConfig = {};
			// 请求函数句柄
			var myPositionHandler,
				companyInfoHandler,
				stockTimeInfoHandler,
				accountInfoHandler;

			// 行情刷新时间间隔 5s
			var stockTimeInfoTime = 5000, 
				stockTimeInfoTimer;

			var positionScoller,
				stockListScoller;

			var positionLoading1;

			var tabIndex = Url.get('index');
				tabIndex = tabIndex || 0;

			var orderType = 1; // 1 买入 / 2 卖出

			$scope.safeApply = function(fn) {
			  var phase = this.$root.$$phase;
			  if(phase == '$apply' || phase == '$digest') {
			    if(fn && (typeof(fn) === 'function')) {
			      fn();
			    }
			  } else {
			    this.$apply(fn);
			  }
			};

			// 点击切换
			$scope.showStockInput = function () {
				$scope.isShowStockIn = true;
				$timeout(function() {
					document.getElementById("stock_inp").focus();
				}, 0);
			};

			// 监听输入代码变化
			$scope.stock_change = function (val) {
				var len = $scope.stock.stockCode.length;
				if( Letter_Reg.test($scope.stock.stockCode) ) {
					reqConfig.stockInfo.codeStr = $scope.stock.stockCode;
					getCompanyInfo();
				} else if( Chinese_Reg.test($scope.stock.stockCode) ) {
					Common.MS.alert('股票代码不能输入中文');
					$scope.stock.stockCode = '';
					$scope.companyList = [];
					$scope.isShowStockList = false;
				} else if( len >= 4 ) {
					if( !Num_Reg.test($scope.stock.stockCode) ) {
						Common.MS.alert('股票代码格式错误');
						$scope.stock.stockCode = '';
						$scope.companyList = [];
						$scope.isShowStockList = false;
						return;
					}
					reqConfig.stockInfo.codeStr = $scope.stock.stockCode;
					getCompanyInfo();
				} else {
					if( $scope.isShowStockList ) $scope.isShowStockList = false;
				}
				if( !!stockTimeInfoTimer ) {
					clearTimeout(stockTimeInfoTimer);
					stockTimeInfoTimer = null;
				}
			};

			// 选择股票
			$scope.selectStock = function (item) {
				$scope.isShowStockIn = false;
				$scope.isShowStockList = false;
				setStockItem(item);
			};

			// 提交
			$scope.submit = function () {
				var params = $scope.stockItem.serialize();
				if( !checkSubmitData(params) ) return;

				$scope.buyDialog.stockCode = params.stockCode;
				$scope.buyDialog.stockName = $scope.stock.showName;
				$scope.buyDialog.stockPrice = params.price;
				$scope.buyDialog.stockNum = params.amount;

				$scope.isShowBuyDialog = true;
			};

			$scope.submitBuyDialog = function () {
				var params = $scope.stockItem.serialize();
				if( orderType == 1 ) {
					stockInfo.submitBuy(params)
						.then(function (res) {
							if( res.statusCode == 200 ) {
								Common.MS.alert("委托成功");
								$scope.reset();
							} else {
								Common.MS.alert(res.message);
							}
							$scope.isShowBuyDialog = false;

						}, function (err) {
							console.error(err);
						});
				} else if( orderType == 2 ) {
					stockInfo.submitSel(params)
						.then(function (res) {
							if( res.statusCode == 200 ) {
								Common.MS.alert("委托成功");
								$scope.reset();
							} else {
								Common.MS.alert(res.message);
							}
							$scope.isShowBuyDialog = false;
						}, function (err) {
							console.error(err);
						});
				}
			}

			$scope.cancalBuyDialog = function () {
				$scope.isShowBuyDialog = false;
			};

			function checkSubmitData (data) {
				// 代码验证
				if( !!$scope.stock.stockCode && !data.stockCode ) {
					Common.MS.alert("请输入正确股票代码");
					return false;
				} else if( !!$scope.stock.stockCode && !!data.stockCode ) {
					if( $scope.stock.stockCode != data.stockCode ) {
						Common.MS.alert("请输入正确股票代码");
						return false;
					}
				} else if( !data.stockCode ) {
					Common.MS.alert("请输入股票代码");
					return false;
				}

				if( !Num_Reg.test(data.stockCode) ) {
					Common.MS.alert("请输入正确股票代码");
					return false;
				}

				if( !data.price ) {
					Common.MS.alert("请输入股票价格");
					return false;
				} else if( data.price < Number($scope.stockTimeInfo.HQJRDT) ) {
					Common.MS.alert("股票价格不能低于跌停价");
					return false;
				} else if ( data.price > Number($scope.stockTimeInfo.HQJRZT)) {
					Common.MS.alert("股票价格不能高于涨停价");
					return false;
				} else if( !Price_Reg.test(data.price) ) {
					Common.MS.alert("股票价格格式不对");
					return false;
				}

				if( !data.amount ) {
					Common.MS.alert("请输入股票数量");
					return false;
				} else if ( data.amount%100 !== 0 ) {
					Common.MS.alert("股票数量只可以是100的整数倍");
					return false;
				} else if ( data.amount > Number($scope.stockItem.maxBuyNum) ) {
					Common.MS.alert("股票数量超出上限");
					return false;
				} else if ( !Num_Reg.test(data.stockCode) ) {
					Common.MS.alert("股票数量格式不对");
					return false;
				}
				
				return true;
			}

			// 重置
			$scope.reset = function () {
				$scope.stock = {};
				$scope.stock.showCode = "股票代码";
				$scope.stock.showName = "股票名称";
				$scope.stockTimeInfo = {};
				$scope.companyList = [];
				$scope.stockItem && $scope.stockItem.reset();
				clearTimeout(stockTimeInfoTimer);
			};

			// 选择价格
			$scope.setPrice = function (price) {
				$scope.stockItem.price = price;
			};

			// 带loading的list
			function LoadingControl(list, listId, loadingId, reqFn, successCallback, initFn) {
				this.list   	= list;
				this.listId 	= listId;
				this.loadingId 	= loadingId;
				this.reqFn 		= reqFn;
				this.successCallback = successCallback;
				this.initFn 	= initFn;

				this.hasMore = true;
				this.loadingHandler = null;
				this.reqParams = {
					index		: 1,
					number		: 5
				};
			}

			LoadingControl.prototype.get = function(callback) {
				var _t = this;
				var handler = _t.reqFn(_t.reqParams);
				handler.then(function(res) {
					var list = res.data;
					if( list.records.length > 0 ) {
						_t.successCallback(list);
						
						_t.reqParams.index  = list.index;
						_t.reqParams.number = list.number;
					} else _t.hasMore = false;
					callback && callback();
				});
			}

			LoadingControl.prototype.more = function () {
				var _t = this;
				if( _t.hasMore ) {
					if( !!_t.list.length ) {
						_t.reqParams.index  = _t.reqParams.index + _t.reqParams.number;
					}
					_t.get(function () {
						_t.loadingHandler.close();
					});
				} else _t.loadingHandler.close();
			}

			LoadingControl.prototype.reload = function() {
				var _t = this;
				_t.list = [];
				_t.loadingHandler.open();
			}

			LoadingControl.prototype.init = function () {
				var _t = this;
				_t.loadingHandler = new Loading(_t.listId, _t.loadingId, function() { _t.more(); } );
				_t.loadingHandler.open();

				_t.initFn && _t.initFn();
			}

			// 我的持仓
			var positionCon = new LoadingControl($scope.myPosition, "posi_list_wrap", "position1_loading", stockInfo.getMyPosition, function(list) {
				var _t = this;
				var _profitRateTxt ;
				angular.forEach(list.records, function (value) {
					if( Number(value.costPrice) > Number(value.nowPrice) ) {
						value.isPosition = false;
					} else value.isPosition = true;
					_profitRateTxt = value.profitRate * 100;
					_profitRateTxt = _profitRateTxt.toFixed(2);
					_profitRateTxt += '%';
					value.profitRate = _profitRateTxt;
					_t.list.splice(0, 0, value);
				});
			});

			// 我的持仓2
			var positionCon2 = new LoadingControl($scope.myPosition2, "my_position_list2", "buy_loading1", stockInfo.getMyPosition, function(list) {
				var _t = this;
				var _profitRateTxt ;
				angular.forEach(list.records, function (value) {
					if( Number(value.costPrice) > Number(value.nowPrice) ) {
						value.isPosition = false;
					} else value.isPosition = true;
					_profitRateTxt = value.profitRate * 100;
					_profitRateTxt = _profitRateTxt.toFixed(2);
					_profitRateTxt += '%';
					value.profitRate = _profitRateTxt;
					_t.list.splice(0, 0, value);
				});
			});

			// 撤单
			var withdrawCon = new LoadingControl($scope.widthdrawList, "withdraw_list_wrap", "withdraw_loading", stockInfo.getEntrustInfo, function(list) {
				var _t = this;
				angular.forEach(list.records, function (value) {
					var times = value.time && value.time.split(' ');
					value.times = times;
					_t.list.splice(0, 0, value);
				});
			}, function() {
				var _t = this;
				var dialogDom = $("#withdraw_dialog");

				dialogDom.find('.mod_dialog_bg').on('tap', function () {
					dialogDom.hide();
				});

				// 点击列表
				$("#withdraw_list_wrap").on('tap', '.tr', function(e) {
					var id = $(this).attr("data-id");
					_t.selectId = id;
					dialogDom.show();
				});
				// 撤单
				$("#dia_withdraw_btn").on('tap', function(e) {
					postWithdraw();
				});

				// 撤单并从新购买
				$("#dia_withdraw_buy_btn").on('tap', function(e) {
					postWithdraw();
				});

				function postWithdraw(callback) {
					var id = _t.selectId;
					if( !id ) {
						Common.MS.alert("委托id不存在");
						return;
					}

					var params = {
						accountId: accountId,
						orderId: id
					};

					var handler = stockInfo.submitWithdraw(params);
					handler.then(function(res) {
						dialogDom.hide();
						if( res.statusCode == 200 ) {
							Common.MS.alert("撤单成功");
						} else {
							Common.MS.alert(res.message);
						}

						callback && callback();

					});
				}
			} );
	
			// 交易记录
			var transCon = new LoadingControl($scope.transList, "trans_list_wrap", "trans_loading", stockInfo.getTransInfo, function(list) {
				var _t = this;
				angular.forEach(list.records, function (value) {
					var times = value.dealTime && value.dealTime.split(' ');
					value.times = times;
					_t.list.splice(0, 0, value);
				});
			});

			init();

			function init() {
				// 初始化滑动mod
				initScroll();

				// 初始化我的持仓
				positionCon.init();
				positionCon2.init();

				// 初始化撤单
				withdrawCon.init();

				// 初始化交易记录
				transCon.init();

				if ( tabIndex == 1 ) {
					changeBuyType(1);
				} else if(tabIndex == 2) {
					changeBuyType(2);
				}

				// 初始化tab
				var tabsCallbackArray = [];
				tabsCallbackArray[0] = function() { positionCon.reload(); }
				tabsCallbackArray[1] = function() { 
					changeBuyType(1);
					positionCon2.reload();
				}
				tabsCallbackArray[2] = function() { 
					changeBuyType(2);
					positionCon2.reload();
				}
				tabsCallbackArray[3] = function() { withdrawCon.reload(); }
				tabsCallbackArray[4] = function() { transCon.reload(); }
				var tabs = new Tab('tab_btn', ['posi_wp','buy_wp', 'sel_wp', 'withdraw_wp','trans_wp'], tabIndex, tabsCallbackArray);
				
				// 我的持仓req params
				reqConfig.myPosition = {
					versionCode : '1.0',
					userId		: '123456',
					accountId   : '546321',
					index		: 1,
					number		: 5
				};

				// 股票信息req params 
				reqConfig.stockInfo = {
					versionCode : '1.0',
					codeStr 	: ''
				};

				// 实时行情 req params
				reqConfig.stockTimeInfo = {
					versionCode : "0.1",
					stockCode   : ""
				};

				// 账号信息
				reqConfig.accountInfo = {
					versionCode : "0.1",
					userId   	: "123",
					accountId 	: "456"
				};

				getAccountInfo();

				$scope.stockItem = new Stock();

			}

			function changeBuyType (type) {

				if( type == 1 ) {
					$scope.safeApply(function() {
						$scope.buyTxtDec = "最大可买";
						$scope.buySubmitDec = "委托买入";
						$scope.buyDialog.title = "买入确认";
					});
					orderType = 1;
				} else if( type == 2 ) {
					$scope.safeApply(function() {
						$scope.buyTxtDec = "最大可卖";
						$scope.buySubmitDec = "委托卖出";
						$scope.buyDialog.title = "卖出确认";
					});
					orderType = 2;
				}

				$scope.safeApply(function() {
					$scope.reset();
					$scope.isShowStockList = false;
				});
				
			}
			
			// 初始化滚动区域
			function initScroll() {

				// 公司列表
				stockListScoller = new IScroll("#stock_list_wp", {
					scrollbars: true,
					click	  : true
				});

			}

			// 根据代码选择股票
			function getCompanyInfo() {
				companyInfoHandler = stockInfo.getCompanyInfo( reqConfig.stockInfo );
				companyInfoHandler.then(function(res) {
					if( res.statusCode == 200 && res.data instanceof Array ) {
						var len = res.data.length;
						if( len == 0 ) {
							Common.MS.alert('未搜到相关股票');
							$scope.companyList = [];
							$scope.isShowStockList = false;
							return;
						}
						$scope.companyList = res.data;

						$timeout(function() {
							stockListScoller.refresh();	
						}, 0);
						
						$scope.isShowStockList = true;
					} else {
						Common.MS.alert(data.message);
						$scope.companyList = [];
						$scope.isShowStockList = false;
					}
					
				}, function(err) {
					console.log(err);
				});
			}

			function getStockTimeInfo () {
				stockTimeInfoHandler = stockInfo.getStockTimeInfo( reqConfig.stockTimeInfo );
				stockTimeInfoHandler.then(function (res) {
					// 更新信息
					updateStockItem(res.data);

					// 对字符串数字化
					var pointArr = ['HQZRSP', 'HQBJW1', 'HQBJW2', 'HQBJW3', 'HQBJW4', 'HQBJW5',
									'HQSJW1', 'HQSJW2', 'HQSJW3', 'HQSJW4', 'HQSJW5'];

					angular.forEach(pointArr, function(value) {
						res.data[value] = Number(res.data[value]);
						if( res.data['HQZRSP'] < res.data[value] ) {
							res.data[value+'_Rise'] = true;
						} else {
							res.data[value+'_Rise'] = false;
						}
						res.data[value] = res.data[value].toFixed(2);
					});

					$scope.stockTimeInfo = res.data;

					// 轮询
					stockTimeInfoTimer = setTimeout(function () {
						getStockTimeInfo();
					}, stockTimeInfoTime);

				}, function (err) {
					console.error(err);
				});
			}

			// 获取账户信息
			function getAccountInfo() {
				accountInfoHandler = stockInfo.getAccountInfo( reqConfig.accountInfo );
					accountInfoHandler.then(function(res) {
						$scope.accoutnInfo = res.data;
					}, function(err) {
						console.error(err);
				});
			}

			// 选择股票
			function setStockItem(item) {
				$scope.stock.stockCode = item.stockCode;
				$scope.stock.showCode  = item.stockCode;
				// $scope.stockItem.stockCode = item.stockCode;
				$scope.stock.showName  = item.stockName;
				// 获取行情
				reqConfig.stockTimeInfo.stockCode = item.stockCode;
				getStockTimeInfo();

				$scope.stockItem.set('initPrice', false);
			}

			// 更新item信息
			function updateStockItem(data) {
				$scope.accoutnInfo = $scope.accoutnInfo || {};
				
				var p = {
					stockCode: data.stockCode,
					money    : Number($scope.accoutnInfo.todayMoney),
					price 	 : Number(data.HQSJW1),
					minPrice : Number(data.HQJRDT),
					maxPrice : Number(data.HQJRZT),
					buyType  : orderType
				};
				
				if( orderType == 2 ) {
					var maxSelNum = getSelNum(data.stockCode);
					p.maxBuyNum = maxSelNum;
					p.price = Number(data.HQBJW1);
				}

				$scope.stockItem.update(p);

				if( orderType == 1 ) {
					$scope.stockItem.countMaxNumber();
				}
				
			}

			function getSelNum( stockCode ) {
				var num ;
				angular.forEach($scope.myPosition2, function(value) {
					if( value.stockCode == stockCode ) {
						num = value.todayNum;
						return;
					}
				});
				return num || 0;
			}


		});

	$(function() {
		angular.bootstrap(document.body, [appName]);
		// Fastclick.attach(document.body);
	});

});