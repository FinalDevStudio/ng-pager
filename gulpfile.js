'use strict';

const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const gulp = require('gulp');
const del = require('del');

const paths = {
  scripts: 'src/*.js'
};

/**
 * Clean the dist folder.
 */
gulp.task('clean', () => {
  del.sync('dist');
});

/**
 * Minify and copy to dist folder.
 */
gulp.task('minify', ['clean'], () => {
  return gulp.src(paths.scripts)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist/'));
});

/**
 * Beautify and copy to dist folder.
 */
gulp.task('beautify', ['minify'], () => {
  return gulp.src(paths.scripts)
    .pipe(uglify({
      mangle: false,
      compress: false,
      output: {
        bracketize: true,
        indent_level: 2,
        beautify: true
      }
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['beautify']);

/**
 * Watch for file changes.
 */
gulp.task('watch', ['default'], () => {
  gulp.watch(paths.scripts, ['build']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['clean', 'build']);
