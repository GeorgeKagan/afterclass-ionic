var gulp = require('gulp');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');

var paths = {
  js: ['./js/**/*.js'],
  es6: ['./es6/**/*.js'],
  vendorJs: ['./www/lib/**/*.js'],
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['javascript', 'babel', 'vendorJs', 'sass', 'watch']);
gulp.task('build', ['javascript', 'babel', 'vendorJs', 'sass']);

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

gulp.task('vendorJs', function () {
  return gulp.src([
      './www/lib/jquery/dist/jquery.min.js',
      './www/lib/lodash/lodash.js',
      // Angular
      './www/lib/angular/angular.min.js',
      './www/lib/angular-animate/angular-animate.min.js',
      './www/lib/angular-sanitize/angular-sanitize.min.js',
      './www/lib/angular-ui-router/release/angular-ui-router.min.js',
      './www/lib/angular-elastic/elastic.js',
      './www/lib/ngCordova/dist/ng-cordova.min.js',
      './www/lib/angular-translate/angular-translate.min.js',
      './www/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
      './www/lib/ion-image-lazy-load/ionic-image-lazy-load.js',
      // Ionic
      './www/lib/ionic/js/ionic.min.js',
      './www/lib/ionic/js/ionic-angular.min.js',
      // Firebase
      './www/lib/firebase/firebase.js',
      './www/lib/angularfire/dist/angularfire.min.js',
      // MomentJS
      './www/lib/moment/min/moment.min.js',
      './www/lib/moment/locale/he.js',
  ])
      .pipe(plumber())
      .pipe(concat('vendor.js'))
      .pipe(gulp.dest('./www/js'));
});

gulp.task('sass', function() {
  return gulp.src(paths.sass)
      .pipe(plumber())
      .pipe(sass())
      .pipe(concat('app.css'))
      .pipe(gulp.dest('./www/css/'));
});

gulp.task('watch', function() {
  gulp.watch(paths.js, ['javascript']);
  gulp.watch(paths.es6, ['babel']);
  gulp.watch(paths.vendorJs, ['vendorJs']);
  gulp.watch(paths.sass, ['sass']);
});