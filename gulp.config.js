module.exports = function () {
  var client = './src/';
  var clientApp = client + 'app/';
  var cssPath = 'styles';
  var report = './report/';
  var root = './';
  var specRunnerFile = 'specs.html';
  var temp = root + '.tmp/';
  var wiredep = require('wiredep');
  var bowerFiles = wiredep({ devDependencies: true })['js'];
  var localenv;
  try {
    localenv = require('./process.env')();
  }
  catch (e) {
    console.log('need process.env for translation');
  }

  var adminConfig = {
    bundleFiles: {
      vendor: {
        js: 'webadmin.vndr.js', //this is also defined in src/app/components/admin/admin.config.js
        css: 'webadmin.vndr.css'
      },
      app: {
        js: 'webadmin.app.js', //this is also defined in src/app/pages/webadmin/webadmin.html
        css: 'webadmin.app.css'
      }
    },
    bowerpackages: {
      js: [
        'bower_components/auth0-lock/build/lock.js', //auth0-lock
        'bower_components/dropzone/downloads/dropzone.min.js', //dropzone
        'bower_components/angular-dropzone/lib/angular-dropzone.js', //angular-dropzone
        'bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
        'bower_components/angular-ui-grid/ui-grid.min.js'
      ],
      css: [
        'bower_components/dropzone/downloads/css/dropzone.css',
        'bower_components/angular-ui-grid/ui-grid.css'
      ]
    }, //see bower.json files for each admin dependency and search for main and dependencies
    jsFiles: [
      clientApp + 'components/admin/**/*.js',
      clientApp + '**/*.admin.*.js',
    ],
  };

  var bower = {
    json: require('./bower.json'),
    directory: './bower_components/',
    ignorePath: '..',
    adminSpecificPackages: adminConfig.bowerpackages
  };
  var nodeModules = root + 'node_modules/';

  var nonAngularStuff = [
    client + 'assets/**/*.*',
    '!' + client + 'assets/sass/*',
  ];

  var config = {
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    /* jshint -W106 */
    transifex : {
      user: process.env.TRANSIFEX_USERNAME || localenv && localenv.transifex.user || '',
      password: process.env.TRANSIFEX_PASSWORD || localenv && localenv.transifex.pass || '',
      project: 'ridestor-angular',
      local_path: 'po/'
    },
    /* jshint +W106 */
    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
    /**
    * File paths
    */
    alljs: [
      './src/**/*.js',
      './*.js',
    ], // all javascript that we want to vet
    build: './build/',
    client: client,
    dev: './build/dev/',
    dist: './build/dist/',
    html: client + '**/*.html',
    htmltemplates: clientApp + '**/*.html',
    index: client + 'index.html',
    js: [
      clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js',
      '!' + adminConfig.jsFiles[0],
      '!' + adminConfig.jsFiles[1],
    ], // app js, with no specs nor admin stuff
    jsOrder: [
      clientApp + 'app.js',
      clientApp + 'core/*.js',
      clientApp + 'core/**/*.js',
      '**/*.module.js',
      '**/*.js',
    ],
    nonAngularStuff: nonAngularStuff,
    adminConfig: adminConfig,
    sourceCss: [client + '**/*.scss'],
    cssPath: cssPath,
    compiledCss: cssPath + '/*.css',
    nodeModules: nodeModules,
    report: report,
    root: root,
    source: 'src/',
    stubsjs: [
      bower.directory + 'angular-mocks/angular-mocks.js',
      client + 'stubs/**/*.js',
    ],
    temp: temp,

    /**
    * template cache
    */
    templateCache: {
      file: 'templates.js',
      options: {
        module: 'RidestoreApp',
        root: 'app/',
        standalone: false,
        moduleSystem: 'IIFE'
      },
    },

    /**
    * Bower and NPM files
    */
    bower: bower,
    packages: [
      './package.json',
      './bower.json',
    ],

    /**
    * specs.html, our HTML spec runner
    */
    specRunner: client + specRunnerFile,
    specRunnerFile: specRunnerFile,

    /**
    * The sequence of the injections into specs.html:
    *  1 testlibraries
    *      mocha setup
    *  2 bower
    *  3 js
    *  4 spechelpers
    *  5 specs
    *  6 templates
    */
    testlibraries: [
      nodeModules + '/mocha/mocha.js',
      nodeModules + '/chai/chai.js',
      nodeModules + '/sinon-chai/lib/sinon-chai.js',
    ],
    specHelpers: [client + 'test-helpers/*.js'],
    specs: [clientApp + '**/*.spec.js'],
    serverIntegrationSpecs: [client + '/tests/server-integration/**/*.spec.js'],
  };
  /**
  * wiredep and bower settings
  */
  config.getWiredepDefaultOptions = function () {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath,
      exclude: config.bower.adminSpecificPackages.js,
    };
    return options;
  };

  /**
  * karma settings
  */
  config.karma = getKarmaOptions();

  return config;

  ////////////////

  function getKarmaOptions() {
    var options = {
      files: [].concat(
        bowerFiles,
        client + 'assets/patches/*.js',
        clientApp + 'core/app.js',
        config.specHelpers,
        clientApp + '**/*.module.js',
        clientApp + '**/*.js',
        temp + config.templateCache.file,
        config.serverIntegrationSpecs
      ),
      exclude: [],
      coverage: {
        dir: report + 'coverage',
        reporters: [

          // reporters not supporting the `file` property
          { type: 'html', subdir: 'report-html' },
          { type: 'lcov', subdir: 'report-lcov' },
          { type: 'text-summary' }, //, subdir: '.', file: 'text-summary.txt'}
        ],
      },
      preprocessors: {}
    };
    options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];
    return options;
  }
};
