# Cloudify UI Common

[![npm](https://img.shields.io/npm/v/cloudify-ui-common.svg?style=flat)](https://circleci.com/gh/cloudify-cosmo/cloudify-ui-common)
[![CircleCI](https://img.shields.io/circleci/project/github/cloudify-cosmo/cloudify-ui-common.svg?style=svg)](https://circleci.com/gh/cloudify-cosmo/cloudify-ui-common)
[![jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

This repository contains common static assets (images, fonts, styles, etc.) as well as JS library with functions reusable across Cloudify UI applications.


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

* [API](./src/README.md) - exposed JavaScript API 


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


## Deployment

Cloudify UI Common library is published in [NPM](https://www.npmjs.com) registry.

Assuming all your changes are merged and you have up-to-date local `master` branch:
1. Create new version using npm-version internal command, eg. 
   
   `npm version patch` for new patch version, 
   
   `npm version minor` for new minor version, 
   
   `npm version --help` for usage details.

1. Create new branch and push it to remote.

1. Check if [CircleCI publish job](https://circleci.com/gh/cloudify-cosmo/cloudify-ui-common) was successful.

1. Verify [NPM registry](https://www.npmjs.com/package/cloudify-ui-common) was updated.
