/*jslint white: true nomen: true plusplus: true */
/*global mx, mxui, mendix, dojo, require, console, define, module */

require([
	'dojo/_base/declare', 'mxui/widget/_WidgetBase',
	'mxui/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-style',
	'dojo/dom-attr'
], function (declare, _WidgetBase, dom, domQuery, domProp, domStyle, domAttr) {
	
	'use strict';

	// Declare widget.
	return declare('HTMLSnippet.widget.HTMLSnippet', [_WidgetBase], {

		// dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
		postCreate: function () {
			console.log(this.id + '.postCreate');

			switch (this.contenttype) {
				case 'html':
					domStyle.set(this.domNode, {
						'height': 'auto',
						'width': '100%',
						'outline': 0
					});

					domAttr.set(this.domNode, 'style', this.style); //might override height and width
					this.domNode.innerHTML = this.contents;
					break;
				case 'js':
					try {
						eval(this.contents);
					} catch (e) {
						dojo.html.set(this.domNode, "Error while evaluating JavaScript: " + e);
					}
					break;
			}
		}
	});
});
