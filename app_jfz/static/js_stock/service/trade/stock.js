define(['common'], function(Common) {

	// 保留俩位小数
	var Price_Reg = /^-?\d+\.?\d{0,2}$/;
	// 整数
	var Num_Reg = /^-?\d+$/;

	// 股票原型模块
	function Stock (params) {
		params = !!params ? params : {};

		this.money 		= params.money;
		this.buyType    = params.buyType || 1;		// 1 买入/ 2 卖出
		this.stockCode	= params.stockCode || 0; 		// 股票代码

		this.price      = params.price ;		  // 股票价格
		this.initPrice  = false;
		this.minPrice   = params.minPrice || 0; 	  // 股票最低价
		this.maxPrice   = params.maxPrice || 0; 	  // 股票最高价
		this.isMinPrice = params.isMinPrice || false; // 当前价格是否位于股票最低价 
		this.isMaxPrice = params.isMaxPrice || false; // 当前价格是否位于股票最高价 

		this.buyNum 	 = params.buyNum  ;        // 股票数量
		this.minBuyNum   = params.minBuyNum || 0; 	    // 股票最低可买
		this.maxBuyNum	 = params.maxBuyNum || 0;	    // 股票最多可买
		this.isMinBuyNum = params.isMinBuyNum || false; // 当前数量是否位于最小值
		this.isMaxBuyNum = params.isMaxBuyNum || false; // 当前数量是否位于最高值

		this.priceReduceStep  = params.priceReduceStep || 0.01; // 价格减少间隔
		this.priceAddStep     = params.priceAddStep || 0.01;	// 价格增加间隔
		this.buyNumReduceStep = params.buyNumReduceStep || 100; // 数量的减少间隔
		this.buyNumAddStep    = params.buyNumAddStep || 100;  // 数量的增加间隔

	}

	// 更新属性
	Stock.prototype.update = function (params) {
		for( i in params ) {
			if( i == 'price' ) {
				if( !this.initPrice ) {
					this[i] = params[i];
					this.initPrice = true;
				}
			} else { 
				this[i] = params[i];
			}
		}
	};

	// 修改属性
	Stock.prototype.set = function (key, value) {
		this[key] = value;
		return this;
	};

	// 获取属性
	Stock.prototype.get = function (key) {
		return this[key];
	};

	// 按step减少价格
	Stock.prototype.reducePrice = function () {
		this.price = Number(this.price);
		// 是否大于最低价
		if( this.price > this.minPrice ) {
			this.price -= Number(this.priceReduceStep);

			this.price = this.price.toFixed(2);

			// 减少后是否小于最低价，小于则等于最低价，改变isMinPrice状态
			if( this.price <= this.minPrice ) {

				this.price      = this.minPrice;
				this.isMinPrice = true;
			} 

			// 若为最大，设置isMaxPrice为false
			if( this.isMaxPrice && this.price < this.maxPrice ) {
				this.isMaxPrice = false;
			}

			if( this.buyType == 1 ) {
				this.countMaxNumber(); 
			}

		}

		return this.price;
	};

	// 按step增加价格
	Stock.prototype.addPrice = function () {
		if( !this.price ) this.price = 0;
		this.price = Number(this.price);
		if( this.price < this.maxPrice ) {
			this.price += Number(this.priceAddStep);
			this.price = this.price.toFixed(2);

			if( this.price >= this.maxPrice ) {

				this.price      = this.maxPrice;
				this.isMaxPrice = true;
			}

			if( this.isMinPrice && this.price > this.minPrice ) {
				this.isMinPrice = false;
			}
			
			if( this.buyType == 1 ) {
				this.countMaxNumber(); 
			}

		} 
		if ( this.isMinPrice && (this.price + this.priceAddStep) > this.minPrice ) {
			this.isMinPrice = false;
		}
		if( !this.maxPrice ) {
			this.price += this.priceAddStep;
			this.price = this.price.toFixed(2);
		} 

		return this.price;
	};

	Stock.prototype.changePrice = function () {
		if( !Price_Reg.test(this.price) ) {
			if( !this.price ) return;
			Common.MS.alert('输入价格格式不对');
			return;
		}
		var price = this.price;
		price = Number(price);
		if( !this.maxPrice ) return;
		if( this.isMinPrice ) {
			if( price > this.minPrice ) this.isMinPrice = false;
		} else {
			if( price <= this.minPrice ) this.isMinPrice = true;
		}

		if( this.isMaxPrice ) {
			if( price < this.maxPrice ) this.isMaxPrice = false;
		} else {
			if( price >= this.maxPrice ) this.isMaxPrice = true;
		}
	};

	Stock.prototype.countMaxNumber = function () {
		this.price = Number(this.price);
		if( !this.price ) this.maxBuyNum = this.money;
		else {
			if( !this.money ) return;
			var _maxNum    = this.money / this.price;
			this.maxBuyNum = Math.floor(_maxNum / 100 ) * 100;
			this.maxBuyNum = this.maxBuyNum.toFixed(0);
			this.maxBuyNum = Number(this.maxBuyNum);
		}
		console.log(this.money, this.maxBuyNum);
	};

	Stock.prototype.formatBuyNum = function () {
		this.buyNum  = Number(this.buyNum);
		if( this.buyNum ) this.buyNum  = this.buyNum.toFixed(0); 
	};

	Stock.prototype.changeBuyNum = function () {
		if( !Num_Reg.test(this.buyNum) ) {
			if( !this.buyNum ) return;
			Common.MS.alert('输入数量格式不对');
			return;
		}
		this.buyNum  = Number(this.buyNum);
		if( !this.maxBuyNum ) return;
		if( this.isMinBuyNum ) {
			if( this.buyNum > this.minBuyNum ) this.isMinBuyNum = false;
		} else {
			if( this.buyNum <= this.minBuyNum ) this.isMinBuyNum = true;
		}

		if( this.isMaxBuyNum ) {
			if( this.buyNum < this.maxBuyNum ) this.isMaxBuyNum = false;
		} else {
			if( this.buyNum >= this.maxBuyNum ) this.isMaxBuyNum = true;
		}
	};

	// 按step减少数量
	Stock.prototype.reduceBuyNum = function () {
		this.buyNum  = Number(this.buyNum);
		if( this.buyNum > this.minBuyNum ) {
			this.buyNum -= this.buyNumReduceStep;

			if( this.buyNum <= this.buyNumReduceStep ) {

				this.buyNum      = this.buyNumReduceStep;
				this.isMinBuyNum = true;
			} 

			if( this.isMaxBuyNum && this.buyNum < this.maxBuyNum ) {
				this.isMaxBuyNum = false;
			}
		}

		return this.buyNum;
	};

	// 按step增加数量
	Stock.prototype.addBuyNum = function () {
		if ( !this.buyNum ) this.buyNum = 0;
		if ( !this.maxBuyNum ) this.maxBuyNum = 0;
		
		this.buyNum  = Number(this.buyNum);
		if( this.buyNum < this.maxBuyNum ) {
			this.buyNum += this.buyNumAddStep;

			if( this.buyNum >= this.maxBuyNum ) {

				this.buyNum      = this.maxBuyNum;
				this.isMaxBuyNum = true;
			}

			if( this.isMinBuyNum && this.buyNum > this.minBuyNum ) {
				this.isMinBuyNum = false;
			} 

		}
		if ( this.isMinBuyNum && (this.buyNum + this.buyNumAddStep) > this.maxBuyNum ) {
			this.isMinBuyNum = false;
		}

		if( !this.maxBuyNum ) {
			this.buyNum += this.buyNumAddStep;
		}

		return this.buyNum;
	};

	// 对必要字段序列化
	Stock.prototype.serialize = function () {
		var result = {
			stockCode : this.stockCode,
			price 	  : this.price,
			amount 	  : this.buyNum,
			type      : this.buyType
		};

		return result;
	};

	// 重置
	Stock.prototype.reset = function () {
		this.stockCode 	= '';
		this.price   	= '';
		this.buyNum     = '';
		this.maxBuyNum  = '';
	};

	return Stock;

});