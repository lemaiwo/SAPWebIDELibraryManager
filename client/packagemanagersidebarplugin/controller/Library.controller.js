sap.ui.define(["packagemanagersidebarplugin/controller/BaseController",
	'sap/ui/model/Context',
	'sap/m/MessageToast',
	'sap/m/MessageBox',
	'sap/ui/model/json/JSONModel',
	"sap/m/BusyDialog"
], function(BaseController, Context, MessageToast, MessageBox, JSONModel, BusyDialog) {
	"use strict";
	return BaseController.extend("packagemanagersidebarplugin.controller.Library", {
		busyDialog: new BusyDialog({
			showCancelButton: false
		}).addStyleClass("busy_indicator"),
		onBeforeShow: function(parent, fragment, callback, data) {
			this.parent = parent;
			this.fragment = fragment;
			this.callback = callback;
			this.data = data;

			var FileContext = new Context(this.fragment.getModel(), data.path + "/assets/0");

			// modify size limit of model to show all available entries (default is 100)
			FileContext.getModel().iSizeLimit = FileContext.getModel().getProperty(data.path + "/assets/0/files");

			var model = this.fragment.getModel();
			model.setProperty("/selectedVersion", FileContext.getObject().version);

			this.getFragmentControlById(this.parent, "files").setBindingContext(FileContext);
			this.fragment.bindElement(data.path);
			var dialogmodel = new JSONModel({
				project: data.project
			});
			this.fragment.setModel(dialogmodel, "dialog");
		},
		updateFiles: function(oEvt) {
			var selectedItem = oEvt.getParameter("selectedItem");
			if (selectedItem.getBindingContext()) {
				this.getFragmentControlById(this.parent, "files").setBindingContext(selectedItem.getBindingContext());
			}
		},
		onAdd: function(evt) {
			var me = this,
				view = this.parent.getView(),
				context = view.getViewData().context,
				model = this.fragment.getModel(),
				selectedversion = model.getProperty("/selectedVersion"),
				bc = this.fragment.getBindingContext(),
				data = bc.getObject();
			//https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js
			var files = [];
			var baseUrl = "https://cdnjs.cloudflare.com/ajax/libs/" + data.name + "/" + selectedversion + "/";
			var libname = data.name.replace(/[|&;$%@"<>()+,.]/g, "");
			var downloadpath = "libs/" + libname + "/";
			data.assets.forEach(function(asset) {
				if (asset.version === selectedversion) {
					asset.files.forEach(function(file) {
						if (file.download) {
							file.manifesturi = downloadpath + file.filename;
						} else {
							file.manifesturi = baseUrl + file.filename;
						}
						file.url = baseUrl + file.filename;
						file.status = "";
						files.push(file);
					});
				}
			});
			me.busyDialog.open();
			model.refresh();
			context.service.progress.startTask("loadlibrary", "Loading library").then(function(taskid) {
				me.taskId = taskid;
				return context.service.manifest.createLibFolder(downloadpath);
			}).then(function() {
				var getfilesPromises = [];
				files.forEach(function(file) {
					if (file.download) {
						getfilesPromises.push(context.service.cdnjs.getFile(file).then(function(result) {
							return context.service.manifest.createFile(downloadpath, file, result);
						}).catch(function(error) {
							file.downloadstatus = false;
							file.status += "Could not download";
							console.error("Could not download file:" + file.filename);
						}));
					}
				});
				return Promise.all(getfilesPromises);
			}).then(function() {
				return context.service.manifest.addSourceManifest(files, selectedversion);
			}).then(function() {
				MessageBox.show("Finished implementing the library");
			}).catch(function(error) {
				MessageBox.error("Finished with errors", {
					details: error.message
				});
			}).then(function() {
				model.refresh();
				me.busyDialog.close();
				return context.service.progress.stopTask(me.taskId);
			});
		},
		onClose: function() {
			this.fragment.close();
		}
	});
});