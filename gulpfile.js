const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const mmq = require("gulp-merge-media-queries");
const browserSync = require("browser-sync");
const cleanCss = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const htmlBeautify = require("gulp-html-beautify");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");

function test(done) {
    console.log("Hello Gulp!");
    done();
}

function compileSass() {
    return gulp.src("./src/assets/sass/**/*.scss")
    .pipe(plumber({
        errorHandler: notify.onError( 'Error: <%= error.message %>' )
    }))
    //処理前のファイルの指定
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssSorter({
        order: "smacss"
    })]))
    .pipe(mmq())
    .pipe(cleanCss())
    .pipe(rename({
        suffix: ".min"
    }))
    .pipe(gulp.dest("./public/assets/css/"))
}

function minJS() {
    return gulp.src("./src/assets/js/**/*.js")
    .pipe(plumber({
        errorHandler: notify.onError( 'Error: <%= error.message %>' )
    }))
    .pipe(uglify())
    .pipe(rename({
        suffix: ".min"
    }))
    .pipe(gulp.dest("./public/assets/js/"))
}

function watch() {
    gulp.watch("./src/assets/sass/**/*.scss", gulp.series(compileSass, browserReload));
    gulp.watch("./src/assets/js/**/*.js", gulp.series(minJS, browserReload));
    gulp.watch("./src/assets/img/**/*", gulp.series(copyImage, browserReload));
    gulp.watch("./src/**/*.html", gulp.series(formatHTML, browserReload));
}

function browserInit(done) {
    browserSync.init({
        server: {
            baseDir: "./public/"
        }
    });
    done();
}

function browserReload(done) {
    browserSync.reload();
    done();
}

function formatHTML() {
    return gulp.src("./src/**/*.html")
    .pipe(plumber({
        errorHandler: notify.onError( 'Error: <%= error.message %>' )
    }))
    .pipe(htmlBeautify({
        indent_size: 2,
        indent_with_tabs: true,
    }))
    .pipe(gulp.dest("./public"))
}

function copyImage() {
    return gulp.src("./src/assets/img/**/*")
    .pipe(plumber({
        errorHandler: notify.onError( 'Error: <%= error.message %>' )
    }))
    .pipe(gulp.dest("./public/assets/img/"))
}

exports.test = test;
exports.compileSass = compileSass;
exports.watch = watch;
exports.browserInit = browserInit;
exports.dev = gulp.parallel(browserInit, watch);
exports.minJS = minJS;
exports.formatHTML = formatHTML;
exports.build = gulp.parallel(formatHTML, minJS, compileSass, copyImage);