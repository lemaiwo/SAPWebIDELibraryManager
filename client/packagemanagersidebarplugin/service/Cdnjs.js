/**
 * A service implementation sample for displaying a greeting notification and counting the number of alerts displayed.
 * 
 * The service provides a public API which is defined in its interface (in this example, Sample.json file) 
 * and can be used by other plugins.   
 * 
 * Every method call on a service is asynchronous and returns a Q-promise.
 * If not done explicitly by the method, the return value is automatically wrapped with a promise object.
 * 
 * Other services (which are required by this service plugin, as defined in the plugin.json file) can be accessed 
 * using 'this.context.service' property.
 * 
 * A service can fire events that are defined in its interface. These events can be handled by any other service.
 * 
 * A service can also handle events from any other service (including its own).
 * The events subscription along with the handler methods must be defined in the plugin.json file.
 * 
 */
define({
	sBaseUrl: "https://api.cdnjs.com",
	client: null,
	$http: function(url) {
		var me = this;
		// A small example of object
		var core = {

			// Method that performs the ajax request
			ajax: function(method, url, args) {

				// Creating a promise
				var promise = new Promise(function(resolve, reject) {
					// if (me.client) {
					// 	me.client.abort();
					// }
					// Instantiates the XMLHttpRequest
					me.client = new XMLHttpRequest();
					var uri = url;

					if (args && (method === 'POST' || method === 'PUT')) {
						uri += '?';
						var argcount = 0;
						for (var key in args) {
							if (args.hasOwnProperty(key)) {
								if (argcount++) {
									uri += '&';
								}
								uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
							}
						}
					}

					me.client.open(method, uri);
					me.client.send();

					me.client.onload = function() {
						if (this.status == 200) {
							// Performs the function "resolve" when this.status is equal to 200
							resolve(this.response);
						} else {
							// Performs the function "reject" when this.status is different than 200
							reject(this.statusText);
						}
					};
					me.client.onerror = function() {
						reject(this.statusText);
					};
				});

				// Return the promise
				return promise;
			}
		};

		// Adapter pattern
		return {
			'get': function(args) {
				return core.ajax('GET', url, args);
			},
			'post': function(args) {
				return core.ajax('POST', url, args);
			},
			'put': function(args) {
				return core.ajax('PUT', url, args);
			},
			'delete': function(args) {
				return core.ajax('DELETE', url, args);
			}
		};
	},
	search: function(sSearch) {
		var me = this;

		return me.$http(me.sBaseUrl + "/libraries?search=" + sSearch + "&fields=name,description,assets").get().then(
			function(response) {
				// parse output to json. 
				return JSON.parse(response);
			}
		);
	},
	abortSearch: function() {
		if (this.client) {
			this.client.abort();
		}
	},
	getFile: function(file) {
			var me = this;
			return me.$http(file.url).get();
		} //,
		// getLibrary: function(sLibraryName) {
		// 	var me = this;
		// 	return new Promise(function(resolve, reject) {
		// 		$.ajax({
		// 			headers: {
		// 				'Accept': 'application/json',
		// 				'Content-Type': 'application/json'
		// 			},
		// 			crossDomain: true,
		// 			async: true,
		// 			type: 'GET',
		// 			dataType: 'json',
		// 			url: me.sBaseUrl + "/libraries/" + sLibraryName,
		// 			success: function(data) {
		// 				resolve(data);
		// 			},
		// 			error: function(error) {
		// 				reject(error);
		// 			}
		// 		});
		// 	});
		// }
});