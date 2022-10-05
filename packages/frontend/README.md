# Cloudify UI Common Frontend

[![npm](https://img.shields.io/npm/v/cloudify-ui-common-frontend.svg?style=flat)](https://www.npmjs.com/package/cloudify-ui-common-frontend)

This package contains common static assets (images, fonts, styles, etc.) as well as TypeScript library with functions 
reusable across Cloudify UI frontend applications.

## Installation

```npm
npm install cloudify-ui-common-frontend
```

## Usage

To load the package into your environment use one of the below presented option for getting [icons](./src/icons.js) module.

#### ES module

```javascript
import { icons } from 'cloudify-ui-common-frontend';
```

#### CommonJS

```javascript
const icons = require('cloudify-ui-common-frontend').icons;
```

#### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/cloudify-ui-common-frontend@1.0.0"></script>
```

Check [jsDelivr home page](https://www.jsdelivr.com/) for details about the URL format. You can get specific version and/or specific file from the package.


## Documentation

* [Fonts](./fonts/README.md) - shared common fonts
* [Images](./images/README.md) - shared common images
* [Styles](./styles/README.md) - shared CSS, SCSS stylesheets

## Development

Development environment is set up to enforce good practices in TS development (static code analysis, style formatting,
code coverage check).

Some general guidelines for different type of assets are listed below.

### Static files

- add new assets to dedicated folder for specific type
- when removing assets verify that it is not used anywhere
- if relevant and possible add documentation on asset usage (eg. in README.md file in the same folder as asset)
- there is [Cloudify Brandbook](https://drive.google.com/drive/folders/1ELapf6idy50n5R2uqWzhWXJrvL4mx6e3) containing 
  Cloudify Brand Guidelines we should follow creating new resources


### TypeScript library

- add new code to `src` folder
- remember to export new files in `src/index.ts` (otherwise the new code will not be available in the distribution package)
- build: `npm run build` (production build) or `npm run dev` (automatic rebuilding)
- test: `npm run test` (unit testing with [Jest](https://jestjs.io/en/) testing framework), `npm run lint` (static analysis, code style check) and `npm run check-types` (TypeScript types check)
- document your code (we are using [JSdoc block tags](https://jsdoc.app/#block-tags))
