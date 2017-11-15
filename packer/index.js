'use strict';
const requireDir = require('require-dir');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const through2 = require("through2").obj;
const runSequence = require('run-sequence');
const combine = require('stream-combiner2').obj;
const gulpWebpack = require('gulp-webpack');
const gulpNotify = require("gulp-notify");
const del = require('del');

var configurationsRelatedToBower = ["bower.json", "config/packer.js", "config/bower-overrides.js", "config/bower-concat.js"];
var configurationsRelatedToBootstrapBuilder = ["bower.json", "config/packer.js", "config/bower-overrides.js", "config/bower-concat.js", "config/bootstrap-variables.scss", "config/bootstrap-modules.scss", "config/bootstrap-modules.js"];
var configurationsRelatedToFoundationBuilder = ["bower.json", "config/packer.js", "config/bower-overrides.js", "config/bower-concat.js", "config/foundation-variables.scss", "config/foundation-config.scss", "config/foundation-modules.scss", "config/foundation-modules.js"];

var packer = function(env, maincallback) {
    const config = require("../config/packer")(env);
    const configBowerOverrides = require("../config/bower-overrides")(env, config);
    const configBowerConcat = require("../config/bower-concat")(env, config);
    const middlewars = requireDir("./middleware");
    const gulpMediator = require("./gulp-mediator/gulp")(env);
    const webpackMediator = require("./webpack-mediator/webpack")(env);
    const bowerMediator = require("./bower-mediator/bower")(env);
    const bootstrapBilder = require("./framework-builders/bootstrap-builder");
    const foundationBilder = require("./framework-builders/foundation-builder");

    var taskDependencies = [];

    for(var key in middlewars) {
        if(!middlewars[key](config)) {
            console.log("Программа неможет дальше выполняться");
            return false;
        }
    }

    const basicTemplate = requireDir("./preparation-basic-template");
    for(var key in basicTemplate) {
        basicTemplate[key](config);
    }

    if(config.clean) {
        gulp.task('clean', function() {
            return del([config.dest, config.tmp]);
        });
        taskDependencies.push(['clean']);
    }

    /*
    gulp.task('gulp:webpack', function() {
        return combine(
            gulp.src(config.src + '/main.js'),
            gulpWebpack(webpackMediator.config(config)),
            gulp.dest(config.dest)
        ).on('error', gulpNotify.onError("Error: <%= error.message %>");
    }).start('gulp:webpack');*/

    //Optimize run "bower"
    //
    var bowerRun = false;

    if(!config.clean) {
        if(!fs.existsSync(path.join(process.cwd(), "packer/bower-mediator/last-run.json")) || !fs.existsSync(path.join(process.cwd(), "packer/bower-mediator/modules-data.json"))) {
            bowerRun = true;
        } else {
            for(var i in configurationsRelatedToBower) {
                var bowerLastRun = fs.statSync(path.join(process.cwd(), "packer/bower-mediator/last-run.json")).mtime.getTime();
                if(fs.statSync(path.join(process.cwd(), configurationsRelatedToBower[i])).mtime.getTime() > bowerLastRun) {
                    bowerRun = true;
                    break;
                }
            }
        }
    }

    var bowerData;
    if(bowerRun || config.clean) {
        gulp.task('bower', function() {
            return bowerMediator.copyAndConcat(config, configBowerOverrides, configBowerConcat)
                .pipe(gulp.dest(path.join(config.dest, config.bowerDest))).on("end", function() {
                    bowerData = bowerMediator.getDependenciesAndModulePaths(config);
                    fs.writeFile(path.join(process.cwd(), "packer/bower-mediator/last-run.json"), JSON.stringify({lastRun: new Date().getTime()}));
                    fs.writeFile(path.join(process.cwd(), "packer/bower-mediator/modules-data.json"), JSON.stringify(bowerData));
                });
        });
        taskDependencies.push(['bower']);
    } else {
        var filedata = fs.readFileSync(path.join(process.cwd(), "packer/bower-mediator/modules-data.json"));
        bowerData = JSON.parse(filedata.toString());
    }

    //Optimize run "bootstrap builder"
    //
    if(config.framework == "bootstrap") {
        var bootstrapBuilderRun = false;

        if(!config.clean) {
            if(!fs.existsSync(path.join(process.cwd(), "bootstrap/dist/css/bootstrap.min.css")) || !fs.existsSync(path.join(process.cwd(), "bootstrap/dist/js/bootstrap.min.js"))) {
                bootstrapBuilderRun = true;
            } else {
                for(var i in configurationsRelatedToBootstrapBuilder) {
                    var bootstrapBuilderLastRun = fs.statSync(path.join(process.cwd(), config.dest, config.bowerDest, "bootstrap/dist/css/bootstrap.min.css")).mtime.getTime();
                    if(fs.statSync(path.join(process.cwd(), configurationsRelatedToBootstrapBuilder[i])).mtime.getTime() > bowerLastRun) {
                        bootstrapBuilderRun = true;
                        break;
                    }
                }
            }
        }

        if(bootstrapBuilderRun || config.clean) {
            bootstrapBilder.taskInit(config);
            taskDependencies.push(['bootstrap:builder']);
        }

        if(config.watch) {
            gulp.watch([
                'config/bootstrap-modules.scss',
                'config/bootstrap-variables.scss',
            ], ['bootstrap:builder:css']);

            gulp.watch([
                'config/foundation-modules.js',
            ], ['bootstrap:builder:js']);
        }
    }

    //Optimize run "foundation builder"
    //
    if(config.framework == "foundation") {
        var foundationBuilderRun = false;

        if(!config.clean) {
            if(!fs.existsSync(path.join(process.cwd(), "foundation-sites/dist/css/foundation.min.css")) || !fs.existsSync(path.join(process.cwd(), "foundation-sites/dist/js/foundation.min.js"))) {
                foundationBuilderRun = true;
            } else {
                for(var i in configurationsRelatedToFoundationBuilder) {
                    var foundationBuilderLastRun = fs.statSync(path.join(process.cwd(), config.dest, config.bowerDest, "foundation-sites/dist/css/foundation.min.css")).mtime.getTime();
                    if(fs.statSync(path.join(process.cwd(), configurationsRelatedToFoundationBuilder[i])).mtime.getTime() > bowerLastRun) {
                        foundationBuilderRun = true;
                        break;
                    }
                }
            }
        }

        if(foundationBuilderRun || config.clean) {
            foundationBilder.taskInit(config);
            taskDependencies.push(['foundation:builder']);
        }

        if(config.watch) {
            gulp.watch([
                'config/foundation-modules.scss',
                'config/foundation-variables.scss',
                'config/foundation-config.scss',
            ], ['foundation:builder:css']);

            gulp.watch([
                'config/foundation-modules.js',
            ], ['foundation:builder:js']);
        }
    }

    require('easy-gulp-by-orel')(function() {
        return gulpMediator.config(config, bowerData);
    });
    if(env == "production") {
        taskDependencies.push(['easy:gulp:by:orel:production']);
    }
    if(env == "development") {
        taskDependencies.push(['easy:gulp:by:orel']);
    }

    taskDependencies.push(function(callback) {
        maincallback();
        //callback();
    });
    runSequence.apply(null, taskDependencies);
};

module.exports = packer;