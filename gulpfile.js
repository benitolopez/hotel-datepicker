'use strict';

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var rename       = require('gulp-rename');
var uglify       = require('gulp-uglify');
var jshint       = require('gulp-jshint');
var stylish      = require('jshint-stylish');
var gcmq         = require('gulp-group-css-media-queries');

// Some costants
var dest = './dist';
var destJS = './dist/js';
var destCSS = './dist/css';
var files = {
    js: 'src/js/*.js',
    scss: 'src/scss/*.scss'
};

gulp.task('sass', function() {
    gulp.src(files.scss)
        .pipe(sass({outputStyle: 'expanded'}))
        .pipe(autoprefixer(['last 2 versions']))
        .pipe(gcmq())
        .pipe(gulp.dest(destCSS));
});

gulp.task('lint', function() {
    return gulp.src(files.js)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('compress', function() {
    return gulp.src(files.js)
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(destJS));
});

gulp.task('default', ['sass', 'lint', 'compress']);

gulp.task('watch', function () {
  gulp.watch(files.js, ['lint']);
  gulp.watch(files.js, ['compress']);
  gulp.watch(files.scss);
});
