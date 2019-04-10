"use strict";

const gulp = require("gulp");
const sass = require("gulp-sass");
const concatCss = require('gulp-concat-css');
const sourcemaps = require("gulp-sourcemaps");
const delMod = require("del");
const ts = require("gulp-typescript");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");
const path = require("path");
const fs = require("fs");
const rename = require("gulp-rename");
const gulpif = require("gulp-if");
const uglifyes = require("uglify-es");
const composer = require("gulp-uglify/composer");
const uglifycss = require("gulp-uglifycss");
const LIBS = require("./libs.json");
let env = 'dev';
const minify = composer(uglifyes, console);

function folderExists(path) {
	try {
		return fs.statSync(path).isDirectory();
	} catch (err) {
		return false;
	}
}

function copy(src, dst, renameArg) {
	if (renameArg === undefined) {
		return () => gulp.src(src).pipe(gulp.dest(dst));
	} else {
		return () => gulp.src(src).pipe(rename(renameArg)).pipe(gulp.dest(dst));
	}
}

function del(paths) {
	return () => delMod(paths, { force: true });
}

// app manifest file
const MANIFEST_FILE = 'manifest.json';
const manifest = require(`./${MANIFEST_FILE}`);

const APP_FOLDER_NAME = manifest.appDomain.split('.').reverse().join('.');

const BUILD = "./public";
const ELECTRON = "../core-platform-electron";
const APP_FOLDER = `${ELECTRON}/build/all/apps/${APP_FOLDER_NAME}`;

gulp.task(
	"pre-prod",
	function (cb) {
		env = 'production';
		console.log(env);
		cb();
	}
);

gulp.task(
	"copy-lib",
	gulp.series(
		copy("./src/assets/**/*.*", "./public/assets"),
		(cb) => {
			for (let item of LIBS) {
				gulp.src(item.from).pipe(gulp.dest(item.to));
			}
			cb();
		}
	)
);

gulp.task(
	"del-lib",
	del(["./public/libs", "./public/assets"])
);

gulp.task(
	"copy-html",
	copy("./src/**/*.html", "./public")
);

gulp.task(
	"del-html",
	del(
		[
			"./public/*",
			!"./public/index.js",
			!"./public/index.css",
			!"./public/libs",
			!"./public/assets"
		]
	)
);

gulp.task("styles", function() {
	return gulp.src("./src/**/*.scss")
		.pipe(gulpif(env === 'dev', sourcemaps.init()))
		.pipe(sass())
		.pipe(gulpif(env === 'dev', sourcemaps.write()))
		.pipe(gulp.dest("./temp"));
});

gulp.task("concat-css", function () {
	return gulp.src('./temp/**/*.css')
		.pipe(concatCss("index.css"))
		.pipe(gulpif(env === 'production', uglifycss()))
		.pipe(gulp.dest('./public/'));
});

gulp.task("del-css", del(["./public/index.css"]));

gulp.task("del-temp", del(["./temp/"]));

gulp.task("del-all", del(["./public"]));


gulp.task("tsc", function() {
	var tsProject = ts.createProject("tsconfig.json");
	var tsResult = tsProject.src()
		.pipe(gulpif(env === 'dev', sourcemaps.init()))
		.pipe(tsProject());
	return tsResult.js
		.pipe(gulpif(env === 'dev', sourcemaps.write()))
		.pipe(gulp.dest("./temp"));
});

function browserifySubTask(browserifyEntry, destFolder) {
	const entryFileName = path.basename(browserifyEntry);
	return gulp.series(
		del([ path.join(destFolder, entryFileName) ]),
		() => browserify({
			entries: browserifyEntry,
			debug: true
		}).bundle()
			.pipe(source(entryFileName))
			.pipe(buffer())
			.pipe(gulpif(env === 'dev', sourcemaps.init({loadMaps: true})))
			.pipe(gulpif(env === 'dev', sourcemaps.write('')))
			.pipe(gulpif(env === 'production', minify({}).on('error', function (err) {
				console.log(err);
			})))
			.pipe(gulp.dest(destFolder))
	);
}

// gulp.task("browserify", gulp.series(
// 	del(["./public/index.js"]),
// 	() => browserify("./temp/index.js")
// 		.bundle()
// 		.pipe(source("index.js"))
// 		.pipe(gulp.dest("./public"))
// ));

gulp.task(
	"browserify",
	browserifySubTask(
		"./temp/index.js",
		"./public",
	),
);


gulp.task("create-lib", gulp.series("copy-lib"));
gulp.task("create-html", gulp.series("copy-html"));
gulp.task("create-css", gulp.series("styles", "concat-css"));
gulp.task("create-js", gulp.series("tsc", "browserify"));

function moveToElectronTasks() {
	if (!folderExists(ELECTRON)) {
		return done => {
			console.log(`
Can't move build into electron-based core build.
Need ${ELECTRON} setup side-by-side for an automated copying to take place.
Still, you may copy content of folder ${BUILD} manually.
`);
			done();
		}
	}
	let tasks = [];
	if (folderExists(APP_FOLDER)) {
		tasks.push(del(APP_FOLDER));
	}
	tasks.push(
		copy(`${BUILD}/**/*`, `${APP_FOLDER}/app`),
		copy(MANIFEST_FILE, APP_FOLDER));
	return gulp.series(...tasks);
}
gulp.task("to-electron", moveToElectronTasks());


gulp.task("help", function(callback) {
	var h = '\nПомощь:\n'+
		'1) "build"  - компилирует необходимые файлы из папки SRC и переносит все в папку PUBLIC.\n'+
		'2) "build:prod" - компилирует необходимые файлы из папки SRC, минимизирует код и переносит все в папку PUBLIC.\n' +
		'3) "default" ("help") - выводит это сообщение\n';
	console.log(h);
	callback();
});

gulp.task(
	"build",
	gulp.series(
		"del-all",
		gulp.parallel(
			"create-lib",
			"create-html",
			"create-css",
			"create-js"
		),
		"del-temp",
		"to-electron"
	)
);
gulp.task(
	"build:prod",
	gulp.series(
		"pre-prod",
		"build"
	)
);
gulp.task(
	"default",
	gulp.series(
		"help"
	)
);
