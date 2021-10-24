# Cloudify UI Common

[![npm](https://img.shields.io/npm/v/cloudify-ui-common.svg?style=flat)](https://www.npmjs.com/package/cloudify-ui-common)
[![jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

This repository contains common static assets (images, fonts, styles, etc.) as well as JS library with functions reusable across Cloudify UI applications.

## Table of Contents

  * [Installation](#installation)
  * [Usage](#usage)
      - [ES module](#es-module)
      - [CommonJS](#commonjs)
      - [Browser](#browser)
  * [Documentation](#documentation)
    + [External](#external)
    + [Internal](#internal)
  * [Development](#development)
    + [Static files](#static-files)
    + [JS API](#js-api)
  * [Debugging](#debugging)
    + [Internal](#internal-1)
    + [External](#external-1)
  * [Deployment](#deployment)
      - [When?](#when-)
      - [Who?](#who-)
      - [How?](#how-)
        * [Checklist](#checklist)
        * [Steps](#steps)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## Installation

```npm
npm install cloudify-ui-common
```


## Usage

To load the package into your environment use one of the below presented option for getting [icons](./src/icons.js) module. 

#### ES module

```javascript
import { icons } from 'cloudify-ui-common';
```

#### CommonJS

```javascript
const icons = require('cloudify-ui-common').icons;
```

#### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/cloudify-ui-common@1.0.0"></script>
```

Check [jsDelivr home page](https://www.jsdelivr.com/) for details about the URL format. You can get specific version and/or specific file from the package.


## Documentation

### External

There is [Cloudify Brandbook](https://drive.google.com/drive/folders/1ELapf6idy50n5R2uqWzhWXJrvL4mx6e3) containing Cloudify Brand Guidelines we should follow creating new resources.

### Internal

* [API](./src/README.md) - exposed JavaScript API 

* [Configurations](./configs/README.md) - shared development tools configuration files
* [Fonts](./fonts/README.md) - shared common fonts
* [Images](./images/README.md) - shared common images 
* [Styles](./styles/README.md) - shared CSS, SCSS stylesheets
* [Scripts](./scripts/README.md) - shared shell scripts


## Development

Development environment is set up to enforce good practices in JS development (static code analysis, style formatting, code coverage check). 

Some general guidelines for different type of assets are listed below. 

### Static files

- add new assets to dedicated folder for specific type 
- when removing assets verify that it is not used anywhere
- if relevant and possible add documentation on asset usage (eg. in README.md file in the same folder as asset)

### JS API

- add new code to `src` folder
- remember to export new files in `src/index.js` (otherwise the new code will not be available in the distribution package)
- build: `npm run build` (production build) or `npm run dev` (automatic rebuilding)
- test: `npm test` (static analysis, code style check, documentation check and unit testing with [Jest](https://jestjs.io/en/) testing framework) 
- use [prettier](https://prettier.io/) and [eslint](https://eslint.org/) during development
- document your code (we are using [JSdoc block tags](https://jsdoc.app/#block-tags) as documentation is auto-generated using [documentation.js](http://documentation.js.org))


## Debugging

### Internal

There is no standalone application for `cloudify-ui-common`, so the best way to debug some portion of it internally is using Jest unit tests (see: [test](./test) folder).

### External

If you want to develop/debug `cloudify-ui-common` from the package user side (eg. from [cloudify-stage](https://github.com/cloudify-cosmo/cloudify-stage)), then instead of using `cloudify-ui-common` package from NPM registry, you can:
 1. Use `npm link cloudify-ui-common <local-path-to-cloudify-ui-common>` command in your package user project,
 1. Build `cloudify-ui-common` project (see: [Development](#development) section), 
 1. Run package user project and see changes applied locally in `cloudify-ui-common`.   


## Deployment

Cloudify UI Common library is published in [NPM](https://www.npmjs.com) registry. See [cloudify-ui-common@npm](https://www.npmjs.com/package/cloudify-ui-common).

The way of work with publishing the package is described below. This section is divided into 3 parts:
1. **When?** - describes when we can publish the package,
1. **Who?** - describes who can publish the package and under which conditions,
1. **How?** - describes technical details to follow to publish the package. 

#### When?

We can release when:
- code on `master` branch is necessary for one of the dependant projects (stage, composer, topology, ...),
- fix/feature on `master` branch is finished.
 
#### Who?

Developers from _cloudify-rnd-ui_ e-mail group can publish new version after agreement with maintainer 
(see author or maintainers field in [package.json](./package.json) file).

#### How?

This section is divided into two parts:
1. **Checklist** - describes prerquisities to be met before publishing the package,
1. **Steps** - describes technical steps to be executed to publish the package.

##### Checklist

* all your changes are merged to `master` branch, so that your local `master` branch is up-to-date,
* you know and follow [Semantic Versioning 2.0.0](https://semver.org/#summary) rules when creating version (first step below),
* you know and follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/#how) guiding principles when adding release notes (last step below),
* you have agreement with developers from _cloudify-rnd-ui_ group on publishing new version.

##### Steps

If you met all points from the checklist above, follow these steps:

1. Run one of the following scripts:  
   
   * `npm run publish:patch` for new patch version,
   * `npm run publish:minor` for new minor version,
   * `npm run publish:major` for new major version,

   which will create special branch, add commit to it containing version bump in `package*.json` files according to your choice, tag the commit and push branch to remote. That should trigger Jenkins jobs finalizing publish.

1. Check if Jenkins jobs were successful.

1. Verify [cloudify-ui-common @ NPM](https://www.npmjs.com/package/cloudify-ui-common) was updated properly.

1. Go to [Create Release page @ GitHub](https://github.com/cloudify-cosmo/cloudify-ui-common/releases/new) to create release and add release notes.
