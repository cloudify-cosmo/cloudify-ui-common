# cloudify-ui-common

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

[Auto-generated documentation](./docs/README.md) contains description of exposed APIs and static files.

## Development

Development environment is set up to enforce good practices in JS development (static code analysis, style formatting, code coverage check). 

Some general guidelines for different type of assets are listed below. 

### Static files

- add new assets to dedicated folder for specific type 
- when removing assets verify that it is not used anywhere
- if relevant and possible add documentation on asset usage (eg. in README.md file in the same folder as asset)

### JS code

- add new code to `src` folder
- remember to export new files in `src/index.js` (otherwise the new code will not be available in the distribution package)
- build: `npm run build` (production build) or `npm run dev` (automatic rebuilding)
- test: `npm test` (static analysis, code style check and unit testing)
- its wise to use [prettier](https://prettier.io/) and [eslint](https://eslint.org/) during development
- test your code (we are using [Jest](https://jestjs.io/en/) testing framework)
- document your code (we aim to be compatible with [ESdoc](https://esdoc.org/manual/tags.html))

## Deployment

Cloudify UI Common library is deployed to [NPM](https://www.npmjs.com). There are mainly two supported options how to deploy new version. Both are described below.

### Manual

TODO: Use [np](https://github.com/sindresorhus/np) tool.

### Automatic

TODO: Add CircleCI configuration and description.
