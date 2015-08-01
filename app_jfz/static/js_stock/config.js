// require.js config
var require = {
	baseUrl: '/plugin/app_jfz/static/js_stock',

	paths: {
		'angular'	 	: 'lib/angular.min',
		'angularTouch'	: 'lib/angular-touch',
		'domready'		: 'lib/ready',
		'fastclick'		: 'lib/fastclick',
		'zepto'  		: 'lib/zepto.min',
		'iscroll'		: 'lib/iscroll',
		'iscroll_probe'	: 'lib/iscroll-probe',
		'zepto_animate' : 'util/zepto_animate',
		'loading'		: 'util/loading',
		'tab'		    : 'util/tab',
		'url'			: 'util/url',
		'authorize'     : 'util/authorize',
		'common'		: 'util/common',
		'jockey' 		: 'lib/jockey'
	},

	// 若加载模块不符合AMD规范，直接返回全局变量，则用下面方式封装
	// 切记：exports的变量一定要和返回的 全局变量名称 一致
	shim: {
		'angular': {
			exports: 'angular'
		},

		'angularTouch': {
			deps: ['angular']
		},

		'zepto': {
			exports: 'Zepto'
		},

		'iscroll': {
			exports: 'IScroll'
		},

		'iscroll_probe': {
			exports: 'IScroll'
		},

		'jockey': {
			exports: 'Jockey'
		}
	}

};