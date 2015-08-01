// loading mod
define(['iscroll_probe', 'zepto'], function( Iscroll, $ ) {

	function Loading (wrapId, loadindId, callback, closeCallback, config) {
		this.config 	= config || {};
		this.wrapId 	= wrapId;
		this.loadindId  = loadindId;
		this.callback	= callback;
		this.closeCallback = closeCallback;

		this.top 		  = this.config.top || 41;
		this.preLoading   = false;
		this.loadingState = 0;
		this.isLoading    = false;

		this.wrapDom    = $("#"+ this.wrapId);
		this.loadingDom = $("#"+ this.loadindId);

		this.scroller =  new Iscroll("#"+this.wrapId, {
			probeType: 2,
		    scrollX: false,
		    scrollY: true,
		    mouseWheel: true,
		    click: true
		});

		this.startTime = 0;
		this.endTime   = 0;

		this._bindEven();

	}

	Loading.prototype.open = function () {
		var _t = this;
		_t._changeLoadingState(3, true);
		_t._loading();
		_t.scroller.scrollTo(0, _t.top);
	}

	Loading.prototype.close = function () {
		var _t = this;
		
		var temp_time = _t.endTime - _t.startTime;
		temp_time = temp_time > 300 ? 0 : 300;
		setTimeout(function() {
			_t.preLoading   = false;
			_t.loadingState = 0;
			_t.isLoading    = false;
			_t._changeLoadingState(0);
			_t.scroller.scrollTo(0, 0, 300);
			_t.refresh();
			_t.closeCallback && _t.closeCallback();
		}, temp_time);
	}

	Loading.prototype.refresh = function () {
		this.scroller.refresh();
	}

	Loading.prototype._bindEven = function () {
		var _t = this;
		var _startY = 0;

		_t.scroller.on('scrollStart', function(e) {
	    	if( this.y == 0 ) {
	    		_t.preLoading = true;
	    	}
	    	_startY = this.y;
	    	console.info('starty', _startY);
	    });

	    _t.scroller.on('scroll', function(e) {
	    	var y = this.y;
	    	// -1 down / 1 up
	    	var directionY = this.directionY;
	    	if( _startY == 0 && directionY === -1 ) {
	    		if( !_t.isLoading && _t.preLoading ) {
	    			if( _t.loadingState < 2 ) {
	    				if(  y > 0  && y < _t.top  ) {
		    				_t._changeLoadingState(1);
		    			} else {
		    				_t._changeLoadingState(2);
		    			}
	    			}
	    			
	    		} 
	    		
	    	}

	    });

	     _t.scroller.on('scrollEnd', function(e) {
	     	_t.endTime = new Date().getTime();
	    	if( _t.loadingState == 2 ) {
	    		_t._changeLoadingState(3);
	    		_t._loading();
	    		_t.scroller.scrollTo(0, _t.top);
	    	} else if ( _t.preLoading && _t.isLoading && _t.directionY == -1 ) {
	    		_t.scroller.scrollTo(0, _t.top);
	    	} 

	    });

	}

	Loading.prototype._loading = function () {
		var _t = this;
		_t.startTime = new Date().getTime();
		_t.isLoading = true;
		_t.callback();
	}

	Loading.prototype._changeLoadingState = function (state, flag) {
		var stateArr = ['mod_loading_state0', 'mod_loading_state1', 'mod_loading_state2', 'mod_loading_state3'];

		if( !flag ) {
			var nowClass = stateArr[state];

			var preState = state - 1;
			if( preState < 0) preState = stateArr.length - 1;
			var preClass = stateArr[preState];

			this.loadingDom.removeClass(preClass);
			this.loadingDom.addClass(nowClass);

		} else {
			this.loadingDom.removeClass(stateArr[0]);
			this.loadingDom.addClass(stateArr[3]);
		}

		this.loadingState = state;
	}

	return Loading;

});