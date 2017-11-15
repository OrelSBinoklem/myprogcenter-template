'use strict';
const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const eventStream = require('event-stream');

module.exports = {
    taskInit: function(config) {
        gulp.task('bootstrap:builder', ['bootstrap:builder:css', 'bootstrap:builder:js']);

        gulp.task('bootstrap:builder:css', function() {
            return gulp.src("config/bootstrap-modules.scss")
                .pipe($.sass())
                .pipe($.autoprefixer(config.autoprefixerOptions))
                .pipe($.cleanCss())
                .pipe($.rename(function(path) {
                    if(path.basename == "bootstrap-modules" && path.extname == ".css") {
                        path.basename = "bootstrap.min";
                    }
                }))
                .pipe(gulp.dest(path.join(config.dest, config.bowerDest, "bootstrap/dist/css")));
        });

        gulp.task('bootstrap:builder:js', function() {
            return gulp.src("config/bootstrap-modules.js")
                .pipe($.rigger())
                .pipe($.uglify())
                .pipe($.rename(function(path) {
                    if(path.basename == "bootstrap-modules" && path.extname == ".js") {
                        path.basename = "bootstrap.min";
                    }
                }))
                .pipe(gulp.dest(path.join(config.dest, config.bowerDest, "bootstrap/dist/js")));
        });
    }
};