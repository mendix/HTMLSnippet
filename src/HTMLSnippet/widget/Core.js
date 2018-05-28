import {
    defineWidget,
    log,
    runCallback,
    execute,
} from 'widget-base-helpers';

import LinkPane from 'dijit/layout/LinkPane';

import { set as setHtml } from 'dojo/html';
import { set as setStyle } from 'dojo/dom-style';
import { set as setAttr } from 'dojo/dom-attr';
import { create, place } from 'dojo/dom-construct';

import jQuery from 'jquery'; // eslint-disable-line no-unused-vars

export default defineWidget('Core', false, {

    // Set in the modeler
    contenttype: 'html',
    contents: '',
    contentsPath: '',
    contentsMF: '',
    onclickmf: '',
    documentation: '',
    refreshOnContextChange: false,
    refreshOnContextUpdate: false,
    encloseHTMLWithDiv: true,

    // Internal properties
    _preText: '',
    contextObj: null,

    constructor() {
        this.log = log.bind(this);
        this.runCB = runCallback.bind(this);
        this.execute = execute.bind(this);
    },

    postCreate() {
        this.log('postCreate', this._WIDGET_VERSION);

        this._setupEvents();

        this.$ = jQuery;

        if (!this.refreshOnContextChange) {
            this.executeCode();
        }
    },

    executeCode() {
        this.log('executeCode');

        const isExternal = '' !== this.contentsPath;

        switch(this.contenttype) {
        case 'html':

            if (isExternal) {

                const panel = new LinkPane({
                    preload: true,
                    loadingMessage: '',
                    href: this.contentsPath,
                    onDownloadError: () => {
                        console.error(this.id + ` :: Error loading html path '${this.contentsPath}'`);
                    },
                });
                panel.placeAt(this.domNode.id).startup();

            } else if (!this.encloseHTMLWithDiv) {

                setHtml(this.domNode, this.contents);

            } else {

                setStyle(this.domNode, {
                    'height': 'auto',
                    'width': '100%',
                    'outline': 0,
                });

                setAttr(this.domNode, 'style', this.style);

                const domNode = create('div', {
                    innerHTML: this.contents,
                });

                place(domNode, this.domNode, 'only');

            }
            break;
        case 'js':
        case 'jsjQuery':
        default:

            if (isExternal) {
                const scriptNode = document.createElement('script');
                const intDate = +new Date();

                scriptNode.type = 'text/javascript';
                scriptNode.src = this.contentsPath + '?v=' + intDate.toString();

                place(scriptNode, this.domNode, 'only');
            } else {
                if ('jsjQuery' === this.contenttype) {
                    this._preText = 'var jQuery, $; jQuery = $ = this.$;';
                } else {
                    this._preText = '';
                }
                this.evalJS();
            }

            break;
        }
    },

    update(obj, cb) {
        this.log('update');

        this.contextObj = obj;

        if (this.refreshOnContextChange) {
            this.executeCode();

            if (this.refreshOnContextUpdate) {
                this.unsubscribeAll();

                if (obj) {
                    this.subscribe({
                        guid: obj.getGuid(),
                        callback: () => {
                            this.executeCode();
                        },
                    });
                }
            }
        }

        this.runCB(cb, 'update');
    },

    _setupEvents() {
        this.log('_setupEvents');

        if (this.onclickmf) {
            this.connect(this.domNode, 'click', this._executeMicroflow);
        }
    },

    _executeMicroflow() {
        this.log('_executeMicroflow');

        if (this.onclickmf) {
            this.execute(this.onclickmf, null !== this.contextObj ? this.contextObj.getGuid() : null);
        }
    },

    _getJSString() {
        this.log('_getJSString');

        return this._preText + this.contents + '\r\n//# sourceURL=' + this.id + '.js';
    },

    evalJS() {
        this.log('evalJS');

        try {
            eval(this._getJSString()); // eslint-disable-line no-eval
        } catch (error) {
            place('<div class="alert alert-danger">Error while evaluating javascript input: ' + error + '</div>', this.domNode, 'only');
        }
    },

});
