'use strict';

module.exports = function(env, packerConfig) {
    return {
        "jquery": {
            main: "dist/jquery.min.js"
        },
        "reset-css": {ignore: !(packerConfig.framework == "reset")},
        "jquery-migrate": {
            main: "jquery-migrate.min.js"
        },
        "bootstrap": {
            main: [
                "dist/css/bootstrap.min.css",
                "dist/js/bootstrap.min.js"
            ],
            ignore: !(packerConfig.framework == "bootstrap")
        },
        "foundation-sites": {
            main: [
                "dist/css/foundation.min.css",
                "dist/js/foundation.min.js"
            ],
            ignore: !(packerConfig.framework == "foundation")
        }
    };
};