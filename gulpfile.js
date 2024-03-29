var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');

var paths = {
  js: ['./js/**/*.js'],
  es6: ['./es6/**/*.js'],
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['javascript', 'babel', 'sass', 'watch']);
gulp.task('build', ['javascript', 'babel', 'sass']);

gulp.task('javascript', function () {
  return gulp.src(paths.js)
      .pipe(plumber())
      .pipe(concat('lib.js'))
      .pipe(gulp.dest('./www/js'));
});

gulp.task('babel', function () {
  return gulp.src(paths.es6)
      .pipe(plumber())
      .pipe(babel({
        presets: ['es2015']
      }))
      .pipe(concat('app.js'))
      .pipe(gulp.dest('./www/js'));
});

gulp.task('sass', function(done) {
  return gulp.src(paths.sass)
      .pipe(plumber())
      .pipe(sass())
      //.pipe(gulp.dest('./www/css/'))
      //.pipe(minifyCss({
      //  keepSpecialComments: 0
      //}))
      //.pipe(rename({ extname: '.min.css' }))
      .pipe(concat('app.css'))
      .pipe(gulp.dest('./www/css/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['javascript']);
  gulp.watch(paths.es6, ['babel']);
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
