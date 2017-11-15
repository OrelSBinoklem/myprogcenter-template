'use strict';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BowerWebpackPlugin = require('bower-webpack-plugin');
const path = require('path');

var webpackMediator = function(env) {
    this.env = env;
};

webpackMediator.prototype.config = function (config, bowerData) {
    var res = {
        general: {
            base_src: config.src,              // (String: "путь"       Def:"."). Базовый путь к папке с исходниками
            base_tmp: config.tmp,              // (String: "путь"       Def:"."). Базовый путь к папке с временными файлами
            base_dest: config.dest,          // (String: "путь"       Def:"."). Базовый путь к папке с конечным результатом

            //Установите сохранение каждую 1 сек, если пользуетесь редактором phpshtorm (File | Settings | Appearance and Behavior | System Settings | Save files automatically if application is idle for 1 sec)
            watch: this.env == "development" //• (boolean: true|false, Def:false). Наблюдение за изменениями файлов и перекомпиляция на лету.
        },

        common_modules: {
            clean: false, //НАДО ВЫПОЛНЯТЬ ДО БОВЕРА ПОЭТОМУ СДЕСЬ БЛОКИРУЕМ ЭТУ ЗАДАЧУ. ЭТУ ЗАДАЧУ ПРОПИСАЛ В ГЛАВНОМ МОДУЛЕ ПАКЕРА

            browserSync: this.env == "development",             //• (boolean: true|false, Def:false). Обновляет на лету вёрстку в браузере если изменились файлы. Синхронизирует действия в нескольких браузерах, что позволяет тестировать вёрстку одновременно в нескольких браузерах. Позволяет тестировать вёрстку на мобильных через WIFI
            browserSyncOptions: {},       //  (object: for browser-sync plugin, Def:notdocumented). По умолчанию задаються разные опции при разных настройках

            adaptivePixelPerfect: this.env == "development",    //• (boolean: true|false, Def:false). Эмулирает вёрстку при разных разрешениях и подкладывает под неё картинку дизайна соответствующую этому разрешению. Синхронизирует действия в нескольких браузерах, что позволяет тестировать вёрстку одновременно в нескольких браузерах. Пока что не позволяет тестировать вёрстку на мобильных через WIFI!!!
            adaptivePixelPerfectOptions: {
                port: 3010,               // (int: \d{4},          Def:3010). Порт по которому создаёться альтернативная страница плагина помимо browser-sync
                design: "design"          // (String: "путь"       Def:"design"). Путь к папке с картинками дизайна
            }
        },

        all_casual_modules: {
            changed: this.env == "development",                //• (boolean: true|false, Notdef). Обрабатывать только те файлы которые изменились
            minification: this.env == "production",          //• (boolean: true|false, Notdef). Минификация файлов
            sourcemaps: this.env == "development"              //• (boolean: true|false, Notdef). Sourcemaps файлы
        },

        //У всех модулей есть следующие опции:
        //watch             //• (boolean: true|false, Def:false). Наблюдение за изменениями файлов и перекомпиляция на лету.
        //name              // ↓(String: "имя задачи" Notdef)
        //src               // ↓(minimatch patterns   Notdef). Откуда брать файлы (относительно "base_src").
        //dest              // ↓(String: "путь"       Def: ""). Куда ложить html (относительно "base_dest")
        //addWatch          // ↓(Boolean: false | String: "путь" Def: false). Добавляет в наблюдение файлы. При изменении файлов просто выполняет задачу без обработки этих файлов (относительно "base_src")
        //disabled          //•↓(boolean: true|false | String: "files-consider", Def:false). Отменяет задачу - возможно понадобиться с использованием переменной dev - если хотите чтоб в зависимых задачах файлы учитывались и непропускались как при включённом режиме то передайте строку "files-consider"

        casual_modules: {
            //Потдерживаються форматы: html, htm, pug
            html: {
                seedingData: "seeding-data.json", //  (Boolean: false | String: "путь" Def:false). json файл в котором храняться вспомогательные контентные данные например: текст имён ссылок и/или текст постов. Эти данные будут переданы во все pug и (html обрабатываемые модулем gulp-file-include) файлы... (относительно "base_src").
                fileInclude: false,       //•↓(boolean: true|false, Def:false). Плагин который просто подключает одни html файлы (с часто используемыми частями кода, например header и footer) в обрабатываемый
                fileIncludeOptions: {     // ↓(object: for gulp-file-include plugin Def:{prefix: '@@', basepath: '@file'}).
                    prefix: '@@',         //  (String:              Def: "@@"). Префикс перед include, пример: @@include('./header.html')
                    basepath: '@file'     //  (String: "относительный путь" Def: "@file"). Относительно чего искать подключаемый файл. По умолчанию: относительно текущего обрабатываемого файла
                },
                pug: true,                //•↓(boolean: true|false, Def:true). Включить pug. Установите "Pug (ex-Jade)" плагин если используете редактор phpshtorm
                pugOptions: {
                    pretty: '  ',          //  (String:              Def: "\t"). Какими отступами должны делаться вложенные теги при компиляции в html. По умолчанию: табуляция
                    data: {
                        config: config,
                        bower: bowerData
                    }
                },
                pugInsertCurPage: true,   //@ (boolean: true|false, Def:true). В этом режиме в каждый pug файл передаёться переменная с именем "current" в которой находиться имя исполняемого (тот в котором extend и всё инклюдиться) pug файла
                //changed: true,          // &(boolean: true|false, Def:true). Обрабатывать только те файлы которые изменились
                sourcemaps: false         // &(boolean: true|false, Def:false). Sourcemaps файлы
            },

            //Потдерживаються форматы: sass, scss, less, styl, css
            css: {
                autoprefixer: config.autoprefixer,       //• (boolean: true|false, true). Вендорные префиксы, чтобы больше браузеров использовали современные фишки пускай даже иногда с небольшими багами. Например -webkit-transition:
                autoprefixerOptions: config.autoprefixerOptions    //  (object: for gulp-autoprefixer plugin Def:{browsers: ['last 2 versions'], cascade: false}). Смотрите подробно тут: //https://github.com/ai/browserslist

                //changed: true,          // &(boolean: true|false, Def:true). Обрабатывать только те файлы которые изменились
                //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
                //minification: true      //  (boolean: true|false, true). Минификация файлов
            },

            //Потдерживаються форматы: js, coffee
            js: {
                coffeeOptions: {          //• (object: for gulp-coffee plugin, Def:{bare: true}).
                    bare: true
                }
                //changed: true,          // &(boolean: true|false, Def:true). Обрабатывать только те файлы которые изменились
                //sourcemaps: false,      // &(boolean: true|false, Def:false). Sourcemaps файлы
                //minification: true      //  (boolean: true|false, true). Минификация файлов
            },

            //Потдерживаються форматы: jpg, png, gif, svg
            //webp всеравно жмёться алгоритмом с потерями при "perfect" (решение автора плагина)
            //Этот метод создание спрайта svg основан на - http://glivera-team.github.io/svg/2016/06/13/svg-sprites-2.html. В этом методе нельзя управлять иконками через js, если вам это нужно то контет картинок внедряйте в html. Для лучшей потдержки старых браузеров (https://github.com/jonathantneal/svg4everybody)
            //Отображать svg иконки в проводнике windows - http://savvateev.org/blog/54/
            images: {
                //changed: true,          // &(boolean: true|false,                 Def:true). Обрабатывать только те картинки которые изменились
                quality: "normal",        //• (String: "perfect" | "good" | "normal" | "simple" | "low", Def: "simple").
                qualityFolders: true,     //• (boolean: true|false,                 Def:true). Если картинки лежат в корне папки с именем качества ("perfect" | "good" | "simple" | "low") то такие картинки жмуться с качеством соответствующим имени. Потом переносяться в папку на уровень вверх (в папку в которой лежит папка с названием качества т.е. родительская папка).
                webp: config.webp,               //• (boolean: true|false,                 Def:false). Все картинки дополнительно жмуться в формат webp и вставляються в ту же папку с такими же именами. Вставьте в ваш .htaccess файл код с этой статьи: https://github.com/vincentorback/WebP-images-with-htaccess. Для потдержки webp
                sprite: false,            //•↓(boolean: true|false,                 Def:false). Просто жмём картинки или создаём спрайт.
                spriteOptions: {
                    styleFormat: 'sass',             //  (String: "расширение файла"           Def: "sass"). Для препроцессора стилей в котором будут данные о спрайте
                    destStyle: 'sass',               //  (String: "путь"                       Def: "sass"). Для файла препроцессора стилей в котором будут данные о спрайте (относительно "base_tmp")
                    relStyleToImg: '../img/sprites', //  (String: "относительный путь"         Def: ""). Путь относительно откомпилированного файла стилей с данными о спрайте к картинке спрайту
                    destExamples: 'sprite-examples', //  (Boolean: false | String: "путь"      Def: "sprite-examples"). Папка в которую поместить полезные миксины и примеры вывода стилей и html для отдельных иконок из спрайтов. (относительно "base_tmp")
                    png: {
                        prefixIcon: "icon-",         //  (String: "имя файла"                  Def: "icon__"). Префикс к именам иконок спрайта - используеться в формировании классов стилей иконок
                        postfix2x: config.spritePngPostfix2x,            //• (Boolean: false | String: "имя файла" Def: false). Конец имени файлов с двойным разрешением для создания спрайта для ретины или 4k. "-2x" с такой строкой возникают баги!!!
                        name: 'sprite',              // ↓(String: "имя файла"                  Def: "sprite"). Картинка спрайта
                        styleName: '_png-sprite'     // ↓(String: "имя файла"                  Def: "_png-sprite"). Стили с данными об иконках спрайта
                    },
                    svg: {
                        prefixIcon: "icon-",         //  (String: "имя файла"                  Def: "svg-icon__"). Префикс к именам иконок спрайта - используеться в формировании классов стилей иконок и идентификаторов в тегах symbol в svg
                        clearColor: config.spriteSvgClearColor,           //• (boolean: true|false,                 Def:false). Удаление атрибутов цвета чтобы можно было цвет svg иконки задавать через свойство color в стилях
                        name: 'sprite',              // ↓(String: "имя файла"                  Def: "sprite"). Картинка спрайта
                        styleName: '_svg-sprite'     // ↓(String: "имя файла"                  Def: "_png-sprite"). Стили с данными об иконках спрайта
                    }
                }
            }
        },

        html: [
            [
                {name: 'pug', src: ['*.pug'], addWatch: ['pug/**/*.pug', "seeding-data.json"], sourcemaps: false},
                {name: 'html', src: ['/**/*.{html,htm}'], sourcemaps: false}
            ]
        ],

        css: (function(arr) {
            if(config.framework == "bootstrap") {
                arr.push({name: 'css:bootstrap', src: path.join("../", config.dest, config.bowerDest, "bootstrap/dist/css/bootstrap.min.css"), dest: path.join("../", config.tmp, "garbage"),
                    minification: false, sourcemaps: false});
            } else if(config.framework == "foundation") {
                arr.push({name: 'css:foundation', src: path.join("../", config.dest, config.bowerDest, "foundation-sites/dist/css/foundation.min.css"), dest: path.join("../", config.tmp, "garbage"),
                    minification: false, sourcemaps: false});
            }
            return arr;
        })([
            [
                {name: 'sass', src: ['sass/*.sass', 'sass/layouts/*.sass'], addWatch: (function(arr) {
                    if(config.framework == "bootstrap") {
                        arr.push("../config/bootstrap-variables.scss");
                    } else if(config.framework == "foundation") {
                        arr.push("../config/foundation-variables.scss");
                    }
                    return arr;
                })(["sass/*/**/*.sass", "../tmp/sass/png-sprite.sass"]), dest: 'css'}
            ],
            {name: 'css', src: ['/**/*.css']}
        ]),

        js: (function(arr) {
            if(config.framework == "bootstrap") {
                arr.push({name: 'js:bootstrap', src: path.join("../", config.dest, config.bowerDest, "bootstrap/dist/js/bootstrap.min.js"), dest: path.join("../", config.tmp, "garbage"),
                    minification: false, sourcemaps: false});
            } else if(config.framework == "foundation") {
                arr.push({name: 'js:foundation', src: path.join("../", config.dest, config.bowerDest, "foundation-sites/dist/js/foundation.min.js"), dest: path.join("../", config.tmp, "garbage"),
                    minification: false, sourcemaps: false});
            }
            return arr;
        })([
            {name: 'coffee', src: 'coffee/*.coffee', addWatch: "coffee/**/*.coffee", dest: 'js'},
            {name: 'js', src: '/**/*.js'}
        ]),

        images: [
            [
                {name: 'images-sprites', src: ['img/icons/**/*.{png,svg}'], quality: "good", qualityFolders: false, dest: 'img', sprite: true,
                    spriteOptions:{
                        png: {name: 'sprite', styleName: '_png-sprite'},
                        svg: {name: 'sprite', styleName: '_svg-sprite'}}},
                {name: 'images-pics', src: ['img/pics/**/*.{jpg,jpeg,png,gif,svg}'], quality: config.imgCompressPics, dest: 'img/pics'},
                {name: 'images-casual', src: ['/**/*.{jpg,jpeg,png,gif,svg}'], quality: config.imgCompressPolicy}
            ]
        ],

        copy: {name: 'copy', src: ['/**/*.{webp,ico,otf,eot,ttf,woff,woff2}']}
    }

    return res;
};


module.exports = function (env) {
    return new webpackMediator(env);
};