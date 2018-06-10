sap.ui.define(["packagemanagersidebarplugin/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	'sap/m/MessageBox'
], function(Controller, JSONModel, MessageBox) {
	"use strict";

	return Controller.extend("packagemanagersidebarplugin.controller.PackageSearch", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf client.view.PackageSearch
		 */
		onInit: function() {
			this.getView().setModel(new JSONModel({
				search: "",
				project: "Nothing selected",
				results: [],
				total: 0
			}));
		},
		onSearch: function(oEvent) {
			var me = this;
			var search = this.getView().getModel().getProperty("/search");
			var view = this.getView();
			var context = view.getViewData().context;
			context.service.cdnjs.abortSearch();
			if (me.taskId) {
				context.service.progress.stopTask(me.taskId);
			}
			context.service.progress.startTask("searchlibraries", "Search for libraries").then(function(taskid) {
				me.taskId = taskid;
				return context.service.cdnjs.search(search).then(function(result) {
					var transformedResult = [];
					result.results.forEach(function(library) {

						library.assets.map(function(asset) {
							asset.files = asset.files.reduce(
								function(result, file) {
									if (/\.(map)$/i.test(file)) {
										// skip '.map' files
									} else {
										// default set min.js and min.css to the manifest
										// download all ...
										var manifest = /\.min\.(js|css)$/i.test(file);
										result.push({
											filename: file,
											download: true,
											manifest: manifest,
											status: ""
										});
									}
									return result;
								}, []);
							return asset;
						});
						transformedResult.push(library);

					});
					var iSizeLimit = 0;
					result.results.forEach(function(line) {
						iSizeLimit += line.assets.length;
						line.assets.forEach(function(asset) {
							iSizeLimit += asset.files.length + 1;
						});
					});
					iSizeLimit += result.results.length;
					me.getView().getModel().setSizeLimit(iSizeLimit + 1);
					me.getView().getModel().setProperty("/results", transformedResult);
					me.getView().getModel().setProperty("/total", result.total);
					return context.service.progress.stopTask(me.taskId);
				}).catch(function() {
					MessageBox.error("Error during search, try again later...");
					return context.service.progress.stopTask(me.taskId);
				});
			});
		},
		onSelectionChange: function(oEvent) {
			var me = this,
				listItem = oEvent.getParameter("listItem");
			if (listItem) {
				var path = listItem.getBindingContextPath();
			}
			if (path) {
				me.openFragment("packagemanagersidebarplugin.view.Library", null, true, false, {
					path: path,
					project: me.getView().getModel().getProperty("/project")
				});

			}
		},
		onCancel: function(oEvent) {
			var view = this.getView();
			var context = view.getViewData().context;
			context.service.cdnjs.abortSearch();
			if (this.taskId) {
				context.service.progress.stopTask(this.taskId);
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf client.view.PackageSearch
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf client.view.PackageSearch
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf client.view.PackageSearch
		 */
		//	onExit: function() {
		//
		//	}

	});

});