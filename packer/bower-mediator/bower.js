'use strict';

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const mainBowerFiles = require('main-bower-files');
const path = require('path');
const combine = require('stream-combiner2').obj;
const through2 = require("through2").obj;
const eventStream = require('event-stream');
const replace_css_url = require('replace-css-url');

var bowerMediator = function(env) {
    this.env = env;
};

bowerMediator.prototype.copyAndConcat = function (config, overrides, concat) {
    var __ = this;

    this.paths = [];

    var bowerDirectory = path.join(process.cwd(), "bower_components");
    var stream = gulp.src(mainBowerFiles({overrides: overrides}), {base: bowerDirectory})
        .pipe(through2(function(file, enc, cb){
            __.paths.push(file.path);
            cb(null, file);
        }));

    __.dependencies = {};
    var streamDependencies = gulp.src("bower_components/*/{.bower,bower}.json", {base: bowerDirectory})
        .pipe(through2(function(file, enc, cb){
            var nameModule = file.path.substr(bowerDirectory.length).replace(/^[\\\/]?([^\\\/]+)[\S\s]*/, "$1");
            var data = JSON.parse(file.contents.toString());
            if("dependencies" in data) {
                __.dependencies[nameModule] = data.dependencies;
            }
            cb();
        }));

    __.concatModules = concat;
    __.concateReverse = {};
    for(var key in concat) {
        for(var i in concat[key]) {
            __.concateReverse[concat[key][i]] = key;
        }
    }

    for(var concatModule in concat) {
        var cssFilter = $.filter('**/*.css', {restore: true});
        var jsFilter = $.filter('**/*.js', {restore: true});

        (function(concatModule) {
            stream = stream.pipe($.if(
                function(file) {
                    var nameModule = file.path.substr(bowerDirectory.length).replace(/^[\\\/]?([^\\\/]+)[\S\s]*/, "$1");

                    return concatModule == __.concateReverse[nameModule];
                },
                combine(
                    through2(function(file, enc, cb){
                        var nameModule = file.path.substr(bowerDirectory.length).replace(/^[\\\/]?([^\\\/]+)[\S\s]*/, "$1");

                        if(/\.css$/.test(file.path)) {
                            var modifiedContents = replace_css_url(
                                file.contents.toString(),
                                function(urlpath){
                                    if(path.isAbsolute(urlpath) || /^data\:/.test(urlpath)) {
                                        return urlpath;
                                    } else {
                                        return path.relative(bowerDirectory, path.join(path.parse(file.path).dir, urlpath)).replace(/\\+/g, "/");
                                    }
                                }
                            );

                            file.contents = new Buffer(modifiedContents);

                            this.push(file);

                            cb();
                        } else {
                            cb(null, file);
                        }
                    }),
                    cssFilter, $.concat(concatModule + '.css'), cssFilter.restore,
                    jsFilter, $.concat(concatModule + '.js'), jsFilter.restore
                )
            ));
        })(concatModule);
    }

    return eventStream.merge(stream, streamDependencies);
};

bowerMediator.prototype.getDependenciesAndModulePaths = function (config) {
    var __ = this;

    var dependencies = [];
    var modulesPaths = {};

    var notDublicate = {};
    var inModuleExistConcatFiles = {};

    var bowerDirectory = path.join(process.cwd(), "bower_components");

     for(var i in __.paths) {
         var filepath = __.paths[i];

         var nameModule = filepath.substr(bowerDirectory.length).replace(/^[\\\/]?([^\\\/]+)[\S\s]*/, "$1");

         if(!(nameModule in notDublicate)) {
             notDublicate[nameModule] = true;
             dependencies.push(nameModule);
         }

         if(!(nameModule in modulesPaths)) {
             modulesPaths[nameModule] = [];
         }
         modulesPaths[nameModule].push(filepath.substr(bowerDirectory.length).replace(/\\+/g, "/"));

         if(nameModule in this.concateReverse) {
             if(!(this.concateReverse[nameModule] in inModuleExistConcatFiles) && (/\.(css|js)$/.test(filepath))) {
                 inModuleExistConcatFiles[this.concateReverse[nameModule]] = {};
             }
             if(/\.css$/.test(filepath)) {
                 inModuleExistConcatFiles[this.concateReverse[nameModule]].css = true;
             }
             if(/\.js$/.test(filepath)) {
                 inModuleExistConcatFiles[this.concateReverse[nameModule]].js = true;
             }
         }
     }

    var concatModuleInsert = {};

    var concatDependencies = [];
    //Чтоб обьединенённые модули были возле последнего обьединяемого модуля делаем reverse
    dependencies.reverse().forEach(function(nameModule, i, arr) {
        if(nameModule in __.concateReverse) {
            var concatNameModule = __.concateReverse[nameModule];

            if(concatNameModule in inModuleExistConcatFiles) {
                delete modulesPaths[nameModule];
                if(!(concatNameModule in concatModuleInsert)) {
                    concatModuleInsert[concatNameModule] = true;
                    concatDependencies.push(concatNameModule);
                }

                var pathsConcat = [];
                if("css" in inModuleExistConcatFiles[concatNameModule]){pathsConcat.push(concatNameModule + ".css")}
                if("js" in inModuleExistConcatFiles[concatNameModule]){pathsConcat.push(concatNameModule + ".js")}
                modulesPaths[concatNameModule] = pathsConcat;
            }
        } else {
            concatDependencies.push(nameModule);
        }
    });
    concatDependencies.reverse();

    //pre paste path "bowerDest"
    for(var name in modulesPaths) {
        modulesPaths[name] = modulesPaths[name].map(function(el) {
            return path.join(config.bowerDest, el).replace(/\\+/g, "/");
        });
    }

    return {
        pluginsList: concatDependencies,
        concatModules: __.concatModules,
        concateReverse: __.concateReverse,
        dependencies: __.dependencies,
        paths: modulesPaths
    }
}


module.exports = function (env) {
    return new bowerMediator(env);
};