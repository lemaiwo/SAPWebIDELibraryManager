var _fragments = [];
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";
	return Controller.extend("packagemanagersidebarplugin.controller.BaseController", {

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("Overview", {}, true /*no history*/ );
			}
		},
		getModel: function(name) {
			return this.getView().getModel(name);
		},
		setModel: function(model, name) {
			return this.getView().setModel(model, name);
		},
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
		openFragment: function(sName, model, updateModelAlways, callback, data) {
			if (sName.indexOf(".") > 0) {
				var aViewName = sName.split(".");
				sName = sName.substr(sName.lastIndexOf(".") + 1);
			} else { //current folder
				aViewName = this.getView().getViewName().split("."); // view.login.Login
			}
			aViewName.pop();
			var sViewPath = aViewName.join("."); // view.login
			sViewPath += ".";
			//create controller
			var sControllerPath = sViewPath.replace("view","controller");
			try{
				var controller = sap.ui.controller(sControllerPath+sName);
			}catch(ex){
				controller = this;
			}
			var id = this.getView().getId() + "-" + sName;
			if (!_fragments[id]) {
				_fragments[id] = sap.ui.xmlfragment(
					id,
					sViewPath + sName,
					controller
				);
				if (model && !updateModelAlways) {
					_fragments[id].setModel(model);
				}
				// version >= 1.20.x
				this.getView().addDependent(_fragments[id]);
			}
			var fragment = _fragments[id];
			if (model && updateModelAlways) {
				fragment.setModel(model);
			}
			if (controller && controller !== this) {
				controller.onBeforeShow(this, fragment, callback, data);
			}

			setTimeout(function() {
				fragment.open();
			}, 100);
		},
		getFragmentControlById: function(parent, id) {
			var latest = this.getMetadata().getName().split(".")[this.getMetadata().getName().split(".").length - 1];
			return sap.ui.getCore().byId(parent.getView().getId() + "-" + latest + "--" + id);
		},
		closeFragments: function() {
			for (var f in _fragments) {
				if (_fragments[f]["isOpen"] && _fragments[f].isOpen()) {
					_fragments[f].close();
				}
			}
		},
		getFragment: function(fragment) {
			return _fragments[this.getView().getId() + "-" + fragment];
		}
	});
});