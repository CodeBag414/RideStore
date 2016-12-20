# Ridestore-Angular

![codeship status](https://codeship.com/projects/36cb5690-0496-0134-b8cb-3e9afa3bdba0/status?branch=master)

**[Found an issue? File it on jira](https://ridestore.atlassian.net/secure/CreateIssue!default.jspa?selectedProjectId=10300)**

## Prerequisites

1. Install [Node.js](http://nodejs.org)
 - on OSX use [homebrew](http://brew.sh) `brew install node`
 - on Windows use [chocolatey](https://chocolatey.org/) `choco install nodejs`

2. Install these NPM packages globally

    ```
    npm install -g bower gulp
    ```

    >Refer to these [instructions on how to not require sudo for npm](https://github.com/sindresorhus/guides/blob/master/npm-global-without-sudo.md)

## Running Ridestore-Angular

### Running in dev mode

 - Run the project with `npm start`
 - This injects the bower components, compiles sass, and runs the server on port `3000`

 - Open your browser and point it to http://localhost:3000

### To build as if for deployment
This will minify, concatenate files, cachebust, compile sass, and copy all relevant
assets to a folder under `./dist/build`.

 - Run `gulp build --dist`

#### To build as if for production
This currently only renames the `index.html` to `index.php`.

 - add the `--production` flag: `gulp build --dist --production`.

## Development environment

### Recommended atom plugins.

1. Install these atom packages with apm

  ```
  apm install <packages name>
  ```

  * Linting
    * ```linter```
    * ```linter-jscs```
    * ```linter-jshint```
    * ```editorconfig```
  * Spelling
    * ```linter-Spell```
    * ```linter-spell-javascript```
  * Snippets
    * ```angularjs```
    * ```angularjs-snippets```
    * ```autoclose-html```
  * Highlighting
    * ```pigments```
    * ```highlight-selected```
  * Theme
    * ```file-icons```
    * ```minimap```
    * ```minimap-highlight-selected```
  * VCS
    * ```open-on-bitbucket```
    * ```git-time-machine```
    * ```merge-conflicts```


## Exploring Ridestore-Angular

### Structure

> **TODO:** describe the folder Structure.

```
src
├── app
│   ├── components
│   │   ├── cart
│   │   ├── favorites
│   │   ├── footer
│   │   ├── menu
│   │   │   └── partials
│   │   ├── search
│   │   ├── top
│   │   │   └── partials
│   │   └── ui
│   ├── core
│   │   └── services
│   └── pages
│       ├── 404
│       ├── about
│       ├── account
│       │   └── login
│       ├── brands
│       ├── category
│       │   └── partials
│       ├── checkout
│       │   └── success
│       │       └── popup+deliveryplace
│       ├── contact
│       ├── jobs
│       ├── latest
│       ├── product
│       │   ├── colors
│       │   └── partials
│       ├── reviews
│       ├── start
│       ├── stickers
│       │   ├── directives
│       │   └── thanks
│       ├── style
│       ├── stylecreator
│       ├── terms
│       ├── thanks
│       └── work
│           └── partials
└── design
    ├── assets
    │   ├── fonts
    │   │   ├── icons-clothes
    │   │   ├── icons-general
    │   │   └── notera
    │   ├── images
    │   └── sass
    └── compiled_css
```

### The Modules
> **TODO:** describe the existing modules.

```
app --> [
        app.module1 --> [
            app.core,
            app.widgets
        ],
        app.module2 --> [
            app.core,
            app.widgets
        ],
        app.moduleN --> [
            app.core
        ],
        app.widgets,
		app.core --> [
			ngAnimate,
			ngSanitize,
			ui.router,
			blocks.exception,
			blocks.logger,
			blocks.router
		]
    ]
```

#### module1 Module
> **TODO:** describe the existing modules.

This module does something


## Gulp Tasks
> **TODO:** describe the existing gulp tasks.

### Task Listing

- `gulp help`

    Displays all of the available gulp tasks.

### Code Analysis

- `gulp vet`

    Performs static code analysis on all javascript files. Runs jshint and jscs.

### Testing

- `gulp test`

    Runs all unit tests using karma runner, mocha, chai and sinon with phantomjs. Depends on vet task, for code analysis.

### Cleaning Up

- `gulp clean-code`

    Remove all javascript and html from the build folder

### Angular HTML Templates

- `gulp templatecache`

    Create an Angular module that adds all HTML templates to Angular's $templateCache. This pre-fetches all HTML templates saving XHR calls for the HTML.

- `gulp templatecache --verbose`

    Displays all files affected by the task.
