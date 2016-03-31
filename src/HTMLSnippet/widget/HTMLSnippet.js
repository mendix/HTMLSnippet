/*jslint white: true, nomen: true, plusplus: true */
/*global mx, mxui, mendix, dojo, require, console, define, module, document*/

require([
	"dojo/_base/declare",
	"mxui/widget/_WidgetBase",

	"mxui/dom",
	"dojo/dom-style",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/_base/lang",
	"dijit/layout/LinkPane"
], function(declare, _WidgetBase, dom, domStyle, domAttr, domConstruct, lang, linkPane) {
	"use strict";

	return declare("HTMLSnippet.widget.HTMLSnippet", [_WidgetBase], {

		postCreate: function() {
			this._setupEvents();

			if (!this.refreshOnContextChange) {
				this.executeCode();
			}
		},

		executeCode: function() {
			var external = this.contentsPath !== "" ? true : false;
			switch (this.contenttype) {
				case "html":
					if (external) {
						new linkPane({
							preload: true,
							loadingMessage: "",
							href: this.contentsPath,
							onDownloadError: function() {
								console.log("Error loading html path");
							}
						}).placeAt(this.domNode.id).startup();
					} else {
						domStyle.set(this.domNode, {
							"height": "auto",
							"width": "100%",
							"outline": 0
						});

						domAttr.set(this.domNode, "style", this.style); // might override height and width
						var domNode = domConstruct.create("div", { innerHTML: this.contents });
						domConstruct.place(domNode, this.domNode, "only");
					}
					break;

				case "js":
				case "jsjQuery":
					if (external) {
						var scriptNode = document.createElement("script"),
							intDate = +new Date();

						scriptNode.type = "text/javascript";
						scriptNode.src = this.contentsPath + "?v=" + intDate.toString();

						domConstruct.place(scriptNode, this.domNode, "only");
					} else {
						if (this.contenttype == "jsjQuery") {
							require(["HTMLSnippet/lib/jquery-1.11.3"], lang.hitch(this, this.evalJs));
						} else {
							this.evalJs();
						}
					}
					break;
			}
		},

		update: function(obj, callback) {
			if (this.refreshOnContextChange) {
				this.executeCode();
			}
			callback();
		},

		_setupEvents: function() {
			if (this.onclickmf) {
				this.connect(this.domNode, "click", this._executeMicroflow);
			}
		},

		_executeMicroflow: function() {
			if (this.onclickmf) {
				mx.data.action({
					store: {
						caller: this.mxform
					},
					params: {
						actionname: this.onclickmf
					},
					callback: function() {
						// ok
					},
					error: function() {
						// error
					}
				});
			}
		},

		evalJs: function() {
			try {
				eval(this.contents + "\r\n//# sourceURL=" + this.id + ".js");
			} catch (e) {
				domConstruct.place("<div class=\"alert alert-danger\">Error while evaluating javascript input: " + e + "</div>", this.domNode, "only");
			}
		}

	});
});
