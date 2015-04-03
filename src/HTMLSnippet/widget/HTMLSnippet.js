/*jslint white: true, nomen: true, plusplus: true */
/*global mx, mxui, mendix, dojo, require, console, define, module */

require([
	'dojo/_base/declare', 'mxui/widget/_WidgetBase',
	'mxui/dom', 'dojo/dom-style', 'dojo/dom-attr', 'dojo/dom-construct', 'dijit/layout/LinkPane'
], function (declare, _WidgetBase, dom, domStyle, domAttr, domConstruct, linkPane) {
	
	'use strict';

	// Declare widget.
	return declare('HTMLSnippet.widget.HTMLSnippet', [_WidgetBase], {

		constructor: function () {
		},
		
		// dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
		postCreate: function () {
			console.log(this.id + '.postCreate');

            var external = this.contentsPath != '' ? true : false;
            
            switch (this.contenttype) {
				case 'html':

                    if (external)
                    {
                        new linkPane(
                        {
                            preload: true,
                            loadingMessage: "",
                            href: this.contentsPath,
                            onDownloadError: function(){ console.log("Error loading html path");}
                        }).placeAt(this.domNode.id).startup();
                    }
                    else
                    {
                        domStyle.set(this.domNode, {
                            'height': 'auto',
                            'width': '100%',
                            'outline': 0
                        });

                        domAttr.set(this.domNode, 'style', this.style); // might override height and width
                        domConstruct.place(this.contents, this.domNode, "only"); 
                    }
                    
					break;
				case 'js':
                
                    if (external)
                    {
                        var scriptNode = document.createElement("script"),
                            intDate = +new Date();
                        
                        scriptNode.type = "text/javascript";    
                        scriptNode.src = this.contentsPath + "?v=" + intDate.toString();
                        
                        domConstruct.place(scriptNode, this.domNode, "only");
                    }
                    else
                    {
                        try {
                            eval(this.contents);
                        } catch (e) {
                            domConstruct.place("Error while evaluating JavaScript: " + e, this.domNode, "only");
                        }
                    }
					break;
			}
		}
	});
});
