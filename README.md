# HTMLSnippet

This widget is useful to add a piece of HTML or JavaScript to a form. For example to embed a YouTube or Flash object. Furthermore it can be used to enhance styling by adding arbitrary HTML elements.

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://docs.mendix.com/howto7/collaboration-project-management/contribute-to-a-github-repository)!

## Typical usage scenario

- Display a predefined HTML document
- Load a Java Applet
- Manipulate the styling using JavaScript rather than theming.

## Features and limitations

- Embed raw HTML
- Embed raw JavaScript
- Load external HTML / JS file

## Dependencies

- Mendix 5.x environment

## Properties

- **Content Type [ HTML, JavaScript, JavaScript with jQuery ] :**
  Select how the snippet should be rendered. The JavaScript with jQuery option will make sure that your code can leverage [jQuery v3.3.1](https://blog.jquery.com/2018/01/20/jquery-3-3-1-fixed-dependencies-in-release-tag/) for example:

```js
//e.g. this code snippet will set the color of all your paragraph tags on the page to red.
$('p').css('color', 'red')
// or
jQuery('p').css('color', 'red')
```

- **Contents :**
  The HTML or Javascript to embed.
- **External File :**
  The path to the HTML or JavaScript file you want to add. The root is the theme folder. Will override the Contents section if used.
- **On click microflow :**
  The microflow which should be executed on click. This can be used to, for example, show a page when the snippet is being clicked.
- **Documentation :**
  Documentation of this widget. Should explain its purpose.
- **Refresh on context change:**
  Refresh when the context changes
- **Refresh on context update:**
  Refresh when the context updates (works only when context change is true)
- **Enclose HTML with DIV:**
  When adding HTML, the widget will wrap it with a DIV. If this is set to false, it will just replace the content of the widget. (For compatibility purposes this is set true on default)
