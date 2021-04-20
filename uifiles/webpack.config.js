
var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var ROOT_PATH = path.resolve( __dirname + '/../');
var JS_PATH = ROOT_PATH + "/uifiles/src";
var HTML_PATH = ROOT_PATH + "/public";
var tpl = JS_PATH + "/app/tpl/tpl.html";

module.exports = {
    entry: {
        vendor:['vue','vuex','vue-router','element-ui','echarts','whatwg-fetch','babel-polyfill'],
        app: JS_PATH+"/app.js",
    },
    output: {
        filename: "[name]_bundle.js?[hash]",
        path: HTML_PATH + '/build',
        publicPath: "/build/"
    },
    resolveLoader: {
        // root: path.join(__dirname, 'node_modules')
    },
    module: {
        noParse: [/videojs-contrib-hls/],
        loaders: [
            {test:/\.css$/, loader:ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })},
            {test:/\.less$/, loader:ExtractTextPlugin.extract({fallback:'style-loader',use:'css-loader!less-loader'})},
            {test: /\.scss$/, loader: ExtractTextPlugin.extract({fallback:'style-loader',use:'css-loader!sass-loader'})},
            {test:/\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,loader:'file-loader'},
            {test:/\.(png|jpg|gif|svg|ico)$/,loader:'file-loader',query:{name:'[name].[ext]?[hash]'}},
            {test:/\.vue$/,loader:'vue-loader',exclude:/node_modules/},
            {test:/\.js$/, loader:'babel-loader', query:{ presets:['es2015'] },exclude:/node_modules/},
            {test:/\.html$/,loader:'html-loader' }
        ]
    },
    resolve: {
        extensions: ['.js', '.css', '.png', '.jpeg', '.jpg', '.jsx', '.vue'],
        alias:{
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    plugins: [
        new ExtractTextPlugin("app.css?[hash]"),
        new webpack.optimize.CommonsChunkPlugin({name:'vendor', filename:'vendor.bundle.js?[hash]'}),
        new HtmlWebpackPlugin({ chunks:['vendor','app'], filename:HTML_PATH+'/index.html', template:tpl, inject:'body' }),

        new webpack.DefinePlugin({'process.env':{ NODE_ENV:'"'+process.env.NODE_ENV+'"' }}),
    ],
    // devtool: (process.env.NODE_ENV === 'production') ? 'cheap-module-source-map' : 'cheap-module-eval-source-map'
};

if(process.env.NODE_ENV === 'production'){
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.optimize.UglifyJsPlugin( { compress:{warnings:false} } )
    ])
}
