const webpack = require("webpack");
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        HTMLSnippet: "./src/HTMLSnippet/widget/HTMLSnippet.js",
        HTMLSnippetContext: "./src/HTMLSnippet/widget/HTMLSnippetContext.js",
    },
    output: {
        path: path.resolve(__dirname, "dist/tmp/src"),
        filename: "HTMLSnippet/widget/[name].js",
        chunkFilename: "HTMLSnippet/widget/HTMLSnippet[id].js",
        libraryTarget: "amd",
        publicPath: "widgets/"
    },
    devtool: "source-map",
    externals: [ /^mxui\/|^mendix\/|^dojo\/|^dijit\// ],
    plugins: [
        new CopyWebpackPlugin([ { from: "src/**/*.xml", to: "../" } ], { copyUnmodified: true }),
        new webpack.LoaderOptionsPlugin({ debug: true })
    ]
};
