// Modules
var gulp        = require('gulp');
var fs          = require('fs');
var reload      = require('gulp-livereload');
var sync        = require('gulp-sync')(gulp).sync;
var child       = require('child_process');
var util        = require('gulp-util');
var path        = require('path');
var os          = require('os');

// Enviroment variables
var env = JSON.parse(fs.readFileSync('./env.json'))
var folderAsset = env.Asset.Folder;

// Application server
var server = null;

// LESS
gulp.task('less', function() {
	var less = require('gulp-less');
	var concat = require('gulp-concat');

	return gulp.src(folderAsset + '/dynamic/less/**/*.less')
		.pipe(less())
		.pipe(concat("style.css"))
		.pipe(gulp.dest(folderAsset + '/static/css/'));
});

// JavaScript Task
gulp.task('javascript', function() {
	var concat = require('gulp-concat');
	var minify = require('gulp-minify');
	var babel = require('gulp-babel');
	var sourcemaps = require('gulp-sourcemaps');

	return gulp.src(folderAsset + '/dynamic/js/**/*.js')
		.pipe(sourcemaps.init())
			.pipe(concat('all.js'))
			.pipe(babel({
				presets: ['es2015']
			}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(folderAsset + '/static/js/'))
		.pipe(reload());
});

// jQuery Task
gulp.task('jquery', function() {
	return gulp.src('node_modules/jquery/dist/jquery.min.*')
		.pipe(gulp.dest(folderAsset + '/static/js/'));
});

// Lodash Task
gulp.task('lodash', function() {
	return gulp.src('node_modules/lodash/lodash.min.*')
		.pipe(gulp.dest(folderAsset + '/static/js/'));
});

// Mustache
gulp.task('mustache', function() {
    return gulp.src('node_modules/mustache/mustache.min.*')
        .pipe(gulp.dest(folderAsset + '/static/js/'));
});

gulp.task('dateformat', function() {
    return gulp.src('node_modules/dateformat/lib/dateformat.js')
        .pipe(gulp.dest(folderAsset + '/static/js/'));
});

// Mustache templates
gulp.task('templates', function() {
    var concat = require('gulp-concat-util');

    gulp.src(folderAsset + '/dynamic/template/**/*.mustache')
		.pipe(concat('templates.js', {
			process: function(src, filePath) {
                var fileName = path.basename(filePath).replace(/\.(.*)$/, '')

				// replace new lines
				src = src.replace(/(?:\r\n|\r|\n)/g, '');

                // escape quotes
				src = src.replace(/\"/g, '\\"');

                return fileName + ": " + '\"' + src + '\"' + ',';
			}
		}))
		.pipe(concat.header('var TemplateJS = {\n'))
		.pipe(concat.footer('\n};'))
        .pipe(gulp.dest(folderAsset + '/static/js'));
});

// Monitor Go files for changes
gulp.task('server:watch', function() {
	// Restart application
	gulp.watch([
		'*/**/*.gohtml',
		'env.json'
	], ['server:spawn']);
	
	// Rebuild and restart application server
	gulp.watch([
		'*.go',
		'*/**/*.go'
	], [
		'server:build',
		'server:spawn'
	]);
});

// Build application from source
gulp.task('server:build', function() {
	var notify = require('gulp-notify');

	var build = child.spawnSync('go', ['build']);
	if (build.stderr.length) {
		var lines = build.stderr.toString()
		.split('\n').filter(function(line) {
		return line.length
		});
		for (var l in lines)
			util.log(util.colors.red(
			'Error (go build): ' + lines[l]
		));
		notify({
			title: 'Error (go build)',
			message: lines
		});
	}
	return build;
});

// Spawn an application process
gulp.task('server:spawn', function() {
	if (server)
		server.kill();
	
	// Get the application name based on the folder
	var appname = path.basename(__dirname);

	// Spawn application server
	if (os.platform() == 'win32') {
		server = child.spawn(appname + '.exe');
	} else {
		server = child.spawn('./' + appname);
	}
	
	// Trigger reload upon server start
	server.stdout.once('data', function() {
		reload.reload('/');
	});
	
	// Pretty print server log output
	server.stdout.on('data', function(data) {
		var lines = data.toString().split('\n')
		for (var l in lines)
		if (lines[l].length)
		util.log(lines[l]);
	});
	
	// Print errors to stdout
	server.stderr.on('data', function(data) {
		process.stdout.write(data.toString());
	});
});

// Main watch function.
gulp.task('watch', ['server:build'], function() {
	// Start the listener (use with the LiveReload Chrome Extension)
	reload.listen();

	// Watch the assets
	gulp.watch(folderAsset + '/dynamic/less/**/*.less', ['less']);
	gulp.watch(folderAsset + '/dynamic/js/*.js', ['javascript']);
	
	return gulp.start(sync([
		'server:watch',
		'server:spawn'
	]));
});

// Init - every task
gulp.task('init', ['less', 'javascript', 'jquery', 'lodash', 'mustache', 'dateformat', 'templates', 'server:build']);

// Default - only run the tasks that change often
gulp.task('default', ['less', 'javascript', 'templates']);
