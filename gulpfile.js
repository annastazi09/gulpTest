'use strict';

var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    concatCss = require('gulp-concat-css'),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    connect = require('gulp-connect'),
    sass = require('gulp-sass'),
    uncss = require('gulp-uncss'),
    rev_append = require('gulp-rev-append'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    gutil  = require('gulp-util'),
    rimraf = require('rimraf'),
    revOutdated = require('gulp-rev-outdated'),
    path = require('path'),
    through = require('through2'),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    sftp = require('gulp-sftp'),
    build = require('gulp-build'),
    minifyCss = require('gulp-minify-css');


// server connect
gulp.task('connect', function () {
	connect.server({
		root: 'app',
		livereload: true
	})
});


// clean
gulp.task('clean', function () {
	return gulp.src('dist',{read:false})
	.pipe(clean());
});

//sftp
gulp.task('sftp', function () {
	return gulp.src('dist/*')
		.pipe(sftp({
			host: 'github.com/annastazi09/',
			user: 'annastazi09',
			pass: '****',
            remotePath: 'https://github.com/annastazi09/gulpTestDeploy.git'
		}));
});

//Build
gulp.task('build',['clean'], function() {
     var assets = useref.assets();
    
     return gulp.src('app/*.html')
      .pipe(assets)
      .pipe(gulpif('*.js', uglify()))
      .pipe(gulpif('*.css', minifyCss()))
      .pipe(assets.restore())
      .pipe(useref())
      .pipe(gulp.dest('dist'));
});

// css
// .pipe(notify('Done!'))
// .pipe(concatCss('bundle.css'))
//  gulp.src('scss/style.css')
gulp.task('css', function () {
    gulp.src('css/*.css')
    .pipe(sass())
    .pipe(cleanCSS(''))
    .pipe(uncss({html: ['app/index.html']}))
    .pipe(rename('bundle.min.css'))
    .pipe(autoprefixer({browsers: ['last 2 versions'], cascade: false}))
    .pipe(gulp.dest('app/css'))
    .pipe(connect.reload());
});

// html
gulp.task('html', function () {
	gulp.src('app/index.html')
	.pipe(connect.reload());
});

// watch changes
gulp.task('watch', function () {
	gulp.watch('css/*.css',['css'])
    gulp.watch('bower.json',['bower'])
	gulp.watch('app/index.html',['html'])

});

// rev-append
gulp.task('rev_append', function() {
  gulp.src('app/index.html')
    .pipe(rev_append())
    .pipe(gulp.dest('app/'));
});

// rev
gulp.task('rev', function () {
	return gulp.src('css/*.css')
		.pipe(rev())
		.pipe(gulp.dest('app/css/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('css/manifest/'));
});

// rev-collector
gulp.task('rev_collector', function () {
    return gulp.src(['css/manifest/**/*.json', 'app/index.html'])
        .pipe( revCollector({replaceReved: true}))
        .pipe(gulp.dest('app/'));
});

function cleaner() {
    return through.obj(function(file, enc, cb){
        rimraf( path.resolve( (file.cwd || process.cwd()), file.path), function (err) {
            if (err) {
                this.emit('error', new gutil.PluginError('Cleanup old files', err));
            }
            this.push(file);
            cb();
        }.bind(this));
    });
}

gulp.task('clean', ['rev_collector'], function() {
    gulp.src( ['app/**/*.*'], {read: false})
        .pipe( revOutdated(1) ) // leave 1 latest asset file for every file name prefix. 
        .pipe( cleaner() );
 
    return;
});

// bower
gulp.task('bower', function () {
         gulp.src(['app/index.html'])
        .pipe( wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app/'));
});

//useref
gulp.task('html', function () {
    return gulp.src('app/index.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));
});

gulp.task('rev_all', ['rev', 'rev_collector', 'clean']);

// default
gulp.task('default', ['connect', 'css', 'html', 'watch']);