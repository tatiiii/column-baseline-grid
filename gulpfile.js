/*jslint node: true */

var gulp = require('gulp'),
    remover = require('del'),
    HTMLValidator = require('gulp-html'),
    CSSCompiler = require('gulp-sass'),
    CSSValidator = require('gulp-w3c-css'),
    JSLinter = require('gulp-eslint'),
    browserSpecificPrefixGenerator = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    config = require('./config.json'),
    color = config.colors,
    folders = config.folders,
    contentLayer = config.content_layer,
    settingsLayer = config.settings_layer,
    backendLayer = config.backend_layer,
    layer = null,
    pathToHTMLFile = null,
    pathToSassFile = null,
    pathToCSSFile = null,
    pathToJSFile = null,
    pathToCSSFolder = null;

/**
 * SET THE LAYER IN WHICH YOU’RE WORKING
 *
 * Calling either of the following three tasks simply sets the layer variable
 * according to the objects defined in the config.json file.
 */
gulp.task('setLayerToContent', function () {
    'use strict';

    layer = folders.layers.content;
});

gulp.task('setLayerToSettings', function () {
    'use strict';

    layer = folders.layers.settings;
});

gulp.task('setLayerToBackend', function () {
    'use strict';

    layer = folders.layers.backend;
});

/**
 * VALIDATE HTML
 *
 * This task cannot be run on its own; it must be run after setting a working layer
 * using either the setLayerToContent or the setLayerToSettings task, as such:
 *
 *      gulp setLayerToContent validateHTML
 *      gulp setLayerToSettings validateHTML
 */
gulp.task('validateHTML', function () {
    'use strict';

    switch (layer) {
    case 'content-layer/':
        pathToHTMLFile =
                folders.development +
                folders.layers.content +
                contentLayer.views.main;

        break;

    case 'settings-layer/':
        pathToHTMLFile =
                folders.development +
                folders.layers.settings +
                settingsLayer.views.main;

        break;

    default:
        process.stdout.write(
            '\n\t' +
                color.red +
                'The layer in which you’re working has not been set. Precede ' +
                'this task\n\twith either the setLayerToContent or the ' +
                'setLayerToSettings task to set\n\tit. For example, to ' +
                'validate the index.html file in the content-layer\n\tfolder, ' +
                'type\n\n\t\tgulp setLayerToContent validateHTML' +
                color.default + '\n\n'
        );

        return;
    }

    return gulp.src(pathToHTMLFile)
        .pipe(new HTMLValidator());
});

/**
 * COMPILE CSS
 *
 * Using Sass, compile the file pathToSassFile and write the final CSS document to
 * the pathToCSSFolder. The final CSS file will be formatted with 2-space
 * indentations. Any floating-point calculations will be carried out 10 places, and
 * browser-specific prefixes will be added to support 2 browser versions behind all
 * current browsers’ versions.
 *
 * Like the validateHTML task, this task too cannot be run on its own. A layer must
 * be set first, as such:
 *
 *      gulp setLayerToContent compileCSS
 *      gulp setLayerToSettings compileCSS
 */
