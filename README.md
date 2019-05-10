# HTMLSnippet
This widget is useful to add a piece of HTML or JavaScript to a form. For example to embed a YouTube or Flash object. Furthermore it can be used to enhance styling by adding arbitrary HTML elements. 

## Contributing

For more information on contributing to this repository visit [Contributing to a GitHub repository](https://world.mendix.com/display/howto50/Contributing+to+a+GitHub+repository)!

## Typical usage scenario

* Display a predefined HTML document
* Load a Java Applet
* Manipulate the styling using JavaScript rather than theming.

## Features and limitations

 * Embed raw HTML
 * Embed raw JavaScript
 * Load external HTML / JS file

## Dependencies
* Mendix 5.x environment
 
## Properties
 
* Content Type [ HTML, JavaScript, JavaScript with jQuery ] : 
Select how the snippet should be rendered. The JavaScript with jQuery option will make sure that jQuery 1.11.3 is loaded and should be available on window.jQuery for the snippet.
* Contents : 
The HTML or Javascript to embed.
* External File :
The path to the HTML or JavaScript file you want to add. The root is the theme folder. Will override the Contents section if used. With the newly added "/p/" native deeplinks, you may want to start your file path with a "/" to prevent any 404s caused by this deeplink. 
* On click microflow :
The microflow which should be executed on click. This can be used to, for example, show a page when the snippet is being clicked.
* Documentation : 
Documentation of this widget. Should explain its purpose.
