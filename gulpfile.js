// grab our gulp packages
var args = require('yargs').argv;
var config = require('./gulp.config')();
var del = require('del');
var glop = require('glob');
var gulp  = require('gulp');
var gutil = require('gulp-util');
var inject = require('gulp-inject');
var flatten = require('gulp-flatten');
var concat = require('gulp-concat');
var mainBowerFiles = require('main-bower-files');
var $ = require('gulp-load-plugins')({ lazy: true });
var gettext = require('gulp-angular-gettext');
var transifex = require('gulp-transifex').createClient(config.transifex);
var autoprefixer = require('autoprefixer');
var lazypipe = require('lazypipe');
var vinylPaths = require('vinyl-paths');
var CacheBuster = require('gulp-cachebust');

var cachebust = new CacheBuster();

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);

/**
 * vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
  log('Analyzing source with JSHint and JSCS');

  return gulp
    .src(config.alljs)
    .pipe($.if(args.verbose, $.print()))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish', { verbose: true }))
    .pipe($.jshint.reporter('fail'))
    .pipe($.jscs())
    .pipe($.if(args.verbose, $.jscs.reporter()))
    .pipe($.jscs.reporter('fail'));
});

// create a default task and start the sass watcher task
gulp.task('default', ['inject', 'translation:convert'], function() {
  gulp.start('sass:watch');
  gulp.start('webadmin:watch');
  return gutil.log('Gulp is running!');
});

gulp.task('cachebuster', ['inject'], function() {
  log('Cachebusting...');
  var basePath = config.dev; //default to dev
  if (args.dev) {
    basePath = config.dev;
  } else if (args.dist) {
    basePath = config.dist;
  }
  var destination = basePath;

  return gulp.src([basePath + '*.css', basePath + '*.js'])
    .pipe($.if(args.verbose, $.print()))
    .pipe($.if(args.dist, cachebust.resources()))
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(destination));
});

gulp.task('build', ['cachebuster', 'translation:convert'], function() {
  var basePath = config.dev; //default to dev
  if (args.dev) {
    basePath = config.dev;
  } else if (args.dist) {
    basePath = config.dist;
  }
  var indexSource = basePath + 'index.html';
  var destination = basePath;

  var vp = vinylPaths();
  var addsrc = require('gulp-add-src');

  gulp.src([indexSource])
    .pipe(vp)
    .pipe($.if(args.production, $.rename('index.php')))
    .pipe(addsrc(basePath + 'ridestore.*.js'))
    .pipe(addsrc(basePath + 'webadmin.app.*.js'))
    .pipe($.if(args.verbose, $.print()))
    .pipe($.if(args.dist, cachebust.references()))
    .pipe(gulp.dest(destination))
    .on('end', function () {
      if (args.production) {
        del(vp.paths);
      }
    });

  if (args.dist) {
    clean([
      basePath + '*.css',
      basePath + '*.js',
      '!' + basePath + '*.*.css',
      '!' + basePath + '*.*.js',
      basePath + config.adminConfig.bundleFiles.vendor.js,
      basePath + config.adminConfig.bundleFiles.vendor.css,
      basePath + config.adminConfig.bundleFiles.app.js,
      basePath + config.adminConfig.bundleFiles.app.css,
    ]);
    clean(basePath + 'styles');
  }

});

gulp.task('inject', ['inject-js', 'inject-css', 'templatecache', 'webadmin'], function () {
  log('Injecting dependencies...');

  var basePath = config.dev; //default to dev
  if (args.dev) {
    basePath = config.dev;
  } else if (args.dist) {
    basePath = config.dist;
  }

  var indexSource = basePath + 'index.html';
  var destination = basePath;

  // compressTasks is a sub process used by useref (below)
  var compressTasks = lazypipe()
    .pipe($.sourcemaps.init, { loadMaps: true })
    .pipe(function () {
      return $.if('*.js', $.uglify());
    })
    .pipe(function() {
      return $.if('*.css', $.cssnano({
        reduceIdents: {
          keyframes: false
        },
        discardUnused: {
          keyframes: false
        },
        zindex: false
      }));
    });

  if (args.dist) {
    return gulp.src(indexSource)
        .pipe($.useref({},
          lazypipe().pipe(compressTasks)
        ))
        .pipe($.sourcemaps.write('.'))
        .pipe($.if(args.verbose, $.print()))
        .pipe(gulp.dest(destination));
  }
});

/*
 * concatenates the webadmin files
 * options:
 *   --dev  : builds to build/dev (default)
 *   --dist : builds to build/dist
 * @return {Stream}
 */
