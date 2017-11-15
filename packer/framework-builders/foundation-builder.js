'use strict';
const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const eventStream = require('event-stream');

module.exports = {
    taskInit: function(config) {
        gulp.task('foundation:builder', ['foundation:builder:css', 'foundation:builder:js']);

        gulp.task('foundation:builder:css', function() {
            return gulp.src("config/foundation-modules.scss")
                .pipe($.sass())
                .pipe($.autoprefixer(config.autoprefixerOptions))
                .pipe($.cleanCss())
                .pipe($.rename(function(path) {
                    if(path.basename == "foundation-modules" && path.extname == ".css") {
                        path.basename = "foundation.min";
                    }
                }))
                .pipe(gulp.dest(path.join(config.dest, config.bowerDest, "foundation-sites/dist/css")));
        });

        gulp.task('foundation:builder:js', function() {
            return gulp.src("config/foundation-modules.js")
                .pipe($.rigger())
                //.pipe($.uglify())
                .pipe($.rename(function(path) {
                    if(path.basename == "foundation-modules" && path.extname == ".js") {
                        path.basename = "foundation.min";
                    }
                }))
                .pipe(gulp.dest(path.join(config.dest, config.bowerDest, "foundation-sites/dist/js")));
        });
    }
};