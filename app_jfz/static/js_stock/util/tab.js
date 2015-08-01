// tab 切换 model
define(['zepto'], function($) {

	function Tab (tabWrapId, itemIdArr, index, callbackArray, config) {
		this.tabWrapId = tabWrapId;
		this.itemIdArr = itemIdArr;
		this.index	   = index || 0;
		this.cbArray   = callbackArray || [];
		this.config    = config || {};
		
		this.tabDomArr	= [];
		this.itemDomArr = [];
		this.top	    = this.config.top || 32;

		this.conHeight  = $(window).height() - this.top;
		this.conWidth   = $(window).width();

		this._init();
	}

	Tab.prototype._init = function () {
		var _t = this;
		// 初始化dom
		_t.tabDomArr = $("#"+ _t.tabWrapId ).find('li');

		$.each(_t.itemIdArr, function(index, item) {
			_t.itemDomArr.push( $("#" + item ) );
		});

		_t._initStyle();
		_t._bindEven();

	}

	Tab.prototype._initStyle = function () {
		var _t = this;
		// 设高
		$.each(_t.itemDomArr, function(index, item) {
			item.css({
				'height': _t.conHeight + 'px'
			});
			item.show();
		});

		if( _t.index >= 0 && _t.index < _t.itemDomArr.length ) {
			var _index  = _t.index;
			_t.index 	= 0;
			_t.change(_index, true);
		}

	}

	Tab.prototype.change = function (index, initFlag) {
		var _t = this;
		var temp_index;

		var flag = true;
		if( _t.index == 1 && index == 2 ) {
			flag = false;
		} else if( _t.index == 2 && index == 1 ) { 
			flag = false;
		}

		_t.tabDomArr.eq(_t.index).removeClass('active');
		_t.tabDomArr.eq(index).addClass('active');

		if( flag ) {
			if( index == 2 ) {
				temp_index = 1;
			} else temp_index = index;
			var futureDom = _t.itemDomArr[temp_index];
			futureDom.addClass('tab_future_item');
			if( _t.index == 2 ) _t.index = 1;
			_t.itemDomArr[_t.index].removeClass('tab_show_item');
			futureDom.addClass('tab_show_item').removeClass('tab_future_item');
		}

		if( !initFlag ) {
			var callback = _t.cbArray[index];

			callback && callback();
		}

		_t.index = index;

	}

	Tab.prototype._bindEven = function () {
		var _t = this;
		_t.tabDomArr.on('tap', function() {
			var index = $(this).index();
			if( index == _t.index ) return;

			_t.change(index);
		});

	}

	return Tab;


});