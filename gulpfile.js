'use strict';

/*
|--------------------------------------------------------------------------
| Require
|--------------------------------------------------------------------------
*/

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');
var csscomb = require('gulp-csscomb');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var del = require('del');
var runSequence = require('run-sequence');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
// PostCSS plugins
var postcss = require('gulp-postcss');
var cssnano = require('cssnano');
var autoprefixer = require('autoprefixer');
var rucksack = require('rucksack-css');
// Debug
var gutil = require('gulp-util');
var notify = require("gulp-notify");

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

var onError = function (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
};

/*
|--------------------------------------------------------------------------
| CSS
|--------------------------------------------------------------------------
*/

gulp.task('sass', function(){
	var processors = [
		rucksack,
		autoprefixer
	];

	return gulp.src("./app/sass/**/*.scss")
		.pipe(plumber({ errorHandler: onError }))
	 	.pipe(sourcemaps.init())
	 	.pipe(sass().on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(csscomb())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("./app/css/"))
		.pipe(browserSync.reload({stream: true}))
		.pipe(notify({ message: 'CSS task complete' }));
});

/*
|--------------------------------------------------------------------------
| Concat and Minify CSS & JS
|--------------------------------------------------------------------------
*/

gulp.task('useref', function() {
	var processors = [
		cssnano
	];

	return gulp.src('app/*.html')
		.pipe(useref())
		.pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css', postcss(processors)))
		.pipe(gulp.dest('dist'))
		.pipe(notify({ message: 'USEREF task complete' }));
});


/*
|--------------------------------------------------------------------------
| BrowserSync
|--------------------------------------------------------------------------
*/

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
		  baseDir: 'app'
		}
	});
});

/*
|--------------------------------------------------------------------------
| Watch CSS, HTML & JS
|--------------------------------------------------------------------------
*/

gulp.task('watch', function(){
	gulp.watch('app/sass/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload); 
  	gulp.watch('app/js/**/*.js', browserSync.reload); 
});

/*
|--------------------------------------------------------------------------
| Images
|--------------------------------------------------------------------------
*/

gulp.task('images', function(){
	return gulp.src('app/images/**/*{jpg,jpeg,png,gif}')
		.pipe(imagemin({
			optimizationLevel: 3,
			progessive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('dist/images/'))
		.pipe(notify({ message: 'IMAGES task complete' }));
});

gulp.task('images:copy', function(){
	return gulp.src('app/images/**/*{jpg,jpeg,png,gif}')
		.pipe(gulp.dest('dist/images/'))
		.pipe(notify({ message: 'IMAGES:COPY task complete' }));
});
/*
|--------------------------------------------------------------------------
| Clean
|--------------------------------------------------------------------------
*/

gulp.task('clean', function() {
	return del.sync('dist').then(function(cb) {
		return cache.clearAll(cb);
	});
})

gulp.task('clean:dist', function() {
	return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*',  '!dist/.git',  '!dist/.git/**/*']);
});

/*
|--------------------------------------------------------------------------
| Build
|--------------------------------------------------------------------------
*/

gulp.task('build', function(callback) {
	runSequence('clean:dist', ['sass', 'useref', 'images:copy'], callback);
});

/*
|--------------------------------------------------------------------------
| Default Task
|--------------------------------------------------------------------------
*/

gulp.task('default', function(callback) {
	runSequence(['sass', 'browserSync', 'watch'], callback);
});