gulp.task('webadmin', function () {
  log('concatenating webadmin files...');

  var adminConfig = config.adminConfig;

  var destination = config.dev; //default to dev
  if (args.dev) {
    destination = config.dev;
  } else if (args.dist) {
    destination = config.dist;
  }

  // fetching the files stream
  var vendorAdminStream = gulp.src(adminConfig.bowerpackages.js);
  var vendorAdminCssStream = gulp.src(adminConfig.bowerpackages.css);
  var appAdminStream = gulp.src(adminConfig.jsFiles);

  appAdminStream.pipe(concat(adminConfig.bundleFiles.app.js))
  .pipe($.if(args.verbose, $.print()))
  .pipe($.if(args.verbose, $.bytediff.start()))
  .pipe($.if(args.dist, $.uglify()))
  .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
  .pipe(gulp.dest(destination));

  //TODO: refactor: extract from here, and add gulp-inject
  vendorAdminCssStream.pipe(concat(adminConfig.bundleFiles.vendor.css))
  .pipe($.if(args.verbose, $.bytediff.start()))
  .pipe($.if(args.dist, $.cssnano({
    reduceIdents: {
      keyframes: false
    },
    discardUnused: {
      keyframes: false
    },
    zindex: false
  })))
  .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
  .pipe(gulp.dest(destination));

  var stream = vendorAdminStream
  .pipe(concat(adminConfig.bundleFiles.vendor.js))
  .pipe($.if(args.verbose, $.print()))
  .pipe($.if(args.verbose, $.bytediff.start()))
  .pipe($.if(args.dist, $.uglify()))
  .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
  .pipe(gulp.dest(destination));

  return stream;
});

gulp.task('webadmin:watch', function () {
  gulp.watch(config.adminConfig.jsFiles, ['webadmin']);
});

/*
 * Injects the compiled css
 * options:
 *   --dev  : builds to build/dev (default)
 *   --dist : builds to build/dist
 * @return {Stream}
 */
gulp.task('inject-css', ['clean:css', 'sass'], function () {
  log('injecting the css into the html');

  var basePath = config.dev; //default to dev
  if (args.dev) {
    basePath = config.dev;
  } else if (args.dist) {
    basePath = config.dist;
  }

  // due to concurrency issues,
  // we pick up on the already moved index as the sass task takes longer
  var indexSource = basePath + 'index.html';

  var cssSource = basePath + config.compiledCss;
  var destination = basePath;

  console.log('cssSource: ', cssSource);
  console.log('indexSource: ', indexSource);

  var stream = gulp.src(indexSource)
    .pipe(inject(
      gulp.src(cssSource, {read: false}),
      { ignorePath: 'build/dev', addRootSlash: false }
    ))
    .pipe($.if(args.verbose, $.print()))
    .pipe(gulp.dest(destination));

  return stream;
});

/**
 * Inject our app js and wire-up the bower dependencies
 * options:
 *   --dev  : builds to build/dev (default)
 *   --dist : builds to build/dist
 * @return {Stream}
 */
gulp.task('inject-js', ['clean:js'], function () {
  log('Wiring the bower dependencies into the html');

  var indexSource = config.index;
  var destination = config.dev;

  if (args.dev) {
    indexSource = config.index;
    destination = config.dev;
  } else if (args.dist) {
    indexSource = config.index;
    destination = config.dist;
  }

  //copying nonAngularStuff to the destination folder
  gulp.src(config.nonAngularStuff)
  .pipe($.if(args.verbose, $.print()))
  .pipe($.if(args.dist, $.if('*.js', $.uglify())))
  .pipe($.if(args.dist, $.if('*.json', $.jsonminify())))
  .pipe(gulp.dest(destination + 'assets/'));

  var wiredep = require('wiredep').stream;
  var options = config.getWiredepDefaultOptions();
  var stream = gulp.src(indexSource)
    .pipe(inject(
      gulp.src(config.js).pipe($.angularFilesort()),
      {relative: true}
    ))
    /* if angularFilesort proves inconsistent, we can manually set the order of files
     * using the following pipe instead */
    //.pipe(inject(config.js, '', config.jsOrder))
    .pipe(wiredep(options))
    .pipe(gulp.dest(destination));

  return stream;
});

/**
 * Compile sass to css
 * options:
 *   --dev  : builds to build/dev (default)
 *   --dist : builds to build/dist
 * @return {Stream}
 */
