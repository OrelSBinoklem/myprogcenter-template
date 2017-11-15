'use strict';

module.exports = function(env) {
    return {
        dest: 'build',                //(String: "путь" Def:"public")

        resetCss: true,
        framework: "bootstrap",         //(Boolean: false | String: "bootstrap" | "foundation" Notdef)

        imgCompressPolicy: "normal", //(String: "good" | "normal" | "simple" Notdef)
        imgCompressPics: "normal",    //(String: "good" | "normal" | "simple" | "low" Def:"simple")
        webp: false,                  //(boolean: true|false, Def:false)
        spritePngPostfix2x: false,    //(Boolean: false | String: "имя файла" Def: false)
        spriteSvgClearColor: false,   //(boolean: true|false, Def:false)

        pugOrganizationCodePolicy: "extends", //(String: "extends" | "includes" Notdef)

        jQueryMigrate: true,          //(boolean: true|false, Def: true)
        autoprefixer: true,           //(boolean: true|false, Def: true)
        autoprefixerOptions: {
            browsers: ['last 2 versions'],
            cascade: false
        },

        //Второстепенные опции
        src: "src",                   //(String: "путь" Def:".")
        tmp: "tmp",                   //(String: "путь" Def:".")
        bowerDest: "vendor",          //(String: "путь" Notdef)
        clean: env == "production",   //(boolean: true|false, Def:false)
        watch: env == "development"   //(boolean: true|false, Def:false)
    };
};