'use strict';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const path = require('path');

var webpackMediator = function(env) {
    this.env = env;
};

webpackMediator.prototype.config = function (config) {
    var res = {
        context: path.join(process.cwd(), config.src),

        entry: {
            main: "./main"
        },
        output: {
            path: path.join(process.cwd(), config.dest),
            publicPath: '/',
            filename: '[name].js'
        },

        resolve: {
            /*alias: {
                'malihu-custom-scrollbar-plugin': 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js'
            },*/
            modulesDirectories: ["node_modules", "bower_components"],
            extensions: ['', '.js', '.css', '.sass']
        },

        module: {
            loaders: [
                /*{
                    test: /\.js$/,
                    loader: 'babel',
                    exclude: /(node_modules|bower_components)/
                },*/
                { test: /jquery-mousewheel/, loader: "imports?define=>false&this=>window" },
                { test: /malihu-custom-scrollbar-plugin/, loader: "imports?define=>false&this=>window" },
                {
                    test: /\.css$/,
                    loader: 'style!css'
                }, {
                    test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
                    include: /[\/\\]node_modules[\/\\]/,
                    loader: 'file?name=[1].[ext]&regExp=node_modules[^.](.*)'//был слеш заместо [^.] но на винде другой слеш и он тут с ошибкой работает
                }, {
                    test: /\.(png|jpg|svg|ttf|eot|woff|woff2)$/,
                    exclude: /[\/\\]node_modules[\/\\]/,
                    loader: 'file?name=[path][name].[ext]'
                }
            ]
        },

        plugins: [new BowerWebpackPlugin({
            modulesDirectories: ["bower_components"],
            manifestFiles:      ["bower.json", ".bower.json"],
            includes:           /.*/,
            excludes: /(.*\.less)/,
            searchResolveModulesDirectories: true
        })],

        //watch: this.env == "development",

        watchOptions: {
            aggregateTimeout: 100
        },

        devtool: "source-map"
    }

    if(this.env == "production") {//this.env == "production"
        res.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                    drop_console: false,
                    unsafe: false
                }
            })
        );
    }

    return res;
};

function wrapRegexp(regexp, label) {
    regexp.test = function (path) {
        console.log(label, path);
        return RegExp.prototype.test.call(this, path);
    }
    return regexp;
}

module.exports = function (env) {
    return new webpackMediator(env);
};