gulp.task('compileCSS', function () {
    'use strict';

    switch (layer) {
    case 'content-layer/':
        pathToSassFile =
            folders.development +
            folders.layers.content +
            contentLayer.styles.source;

        pathToCSSFolder =
            folders.development +
            folders.layers.content;

        break;

    case 'settings-layer/':
        pathToSassFile =
            folders.development +
            folders.layers.settings +
            settingsLayer.styles.source;

        pathToCSSFolder =
            folders.development +
            folders.layers.settings;

        break;

    default:
        process.stdout.write(
            '\n\t' +
                color.red +
                'The layer in which you’re working has not been set. Precede ' +
                'this task\n\twith either the setLayerToContent or the ' +
                'setLayerToSettings task to set\n\tit. For example, to ' +
                'compile the main.css file in the content-layer\n\tfolder, ' +
                'type\n\n\t\tgulp setLayerToContent compileCSS' +
                color.default + '\n\n'
        );

        return;
    }

    return gulp.src(pathToSassFile)
        .pipe(new CSSCompiler({
            outputStyle: 'expanded',
            precision: 10
        }).on('error', CSSCompiler.logError))
        .pipe(browserSpecificPrefixGenerator({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest(pathToCSSFolder));
});

/**
 * VALIDATE CSS
 *
 * The task layer must first be set in order for both the compileCSS and this task
 * to run. Call this task as such:
 *
 *      gulp setLayerToContent validateCSS
 *      gulp setLayerToSettings validateCSS
 */
gulp.task('validateCSS', ['compileCSS'], function () {
    'use strict';

    switch (layer) {
    case 'content-layer/':
        pathToCSSFile =
                folders.development +
                folders.layers.content +
                contentLayer.styles.source;

        break;

    case 'settings-layer/':
        pathToCSSFile =
                folders.development +
                folders.layers.settings +
                settingsLayer.styles.source;

        break;

    default:
        process.stdout.write(
            '\n\t' +
                color.red +
                'The layer in which you’re working has not been set. Precede ' +
                'this task\n\twith either the setLayerToContent or the ' +
                'setLayerToSettings task to set\n\tit. For example, to ' +
                'validate the main.css file in the content-layer\n\tfolder, ' +
                'type\n\n\t\tgulp setLayerToContent validateCSS' +
                color.default + '\n\n'
        );

        return;
    }

    return gulp.src(pathToCSSFile)
        .pipe(new CSSValidator())
        .pipe(gulp.dest(folders.validator_results));
});

/**
 * LINT JAVASCRIPT
 *
 * This task lints JavaScript using the linter defined by JSLinter. Like the other
 * tasks, a layer must be set before running this task, as such:
 *
 *      gulp setLayerToBackend lintJS
 *      gulp setLayerToSettings lintJS
 *
 * Note: This task does not write any files to a destination folder.
 */
gulp.task('lintJS', function () {
    'use strict';

    switch (layer) {
    case 'content-layer/':
        pathToJSFile =
                folders.development +
                folders.layers.content +
                contentLayer.controllers.main;

        break;

    case 'settings-layer/':
        pathToJSFile =
                folders.development +
                folders.layers.settings +
                settingsLayer.controllers.main;

        break;

    case 'backend-layer/':
        pathToJSFile =
                folders.development +
                folders.layers.content +
                backendLayer.controllers.main;

        break;


    default:
        process.stdout.write(
            '\n\t' +
                color.red +
                'The layer in which you’re working has not been set. Precede ' +
                'this task\n\twith either the setLayerToContent, ' +
                'setLayerToSettings, or\n\tsetLayerToBackend task to set it. For ' +
                'example, to validate the main.js\n\tfile in the ' +
                'content-layer folder, type\n\n\t\t' +
                'gulp setLayerToContent lintJS' +
                color.default + '\n\n'
        );

        return;
    }

    return gulp.src(pathToJSFile)
        .pipe(new JSLinter({
            rules: {
                indent: [2, 4],
                quotes: [2, 'single'],
                'linebreak-style': [2, 'unix'],
                semi: [2, 'always'],
                'max-len': [2, 85, 4]
            },
            env: {
                es6: true,
                node: true,
                browser: true
            },
            extends: 'eslint:recommended'
        }))
        .pipe(JSLinter.formatEach('compact', process.stderr))
        .pipe(JSLinter.failAfterError());
});

/**
 * CLEAN
 *
 * This task deletes the removable files and folders created during development and
 * production. A report is generated regarding files/folders that exist and can be
 * removed, and those that do not exist.
 */
gulp.task('clean', function () {
    'use strict';

    var fileSystem = require('fs'),
        index,
        removableFolders = [
            folders.validator_results,
            folders.production,
            folders.development +
                    folders.layers.content +
                    contentLayer.styles.target,
            folders.development +
                    folders.layers.settings +
                    settingsLayer.styles.target
        ];

    for (index = 0; index < removableFolders.length; index += 1) {
        try {
            fileSystem.accessSync(removableFolders[index], fileSystem.F_OK);
            process.stdout.write('\n\t' + color.green + removableFolders[index] +
                    color.default + ' was found and ' + color.green + 'will' +
                    color.default + ' be deleted.\n');
            remover(removableFolders[index]);
        } catch (error) {
            if (error) {
                process.stdout.write('\n\t' + color.red + removableFolders[index] +
                        color.default + ' does ' + color.red + 'not' +
                        color.default + ' exist or is ' + color.red + 'not' +
                        color.default + ' accessible.\n');
            }
        }
    }

    process.stdout.write('\n');
});

/**
 * COPY UNPROCESSED FILE STO THE PRODUCTION FOLDER
 *
 * This task copies all assets that aren’t processed by other tasks. Thus, CSS, for
 * example, isn’t copied by this asset, but images, JavaScript, HTML, language
 * locales, and JSON files *are* copied by this task.
 */
gulp.task('copyUnprocessedFilesToProdFolder', function () {
    'use strict';

    return gulp.src([
        folders.development + '*.*',
        folders.development + '**',
        '!' + folders.development +
                folders.layers.settings +
                settingsLayer.styles.source,
        '!' + folders.development +
                folders.layers.content +
                contentLayer.styles.source
    ], {dot: true})
        .pipe(gulp.dest(folders.production));
});

/**
 * SERVE CONTENT LAYER
 *
 * Unlike the other tasks, this one may be called directly, without the need to
 * establish the layer in which you’re working. Thus, it’s run as such:
 *
 *      gulp serveContentLayer
 */
gulp.task('serveContentLayer', ['setLayerToContent', 'compileCSS', 'lintJS'],
    function () {
        'use strict';

        browserSync({
            notify: true,
            port: 9000,
            browser: 'google chrome',
            server: folders.development + folders.layers.content
        });

        gulp.watch(
            folders.development +
                folders.layers.content +
                contentLayer.styles.source,
            ['compileCSS']
        )
            .on('change', reload);

        gulp.watch(
            folders.development +
                folders.layers.content +
                contentLayer.controllers.main,
            ['lintJS']
        )
            .on('change', reload);
    });

/**
 * SERVE SETTINGS LAYER
 *
 * Like the serveContentLayer, this task may be called directly, without the need to
 * establish the layer in which you’re working, because the layer is mentioned in
 * this task’s name. Run this task as such:
 *
 *      gulp serveSettingsLayer
 */
gulp.task('serveSettingsLayer', [
    'setLayerToSettings',
    'validateHTML',
    'compileCSS',
    'lintJS'],
    function () {
        'use strict';

        browserSync({
            notify: true,
            port: 9000,
            browser: 'google chrome',
            server: folders.development + folders.layers.settings
        });

        gulp.watch(
            folders.development +
                folders.layers.settings +
                settingsLayer.views.main,
            ['validateHTML']
        )
            .on('change', reload);

        gulp.watch(
            folders.development +
                folders.layers.settings +
                settingsLayer.styles.source,
            ['compileCSS']
        )
            .on('change', reload);

        gulp.watch(
            folders.development +
                folders.layers.settings +
                settingsLayer.controllers.main,
            ['lintJS']
        )
            .on('change', reload);
    });

/**
 * SERVE BACKEND LAYER
 *
 * Like the other serve-based tasks, this one may be called directly, without the
 * need to establish the layer in which you’re working, because the layer is
 * mentioned in the task’s name. Run as such:
 *
 *      gulp serveBackendLayer
 */
gulp.task('serveBackendLayer', ['setLayerToBackend', 'lintJS'],
    function () {
        'use strict';

        browserSync({
            notify: true,
            port: 9000,
            browser: 'google chrome',
            server: folders.development + folders.layers.backend
        });

        gulp.watch(
            folders.development +
                folders.layers.backend +
                backendLayer.controllers.main,
            ['lintJS']
        )
            .on('change', reload);
    });