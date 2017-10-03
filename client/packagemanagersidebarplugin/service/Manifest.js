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
	setSelection: function(oSelection) {
		this.selection = oSelection;
	},
	getSelection: function() {
		if (this.selection.getEntity().getName()) {
			return this.selection;
		}
		throw {
			message: "No project selected"
		};
	},
	addSourceManifest: function(files, selectedversion) {
		var me = this;
		// return this.context.service.content.getCurrentDocument().then(function(document) {
		return me.context.service.manifest.getManifest(this.getSelection()).then(function(manifest) {
			me.manifest = manifest;
			return manifest.getContent();
		}).then(function(result) {
			var m = JSON.parse(result);
			var s = m["sap.ui5"];
			if (!s.resources) {
				s.resources = {};
			}
			var r = s.resources;
			if (!r.js) {
				r.js = [];
			}
			if (!r.css) {
				r.css = [];
			}
			files.forEach(function(source) {
				if (!/\.(js|css)$/i.test(source.filename)) {
					source.status += "Only CSS en JS can be added to the manifest";
					return;
				}
				if ((source.download && source.downloadstatus) || !source.download) {
					//&& source.manifest )||(!source.download && source.manifest)) {
					var extension = source.filename.substr(source.filename.lastIndexOf(".") + 1);
					var addFile = true;
					r[extension] = r[extension].map(function(jsdoc) {
						if (jsdoc && jsdoc.name && jsdoc.version && jsdoc.name === source.filename && source.manifest) {
							//&& jsdoc.version === selectedversion && jsdoc.uri === source.url         ) {
							addFile = false;
							source.status += "Updated entry in the manifest";
							return {
								uri: source.manifesturi,
								name: source.filename,
								version: selectedversion
							};
						}
						return jsdoc;
					});
					r[extension] = r[extension].filter(function(jsdoc) {
						if (jsdoc && jsdoc.name && jsdoc.version && jsdoc.name === source.filename && !source.manifest) {
							//&& jsdoc.version === selectedversion && jsdoc.uri === source.url         ) {
							addFile = false;
							source.status += "Deleted entry in the manifest";
							return false;
						}
						return true;
					});
					// source.status += sStatus;
					if (addFile && source.manifest) {
						source.status += "Added new entry in the manifest";
						r[[extension]].push({
							uri: source.manifesturi,
							name: source.filename,
							version: selectedversion
						});
					}
				}
			});
			return JSON.stringify(m);
		}).then(function(changedMetadata) {
			return me.context.service.beautifierProcessor.beautify(changedMetadata, "json");
		}).then(function(sFormattedChange) {
			return me.manifest.setContent(sFormattedChange);
		}).then(function() {
			return me.manifest.save();
		});
	},
	createLibFolder: function(downloadpath) {
		// return this.context.service.content.getCurrentDocument().then(function(document) {
		return this.getSelection().getProject().then(function(project) {
			return project.createFolder("webapp/" + downloadpath);
		});
	},
	createFile: function(downloadpath, file, content) {
		var me = this;
		// return this.context.service.content.getCurrentDocument().then(function(document) {
		return this.getSelection().getProject().then(function(project) {
			return project.createFolder("webapp/" + downloadpath);
		}).catch(function(error) {
			file.downloadstatus = false;
			file.status += "Error finding libs folder";
			//return file;
		}).then(function(folder) {
			me.folder = folder;
			return folder.getChild(file.filename);
		}).catch(function(error) {
			return me.folder.createFile(file.filename);
			// .then(function(newFile) {
			// 	return me._setFileContent(newFile, file, content);
			// });
		}).then(function(existsFile) {
			if (!existsFile) {
				return me.folder.createFile(file.filename);
			}
			return existsFile;
		}).then(function(existsFile) {
			me.existFile = existsFile;
			//return me._setFileContent(existsFile, file, content);
			return existsFile.setContent(content);
		}).then(function() {
			return me.existFile.save();
		}).then(function() {
			file.downloadstatus = true;
			file.status += "File created.";
			return file;
		}).catch(function(error) {
			file.downloadstatus = false;
			file.status += "Error adding content";
			return file;
		});
	},
	_setFileContent: function(document, file, content) {
		return document.setContent(content).fail(function(error) {
			file.downloadstatus = false;
			file.status += "Error adding content";
			return file;
		}).then(function() {
			return document.save();
		}).then(function() {
			file.downloadstatus = true;
			file.status += "File created.";
			return file;
		}).fail(function(error) {
			file.downloadstatus = false;
			file.status += "Error saving file";
			return file;
		});
	},
	getManifest: function() {
		var me = this;
		Array.prototype.flatten = function() {
			return this.reduce(function(prev, cur) {
				var more = [].concat(cur).some(Array.isArray);
				return prev.concat(more ? cur.flatten() : cur);
			}, []);
		};
		// return this.context.service.selection.getSelection().then(function(aSelection) { // get project content
		// 	if (aSelection && aSelection.length !== 0 && aSelection[0]) {
		// 		return aSelection[0].document.getProject().then(function(project) {
		// 			return me.getManifestFile(project);
		// 		});
		// 	}
		// });

		// return this.context.service.content.getCurrentDocument().then(function(document) {
		return this.getSelection().getProject().then(function(project) {
			return me.getManifestFile(project);
		}).then(function(files) {
			var flatFiles = files.flatten();
			var oFile = undefined;
			flatFiles.forEach(function(file) {
				if (file) {
					oFile = file;
				}
			});
			if(oFile){
				return oFile;
			}
			throw {
				message: "Could not found manifest.js"
			};
		});
	},
	getManifestFile: function(folder) {
		var me = this;
		var folders = [];
		return folder.getFolderContent().then(function(content) {
			for (var i = 0; i < content.length; i++) {
				var item = content[i];
				if (item.getType() === "folder") {
					//repeat
					folders.push(me.getManifestFile(item)); //item.getFolderContent());
					//me.getFiles(item,callback);
				} else {
					var entity = item.getEntity();
					if (entity.getFullPath().toUpperCase().indexOf('WEBAPP') >= 0 && entity.getName() === "manifest.json") {
						return item;
					}
				}
			}
			if (folders && folders.length > 0) {
				return Promise.all(folders);
				// .then(function(values) {
				// 	return values;
				// });
			}
			return false;
		});
	}
});