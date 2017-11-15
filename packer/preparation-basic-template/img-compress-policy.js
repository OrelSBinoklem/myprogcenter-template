'use strict';
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function(config) {
    if(config.imgCompressPolicy == "good" && !fs.existsSync(path.join(process.cwd(), config.src, '/img/normal')) && !fs.existsSync(path.join(process.cwd(), config.src, '/img/simple'))) {
        mkdirp(path.join(process.cwd(), config.src, '/img/normal'), function (err) {
            if (err) console.error(err)
            else console.log('create folder ./img/normal');
        });
        mkdirp(path.join(process.cwd(), config.src, '/img/simple'), function (err) {
            if (err) console.error(err)
            else console.log('create folder ./img/simple');
        });
    } else if(config.imgCompressPolicy == "normal" && !fs.existsSync(path.join(process.cwd(), config.src, '/img/good')) && !fs.existsSync(path.join(process.cwd(), config.src, '/img/simple'))) {
        mkdirp(path.join(process.cwd(), config.src, '/img/good'), function (err) {
            if (err) console.error(err)
            else console.log('create folder ./img/good');
        });
        mkdirp(path.join(process.cwd(), config.src, '/img/simple'), function (err) {
            if (err) console.error(err)
            else console.log('create folder ./img/simple');
        });
    } else if(config.imgCompressPolicy == "simple" && !fs.existsSync(path.join(process.cwd(), config.src, '/img/good')) && !fs.existsSync(path.join(process.cwd(), config.src, '/img/normal'))) {
        mkdirp(path.join(process.cwd(), config.src, '/img/good'), function (err) {
            if (err) console.error(err)
            else console.log('create folder ./img/good');
        });
        mkdirp(path.join(process.cwd(), config.src, '/img/normal'), function (err) {
            if (err) console.error(err)
            else console.log('create folder ./img/normal');
        });
    }
};