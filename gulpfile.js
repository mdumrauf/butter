'use strict';

var gulp = require('gulp');
var tasks = require('gulp-tasks');
var eslint = require('gulp-eslint');


gulp.task('lint', () => {
  return gulp.src(['lib/**/*.js', 'test/**/*.js', 'index.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('mocha', tasks.mocha);

gulp.task('test', ['lint', 'mocha']);