gulp.task('sass', function () {
  log('Compiling sass to css...');

  var basePath = config.dev; //default to dev
  if (args.dev) {
    basePath = config.dev;
  } else if (args.dist) {
    basePath = config.dist;
  }

  var source = config.sourceCss;
  var destination = basePath + config.cssPath;

  if (args.verbose) {
    log('source: ' + source);
    log('destination: ' + destination);
  }

  var stream = gulp.src(source)
    .pipe($.sourcemaps.init())
    .pipe($.plumber())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([
        autoprefixer({ browsers: ['last 2 versions','last 3 iOS versions'] })
    ]))
    .pipe($.plumber.stop())
    .pipe(flatten())
    .pipe($.sourcemaps.write('./maps'))
    .pipe(gulp.dest(destination));

  return stream;
});

gulp.task('sass:watch', function () {
  gulp.watch(config.sourceCss, ['sass']);
});

/**
 * Run specs once and exit
 * To start servers and run midway specs as well:
 *    gulp test --startServers
 * @return {Stream}
 */
gulp.task('test', ['vet'], function(done) {
  startTests(true /*singleRun*/, done);
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean:tc'], function() {
  if (!args.dist) {
    return;
  }

  log('Creating an AngularJS $templateCache');

  var stream = gulp
    .src(config.htmltemplates)
    .pipe($.if(args.verbose, $.bytediff.start()))
    .pipe($.htmlmin({collapseWhitespace: true, conservativeCollapse: true}))
    .pipe($.if(args.verbose, $.bytediff.stop(bytediffFormatter)))
    .pipe($.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options
    ))
    .pipe($.if(args.verbose, $.print()))
    //.pipe(cachebust.resources())
    .pipe(gulp.dest(config.dist));

  return stream;
});

// TRANSLATIONS

/**
 * converts the pot files into json
 * options:
 *   --dev  : builds to build/dev (default)
 *   --dist : builds to build/dist
 * @return {Stream}
 */
gulp.task('translation:convert', function() {
  var source = 'po/**/*.po';
  var destination = config.dev + 'translations/';

  if (args.dev) {
    destination = config.dev + 'translations/';
  } else if (args.dist) {
    destination = config.dist + 'translations/';
  }

  var stream = gulp
    .src(source)
    .pipe(gettext.compile({ format: 'json' }))
    .pipe(gulp.dest(destination));

  return stream;
});

////////////

gulp.task('clean:js', function(done) {
  var files = [].concat(
    config.dev + '*.js',
    config.dev + '*.js.map',
    config.dist + '*.js',
    config.dist + '*.js.map'
  );
  return clean(files, done);
});

gulp.task('clean:css', function(done) {
  var files = [].concat(
    config.dev + '*.css',
    config.dev + '*.css.map',
    config.dev + 'styles',
    config.dist + '*.css',
    config.dist + '*.css.map',
    config.dist + 'styles'
  );
  return clean(files, done);
});

gulp.task('clean:tc', function(done) {
  var files = [].concat(
    config.dev + 'templates.*js',
    config.dist + 'templates.*js'
  );
  return clean(files, done);
});

gulp.task('clean:translations', function(done) {
  var files = [].concat(
    config.dev + 'translations',
    config.dist + 'translations'
  );
  return clean(files, done);
});

/**
 * Remove all files from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
  var files = [].concat(
    config.temp,
    config.build
  );
  return clean(files, done);
});

/////////

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path) {
  log('Cleaning: ' + $.util.colors.blue(path));
  return del(path);
}

/**
 * Start the tests using karma.
 * @param  {boolean} singleRun - True means run once and end (CI), or keep running (dev)
 * @param  {Function} done - Callback to fire when karma is done
 * @return {undefined}
 */
function startTests(singleRun, done) {
  var child;
  var excludeFiles = [];
  var fork = require('child_process').fork;
  var Karma = require('karma').Server;

  new Karma({
    configFile: __dirname + '/karma.conf.js',
    exclude: excludeFiles,
    singleRun: !!singleRun
  }, karmaCompleted).start();

  ////////////////

  function karmaCompleted(karmaResult) {
    log('Karma completed');
    if (child) {
      log('shutting down the child process');
      child.kill();
    }
    if (karmaResult === 1) {
      done('karma: tests failed with code ' + karmaResult);
    } else {
      done();
    }
  }
}

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
  var difference = (data.savings > 0) ? ' smaller.' : ' larger.';
  return data.fileName + ' went from ' +
    (data.startSize / 1000).toFixed(2) + ' kB to ' +
    (data.endSize / 1000).toFixed(2) + ' kB and is ' +
    formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted perentage
 */
function formatPercent(num, precision) {
  return (num * 100).toFixed(precision);
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof (msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(item + ':' + msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}
