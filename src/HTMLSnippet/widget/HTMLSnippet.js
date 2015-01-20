/*jslint white: true nomen: true plusplus: true */
/*global mx, mxui, mendix, dojo, require, console, define, module */
/**

	HTMLSnippet
	========================

	@file      : HTMLSnippet.js
	@version   : 1.0
	@author    : ...
	@date      : Tuesday, January 20, 2015
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Describe your widget here.

*/

(function () {
    'use strict';

    // test
    require([

        'mxui/widget/_WidgetBase', 'dijit/_Widget',
        'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/on', 'dojo/_base/lang', 'dojo/_base/declare', 'dojo/text'

    ], function (_WidgetBase, _Widget, domMx, dom, domQuery, domProp, domGeom, domClass, domStyle, on, lang, declare, text) {

        // Declare widget.
        return declare('HTMLSnippet.widget.HTMLSnippet', [_WidgetBase, _Widget], {
                        
            postCreate: function () {
                switch (this.contenttype) {
                case 'html':
                    dojo.style(this.domNode, {
                        'height': 'auto',
                        'width': '100%',
                        'outline': 0
                    });
                    dojo.attr(this.domNode, 'style', this.style); //might override height and width
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

                this.actLoaded();
            }
        });
    });

}());