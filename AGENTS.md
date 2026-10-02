# HTMLSnippet: agent knowledge base

Context for any agent continuing work in this repository. Written 2026-10-02 from reading the code and docs listed under [Sources](#sources). Statements marked **unverified** were derived from reading code or docs and have not been run in a Mendix app.

## 1. What this repository is

A legacy Mendix **Dojo** widget, "HTML / JavaScript Snippet", version 3.10.0. It is being replaced, not extended:

| HTMLSnippet function | Replacement |
| --- | --- |
| Display an HTML snippet | **HTML Element** pluggable widget (`html-element-web`) |
| Run a JavaScript snippet | **JavaScript action** in Studio Pro, called from a **nanoflow**, triggered on page load by the **Events** pluggable widget (`events-web`) |

Treat work here as migration toward those targets, not feature work on the Dojo widget.

## 2. Repository layout

```
src/package.xml                         clientModule manifest, lists both widget XMLs
src/HTMLSnippet/HTMLSnippet.xml         widget definition, needsEntityContext="false"
src/HTMLSnippet/HTMLSnippetContext.xml  same properties, needsEntityContext="true"
src/HTMLSnippet/widget/HTMLSnippet.js   all logic (217 lines)
src/HTMLSnippet/widget/HTMLSnippetContext.js  empty subclass of HTMLSnippet
webpack.config.js / webpack.config.dev.js     webpack 4 build
test/Test.mpr                           Mendix test project
xsd/widget.xsd                          widget XML schema
```

- Module format: AMD `define` + `dojo/_base/declare`, extends `mxui/widget/_WidgetBase`.
- Build: `npm run build` (webpack 4, AMD output). `dojo/`, `dijit/`, `mxui/`, `mendix/` are externals. Output is zipped to `dist/<version>/HTMLSnippet.mpk`.
- Dependencies: `jquery ~3.5.1` (bundled, not global), `core-js` (promise polyfill).
- `.nvmrc` says Node 12.
- There are no tests, no lint script, no TypeScript and no changelog file. The last commit is from January 2025.

## 3. Widget configuration

Two widgets share one implementation and the same eight properties:

- **HTMLSnippet**: needs no context, can be placed anywhere.
- **HTMLSnippet with Context**: must be inside a data view or list view and receives that object as `contextObj`.

| Property (key) | Type, default | What it does |
| --- | --- | --- |
| Content Type (`contenttype`) | enum, `html` | `html`, `js` or `jsjQuery` |
| Contents (`contents`) | multiline string, empty | Inline HTML or JavaScript text |
| External File (`contentsPath`) | string, empty | Path to an HTML or JS file relative to the theme folder. If set, `contents` is ignored |
| On click microflow (`onclickmf`) | microflow, optional | Microflow run when the user clicks the widget |
| Documentation (`documentation`) | multiline string | Developer note, never read at runtime |
| Refresh on context change (`refreshOnContextChange`) | boolean, `false` | Run the content once at creation (`false`) or each time the widget receives its context (`true`) |
| Refresh on context update (`refreshOnContextUpdate`) | boolean, `false` | Re-run when the context object changes. Only works if the previous option is `true` |
| Enclose HTML with DIV (`encloseHTMLWithDiv`) | boolean, `true` | Whether inline HTML gets an extra wrapper `div` |

The standard Studio Pro properties (name, class, style) also apply.

### Behavior per content type

**`html`**

- Inline, enclose on: creates a `div` with `innerHTML = contents` and replaces the widget content with it. The widget node gets the Studio Pro `style` value.
- Inline, enclose off: sets the content directly on the widget node (`dojo/html.set`).
- External file: loaded through `dijit/layout/LinkPane` into the widget node. The enclose option is not used.

**`js`**

- Inline: `eval(contents)` inside a widget method, so `this` in the snippet is the widget (`this.domNode`, `this.contextObj`, `this.subscribe`, `this.connect`, ...). A `sourceURL` comment is appended so the code appears in devtools as `<widgetId>.js`.
- External file: a `<script src="path?v=<timestamp>">` tag is placed in the widget node.

**`jsjQuery`**

- Inline: loads the bundled jQuery, then `eval`s the snippet with local `$` and `jQuery`. jQuery is not put on `window`; `window.jQuery` and `window.$` in the snippet text are rewritten to the local names.
- `this` differs from `js` mode: `this.jquery` is jQuery and `this.widget` is the widget.
- External file: same script tag as `js` mode, so no scoped jQuery is provided.

**Errors:** an exception in inline JS replaces the widget content with an `alert alert-danger` box showing the error.

### Timing

- `refreshOnContextChange = false`: content runs once in `postCreate`. The context object is not available yet.
- `refreshOnContextChange = true`: content does not run in `postCreate`; it runs in `update`, each time Mendix hands the widget its context object. Required if the snippet uses `contextObj`.
- `refreshOnContextUpdate = true` (with the previous option on): also subscribes to the object's guid and re-runs the content on each change. The old subscription is removed when the context switches.
- Every re-run executes the whole snippet again, so snippets that add listeners add them again.

### Click microflow

- The click handler is attached to the widget node at creation, for any content type.
- It calls the microflow through `mx.data.action` and passes the context object if there is one.
- There is no nanoflow option and no other event.

## 4. Background: pluggable widgets

The modern widget model, as used in the [mendix/web-widgets](https://github.com/mendix/web-widgets) monorepo:

- A React function component in TypeScript. The widget XML has `pluginWidget="true"`, and props typings are generated from the XML into `typings/*Props.d.ts`.
- Data arrives as props (`DynamicValue`, `EditableValue`, `ActionValue`, `ListValue`, `ListExpressionValue`, `ListWidgetValue`). There is no `mx.data.*` call and no manual subscribe; new props cause a re-render.
- Actions: check `canExecute`, then call `execute()`.
- Studio Pro integration: `*.editorConfig.ts` (`getProperties`, `check`, structure preview) and `*.editorPreview.tsx`.
- Tooling: `@mendix/pluggable-widgets-tools` (Rollup), pnpm + Turbo, Node 24+, Jest + React Testing Library, Playwright for E2E.
- Conventions: package folder `<name>-web`, widget id `com.mendix.widget.web.<name>.<Name>`, lowerCamelCase XML keys that match the props exactly, per-package `CHANGELOG.md`, conventional commits.

## 5. Replacement for HTML: HTML Element widget

[`packages/pluggableWidgets/html-element-web`](https://github.com/mendix/web-widgets/tree/main/packages/pluggableWidgets/html-element-web) in mendix/web-widgets, v1.2.12, minimum Mendix 9.12.

| | HTMLSnippet | HTML Element |
| --- | --- | --- |
| HTML content | static string, raw `innerHTML` | text template or expression, sanitized with DOMPurify (configurable JSON) |
| JavaScript | `eval`, optional jQuery | none; the `script` tag is disabled |
| External file | yes | no |
| Events | click to microflow only | any React event to any action, with stop-propagation and prevent-default flags |
| Context | separate Context widget, manual subscribe | reactive props, optional repeat over a data source |
| Child widgets | no | yes (`widgets` property) |
| Attributes | `style` only | arbitrary attribute list |

Consequences for migration:

- Inline `<script>` and event-handler attributes that worked in HTMLSnippet are stripped by the sanitizer.
- `onclickmf` maps to an `onClick` event action.
- External HTML files (`contentsPath`) have no equivalent.

## 6. Replacement for JavaScript: JavaScript actions

### What a JavaScript action is

- Callable **only from nanoflows**, through the "Call JavaScript Action" activity. Arguments are expressions; the return value can be stored in a variable.
- One file per action: `javascriptsource/<module>/actions/<Name>.js`, with a skeleton generated by Studio Pro.
- Only three parts of that file survive regeneration: the import list, the `// BEGIN EXTRA CODE` block, and the `// BEGIN USER CODE` block inside the exported async function.
- Parameter types: Object and List (`MxObject`), Entity (string), Nanoflow and Microflow (async functions the action can call), Boolean, Date and Time (`Date`), Decimal and Integer/Long (`Big`), Enumeration (string), String. An optional parameter that is not supplied arrives as `undefined`.
- Return: any parameter type or Nothing. The action may return a Promise and the nanoflow waits for it.
- Platform: All, Web or Native. It restricts the nanoflow that uses the action.
- "Expose as nanoflow action" (caption + category) puts the action in the nanoflow toolbox.
- External libraries: `npm install` inside the module's `actions` folder, then `import`.
- An uncaught error stops the nanoflow.
- Documented bad practices: do not use Dojo, Dijit or jQuery; do not render permanent DOM from an action, because the client re-renders and drops the changes. Rendering belongs in a pluggable widget.

### mxcli (MDL)

`mxcli` v0.24.0 is a CLI that reads and writes `.mpr` files with MDL. It is alpha quality, and the `.mpr` must be closed in Studio Pro before writes. `mxcli syntax javascript-action` gives:

```
SHOW JAVASCRIPT ACTIONS [IN Module];
DESCRIBE JAVASCRIPT ACTION Module.Name;
CREATE [OR MODIFY] JAVASCRIPT ACTION Module.Name [FOLDER 'path'](Param: Type [NOT NULL], ...)
  RETURNS Type [EXPOSED AS 'Caption' IN 'Category'] [PLATFORM Web|Native|Hybrid|All]
  AS $$ ...user code... $$;
DROP JAVASCRIPT ACTION Module.Name;
```

- It writes the model unit and the `.js` file together. `AS $$ ... $$` is mandatory. Platform defaults to Web.
- Calling it from a nanoflow: `$Ok = CALL JAVASCRIPT ACTION Module.Name (Param = value);`. This form is not in the syntax reference.

Tried on a scratch copy of `test/Test.mpr` (2026-10-02); the results were read back with mxcli only, never opened in Studio Pro or run:

- `DESCRIBE PAGE` lists each instance as `pluggablewidget 'HTMLSnippet.widget.HTMLSnippet' <name> (contenttype: ..., contents: '...', contentsPath: ...)`, so snippet code can be read. Empty properties are omitted.
- `CREATE JAVASCRIPT ACTION` and a `CREATE NANOFLOW` containing `CALL JAVASCRIPT ACTION` both executed, and the `.js` file was generated under `javascriptsource/<module lowercase>/actions/`.
- Placing the Events widget fails the check with MDL-WIDGET25 until the Events `.mpk` is in the project's `widgets/` folder. In a project that has it, the widget is written by its MDL name `events` and `onComponentLoad` takes `NANOFLOW Module.Name`; see section 8.
- `test/Test.mpr` is a Mendix 7.23.10 project and every `contents` value in it is empty, so it holds no real snippet to migrate. It is too old for pluggable widgets; use a newer project for an end-to-end proof.

### Trigger: Events widget

[`packages/pluggableWidgets/events-web`](https://github.com/mendix/web-widgets/tree/main/packages/pluggableWidgets/events-web) in mendix/web-widgets, v1.3.1, minimum Mendix 9.24, web only, offline capable.

The intended chain is **Events widget → nanoflow → Call JavaScript Action**. It works by design: `onComponentLoad` is a plain `action` property, so "Call a nanoflow" can be selected, and the widget only calls `execute()`. The chain has been built in a real project with mxcli and confirmed at runtime (section 8).

Properties:

- **Component load**: `onComponentLoad` action, delay (number or expression, default 0 ms), optional repeat with interval (default 30000 ms).
- **On change**: `onEventChangeAttribute` plus `onEventChange` action and a delay; fires when the watched attribute's value changes after first load.

Behavior:

- It fires when the widget **mounts**, not on browser page load. It goes through `setTimeout(delay)` and then waits until the action's `canExecute` is true.
- It runs once per mount. Navigating away and back, or toggling conditional visibility, remounts the widget and fires again.
- With repeat on, the next run waits until the previous one has finished.
- Inside a data view, the context object can be passed as a nanoflow parameter, and from there to an Object parameter of the JavaScript action.
- The widget renders an empty `div.widget-events`. It has no "on unload" action; on unmount it only stops its own timer.

### Mapping

| HTMLSnippet | Replacement |
| --- | --- |
| `contenttype: js` | JavaScript action + nanoflow + Events widget |
| `contenttype: jsjQuery` | Same; jQuery must be npm-installed in the actions folder or the code rewritten |
| run on `postCreate` | Events `onComponentLoad`, delay 0 |
| `contextObj` in the snippet | Object parameter on the JavaScript action |
| `refreshOnContextUpdate` | Partial: Events `onEventChange` watches one attribute, not the whole object |
| `refreshOnContextChange` | Unclear. After the first run the Events timer state is "completed", so it does not fire again unless the client remounts the widget when the data view object changes. **Needs a test** |
| cleanup on destroy | None |
| `contentsPath` external JS file | None; move the code into the action or import it as a module |

## 7. Difficulty of converting a JavaScript snippet

Moving the code text is easy. The difficulty is that a snippet lives on the page as a widget, while an action is a detached function in a nanoflow. Hardest first:

1. **Lifecycle and cleanup.** A snippet could register teardown through the widget. An action runs once and returns, with no unmount hook, so listeners, timers and observers leak across page navigation.
2. **DOM work.** Snippets often write into `this.domNode` or patch other widgets. An action has no node of its own, and the React client drops foreign DOM changes on re-render. These snippets need a pluggable widget or HTML Element instead.
3. **Timing.** Mounting the Events widget does not guarantee that sibling widgets have rendered, so snippets that query the page DOM may race. A delay value is guesswork.
4. **Scope.** `this.contextObj`, `this.domNode`, `this.id`, `this.subscribe` and `this.connect` are gone. The context object becomes an explicit parameter; the rest must be rewritten.
5. **Legacy APIs.** `mx.data.*`, `mx.ui.*`, Dojo/Dijit `require` and jQuery must be ported to `mx-api` imports or plain DOM.
6. **Static text to parameters.** Snippet content is fixed text per widget instance with values baked in. Each distinct snippet becomes its own action or must be generalized by hand.
7. **External files.** Script-tag loading from the theme folder has no action equivalent.
8. **Semantics.** A snippet is sloppy-mode `eval`; an action is a strict, async ES module where `return` is meaningful and errors abort the nanoflow.
9. **No automation path.** Snippet code is free text in a widget property inside the `.mpr`. Finding instances is feasible with mxcli; converting each one needs human judgment.

Rough sizing:

- **Easy:** fire-and-forget snippets (analytics call, set `document.title`, logging, API call).
- **Medium:** snippets that use the context object, `mx.data` or jQuery.
- **Hard, or wrong target:** snippets that render DOM, attach listeners, patch other widgets or load a third-party UI library. These belong in a pluggable widget.

## 8. Migration procedure with mxcli (done once)

On 2026-10-02 one JavaScript snippet was converted in a real project: `~/Mendix/TestAppLTS1024-main` (Mendix 10.24.24, HTML Element and Events widgets already installed). The snippet was a three-line "append `<div>Hello World</div>` to `body`" on page `MyFirstModule.Home_Web`. The result was read back with mxcli, then the user ran the app from Studio Pro and it was checked in Chrome at `http://localhost:8080/`:

- exactly one `<div>Hello World</div>`, as the last child of `body`;
- one `div.widget-events.mx-name-events1` on the page, no HTMLSnippet node;
- no console errors or warnings.

So the Events → nanoflow → JavaScript action chain works at runtime for a fire-and-forget snippet.

### Steps

1. **Check that the project is closed in Studio Pro.** An open project has `<Name>.mpr.lock` next to the `.mpr`. Do not write while it exists; ask the user to close the project. Reading is fine, but shows only what was last saved.
2. **Inventory.** `SHOW PAGES;` then `DESCRIBE PAGE Module.Page;` for each page. In a project where the widget is installed, an instance appears under the MDL name `htmlsnippet`:

    ```
    htmlsnippet hTMLSnippet1 (
      contenttype: 'js',
      contents: 'var div = ...',
      refreshOnContextChange: false,
      refreshOnContextUpdate: false,
      encloseHTMLWithDiv: true
    )
    ```

    Snippets (`SHOW SNIPPETS`) and layouts can hold instances too. `grep -l HTMLSnippet mprcontents -r` does not find them, because units are binary.
3. **Write the MDL script** (template below) and validate it without writing: `mxcli check script.mdl -p App.mpr`.
4. **Dry run on a copy.** `rsync` the project without `deployment`, `.git`, `.mendix-cache` and `*.lock` to a scratch folder and run `mxcli -p App.mpr exec script.mdl` there.
5. **Back up** `App.mpr`, `mprcontents/` and `javascriptsource/`, then run the same `exec` on the real project.
6. **Verify.** `DESCRIBE PAGE` no longer contains `htmlsnippet`; the `.js` file exists under `javascriptsource/<module lowercase>/actions/`.
7. **Hand over to the user:** open in Studio Pro, check for consistency errors, run the app.
8. **Check at runtime** with the Chrome DevTools MCP tools: open the page, evaluate a script that looks for the snippet's effect and for `.widget-events`, and list console errors.

`DESCRIBE WIDGET 'com.mendix.widget.web.events.Events';` lists a widget's properties and an MDL example that parses. Use it instead of guessing property names.

### Template that worked

```
CREATE JAVASCRIPT ACTION MyFirstModule.JS_Home_Web_Snippet() RETURNS Boolean
PLATFORM Web
AS $$
var div = document.createElement("div");
div.textContent = "Hello World";
document.body.appendChild(div);
return true;
$$;

CREATE NANOFLOW MyFirstModule.ACT_Home_Web_Snippet_OnLoad ()
BEGIN
  CALL JAVASCRIPT ACTION MyFirstModule.JS_Home_Web_Snippet ();
END;

GRANT EXECUTE ON NANOFLOW MyFirstModule.ACT_Home_Web_Snippet_OnLoad TO MyFirstModule.User;

ALTER PAGE MyFirstModule.Home_Web {
  REPLACE hTMLSnippet1 WITH {
    events events1 (
      onComponentLoad: NANOFLOW MyFirstModule.ACT_Home_Web_Snippet_OnLoad,
      componentLoadDelayParameterType: 'number',
      componentLoadDelay: 0,
      componentLoadRepeat: false,
      onEventChangeDelayParameterType: 'number',
      onEventChangeDelay: 0
    )
  };
};
```

Notes on the template:

- MDL requires a return type. `Boolean` with `return true;` was used; a "Nothing" return type was not tried.
- The grant must name every module role that can view the page.
- `REPLACE` puts the Events widget in the same position as the old widget.
- The script does not remove `HTMLSnippet.mpk` from the project's `widgets/` folder. While the file is there, the widget code stays in the app bundle.

### Limits of this proof

- Only one trivial, fire-and-forget snippet was converted. No snippet using `contextObj`, jQuery, `mx.data`, `this.domNode` or `contentsPath` has been migrated.
- HTML-mode conversion to HTML Element with mxcli has not been tried. `mxcli syntax page widget-any` shows the MDL shape (`htmlelement name (tagName: 'div') { ... }`).

## 9. Security scan finding (CWE-95)

A customer's Semgrep scan reported CWE-95 (code injection through dynamically evaluated code), severity High, in `HTMLSnippet.js`, `HTMLSnippetContext.js` and `widgets.js`. Assessment from the code:

- The finding is the two `eval` calls in `src/HTMLSnippet/widget/HTMLSnippet.js` (lines 163 and 188). `HTMLSnippetContext.js` has no `eval` in source, but its built bundle includes `HTMLSnippet.js`; `widgets.js` is the app's combined widget bundle. Three files, one finding.
- It is by design: the widget's JavaScript function is to evaluate text the developer typed in Studio Pro.
- It is not exploitable through the widget itself. The evaluated value is `contents`, a design-time `string` property. It is not an attribute, expression or text template, and the context object is never concatenated into it. Before 3.9.10 the property was `translatableString`, so translations could alter it.
- No patched version exists or is possible: removing `eval` removes the feature. The fix is migration (sections 5 to 8) and deleting the widget from the project.
- No configuration removes the finding. With content type `html` the `eval` never runs, but the code is still in the bundle.
- `eval` forces `unsafe-eval` in the Content Security Policy.
- HTML mode uses unsanitized `innerHTML` with the same static developer text; a scanner may report it as CWE-79.

Suppressing the finding is defensible as **accepted risk, by design**, not as a false positive, and only if: each snippet's own code is reviewed for untrusted input; `contentsPath` files are not writable at runtime; the widget is 3.9.10 or later; the suppression is scoped to these files; the CSP impact is accepted; and the acceptance has a review date tied to migration. The customer owns that decision.

Not verified: whether `widgets.js` omits a widget that is installed but unused; the exact Semgrep rule and lines the customer saw; whether Mendix has published a deprecation or security statement for this widget.

## 10. Open items

- Check that the action runs again on page revisit (navigate away and back), as the old widget did.
- Test whether Events `onComponentLoad` fires again when the surrounding data view's object changes.
- Convert a snippet that uses the context object, and one in HTML mode, to extend the procedure.
- Decide what to offer for snippets that need cleanup or render DOM.
- No reusable migration tooling or user-facing guide has been written yet.

## Sources

The repositories below are public on GitHub. On the machine where this was written they were also checked out next to this repository (`../web-widgets`, `../docs`); clone them if they are missing.

- This repository: <https://github.com/mendix/HTMLSnippet>
- **web-widgets**, <https://github.com/mendix/web-widgets> (the pluggable widgets monorepo): `AGENTS.md`, `docs/repo-layout.md`, `docs/widget-scripts.md`, `docs/requirements/*.md`, `packages/pluggableWidgets/html-element-web`, `packages/pluggableWidgets/events-web`.
- **docs**, <https://github.com/mendix/docs> (Mendix documentation source):
  - `content/en/docs/refguide/modeling/resources/javascript-actions.md` (<https://docs.mendix.com/refguide/javascript-actions/>)
  - `content/en/docs/refguide/modeling/application-logic/microflows-and-nanoflows/activities/action-call-activities/javascript-action-call.md`
  - `content/en/docs/howto/extensibility/best-practices-javascript-actions.md`
- `mxcli syntax javascript-action`, `mxcli syntax microflow nanoflow`.
- User documentation for this widget: <https://docs.mendix.com/appstore/widgets/html-javascript-snippet>
