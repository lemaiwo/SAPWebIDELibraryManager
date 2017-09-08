define({
	onSelectionChanged: function(oEvent) {
		if (oEvent.params.selection && oEvent.params.selection.length > 0 && oEvent.params.selection[0].document) {
			var oSelectedDoc = oEvent.params.selection[0].document;
			this.context.service.manifest.setSelection(oSelectedDoc);
			this.context.service.packagesearchservice.getContent().then(function(view) {
				var model = view.getModel();
				if (model) {
					oSelectedDoc.getProject().then(function(project) {
						model.setProperty("/project",project.getEntity().getName());
					});
				}
			});
		}
	}
});