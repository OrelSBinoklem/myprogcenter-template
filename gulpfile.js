'use strict';
const gulp = require('gulp');

var env;

gulp.task('default', function(maincallback) {
    env = "development";
    next(maincallback);
});
gulp.task('production', function(maincallback) {
    env = "production";
    next(maincallback);
});

function next(maincallback) {
    require('./packer/index')(env, maincallback);
}