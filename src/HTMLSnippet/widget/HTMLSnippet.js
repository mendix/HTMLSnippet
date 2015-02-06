/*jslint white: true, nomen: true, plusplus: true */
/*global mx, mxui, mendix, dojo, require, console, define, module */

require([
	'dojo/_base/declare', 'mxui/widget/_WidgetBase',
	'mxui/dom', 'dojo/dom-style', 'dojo/dom-attr', 'dojo/html'
], function (declare, _WidgetBase, dom, domStyle, domAttr, html) {
	
	'use strict';

	// Declare widget.
	return declare('HTMLSnippet.widget.HTMLSnippet', [_WidgetBase], {

		constructor: function () {
		},
		
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
					html.set(this.domNode, this.contents);
					break;
				case 'js':
					try {
						eval(this.contents);
					} catch (e) {
						html.set(this.domNode, "Error while evaluating JavaScript: " + e);
					}
					break;
			}
		}
	});
});
