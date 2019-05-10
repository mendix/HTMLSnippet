/*jslint -W061:false*/
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/html",
    "dijit/layout/LinkPane"
], function (
    declare,
    _WidgetBase,
    domStyle,
    domAttr,
    domConstruct,
    lang,
    html,
    LinkPane
) {
    "use strict";

    return declare("HTMLSnippet.widget.HTMLSnippet", [_WidgetBase], {
        // Set in Modeler
        contenttype: "html",
        contents: "",
        contentsPath: "",
        onclickmf: "",
        documentation: "",
        refreshOnContextChange: false,
        refreshOnContextUpdate: false,
        encloseHTMLWithDiv: true,

        // Internal
        _objectChangeHandler: null,
        contextObj: null,

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._setupEvents();

            if (!this.refreshOnContextChange) {
                this.executeCode();
            }
        },

        executeCode: function () {
            logger.debug(this.id + ".executeCode");
            var external = this.contentsPath !== "" ? true : false;
            switch (this.contenttype) {
                case "html":
                    if (external) {
                        new LinkPane({
                                preload: true,
                                loadingMessage: "",
                                href: this.contentsPath,
                                onDownloadError: function () {
                                    console.log("Error loading html path");
                                }
                            })
                            .placeAt(this.domNode.id)
                            .startup();
                    } else if (!this.encloseHTMLWithDiv) {
                        html.set(this.domNode, this.contents);
                    } else {
                        domStyle.set(this.domNode, {
                            height: "auto",
                            width: "100%",
                            outline: 0
                        });

                        domAttr.set(this.domNode, "style", this.style); // might override height and width
                        var domNode = domConstruct.create("div", {
                            innerHTML: this.contents
                        });
                        domConstruct.place(domNode, this.domNode, "only");
                    }
                    break;

                case "js":
                case "jsjQuery":
                    if (external) {
                        var scriptNode = document.createElement("script"),
                            intDate = +new Date();

                        scriptNode.type = "text/javascript";
                        scriptNode.src =
                            this.contentsPath + "?v=" + intDate.toString();

                        domConstruct.place(scriptNode, this.domNode, "only");
                    } else {
                        if (this.contenttype === "jsjQuery") {
                            this._evalJQueryCode();
                        } else {
                            this.evalJs();
                        }
                    }
                    break;
            }
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this.contextObj = obj;
            if (this.refreshOnContextChange) {
                this.executeCode();

                if (this.refreshOnContextUpdate) {
                    if (this._objectChangeHandler !== null) {
                        this.unsubscribe(this._objectChangeHandler);
                    }
                    if (obj) {
                        this._objectChangeHandler = this.subscribe({
                            guid: obj.getGuid(),
                            callback: lang.hitch(this, function () {
                                this.executeCode();
                            })
                        });
                    }
                }
            }

            this._executeCallback(callback, "update");
        },

        _setupEvents: function () {
            logger.debug(this.id + "._setupEvents");
            if (this.onclickmf) {
                this.connect(
                    this.domNode,
                    "click",
                    this._executeMicroflow
                );
            }
        },

        _executeMicroflow: function () {
            logger.debug(this.id + "._executeMicroflow");
            if (this.onclickmf) {
                var params = {};
                if (this.contextObj !== null) {
                    params.applyto = "selection";
                    params.guids = [this.contextObj.getGuid()];
                }
                mx.ui.action(
                    this.onclickmf, {
                        params: params,
                        callback: function (obj) {
                            logger.debug(
                                this.id + " (executed microflow successfully)."
                            );
                        },
                        error: function (error) {
                            logger.error(this.id + error);
                        }
                    },
                    this
                );
            }
        },

        evalJs: function () {
            logger.debug(this.id + ".evalJS");
            try {
                eval(this.contents + "\r\n//# sourceURL=" + this.id + ".js");
            } catch (error) {
                this._handleError(error);
            }
        },

        _evalJQueryCode: function () {
            logger.debug(this.id + "._evalJQueryCode");
            /*** load jQuery ***/
            require(["HTMLSnippet/lib/jquery-3.3.1"], lang.hitch(this, function (jquery_3_3_1) {
                try {

                    (function (snippetCode) {

                        /**
                         *  user's are get used to or might expect to have jQuery available globaly
                         *  and they will write their code according to that, and since we, in this widget, don't expose 
                         *  jQuery globaly, we'll check user's code snippet if there is any attemption to access jQuery 
                         *  from the global scope ( window ). 
                         */
                        var jqueryIdRegex1 = /window.\jQuery/g;
                        var jqueryIdRegex2 = /window.\$/g;
                        snippetCode = snippetCode.replace(jqueryIdRegex1, 'jQuery');
                        snippetCode = snippetCode.replace(jqueryIdRegex2, '$');

                        snippetCode = "var jQuery, $; jQuery = $ = this.jquery;" + // make this jQuery version only accessible and availabe in the scope of this anonymous function
                            snippetCode +
                            "console.debug('your code snippet is evaluated and executed against JQuery version:'+ this.jquery.fn.jquery);";
                        eval(snippetCode);
                    }).call({
                        jquery: jquery_3_3_1 // pass JQuery as the context of the immediate function which will wrap the code snippet
                    }, this.contents); // pass the code snippet as an arg
                } catch (error) {
                    this._handleError(error);
                }
            }));
        },


        _handleError: function (error) {
            logger.debug(this.id + "._handleError");
            domConstruct.place(
                '<div class="alert alert-danger">Error while evaluating javascript input: ' +
                error +
                "</div>",
                this.domNode,
                "only"
            );
        },

        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["HTMLSnippet/widget/HTMLSnippet"]);
