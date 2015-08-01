define(function() {
	var url = {
		/*
		 * return an string from query by the arg name.
		 *
		 * if arg name is not specialed, it will return an object parsed from query.
		 */
		get: function(name) {
			var query = window.location.search;
			if (name) {
				var r = new RegExp("[?&]" + name + "=([^&]*)");
				var m = r.exec(query);
				if (m) {
					return m[1];
				} else {
					return null;
				}
			} else {
				return this.parseQueryString(query);
			}
		},

		/*
		 * return an object parsed from query.
		 */
		parseQueryString: function(query) {
			if (query[0] === '?')
				query = query.substring(1);
			var args = {};
			var fragments = query.split('&');
			var fragment, pos, i, length = fragments.length;
			for (i = 0; i < length; i++) {
				fragment = fragments[i];
				pos = fragment.indexOf('=');
				if (pos > 0) {
					args[fragment.substring(0, pos)] = fragment.substring(pos + 1);
				} else {
					args[fragment] = null;
				}
			}
			return args;
		},

		/*
		 * return an new url joined all args.
		 */
		join: function(url, args) {
			if (!args) {
				return url;
			}
			var array = [],
				k, v;
			for (k in args) {
				v = args[k];
				if (typeof v === 'function' || typeof v === 'undefined') {
					continue;
				}
				if (v === null) {
					array.push(k + '=');
				} else {
					array.push(k + '=' + encodeURIComponent(v));
				}
			}
			if (array.length === 0) {
				return url;
			}
			var joined = url;
			joined += (joined.indexOf('?') >= 0) ? '&' : '?';
			joined += array.join('&');
			return joined;
		},

		/*
		 * return an url id according to prefix and suffix.
		 */
		 getId: function(prefix, suffix) {
		 	var url = window.location.href;
		 	var r = new RegExp(prefix+"([^"+suffix+"]*)");
		 	var m = r.exec(url);
			if (m) {
				return m[1];
			} else {
				return null;
			}
		 }

	};

	return url;
});