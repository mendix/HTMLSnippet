define([
    "dojo/_base/declare", "HTMLSnippet/widget/HTMLSnippet"
], function(declare, _htmlSnippetWidget) {
    return declare("HTMLSnippet.widget.HTMLSnippetOffline", [_htmlSnippetWidget], {
    })
});
require(["HTMLSnippet/widget/HTMLSnippetOffline"], function() {
    "use strict";
});
